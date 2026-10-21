import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { prepareRuntime } from "./runtime.mjs";

const digest = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
export function requiredRuntimeProblems(doctor) {
  const required = ["Node.js", "FFmpeg", "FFprobe", "Chrome"];
  if (!Array.isArray(doctor?.checks)) return ["Missing doctor dependency checks"];
  return required.filter((name) => doctor.checks.find((check) => check.name === name)?.ok !== true);
}
function plainPath(root, relative) {
  if (typeof relative !== "string" || !relative || relative.includes("\\") || relative.includes(":") ||
      path.posix.isAbsolute(relative) || relative.split("/").some((part) => !part || part === "." || part === "..")) {
    throw new Error(`Invalid bundle path: ${relative}`);
  }
  let current = root;
  for (const segment of relative.split("/")) {
    current = path.join(current, segment);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw new Error(`Linked path is not supported: ${relative}`);
  }
  return current;
}

export function installSkills(bundleRoot, destination) {
  const bundle = fs.realpathSync(bundleRoot);
  const config = JSON.parse(fs.readFileSync(path.join(bundle, "delivery.json"), "utf8"));
  if (config.schemaVersion !== 1 || !Array.isArray(config.skills) || !config.skills.includes("xiangsu-mg") ||
      new Set(config.skills).size !== config.skills.length || config.skills.some((name) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name))) {
    throw new Error("Invalid delivery skill list");
  }
  const targetRoot = path.resolve(destination);
  if (targetRoot === bundle || targetRoot.startsWith(bundle + path.sep)) throw new Error("Choose an installation directory outside the extracted bundle");
  // Inspect every destination ancestor before writing; existing skills are never overwritten.
  let ancestor = targetRoot;
  while (true) {
    if (fs.existsSync(ancestor) && (fs.lstatSync(ancestor).isSymbolicLink() || !fs.statSync(ancestor).isDirectory())) throw new Error(`Installation directory is linked or not a directory: ${ancestor}`);
    const parent = path.dirname(ancestor);
    if (parent === ancestor) break;
    ancestor = parent;
  }
  const entries = fs.readFileSync(path.join(bundle, "MANIFEST.sha256"), "utf8").trim().split(/\r?\n/).map((line) => {
    const match = line.match(/^([a-f0-9]{64})  (.+)$/);
    if (!match) throw new Error("Invalid delivery manifest line");
    const source = plainPath(bundle, match[2]);
    if (!fs.statSync(source).isFile() || digest(source) !== match[1]) throw new Error(`Delivery file hash mismatch: ${match[2]}`);
    return { relative: match[2], source, sha256: match[1] };
  });
  if (new Set(entries.map((entry) => entry.relative)).size !== entries.length) throw new Error("Duplicate delivery manifest paths");
  const pending = [];
  for (const name of config.skills) {
    const prefix = `skills/${name}/`;
    const selected = entries.filter((entry) => entry.relative.startsWith(prefix));
    if (!selected.some((entry) => entry.relative === prefix + "SKILL.md")) throw new Error(`Missing bundled skill: ${name}`);
    for (const entry of selected) {
      const relative = `${name}/${entry.relative.slice(prefix.length)}`;
      const target = plainPath(targetRoot, relative);
      if (fs.existsSync(target)) {
        if (!fs.statSync(target).isFile() || digest(target) !== entry.sha256) throw new Error(`Existing skill differs: ${relative}. Preserve it and choose an empty --destination directory.`);
      } else pending.push({ source: entry.source, target });
    }
  }
  for (const item of pending) {
    fs.mkdirSync(path.dirname(item.target), { recursive: true });
    fs.copyFileSync(item.source, item.target, fs.constants.COPYFILE_EXCL);
  }
  return { skills: config.skills, writtenFiles: pending.length, destination: targetRoot, cliVersion: config.cliVersion };
}

export function runInstaller({ bundleRoot, args = process.argv.slice(2), runCommand, prepareBundledRuntime = prepareRuntime } = {}) {
  if (args.includes("--help")) {
    console.log("node install.mjs [--skills-only] [--destination <skill-directory>]\nDefault: install bundled skills, prepare the pinned CLI/browser online, then check the environment.\nExisting differing skills are preserved; use an empty destination to install a separate copy.");
    return;
  }
  let destination = process.env.CODEX_HOME ? path.join(process.env.CODEX_HOME, "skills") : path.join(os.homedir(), ".codex", "skills");
  let skillsOnly = false;
  for (let index = 0; index < args.length; index++) {
    if (args[index] === "--skills-only") skillsOnly = true;
    else if (args[index] === "--destination" && args[index + 1] && !args[index + 1].startsWith("--")) destination = args[++index];
    else throw new Error(`Unknown or incomplete argument: ${args[index]}`);
  }
  if (Number(process.versions.node.split(".")[0]) < 22) throw new Error("Node.js 22 or newer is required. Install Node.js first.");
  const result = installSkills(bundleRoot, destination);
  console.log(`Installed ${result.skills.length} skills (${result.writtenFiles} new files): ${result.destination}`);
  if (skillsOnly) { console.log("Skills installed. Runtime preparation was skipped."); return result; }
  const bundledRuntime = path.join(result.destination, 'xiangsu-mg', 'runtime');
  if (fs.existsSync(path.join(bundledRuntime, 'package.json'))) {
    prepareBundledRuntime(bundledRuntime);
    console.log('Setup complete. Restart your agent, then invoke $xiangsu-mg. Pixel2All candidate previews download for review; selected PNGs are staged into the project. Azure authentication remains user-owned.');
    return result;
  }
  if (!/^\d+\.\d+\.\d+$/.test(result.cliVersion ?? "")) throw new Error("Invalid pinned HyperFrames version");
  const run = runCommand ?? ((commandArgs) => spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", commandArgs, {
    // Setup needs no project context; background npm/CLI probes must not hold the bundle directory.
    cwd: os.tmpdir(), encoding: "utf8", shell: process.platform === "win32",
  }));
  const cliArgs = ["--yes", `hyperframes@${result.cliVersion}`];
  for (const operation of [["--help"], ["browser", "ensure"], ["doctor", "--json"]]) {
    console.log(`Preparing HyperFrames ${result.cliVersion}: ${operation.join(" ")}`);
    const execution = run([...cliArgs, ...operation]);
    if (execution.error || execution.status !== 0) throw new Error(`Skills are installed; runtime setup failed at ${operation.join(" ")}: ${execution.error?.message ?? execution.stderr ?? "unknown error"}`);
    if (operation[0] === "doctor") {
      const doctor = JSON.parse(execution.stdout.trim());
      const missing = requiredRuntimeProblems(doctor);
      if (missing.length) throw new Error(`Skills are installed; required runtime checks failed: ${missing.join(", ")}. Run npx --yes hyperframes@${result.cliVersion} doctor for details.`);
      const optional = doctor.checks.filter((check) => !check.ok && !["Node.js", "FFmpeg", "FFprobe", "Chrome"].includes(check.name));
      if (optional.length) console.log(`Other checks need attention, but are not required by this local 像素 MG setup: ${optional.map((check) => check.name).join(", ")}`);
    }
  }
  console.log("Setup complete. Restart your agent, then invoke $xiangsu-mg. Azure/provider authentication remains user-owned.");
  return result;
}
