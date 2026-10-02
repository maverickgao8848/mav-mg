import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { applyStyle } from '../scripts/apply-style.mjs';
import { stageThiingsObject } from '../scripts/stage-thiings-object.mjs';

const temporary = t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mav-mg-local-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
};

test('Thiings import preserves pixels and provenance, is idempotent and refuses overwrite', t => {
  const root = temporary(t), project = path.join(root, 'project'), inputFile = path.join(root, 'selected.png');
  const bytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jR1kAAAAASUVORK5CYII=', 'base64');
  fs.writeFileSync(inputFile, bytes);
  const input = { inputFile, id: 'camera', sourcePage: 'https://www.thiings.co/things/camera', projectDirectory: project, roles: ['recording', 'camera'] };
  const result = stageThiingsObject(input);
  assert.equal(result.status, 'staged');
  assert.equal(result.usage, 'personal-noncommercial');
  assert.equal(result.attribution, 'Objects: thiings.co');
  assert.equal(result.width, 1);
  assert.ok(fs.readFileSync(path.join(project, result.path)).equals(bytes));
  const metadataPath = path.join(project, 'assets/objects/thiings/metadata.json'), before = fs.readFileSync(metadataPath);
  assert.equal(stageThiingsObject(input).status, 'unchanged');
  assert.ok(before.equals(fs.readFileSync(metadataPath)));
  assert.throws(() => stageThiingsObject({ ...input, roles: ['different'] }), /Existing object differs/);
  assert.ok(before.equals(fs.readFileSync(metadataPath)));
  assert.throws(() => stageThiingsObject({ ...input, id: '../outside' }), /Invalid semantic/);
  assert.throws(() => stageThiingsObject({ ...input, sourcePage: 'https://example.com/things/camera' }), /official/);
  assert.throws(() => stageThiingsObject({ ...input, usage: 'commercial' }), /license evidence/);
  assert.equal(stageThiingsObject({ ...input, id: 'licensed-camera', usage: 'commercial', licenseEvidence: 'user-supplied license record' }).usage, 'commercial');
  fs.writeFileSync(inputFile, bytes.subarray(0, 40));
  assert.throws(() => stageThiingsObject({ ...input, id: 'truncated' }), /Truncated|Incomplete/);
  assert.equal(fs.existsSync(path.join(project, 'assets/objects/thiings/truncated.png')), false);
});
