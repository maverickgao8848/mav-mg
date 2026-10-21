import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { installSkills, requiredRuntimeProblems, runInstaller } from "./install-delivery.mjs";

function fixture(t) {
  const temporaryRoot = fs.realpathSync(os.tmpdir());
  const root = fs.mkdtempSync(path.join(temporaryRoot, "xiangsu-mg-installer-"));
  t.after(() => {
    const resolved = fs.realpathSync(root);
    assert.equal(path.dirname(resolved), temporaryRoot);
    assert.ok(path.basename(resolved).startsWith("xiangsu-mg-installer-"));
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  const bundle = path.join(root, "bundle"), destination = path.join(root, "installed");
  const write = (relative, data) => {
    const file = path.join(bundle, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, data);
  };
  write("delivery.json", JSON.stringify({ schemaVersion: 1, cliVersion: "0.8.144", skills: ["xiangsu-mg", "hyperframes-core"] }));
  write("skills/xiangsu-mg/SKILL.md", "像素 MG"); write("skills/hyperframes-core/SKILL.md", "Core");
  const relativeFiles = ["delivery.json", "skills/xiangsu-mg/SKILL.md", "skills/hyperframes-core/SKILL.md"];
  write("MANIFEST.sha256", relativeFiles.map((relative) => crypto.createHash("sha256").update(fs.readFileSync(path.join(bundle, relative))).digest("hex") + "  " + relative).join("\n") + "\n");
  return { bundle, destination, write };
}
test("bundled dependencies install together and identical rerun writes nothing", (t) => {
  const f = fixture(t);
  assert.equal(installSkills(f.bundle, f.destination).writtenFiles, 2);
  assert.equal(fs.readFileSync(path.join(f.destination, "hyperframes-core/SKILL.md"), "utf8"), "Core");
  assert.equal(installSkills(f.bundle, f.destination).writtenFiles, 0);
});
test("conflicting installed dependency is preserved before any new skill is written", (t) => {
  const f = fixture(t);
  fs.mkdirSync(path.join(f.destination, "hyperframes-core"), { recursive: true });
  fs.writeFileSync(path.join(f.destination, "hyperframes-core/SKILL.md"), "Customer edits");
  assert.throws(() => installSkills(f.bundle, f.destination), /Existing skill differs/);
  assert.equal(fs.existsSync(path.join(f.destination, "xiangsu-mg")), false);
  assert.equal(fs.readFileSync(path.join(f.destination, "hyperframes-core/SKILL.md"), "utf8"), "Customer edits");
});
test("corrupted package is rejected before installation", (t) => {
  const f = fixture(t); f.write("skills/xiangsu-mg/SKILL.md", "Modified");
  assert.throws(() => installSkills(f.bundle, f.destination), /hash mismatch/);
  assert.equal(fs.existsSync(f.destination), false);
});
test("skills-only installation does not call online runtime setup", (t) => {
  const f = fixture(t);
  runInstaller({ bundleRoot: f.bundle, args: ["--skills-only", "--destination", f.destination], runCommand: () => { throw new Error("Unexpected network call"); } });
  assert.ok(fs.existsSync(path.join(f.destination, "xiangsu-mg/SKILL.md")));
});
test("runtime preflight does not require optional MusicGen or Docker", () => {
  const checks = ["Node.js", "FFmpeg", "FFprobe", "Chrome"].map((name) => ({ name, ok: true }));
  checks.push({ name: "Docker running", ok: false }, { name: "BGM (MusicGen)", ok: false });
  assert.deepEqual(requiredRuntimeProblems({ ok: false, checks }), []);
  checks.find((check) => check.name === "FFmpeg").ok = false;
  assert.deepEqual(requiredRuntimeProblems({ checks }), ["FFmpeg"]);
  assert.ok(requiredRuntimeProblems({ ok: true }).length);
});
test('receiver runtime preparation follows copied skill location', t => {
  const f = fixture(t);
  f.write('skills/xiangsu-mg/runtime/package.json', JSON.stringify({private:true}));
  const manifestFile=path.join(f.bundle,'MANIFEST.sha256');
  const relative='skills/xiangsu-mg/runtime/package.json';
  fs.appendFileSync(manifestFile,crypto.createHash('sha256').update(fs.readFileSync(path.join(f.bundle,relative))).digest('hex')+'  '+relative+'\n');
  let prepared;
  runInstaller({bundleRoot:f.bundle,args:['--destination',f.destination],prepareBundledRuntime:root=>{prepared=root;assert.ok(fs.existsSync(path.join(root,'package.json')));},runCommand:()=>{throw new Error('Wrong legacy setup');}});
  assert.equal(prepared,path.join(f.destination,'xiangsu-mg/runtime'));
});
test("default installer prepares fixed CLI and browser then verifies required dependencies", (t) => {
  const f = fixture(t), calls = [];
  runInstaller({ bundleRoot: f.bundle, args: ["--destination", f.destination], runCommand: (args) => {
    calls.push(args);
    return { status: 0, stdout: args.includes("doctor") ? JSON.stringify({ checks: ["Node.js", "FFmpeg", "FFprobe", "Chrome"].map((name) => ({ name, ok: true })) }) : "ready" };
  } });
  assert.equal(calls.length, 3);
  assert.ok(calls.every((args) => args[1] === "hyperframes@0.8.144"));
  assert.deepEqual(calls[1].slice(2), ["browser", "ensure"]);
});
