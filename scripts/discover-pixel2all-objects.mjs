import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { catalogUrl, fetchBytes, validateCatalog, searchCatalog } from './stage-pixel2all-object.mjs';
import { runtimeRequire } from './runtime.mjs';

const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
export function projectPath(root, relative) {
  if (!nonempty(relative) || relative.includes('\\') || relative.includes(':') || path.posix.isAbsolute(relative) ||
      relative.split('/').some(part => !part || part === '.' || part === '..')) throw new Error('Invalid discovery evidence path');
  let current = root;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw new Error('Linked discovery evidence path');
  }
  return current;
}
export function validatePlan(plan) {
  if (plan?.schemaVersion !== 1 || !Array.isArray(plan.objects)) throw new Error('Discovery plan needs schemaVersion: 1 and objects');
  const ids = new Set();
  for (const object of plan.objects) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(object.id ?? '') || ids.has(object.id)) throw new Error('Invalid/duplicate discovery object ID');
    ids.add(object.id);
    if (![object.intent, object.action].every(nonempty) || !Array.isArray(object.routes) || !object.routes.length) throw new Error('Object needs intent, action and search routes');
    for (const route of object.routes) {
      if (!['entity', 'state', 'metaphor'].includes(route.kind) || !nonempty(route.reason) ||
          !Array.isArray(route.queries) || !route.queries.length || !route.queries.every(nonempty)) throw new Error('Route needs kind, reason and queries');
    }
  }
  return plan;
}

export function readHistory(projects = []) {
  return [...new Set(projects.map(root => fs.realpathSync(root)))].map(root => {
    const read = relative => fs.readFileSync(projectPath(root, relative));
    const reviewBytes = read('assets/objects/pixel2all/search-review.json');
    const review = JSON.parse(reviewBytes);
    if (!Array.isArray(review.objects)) throw new Error(`Invalid history review: ${root}`);
    const used = [...new Set(review.objects.filter(item => item.status === 'used').map(item => item.assetId))];
    const metadataPath = projectPath(root, 'assets/objects/pixel2all/metadata.json');
    const metadataBytes = used.length && fs.existsSync(metadataPath) ? fs.readFileSync(metadataPath) : null;
    const manifest = metadataBytes ? JSON.parse(metadataBytes) : { items: [] };
    return { project: root, reviewSha256: hash(reviewBytes), metadataSha256: metadataBytes ? hash(metadataBytes) : null,
      metadataStatus: used.every(id => manifest.items?.some(item => item.id === id)) ? 'available' : 'incomplete-recorded-usage-only',
      items: used.map(id => {
        const item = manifest.items?.find(item => item.id === id);
        return { id, object: item?.roles?.[0] ?? null };
      }) };
  });
}

// Spread the visual shortlist across routes and object families, then add states.
// Full lexical results remain in the report; this is a viewing order, not a verdict.
export function chooseBoard(routes, size) {
  const board = [], families = new Set(), selected = new Set();
  for (const familyPass of [true, false]) {
    let progress = true;
    while (progress && board.length < size) {
      progress = false;
      for (const route of routes) {
        const next = route.items.find(item => !selected.has(item.id) && (!familyPass || !families.has(item.object)));
        if (!next) continue;
        board.push(next.id); selected.add(next.id); families.add(next.object); progress = true;
        if (board.length === size) break;
      }
    }
  }
  return board;
}

export function discoverCatalog(catalog, plan, { catalogSha256, history = [], boardSize = 12, checkedOn = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' }) } = {}) {
  validatePlan(plan); validateCatalog(catalog);
  if (!Number.isInteger(boardSize) || boardSize < 1 || boardSize > 60) throw new Error('board-size must be 1..60');
  return { schemaVersion: 1, sourceId: 'pixel2all', catalogUrl, catalogSha256, catalogCount: catalog.count, checkedOn,
    history, historyScope: history.length ? 'explicit-projects-only' : 'not-supplied',
    objects: plan.objects.map(object => {
      const routes = object.routes.map(route => {
        const queries = [...new Set(route.queries.map(query => query.trim()))];
        return { ...route, queries, queryResults: queries.map(query => ({ query, ids: searchCatalog(catalog, [query]).map(item => item.id) })),
          items: searchCatalog(catalog, queries) };
      });
      const candidates = [...new Map(routes.flatMap(route => route.items).map(item => [item.id, item])).values()].map(item => ({ ...item,
        recentUses: history.filter(project => project.items.some(used => used.id === item.id)).map(project => project.project),
        recentFamilyUses: history.filter(project => project.items.some(used => (used.object ?? catalog.items.find(entry => entry.id === used.id)?.object) === item.object)).map(project => project.project),
      }));
      return { ...object, routes: routes.map(({ items, ...route }) => ({ ...route, candidateIds: items.map(item => item.id) })),
        candidates, boardAssetIds: chooseBoard(routes, boardSize), sheets: [], reviewStatus: 'not-reviewed' };
    }) };
}

const xml = value => String(value).replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[char]));
export async function renderBoards(report, root, { fetcher = fetchBytes } = {}) {
  const sharp = runtimeRequire()('sharp');
  for (const object of report.objects) {
    if (!object.boardAssetIds.length) continue;
    const tiles = [];
    for (const [index, id] of object.boardAssetIds.entries()) {
      const item = object.candidates.find(item => item.id === id);
      const preview = await fetcher(new URL(item.preview, catalogUrl).href, 20 * 1024 * 1024);
      const info = await sharp(preview).metadata();
      if (info.format !== 'webp' || Math.max(info.width, info.height) !== item.previewSize) throw new Error(`Invalid board preview: ${id}`);
      const image = await sharp(preview).resize(280, 260, { fit: 'contain', background: '#19252b' }).png().toBuffer();
      const words = id.replace(/^ceramic-/, '').split('-');
      const lines = []; let line = '';
      for (const word of words) { if ((line + word).length > 28) { lines.push(line); line = ''; } line += (line ? '-' : '') + word; } lines.push(line);
      const labels = [`${index + 1}. ${lines.shift()}`, ...lines, `${item.category} / ${item.state}`, `recent: ${item.recentUses.length} | family: ${item.recentFamilyUses.length}`];
      const caption = Buffer.from(`<svg width="300" height="108"><rect width="300" height="108" fill="#19252b"/>${labels.map((text, i) => `<text x="10" y="${20 + i * 19}" fill="white" font-family="Arial" font-size="13">${xml(text)}</text>`).join('')}</svg>`);
      tiles.push(await sharp({ create: { width: 300, height: 380, channels: 4, background: '#19252b' } }).composite([{ input: image, left: 10, top: 4 }, { input: caption, left: 0, top: 270 }]).png().toBuffer());
    }
    const relative = `verification/object-candidates/${object.id}.png`;
    const columns = Math.min(4, tiles.length);
    const target = projectPath(root, relative); fs.mkdirSync(path.dirname(target), { recursive: true });
    const bytes = await sharp({ create: { width: columns * 300, height: Math.ceil(tiles.length / columns) * 380, channels: 4, background: '#101a20' } })
      .composite(tiles.map((input, i) => ({ input, left: (i % columns) * 300, top: Math.floor(i / columns) * 380 }))).png().toBuffer();
    fs.writeFileSync(target, bytes);
    object.sheets.push({ path: relative, sha256: hash(bytes), assetIds: object.boardAssetIds });
  }
}

