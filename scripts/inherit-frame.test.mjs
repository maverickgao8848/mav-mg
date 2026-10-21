import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { inheritFrame, verifyInheritedFrame } from './inherit-frame.mjs';

function fixture(t) { const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mav-frame-')); t.after(() => fs.rmSync(root, { recursive: true, force: true })); return root; }
test('nearest upstream preserves exact bytes and declared resources, idempotently', t => {
  const root = fixture(t), film = path.join(root, 'film'), child = path.join(film, 'animations/beat');
  fs.mkdirSync(path.join(film, 'assets/style'), { recursive: true });
  const bytes = Buffer.from('\ufeff# 黑底\r\n点阵24px；保留材质。\r\n');
  fs.writeFileSync(path.join(root, 'frame.md'), 'wrong ancestor');
  fs.writeFileSync(path.join(film, 'frame.md'), bytes);
  fs.writeFileSync(path.join(film, 'assets/style/bg.css'), '.dots{background:#08090b}');
  fs.writeFileSync(path.join(film, 'frame-resources.json'), JSON.stringify({ styleId: 'custom-film', resources: [{ path: 'assets/style/bg.css' }] }));
  assert.equal(inheritFrame({ projectDirectory: child, searchRoot: root }).styleId, 'custom-film');
  assert.deepEqual(fs.readFileSync(path.join(child, 'frame.md')), bytes);
  assert.equal(verifyInheritedFrame(child).ok, true);
  assert.equal(inheritFrame({ projectDirectory: child, upstream: film }).status, 'unchanged');
  fs.writeFileSync(path.join(child, 'assets/style/bg.css'), 'drift');
  assert.equal(verifyInheritedFrame(child).ok, false);
});
test('protect existing child; explicit replacement restores the complete source', t => {
  const root = fixture(t), child = path.join(root, 'child'); fs.mkdirSync(child);
  fs.writeFileSync(path.join(root, 'frame.md'), 'source'); fs.writeFileSync(path.join(child, 'frame.md'), 'approved child');
  assert.equal(inheritFrame({ projectDirectory: child }).status, 'existing-project');
  assert.throws(() => inheritFrame({ projectDirectory: child, upstream: root }), /differs/);
  inheritFrame({ projectDirectory: child, upstream: root, replace: true });
  assert.equal(fs.readFileSync(path.join(child, 'frame.md'), 'utf8'), 'source');
  fs.writeFileSync(path.join(root, 'frame.md'), 'changed upstream');
  assert.equal(verifyInheritedFrame(child).ok, false);
  fs.renameSync(path.join(root, 'frame.md'), path.join(root, 'unavailable.md'));
  assert.equal(verifyInheritedFrame(child).ok, true);
});
test('missing resource and path escape fail before writing; absent upstream permits bundled choice', t => {
  const root = fixture(t), child = path.join(root, 'child');
  assert.equal(inheritFrame({ projectDirectory: child, searchRoot: root }).status, 'no-upstream');
  fs.writeFileSync(path.join(root, 'frame.md'), 'style');
  for (const destination of ['assets/missing.ttf', '../escape']) {
    fs.writeFileSync(path.join(root, 'frame-resources.json'), JSON.stringify({ resources: [{ path: destination }] }));
    assert.throws(() => inheritFrame({ projectDirectory: child, upstream: root }));
    assert.equal(fs.existsSync(child), false);
  }
});
test('a supplied source video locates its original project frame across output directories', t => {
  const root=fixture(t), source=path.join(root,'original/source'), project=path.join(root,'outputs/child');
  fs.mkdirSync(source,{recursive:true}); fs.mkdirSync(path.join(root,'outputs/.git'),{recursive:true});
  fs.writeFileSync(path.join(root,'original/frame.md'),'original style');fs.writeFileSync(path.join(source,'recording.mp4'),'source placeholder');
  inheritFrame({projectDirectory:project,sourcePath:path.join(source,'recording.mp4')});
  assert.equal(fs.readFileSync(path.join(project,'frame.md'),'utf8'),'original style');
});
