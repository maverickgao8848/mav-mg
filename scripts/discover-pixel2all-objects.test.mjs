import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import test from 'node:test';
import { searchCatalog, stageObject } from './stage-pixel2all-object.mjs';
import { discoverCatalog, readHistory, renderBoards, saveDiscovery, validatePlan } from './discover-pixel2all-objects.mjs';
import { verifyThiingsReview } from './verify-thiings-review.mjs';
import { runtimeRequire } from './runtime.mjs';

const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const sharp = runtimeRequire()('sharp');
function entry(id, object, tags, extra = {}) {
  return { id: `ceramic-${id}`, name: object, object, state: 'normal', category: 'object', tags, aliases: [],
    width: 2, height: 2, previewSize: 2, sha256: 'a'.repeat(64), preview: `/media/ceramic/ceramic-${id}-preview.webp`, ...extra };
}
const items = [entry('ai-chip-normal', 'AI chip', ['人工智能']), entry('airliner-normal', 'airliner', []), entry('chain-normal', 'chain', []),
  entry('funnel-free-flowing', 'funnel', ['流量', '通过'], { state: 'free flowing', category: 'state' }),
  entry('funnel-clogged', 'funnel', ['流量', '阻塞'], { state: 'clogged', category: 'state' }), entry('bucket-leaking', 'bucket', ['流量', '泄漏'], { state: 'leaking', category: 'metaphor' })];
const catalog = { schemaVersion: 1, count: items.length, items };
const plan = { schemaVersion: 1, objects: [{ id: 'throughput', beatRefs: ['cue-001'], intent: '输入超过出口容量导致积压', action: '比较畅通与堵塞', routes: [
  { kind: 'state', reason: '寻找流量失衡的可见状态', queries: ['流量', 'overload'] },
  { kind: 'metaphor', reason: '比较不同的容量容器', queries: ['bucket'] },
] }] };
function fixture(t) {
  const parent = fs.realpathSync(os.tmpdir()), root = fs.mkdtempSync(path.join(parent, 'xiangsu-discovery-'));
  t.after(() => { assert.equal(path.dirname(fs.realpathSync(root)), parent); assert.ok(path.basename(root).startsWith('xiangsu-discovery-')); fs.rmSync(root, { recursive: true, force: true }); });
  const write = (relative, content) => { const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); };
  return { root, write };
}
const preview = async () => sharp(Buffer.from([255,255,255,255, 0,0,0,0, 0,0,0,0, 255,255,255,255]), { raw: { width: 2, height: 2, channels: 4 } }).webp({ lossless: true }).toBuffer();

test('AI does not match air/chain; English phrases and Chinese states keep valid matches', () => {
  assert.deepEqual(searchCatalog(catalog, ['AI']).map(item => item.id), ['ceramic-ai-chip-normal']);
  assert.deepEqual(searchCatalog(catalog, ['free-flowing']).map(item => item.id), ['ceramic-funnel-free-flowing']);
  assert.equal(searchCatalog(catalog, ['阻塞'])[0].id, 'ceramic-funnel-clogged');
  assert.deepEqual(searchCatalog(catalog, ['ai', 'AI']), searchCatalog(catalog, ['AI']));
  assert.ok(searchCatalog(catalog, ['AI'])[0].matches.some(match => match.fields.includes('id')));
});

test('mechanism routes expose distinct families and alternate states without inventing semantic matches', () => {
  const report = discoverCatalog(catalog, plan, { catalogSha256: hash(JSON.stringify(catalog)), boardSize: 3 });
  const object = report.objects[0];
  assert.equal(object.candidates.length, 3);
  assert.equal(object.routes[0].queryResults.find(result => result.query === 'overload').ids.length, 0);
  assert.ok(object.boardAssetIds.slice(0, 2).some(id => id.startsWith('ceramic-bucket-')));
  assert.ok(object.boardAssetIds.slice(0, 2).some(id => id.startsWith('ceramic-funnel-')));
  assert.equal(object.boardAssetIds.length, 3);
  assert.equal(report.historyScope, 'not-supplied');
  assert.throws(() => validatePlan({ schemaVersion: 1, objects: [{ id: 'x', routes: [] }] }), /intent, action/);
});

test('recent usage is advisory and counts used items, not downloaded or duplicate history paths', t => {
  const f = fixture(t);
  f.write('assets/objects/pixel2all/search-review.json', JSON.stringify({ objects: [{ status: 'used', assetId: items[3].id }, { status: 'blocked', assetId: items[4].id }] }));
  f.write('assets/objects/pixel2all/metadata.json', JSON.stringify({ items: [items[3], items[4]].map(item => ({ ...item, roles: [item.object, item.state] })) }));
  const history = readHistory([f.root, f.root]); assert.equal(history.length, 1);
  const before = discoverCatalog(catalog, plan).objects[0];
  const after = discoverCatalog(catalog, plan, { history }).objects[0];
  assert.deepEqual(after.boardAssetIds, before.boardAssetIds);
  assert.equal(after.candidates.find(item => item.id === items[3].id).recentUses.length, 1);
  assert.equal(after.candidates.find(item => item.id === items[4].id).recentUses.length, 0);
  assert.equal(after.candidates.find(item => item.id === items[4].id).recentFamilyUses.length, 1);
});

