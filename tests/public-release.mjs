import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { applyStyle } from "../scripts/apply-style.mjs";
import { verifyArtReview } from "../scripts/verify-art-review.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const sha = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

const publicStyles = ["cobalt-grid", "editorial-forest"];

test("the public package contains only public styles and paid-style covers", () => {
  assert.deepEqual(fs.readdirSync(path.join(root, "assets/styles")).sort(), publicStyles);
  assert.deepEqual(fs.readdirSync(path.join(root, "assets/showcase/styles")).sort(), [
    "broadside.png", "cobalt-grid.jpg", "dell-1996.png", "editorial-forest.jpg", "gable-reed.png", "opencode.png", "vermilion-theatre.jpg",
  ]);
});

test("Cobalt Grid selects mode-specific references and refuses a mixed project", (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "mav-mg-styles-"));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const standard = path.join(temp, "standard");
  const advanced = path.join(temp, "advanced");
  applyStyle({ styleId: "cobalt-grid", projectDirectory: standard, productionMode: "standard" });
  applyStyle({ styleId: "cobalt-grid", projectDirectory: advanced, productionMode: "advanced" });
  const refs = (dir) => path.join(dir, "assets/references/styles/cobalt-grid");
  assert.equal(fs.readdirSync(path.join(refs(standard), "samples")).length, 7);
  assert.equal(fs.existsSync(path.join(refs(standard), "advanced-samples")), false);
  assert.equal(fs.readdirSync(path.join(refs(advanced), "advanced-samples")).length, 7);
  assert.equal(fs.existsSync(path.join(refs(advanced), "samples")), false);
  assert.throws(() => applyStyle({ styleId: "cobalt-grid", projectDirectory: standard, productionMode: "advanced" }), /Other mode references/);
  assert.throws(() => applyStyle({ styleId: "cobalt-grid", projectDirectory: advanced, productionMode: "standard" }), /Other mode references/);
  for (const styleId of ["vermilion-theatre", "opencode", "gable-reed", "dell-1996", "broadside"]) {
    assert.throws(() => applyStyle({ styleId, projectDirectory: path.join(temp, `paid-${styleId}`) }), /ENOENT/);
  }
  applyStyle({ styleId: "editorial-forest", projectDirectory: path.join(temp, "editorial"), productionMode: "advanced" });
});

test("art review requires current build, check counts, existing screenshots, and independent passes", (t) => {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "mav-mg-review-"));
  t.after(() => fs.rmSync(project, { recursive: true, force: true }));
  const write = (relative, data) => {
    const target = path.join(project, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, data);
    return target;
  };
  const build = write("index.html", "<html><body>current build</body></html>");
  const check = write("evidence-check.json", JSON.stringify({ ok: true, lint: { errorCount: 0, warningCount: 1 } }));
  const early = ["opening", "mechanism", "conclusion"].map((name) => `snapshots/keyframes/${name}.png`);
  const final = ["opening", "mechanism", "conclusion"].map((name) => `snapshots/final/${name}.png`);
  for (const relative of [...early, ...final]) write(relative, "image fixture");
  const now = Date.now() / 1000;
  for (const relative of early) fs.utimesSync(path.join(project, relative), now - 60, now - 60);
  fs.utimesSync(build, now - 30, now - 30);
  fs.utimesSync(check, now - 10, now - 10);
  const review = write("ART-REVIEW.md", [
    "technical: pass", "design_adherence: pass", "art_direction: ready_for_review",
    "storyboard_keyframes: ready_for_review", `build_sha256: ${sha(build)}`,
    `check_sha256: ${sha(check)}`, "check_error_count: 0", "check_warning_count: 1",
    ...[...early, ...final].map((relative) => `- ${relative}`),
  ].join("\n"));
  assert.equal(verifyArtReview(project).ok, true);
  fs.appendFileSync(build, "changed");
  assert.match(verifyArtReview(project).problems.join("; "), /build_sha256 does not match/);
  fs.writeFileSync(build, "<html><body>current build</body></html>");
  fs.rmSync(path.join(project, final[0]));
  assert.match(verifyArtReview(project).problems.join("; "), /Cited snapshot is missing/);
  write(final[0], "image fixture");
  fs.writeFileSync(review, fs.readFileSync(review, "utf8").replace("check_warning_count: 1", "check_warning_count: 0"));
  assert.match(verifyArtReview(project).problems.join("; "), /check_warning_count must be 1/);
  fs.writeFileSync(review, fs.readFileSync(review, "utf8").replace("design_adherence: pass", "design_adherence: revise"));
  assert.match(verifyArtReview(project).problems.join("; "), /requires design_adherence: pass/);
});
