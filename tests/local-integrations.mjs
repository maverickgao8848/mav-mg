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

test('approved font is the default and explicit variants resolve one effective FRAME with local fonts', t => {
  const root = temporary(t);
  const defaultProject = path.join(root, 'default');
  const selected = applyStyle({ styleId: 'vermilion-theatre', projectDirectory: defaultProject });
  assert.equal(selected.typographyVariant, 'letterpress');
  assert.ok(fs.readFileSync(path.join(defaultProject, 'frame.md'), 'utf8').includes('Noto Serif SC 900'));
  assert.equal(applyStyle({ styleId: 'vermilion-theatre', projectDirectory: defaultProject, typographyVariant: 'letterpress' }).status, 'unchanged');
  const invalidProject = path.join(root, 'invalid');
  assert.throws(() => applyStyle({ styleId: 'vermilion-theatre', projectDirectory: invalidProject, typographyVariant: 'unknown' }), /no valid selected variant/);
  assert.equal(fs.existsSync(invalidProject), false);
  for (const [variant, family] of [['letterpress', 'Noto Serif SC 900'], ['rubber', 'ZCOOL QingKe HuangYou'], ['signpaint', 'Ma Shan Zheng']]) {
    const project = path.join(root, variant);
    for (const mode of ['standard', 'advanced']) {
      const result = applyStyle({ styleId: 'vermilion-theatre', projectDirectory: project, productionMode: mode, typographyVariant: variant });
      assert.equal(result.status, mode === 'standard' ? 'applied' : 'unchanged');
    }
    const frame = fs.readFileSync(path.join(project, 'frame.md'), 'utf8');
    assert.ok(frame.includes(family));
    assert.equal(frame.includes('{{TYPOGRAPHY_VARIANT}}'), false);
    const selection = JSON.parse(fs.readFileSync(path.join(project, 'assets/references/styles/vermilion-theatre/selection.json')));
    assert.equal(selection.typographyVariant, variant);
    for (const font of [...frame.matchAll(/`(assets\/references\/styles\/vermilion-theatre\/fonts\/[^`]+\.ttf)`/g)]) assert.ok(fs.existsSync(path.join(project, font[1])));
  }
  const project = path.join(root, 'letterpress');
  const before = fs.readFileSync(path.join(project, 'frame.md'));
  assert.throws(() => applyStyle({ styleId: 'vermilion-theatre', projectDirectory: project, typographyVariant: 'rubber' }), /Existing project content differs/);
  assert.ok(before.equals(fs.readFileSync(path.join(project, 'frame.md'))));
});

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
