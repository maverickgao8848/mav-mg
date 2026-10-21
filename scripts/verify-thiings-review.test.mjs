import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from 'node:url';
import { stageThiingsObject } from "./stage-thiings-object.mjs";
import { verifyThiingsReview } from "./verify-thiings-review.mjs";
import { verifyArtReview } from "./verify-art-review.mjs";

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64");
const digest = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
function fixture(t) {
  const temporaryRoot = fs.realpathSync(os.tmpdir());
  const project = fs.mkdtempSync(path.join(temporaryRoot, "xiangsu-mg-thiings-"));
  t.after(() => {
    const resolved = fs.realpathSync(project);
    assert.equal(path.dirname(resolved), temporaryRoot);
    assert.ok(path.basename(resolved).startsWith("xiangsu-mg-thiings-"));
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  const write = (relative, content) => {
    const target = path.join(project, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  };
  write("source.png", png);
  stageThiingsObject({ inputFile: path.join(project, "source.png"), id: "camera", sourcePage: "https://www.thiings.co/things/camera", projectDirectory: project, roles: ["camera"] });
  const storyboard = "cue-001\nthiings_object_id: camera\nobject: assets/objects/thiings/camera.png\n";
  const build = '<img src="assets/objects/thiings/camera.png">';
  write("STORYBOARD.md", storyboard);
  write("index.html", build);
  write("snapshots/keyframes/camera.png", png);
  write("snapshots/camera.png", png);
  const record = {
    schemaVersion: 1, storyboardSha256: digest(storyboard), buildSha256: digest(build),
    objects: [{
      id: "camera", label: "相机", beatRefs: ["cue-001"], status: "used", assetId: "camera",
      searches: [{ query: "camera", route: "collection", checkedOn: "2026-10-10", evidence: "https://www.thiings.co/things", candidates: [{ sourcePage: "https://www.thiings.co/things/camera", assessment: "Fits whole-object camera motion" }] }],
      implementationPaths: ["index.html"], snapshotPaths: ["snapshots/keyframes/camera.png", "snapshots/camera.png"],
    }],
  };
  const save = () => write("assets/objects/thiings/search-review.json", JSON.stringify(record));
  save();
  return { project, record, write, save };
}

test("actually staged and referenced object passes both checkpoints", (t) => {
  const f = fixture(t);
  assert.equal(verifyThiingsReview(f.project, { stage: "keyframes" }).ok, true);
  assert.equal(verifyThiingsReview(f.project).ok, true);
});

test("explicit Pixel2All handoff uses its selected objects through both checkpoints", (t) => {
  const f = fixture(t);
  const root = "assets/objects/pixel2all", id = "ceramic-brain-normal";
  f.write("BRIEF.md", "object_source: pixel2all\n");
  f.write(`${root}/${id}.png`, png);
  const sourcePage = `https://pixel2all.cn/objects/?item=${id}`;
  f.write(`${root}/metadata.json`, JSON.stringify({ schemaVersion: 1, sourceId: "pixel2all", items: [{
    id, path: `${root}/${id}.png`, sourceId: "pixel2all", sourcePage, sha256: digest(png), usage: "owner", licenseEvidence: "User is creator",
  }] }));
  const storyboard = `cue-001\nobject_id: brain\nobject: ${root}/${id}.png\n`;
  const build = `<img src="${root}/${id}.png">`;
  f.write("STORYBOARD.md", storyboard); f.write("index.html", build);
  const record = { ...f.record, sourceId: "pixel2all", storyboardSha256: digest(storyboard), buildSha256: digest(build), objects: [{
    ...f.record.objects[0], id: "brain", assetId: id,
    searches: [{ query: "思考", route: "pixel2all", checkedOn: "2026-10-11", evidence: "verification/object-search.json", candidates: [{sourcePage, assessment: "Whole object fits cognition cue"}] }],
  }] };
  const save = () => f.write(`${root}/search-review.json`, JSON.stringify(record)); save();
  assert.equal(verifyThiingsReview(f.project, {stage:"keyframes"}).ok, true);
  assert.equal(verifyThiingsReview(f.project).ok, true);
  const metadataFile = path.join(f.project, `${root}/metadata.json`);
  const metadata = JSON.parse(fs.readFileSync(metadataFile,'utf8'));
  const rights = path.join(path.dirname(fileURLToPath(import.meta.url)), '../references/pixel2all-rights.md');
  metadata.items[0].usage = 'delivery-authorized';
  metadata.items[0].licenseEvidence = fs.readFileSync(rights,'utf8').trim();
  metadata.items[0].rightsSha256 = digest(fs.readFileSync(rights));
  f.write(`${root}/metadata.json`,JSON.stringify(metadata));
  assert.equal(verifyThiingsReview(f.project).ok,true);
  metadata.items[0].rightsSha256='0'.repeat(64);
  f.write(`${root}/metadata.json`,JSON.stringify(metadata));
  assert.equal(verifyThiingsReview(f.project).ok,false);
  metadata.items[0].rightsSha256=digest(fs.readFileSync(rights));
  f.write(`${root}/metadata.json`,JSON.stringify(metadata));
  record.objects[0].searches[0].candidates[0].sourcePage = "https://www.thiings.co/things/brain"; save();
  assert.equal(verifyThiingsReview(f.project).ok, false);
});
test("missing search record blocks delivery and integrated art review", (t) => {
  const f = fixture(t);
  fs.unlinkSync(path.join(f.project, "assets/objects/thiings/search-review.json"));
  f.write("ART-REVIEW.md", "art_direction: ready_for_review\n");
  assert.equal(verifyThiingsReview(f.project).ok, false);
  assert.ok(verifyArtReview(f.project).problems.some((problem) => problem.startsWith("THIINGS:")));
});
test("downloaded object without an implementation reference is rejected", (t) => {
  const f = fixture(t);
  f.write("index.html", "<p>Only text</p>");
  f.record.buildSha256 = digest("<p>Only text</p>"); f.save();
  assert.ok(verifyThiingsReview(f.project).problems.some((problem) => problem.includes("no implementation reference")));
});
test("omitted storyboard object cannot be hidden by an abstract-only claim", (t) => {
  const f = fixture(t);
  f.record.objects = []; f.record.abstractOnlyReason = "Formula only"; f.save();
  assert.equal(verifyThiingsReview(f.project).ok, false);
});
test("network/download blocker cannot pass as completed acquisition", (t) => {
  const f = fixture(t);
  f.record.objects[0].status = "blocked"; f.record.objects[0].blocker = "Download failed"; f.save();
  assert.ok(verifyThiingsReview(f.project).problems.some((problem) => problem.includes("Acquisition is blocked")));
});
test("no-match requires distinct online query attempts", (t) => {
  const f = fixture(t), item = f.record.objects[0];
  item.status = "exception"; item.exception = { reason: "no-match", detail: "No matching view", replacement: "Semantic SVG" }; f.save();
  assert.equal(verifyThiingsReview(f.project).ok, false);
  item.searches.push({ query: "camcorder", route: "web", checkedOn: "2026-10-10", evidence: "site:thiings.co/things camcorder", candidates: [] }); f.save();
  assert.equal(verifyThiingsReview(f.project).ok, true);
});
test("structural exception must name an inspected candidate", (t) => {
  const f = fixture(t), item = f.record.objects[0];
  item.status = "exception"; item.exception = { reason: "independent-parts", detail: "Lens needs independent rotation", replacement: "Part-grouped SVG" }; f.save();
  assert.equal(verifyThiingsReview(f.project).ok, true);
  item.searches[0].candidates = []; f.save();
  assert.equal(verifyThiingsReview(f.project).ok, false);
});
test("modified storyboard, build or staged PNG invalidates evidence", (t) => {
  const f = fixture(t);
  const originalStoryboard = fs.readFileSync(path.join(f.project, "STORYBOARD.md"), "utf8");
  f.write("STORYBOARD.md", "Changed storyboard");
  assert.equal(verifyThiingsReview(f.project).ok, false);
  f.record.storyboardSha256 = digest("Changed storyboard"); f.save();
  f.write("index.html", "Changed build");
  assert.ok(verifyThiingsReview(f.project).problems.some((problem) => problem.includes("current index.html")));
  f.write("STORYBOARD.md", originalStoryboard); f.record.storyboardSha256 = digest(originalStoryboard); f.save();
  f.write("assets/objects/thiings/camera.png", "not original PNG");
  assert.ok(verifyThiingsReview(f.project).problems.some((problem) => problem.includes("hash mismatch")));
});
test("delivery requires finished-render usage evidence", (t) => {
  const f = fixture(t);
  f.record.objects[0].snapshotPaths = ["snapshots/keyframes/camera.png"]; f.save();
  assert.equal(verifyThiingsReview(f.project, { stage: "keyframes" }).ok, true);
  assert.equal(verifyThiingsReview(f.project).ok, false);
});
test("purely abstract storyboard can pass without decorative objects", (t) => {
  const f = fixture(t);
  const text = "cue-001: formula transformation only\n";
  f.write("STORYBOARD.md", text); f.record.storyboardSha256 = digest(text);
  f.record.objects = []; f.record.abstractOnlyReason = "cue-001 demonstrates an algebraic transformation without concrete entities"; f.save();
  assert.equal(verifyThiingsReview(f.project).ok, true);
});
test("evidence paths cannot leave the project", (t) => {
  const f = fixture(t);
  f.record.objects[0].implementationPaths = ["../outside.html"]; f.save();
  assert.equal(verifyThiingsReview(f.project).ok, false);
});
