import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runtimeRequire } from './runtime.mjs';

export const catalogUrl = 'https://pixel2all.cn/media/ceramic/catalog.json';
export const collectionUrl = 'https://pixel2all.cn/objects/';
const rightsFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../references/pixel2all-rights.md');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
export async function fetchBytes(url, limit) {
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Download failed (${response.status}): ${url}`);
  const chunks = []; let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > limit) throw new Error('Remote asset exceeds size limit');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
export function validateCatalog(catalog) {
  if (catalog.schemaVersion !== 1 || !Array.isArray(catalog.items) || catalog.count !== catalog.items.length) throw new Error('Invalid Pixel2All catalog');
  const seen = new Set();
  for (const item of catalog.items) {
    if (!/^ceramic-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id ?? '') || seen.has(item.id)) throw new Error('Invalid/duplicate object ID');
    seen.add(item.id);
    const url = new URL(item.preview, 'https://pixel2all.cn');
    const version = url.searchParams.getAll('v');
    if (url.origin !== 'https://pixel2all.cn' || url.pathname !== `/media/ceramic/${item.id}-preview.webp` || url.hash ||
        [...url.searchParams.keys()].some(key => key !== 'v') || version.length > 1 ||
        (version.length && (!/^[a-f0-9]{64}$/.test(item.sha256 ?? '') || version[0] !== item.sha256.slice(0, 16)))) throw new Error(`Unexpected preview URL: ${item.id}`);
    if (![item.width, item.height, item.previewSize].every(n => Number.isInteger(n) && n > 0 && n <= 8192) ||
        !['name', 'object', 'state'].every(key => typeof item[key] === 'string') ||
        !['tags', 'aliases'].every(key => Array.isArray(item[key]) && item[key].every(value => typeof value === 'string'))) throw new Error(`Invalid object metadata: ${item.id}`);
  }
  return catalog;
}
export function searchCatalog(catalog, queries, category) {
  const normalize = value => value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const tokens = [...new Set(queries.map(normalize).filter(Boolean))];
  return catalog.items.filter(item => !category || item.category === category).map(item => {
    const fields = Object.entries({ id: [item.id], name: [item.name], object: [item.object], state: [item.state], tags: item.tags, aliases: item.aliases })
      .flatMap(([field, values]) => values.map(value => ({ field, value: normalize(value) })));
    const matches = tokens.map(query => {
      // Latin words/phrases have boundaries: AI must not match air or chain.
      const includes = value => /\p{Script=Han}/u.test(query) ? value.includes(query) : (` ${value} `).includes(` ${query} `);
      const matched = fields.filter(({ value }) => includes(value));
      return { query, score: matched.some(({ value }) => value === query) ? 3 : matched.length ? 1 : 0,
        fields: [...new Set(matched.map(({ field }) => field))] };
    }).filter(match => match.score);
    const score = matches.reduce((sum, match) => sum + match.score, 0);
    return { ...item, score, matches, sourcePage: collectionUrl + '?item=' + item.id };
  }).filter(item => !tokens.length || item.score).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}
function local(root, relative) {
  if (!relative || path.posix.isAbsolute(relative) || relative.includes('\\') || relative.includes(':') || relative.split('/').some(part => !part || part === '.' || part === '..')) throw new Error('Invalid project asset path');
  let current = root;
  for (const segment of relative.split('/')) {
    current = path.join(current, segment);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw new Error('Linked project asset path');
  }
  return current;
}
const read = (file, fallback) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')) : fallback;
export async function stageObject({ projectDirectory, item, catalogSha256, usage = 'delivery-authorized', rightsNote, original, fetcher = fetchBytes }) {
  if (!['delivery-authorized', 'owner', 'personal-noncommercial', 'commercial'].includes(usage)) throw new Error('Invalid usage');
  const rightsSha256 = usage === 'delivery-authorized' ? hash(fs.readFileSync(rightsFile)) : null;
  const licenseEvidence = usage === 'delivery-authorized' ? fs.readFileSync(rightsFile, 'utf8').trim() : rightsNote ?? null;
  if (usage !== 'personal-noncommercial' && !licenseEvidence?.trim()) throw new Error('Usage needs actual rights evidence');
  const root = path.resolve(projectDirectory);
  const relative = `assets/objects/pixel2all/${item.id}.png`;
  const target = local(root, relative), metadataFile = local(root, 'assets/objects/pixel2all/metadata.json'), creditsFile = local(root, 'asset-credits.json');
  const manifest = read(metadataFile, { schemaVersion: 1, sourceId: 'pixel2all', items: [] });
  const credits = read(creditsFile, []);
  if (manifest.schemaVersion !== 1 || manifest.sourceId !== 'pixel2all' || !Array.isArray(manifest.items) || !Array.isArray(credits)) throw new Error('Invalid existing object manifest/credits');
  const acquisition = original ? 'original-import' : 'online-preview-converted';
  const sourceUrl = original ? null : new URL(item.preview, 'https://pixel2all.cn').href;
  const sourcePage = collectionUrl + '?item=' + item.id;
  const existing = manifest.items.find(entry => entry.id === item.id);
  if (existing) {
    if (!fs.existsSync(target) || hash(fs.readFileSync(target)) !== existing.sha256) throw new Error('Frozen project object changed');
    if (existing.usage !== usage || existing.licenseEvidence !== licenseEvidence || existing.sourcePage !== sourcePage || existing.acquisition !== acquisition ||
        (original && hash(fs.readFileSync(original)) !== existing.sha256)) throw new Error('Existing object provenance differs; preserve it and reconcile explicitly');
    if (!credits.some(entry => entry.path === relative && entry.sha256 === existing.sha256 && entry.sourceId === 'pixel2all')) throw new Error('Frozen object credits missing or changed');
    return { status: 'unchanged', ...existing };
  }
  if (fs.existsSync(target) || credits.some(entry => entry.path === relative)) throw new Error('Unregistered/conflicting project object');
  let sharp;
  try { sharp = runtimeRequire()('sharp'); } catch { throw new Error('PNG converter is unavailable. Run the bundle install.mjs first.'); }
  const source = original ? fs.readFileSync(original) : await fetcher(sourceUrl, 20 * 1024 * 1024);
  const info = await sharp(source, { limitInputPixels: 8192 * 8192 }).metadata();
  if (original ? info.format !== 'png' || info.width !== item.width || info.height !== item.height || (item.sha256 && hash(source) !== item.sha256)
    : info.format !== 'webp' || Math.max(info.width, info.height) !== item.previewSize) throw new Error('Unexpected selected image format, dimensions or original hash');
  const bytes = original ? source : await sharp(source).ensureAlpha().png().toBuffer();
  const { data, info: pixels } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let transparent = false, visible = false;
  for (let i = 3; i < data.length; i += pixels.channels) { transparent ||= data[i] < 255; visible ||= data[i] > 0; }
  if (!transparent || !visible) throw new Error('Object requires visible pixels and transparent background');
  const record = {
    id: item.id, name: item.name, path: relative, sourceId: 'pixel2all', sourcePage, sourceUrl,
    catalogUrl, catalogSha256, sha256: hash(bytes), downloadSha256: hash(source), originalSha256: item.sha256 ?? null,
    bytes: bytes.length, width: info.width, height: info.height, alphaCapable: true, acquisition,
    originalDimensions: [item.width, item.height], category: item.category, tags: item.tags, aliases: item.aliases,
    roles: [item.object, item.state], usage, licenseUrl: 'https://pixel2all.cn/objects/license', licenseEvidence, rightsSha256,
    attribution: usage === 'personal-noncommercial' ? '素材：像素造物 pixel2all.cn/objects' : null,
    stagedOn: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' }),
  };
  const backups = [metadataFile, creditsFile].map(file => fs.existsSync(file) ? fs.readFileSync(file) : null);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  try {
    fs.writeFileSync(target, bytes, { flag: 'wx' });
    fs.writeFileSync(metadataFile, JSON.stringify({ ...manifest, items: [...manifest.items, record] }, null, 2) + '\n');
    fs.writeFileSync(creditsFile, JSON.stringify([...credits, record], null, 2) + '\n');
  } catch (error) {
    fs.rmSync(target, { force: true });
    [metadataFile, creditsFile].forEach((file, i) => backups[i] ? fs.writeFileSync(file, backups[i]) : fs.rmSync(file, { force: true }));
    throw error;
  }
  return { status: 'staged', ...record };
}
async function main(args) {
  const options = { queries: [], ids: [] };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--list') options.list = true;
    else if (arg === '--help') { console.log('node scripts/stage-pixel2all-object.mjs --search <word> [--search <synonym>] [--output <json>]\n--id <catalog-id> --project <directory> [--file <original.png>] [--usage delivery-authorized|owner|personal-noncommercial|commercial] [--rights-note <evidence>]'); return; }
    else if (['--search', '--id', '--project', '--output', '--category', '--usage', '--rights-note', '--file'].includes(arg) && args[i + 1] && !args[i + 1].startsWith('--')) {
      const value = args[++i];
      if (arg === '--search') options.queries.push(value);
      else if (arg === '--id') options.ids.push(value);
      else options[arg.slice(2)] = value;
    } else throw new Error(`Unknown or incomplete argument: ${arg}`);
  }
  if (!options.list && !options.queries.length && !options.ids.length) throw new Error('Use --search, --list, or --id with --project');
  if (options.ids.length && !options.project) throw new Error('--id requires --project');
  if (options.file && options.ids.length !== 1) throw new Error('--file requires exactly one --id');
  const bytes = await fetchBytes(catalogUrl, 4 * 1024 * 1024);
  const catalog = validateCatalog(JSON.parse(bytes.toString('utf8'))), sha = hash(bytes);
  const result = options.ids.length ? await (async () => {
    const selected = [...new Set(options.ids)].map(id => {
      const item = catalog.items.find(item => item.id === id);
      if (!item) throw new Error(`Unknown catalog ID: ${id}`);
      return item;
    });
    const records = [];
    for (const item of selected) records.push(await stageObject({ projectDirectory: options.project, item, catalogSha256: sha, original: options.file, usage: options.usage, rightsNote: options['rights-note'] }));
    return records;
  })() : { sourceId: 'pixel2all', catalogUrl, catalogSha256: sha, queries: options.queries, checkedOn: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' }), items: searchCatalog(catalog, options.queries, options.category) };
  const output = JSON.stringify(result, null, 2) + '\n';
  if (options.output) { fs.mkdirSync(path.dirname(path.resolve(options.output)), { recursive: true }); fs.writeFileSync(options.output, output); }
  console.log(output);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