export function saveDiscovery(report, root) {
  const relative = 'verification/object-discovery.json';
  const target = projectPath(root, relative); fs.mkdirSync(path.dirname(target), { recursive: true });
  const bytes = Buffer.from(JSON.stringify(report, null, 2) + '\n'); fs.writeFileSync(target, bytes);
  const reviewFile = projectPath(root, 'assets/objects/pixel2all/search-review.json');
  const exists = fs.existsSync(reviewFile);
  if (!exists) {
    const fileHash = name => fs.existsSync(projectPath(root, name)) ? hash(fs.readFileSync(projectPath(root, name))) : null;
    const review = { schemaVersion: 2, sourceId: 'pixel2all', storyboardSha256: fileHash('STORYBOARD.md'), buildSha256: fileHash('index.html'),
      discovery: { path: relative, sha256: hash(bytes) }, abstractOnlyReason: null,
      objects: report.objects.map(object => ({ id: object.id, label: object.id, beatRefs: object.beatRefs ?? [], status: 'blocked', blocker: 'Candidate review pending',
        searches: [...new Set(object.routes.flatMap(route => route.queries))].map(query => ({ query, route: 'pixel2all', checkedOn: report.checkedOn, evidence: relative, candidates: [] })),
        selection: { reason: '', inspectedAssetIds: [], sheetPaths: [] } })) };
    fs.mkdirSync(path.dirname(reviewFile), { recursive: true }); fs.writeFileSync(reviewFile, JSON.stringify(review, null, 2) + '\n', { flag: 'wx' });
  }
  return { report: target, selectionReview: reviewFile, reviewStatus: exists ? 'preserved-rebind-after-review' : 'created-blocked' };
}

async function main(args) {
  const options = { history: [] };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help') { console.log('node discover-pixel2all-objects.mjs --project <directory> --plan <json> [--history <recent-project>] [--board-size 12]\nWrites verification/object-discovery.json and candidate PNG sheets; does not select or stage final objects.'); return; }
    if (!['--project', '--plan', '--history', '--board-size'].includes(arg) || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Unknown/incomplete argument: ${arg}`);
    const value = args[++i];
    if (arg === '--history') options.history.push(value); else options[arg.slice(2)] = value;
  }
  if (!options.project || !options.plan) throw new Error('--project and --plan are required');
  const plan = validatePlan(JSON.parse(fs.readFileSync(options.plan, 'utf8').replace(/^\uFEFF/, '')));
  const root = path.resolve(options.project);
  const history = readHistory(options.history);
  if (history.some(item => path.resolve(item.project) === root)) throw new Error('History should name other projects, not the current project');
  const bytes = await fetchBytes(catalogUrl, 4 * 1024 * 1024);
  const report = discoverCatalog(validateCatalog(JSON.parse(bytes)), plan, { catalogSha256: hash(bytes), history, boardSize: Number(options['board-size'] ?? 12) });
  await renderBoards(report, root);
  const saved = saveDiscovery(report, root);
  console.log(JSON.stringify({ ...saved, catalogCount: report.catalogCount, historyScope: report.historyScope,
    historyNotes: report.history.filter(project => project.metadataStatus !== 'available').map(project => ({ project: project.project, status: project.metadataStatus })),
    objects: report.objects.map(object => ({ id: object.id, candidates: object.candidates.length, sheets: object.sheets,
      emptyQueries: object.routes.flatMap(route => route.queryResults.filter(result => !result.ids.length).map(result => result.query)) })) }, null, 2));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
