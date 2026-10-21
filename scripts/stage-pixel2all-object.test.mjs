import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { validateCatalog, searchCatalog, stageObject } from './stage-pixel2all-object.mjs';
import { runtimeRequire } from './runtime.mjs';
const sharp = runtimeRequire()('sharp');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const item = { id: 'ceramic-brain-normal', name: '脑', object: 'brain', state: 'normal', category: 'object', tags: ['思考'], aliases: ['cognition'], width: 2, height: 2, previewSize: 2, sha256: 'a'.repeat(64), preview: '/media/ceramic/ceramic-brain-normal-preview.webp?v=' + 'a'.repeat(16) };
function fixture(t) {
  const temporaryRoot = fs.realpathSync(os.tmpdir());
  const root = fs.mkdtempSync(path.join(temporaryRoot, 'xiangsu-mg-pixel2all-'));
  t.after(() => { assert.equal(path.dirname(fs.realpathSync(root)), temporaryRoot); assert.ok(path.basename(root).startsWith('xiangsu-mg-pixel2all-')); fs.rmSync(root, { recursive: true, force: true }); });
  return root;
}
async function preview() {
  return sharp(Buffer.from([255,255,255,255, 0,0,0,0, 0,0,0,0, 255,255,255,255]), {raw:{width:2,height:2,channels:4}}).webp({lossless:true}).toBuffer();
}
test('versioned preview URLs and bilingual keyword searches work', () => {
  const catalog = validateCatalog({schemaVersion:1,count:1,items:[item]});
  assert.equal(searchCatalog(catalog, ['思考'])[0].id, item.id);
  assert.equal(searchCatalog(catalog, ['brain'])[0].id, item.id);
  assert.equal(searchCatalog(catalog, ['missing']).length, 0);
  assert.throws(() => validateCatalog({...catalog,items:[{...item,preview:'https://other.example/image.webp'}]}), /Unexpected preview/);
  assert.throws(() => validateCatalog({...catalog,items:[{...item,preview:item.preview.replace('a'.repeat(16),'b'.repeat(16))}]}), /Unexpected preview/);
});
test('download only the selected image, preserve alpha, record delivery grant, reuse without image fetch', async t => {
  const root = fixture(t), bytes = await preview(); let calls = 0;
  const fetcher = async url => { calls++; assert.equal(url, 'https://pixel2all.cn'+item.preview); return bytes; };
  const options = {projectDirectory:root,item,catalogSha256:'b'.repeat(64),fetcher};
  const first = await stageObject(options);
  assert.equal(first.status,'staged'); assert.equal(calls,1);
  assert.equal(first.usage,'delivery-authorized'); assert.match(first.licenseEvidence,/接收者/);
  const png = fs.readFileSync(path.join(root,first.path));
  assert.equal(hash(png),first.sha256);
  assert.equal((await sharp(png).metadata()).hasAlpha,true);
  assert.equal(fs.readdirSync(path.join(root,'assets/objects/pixel2all')).filter(name=>name.endsWith('.png')).length,1);
  const second = await stageObject({...options, item:{...item,preview:item.preview.split('?')[0]},fetcher:()=>{throw new Error('Unexpected repeat download');}});
  assert.equal(second.status,'unchanged'); assert.equal(second.sha256,first.sha256);
  fs.writeFileSync(path.join(root,first.path),'changed');
  await assert.rejects(stageObject(options), /Frozen project object changed/);
});
test('download failure leaves no staged image or fabricated success metadata', async t => {
  const root=fixture(t);
  await assert.rejects(stageObject({projectDirectory:root,item,catalogSha256:'b'.repeat(64),fetcher:()=>{throw new Error('HTTP unavailable');}}),/HTTP unavailable/);
  assert.equal(fs.existsSync(path.join(root,'assets/objects/pixel2all/metadata.json')),false);
});
test('opaque image and mismatched original are rejected', async t => {
  const root=fixture(t);
  const bytes=await sharp({create:{width:2,height:2,channels:4,background:{r:255,g:255,b:255,alpha:1}}}).webp().toBuffer();
  await assert.rejects(stageObject({projectDirectory:root,item,catalogSha256:'b'.repeat(64),fetcher:async()=>bytes}),/transparent background/);
  const original=path.join(root,'original.png');fs.writeFileSync(original,await sharp(await preview()).png().toBuffer());
  await assert.rejects(stageObject({projectDirectory:root,item,catalogSha256:'b'.repeat(64),original}),/original hash/);
});
