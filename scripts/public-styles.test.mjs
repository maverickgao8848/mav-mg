import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { applyStyle } from './apply-style.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicStyles = ['architectural-section','broadside','cobalt-grid','dell-1996','gable-reed','opencode','vermilion-theatre'];
test('each public style stages its declared resources with valid hashes and preserves customer changes', t => {
  const temporaryParent = fs.realpathSync(os.tmpdir());
  const temporary = fs.mkdtempSync(path.join(temporaryParent, 'mav-public-style-'));
  t.after(() => { assert.equal(path.dirname(temporary), temporaryParent); fs.rmSync(temporary, {recursive:true,force:true}); });
  assert.deepEqual(fs.readdirSync(path.join(root,'assets/styles')).sort(), publicStyles);
  for (const styleId of publicStyles) {
    const projectDirectory = path.join(temporary,styleId);
    assert.equal(applyStyle({styleId,projectDirectory}).status,'applied');
    assert.equal(applyStyle({styleId,projectDirectory}).status,'unchanged');
    const meta=JSON.parse(fs.readFileSync(path.join(root,'assets/styles',styleId,'metadata.json')));
    for (const entry of meta.files.filter(x=>x.path!=='FRAME.md')) {
      const staged=fs.readFileSync(path.join(projectDirectory,'assets/references/styles',styleId,entry.path));
      assert.equal(crypto.createHash('sha256').update(staged).digest('hex'),entry.sha256);
    }
    fs.writeFileSync(path.join(projectDirectory,'frame.md'),'customer edit');
    assert.throws(()=>applyStyle({styleId,projectDirectory}),/differs/);
    assert.equal(fs.readFileSync(path.join(projectDirectory,'frame.md'),'utf8'),'customer edit');
  }
});
test('paid styles cannot be applied from the free package', () => {
  for (const styleId of ['glass-lime','baijin-black-texture']) {
    assert.equal(fs.existsSync(path.join(root,'assets/styles',styleId)),false);
    assert.throws(()=>applyStyle({styleId,projectDirectory:path.join(os.tmpdir(),'mav-paid-must-not-write')}),/ENOENT/);
  }
});
