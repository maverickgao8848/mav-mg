import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sections = ["lint", "runtime", "layout", "motion", "contrast"];
const digest = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const field = (review, name) => review.match(new RegExp(`^${name}:\\s*\"?([^\"\\r\\n]+)\"?\\s*$`, "m"))?.[1]?.trim();

export function verifyArtReview(projectDirectory) {
  const project = path.resolve(projectDirectory);
  const problems = [];
  const reviewFile = path.join(project, "ART-REVIEW.md");
  const buildFile = path.join(project, "index.html");
  const checkFile = path.join(project, "evidence-check.json");
  if (!fs.existsSync(reviewFile)) return { ok: false, problems: ["ART-REVIEW.md is missing"] };
  const review = fs.readFileSync(reviewFile, "utf8");
  const artDirection = field(review, "art_direction");
  const keyframeOutcome = field(review, "storyboard_keyframes");
  const technical = field(review, "technical");
  const designAdherence = field(review, "design_adherence");
  const expectedBuild = field(review, "build_sha256");
  const expectedCheck = field(review, "check_sha256");
  const expectedErrors = Number(field(review, "check_error_count"));
  const expectedWarnings = Number(field(review, "check_warning_count"));

  if (!expectedBuild || !/^[a-f0-9]{64}$/i.test(expectedBuild)) problems.push("build_sha256 is missing or invalid");
  if (!fs.existsSync(buildFile)) problems.push("index.html is missing");
  else if (expectedBuild && digest(buildFile) !== expectedBuild.toLowerCase()) problems.push("build_sha256 does not match the current index.html");

  if (!expectedCheck || !/^[a-f0-9]{64}$/i.test(expectedCheck)) problems.push("check_sha256 is missing or invalid");
  if (!fs.existsSync(checkFile)) problems.push("evidence-check.json is missing");
  else {
    if (expectedCheck && digest(checkFile) !== expectedCheck.toLowerCase()) problems.push("check_sha256 does not match evidence-check.json");
    if (fs.existsSync(buildFile) && fs.statSync(checkFile).mtimeMs < fs.statSync(buildFile).mtimeMs) problems.push("evidence-check.json predates the current build");
    try {
      const check = JSON.parse(fs.readFileSync(checkFile, "utf8"));
      const errors = sections.reduce((total, key) => total + (check[key]?.errorCount ?? 0), 0);
      const warnings = sections.reduce((total, key) => total + (check[key]?.warningCount ?? 0), 0);
      if (!Number.isInteger(expectedErrors) || errors !== expectedErrors) problems.push(`check_error_count must be ${errors}`);
      if (!Number.isInteger(expectedWarnings) || warnings !== expectedWarnings) problems.push(`check_warning_count must be ${warnings}`);
      if (technical === "pass" && (errors !== 0 || !check.ok)) problems.push("technical: pass conflicts with the check result");
    } catch (error) {
      problems.push(`evidence-check.json cannot be read: ${error.message}`);
    }
  }

  const snapshots = [...new Set(review.match(/snapshots\/[A-Za-z0-9._/-]+\.(?:png|jpe?g|webp)/gi) ?? [])];
  const keyframes = snapshots.filter((relative) => relative.startsWith("snapshots/keyframes/"));
  const finishedFrames = snapshots.filter((relative) => !relative.startsWith("snapshots/keyframes/"));
  if (snapshots.length === 0) problems.push("No snapshot paths are cited");
  if (artDirection === "ready_for_review") {
    if (technical !== "pass") problems.push("ready_for_review requires technical: pass");
    if (designAdherence !== "pass") problems.push("ready_for_review requires design_adherence: pass");
    if (keyframeOutcome !== "ready_for_review") problems.push("ready_for_review requires a completed storyboard_keyframes checkpoint");
    if (keyframes.length < 3) problems.push("ready_for_review needs at least three cited prebuild keyframes");
    if (finishedFrames.length < 3) problems.push("ready_for_review needs at least three cited finished-build snapshots");
  }
  for (const relative of snapshots) {
    const absolute = path.resolve(project, relative);
    if (!absolute.startsWith(path.join(project, "snapshots") + path.sep)) {
      problems.push(`Snapshot path escapes snapshots/: ${relative}`);
    } else if (!fs.existsSync(absolute)) {
      problems.push(`Cited snapshot is missing: ${relative}`);
    } else if (fs.existsSync(buildFile)) {
      const imageTime = fs.statSync(absolute).mtimeMs;
      const buildTime = fs.statSync(buildFile).mtimeMs;
      if (relative.startsWith("snapshots/keyframes/") && imageTime >= buildTime) problems.push(`Prebuild keyframe does not predate the finished build: ${relative}`);
      if (!relative.startsWith("snapshots/keyframes/") && imageTime < buildTime) problems.push(`Cited snapshot predates the current build: ${relative}`);
    }
  }
  return { ok: problems.length === 0, problems, snapshots, artDirection };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const projectIndex = process.argv.indexOf("--project");
  if (projectIndex < 0 || !process.argv[projectIndex + 1]) {
    console.error("Usage: node scripts/verify-art-review.mjs --project <project-directory>");
    process.exitCode = 2;
  } else {
    const result = verifyArtReview(process.argv[projectIndex + 1]);
    if (result.ok) console.log(`Evidence verified for ${result.artDirection}: ${result.snapshots.length} cited snapshots`);
    else {
      for (const problem of result.problems) console.error(problem);
      process.exitCode = 1;
    }
  }
}