test('discovery → real candidate PNG → reviewed selection → staged image → usage verification, with stale evidence rejected', async t => {
  const f = fixture(t), bytes = await preview();
  const chosen = items[4];
  f.write('BRIEF.md', 'object_source: pixel2all\n');
  f.write('STORYBOARD.md', `cue-001\nobject_id: throughput\nassets/objects/pixel2all/${chosen.id}.png\n`);
  f.write('index.html', `<img src="assets/objects/pixel2all/${chosen.id}.png">`);
  const report = discoverCatalog(catalog, plan, { catalogSha256: hash(JSON.stringify(catalog)) });
  await renderBoards(report, f.root, { fetcher: async () => bytes });
  const saved = saveDiscovery(report, f.root);
  assert.equal(saved.reviewStatus, 'created-blocked');
  assert.equal((await sharp(path.join(f.root, report.objects[0].sheets[0].path)).metadata()).format, 'png');
  assert.equal(verifyThiingsReview(f.root).ok, false);
  const review = JSON.parse(fs.readFileSync(saved.selectionReview));
  const record = review.objects[0];
  record.status = 'used'; delete record.blocker; record.assetId = chosen.id;
  record.selection = { reason: '阻塞出口保留了输入与容量关系；泄漏容器会表达另一种失效原因', inspectedAssetIds: report.objects[0].boardAssetIds, sheetPaths: report.objects[0].sheets.map(sheet => sheet.path) };
  for (const search of record.searches) {
    const result = report.objects[0].routes.flatMap(route => route.queryResults).find(result => result.query === search.query);
    search.candidates = report.objects[0].candidates.filter(item => result.ids.includes(item.id)).map(item => ({ sourcePage: item.sourcePage, assessment: 'Synthetic test assessment of visible state' }));
  }
  record.implementationPaths = ['index.html']; record.snapshotPaths = ['snapshots/keyframes/use.png', 'snapshots/use.png'];
  const asset = await stageObject({ projectDirectory: f.root, item: chosen, catalogSha256: report.catalogSha256, fetcher: async () => bytes });
  f.write('snapshots/keyframes/use.png', fs.readFileSync(path.join(f.root, asset.path)));
  f.write('snapshots/use.png', fs.readFileSync(path.join(f.root, asset.path)));
  const save = () => fs.writeFileSync(saved.selectionReview, JSON.stringify(review)); save();
  assert.equal(verifyThiingsReview(f.root).ok, true, JSON.stringify(verifyThiingsReview(f.root)));
  assert.equal(verifyThiingsReview(f.root, { stage: 'keyframes' }).selectionEvidence, 'discovery-bound');
  record.status = 'selected'; save();
  assert.equal(verifyThiingsReview(f.root, { stage: 'selection' }).ok, true);
  assert.equal(verifyThiingsReview(f.root, { stage: 'keyframes' }).ok, false);
  record.status = 'used'; save();
  record.selection.inspectedAssetIds = [items[5].id]; save();
  assert.ok(verifyThiingsReview(f.root).problems.some(problem => problem.includes('not inspected')));
  record.selection.inspectedAssetIds = report.objects[0].boardAssetIds; save();
  f.write(report.objects[0].sheets[0].path, 'changed');
  assert.ok(verifyThiingsReview(f.root).problems.some(problem => problem.includes('sheet missing or changed')));
  fs.appendFileSync(saved.report, '\n');
  assert.ok(verifyThiingsReview(f.root).problems.some(problem => problem.includes('report missing or changed')));
});

test('rediscovery preserves an existing decision instead of silently relabelling it as reviewed', t => {
  const f = fixture(t), report = discoverCatalog(catalog, plan, { catalogSha256: 'a'.repeat(64) });
  const saved = saveDiscovery(report, f.root);
  fs.appendFileSync(saved.selectionReview, '\n'); const before = fs.readFileSync(saved.selectionReview);
  report.checkedOn = '2030-01-01';
  assert.equal(saveDiscovery(report, f.root).reviewStatus, 'preserved-rebind-after-review');
  assert.deepEqual(fs.readFileSync(saved.selectionReview), before);
});

test('failed preview download cannot produce a completed candidate board', async t => {
  const f = fixture(t), report = discoverCatalog(catalog, plan);
  await assert.rejects(renderBoards(report, f.root, { fetcher: async () => { throw new Error('offline'); } }), /offline/);
  assert.deepEqual(report.objects[0].sheets, []);
  assert.equal(fs.existsSync(path.join(f.root, 'verification/object-discovery.json')), false);
});

test('incomplete historical metadata stays visible without blocking discovery or inventing verified files', t => {
  const f = fixture(t);
  f.write('assets/objects/pixel2all/search-review.json', JSON.stringify({ objects: [{ status: 'used', assetId: items[3].id }] }));
  const history = readHistory([f.root]);
  assert.equal(history[0].metadataStatus, 'incomplete-recorded-usage-only');
  assert.equal(history[0].metadataSha256, null);
  const report = discoverCatalog(catalog, plan, { history });
  assert.equal(report.objects[0].candidates.find(item => item.id === items[4].id).recentFamilyUses.length, 1);
});
