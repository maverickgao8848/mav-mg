import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const recordName = 'frame-provenance.json';
function relative(value) {
  if (typeof value !== 'string' || !value || value.includes('\\') || value.includes(':') || path.posix.isAbsolute(value) || value.split('/').some(p => !p || p === '.' || p === '..')) throw Error(`Unsafe frame resource destination: ${value}`);
  return value;
}
function inside(project, name) {
  let current = project;
  for (const part of relative(name).split('/')) {
    current = path.join(current, part);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw Error(`Linked frame destination: ${name}`);
  }
  return current;
}
function readFrame(source) {
  let file = path.resolve(source);
  if (fs.statSync(file).isDirectory()) file = path.join(file, 'frame.md');
  const bytes = fs.readFileSync(file);
  if (!bytes.toString('utf8').trim()) throw Error(`Empty upstream frame: ${file}`);
  return { file, bytes };
}

export function verifyInheritedFrame(projectDirectory) {
  const project = path.resolve(projectDirectory), problems = [];
  const file = path.join(project, recordName);
  if (!fs.existsSync(file)) return { ok: true, inherited: false, problems };
  try {
    const record = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (record.schemaVersion !== 'mav-mg-frame-inheritance/v1' || !Array.isArray(record.resources)) throw Error('Invalid frame provenance');
    for (const item of [{ path: 'frame.md', sha256: record.frameSha256 }, { path: record.snapshot, sha256: record.frameSha256 }, ...record.resources]) {
      const target = inside(project, item.path);
      if (!fs.existsSync(target) || hash(fs.readFileSync(target)) !== item.sha256) problems.push(`Inherited frame drift: ${item.path}`);
    }
    // A portable copy remains valid without access to its original machine.
    if (fs.existsSync(record.sourcePath) && hash(fs.readFileSync(record.sourcePath)) !== record.sourceSha256) problems.push('Upstream frame changed; explicitly re-import after reviewing the change');
  } catch (error) { problems.push(error.message); }
  return { ok: problems.length === 0, inherited: true, problems };
}

export function inheritFrame({ projectDirectory, upstream, sourcePath, searchRoot, replace = false, styleId, resources = [] }) {
  const project = path.resolve(projectDirectory);
  // An established child stays pinned to its own frame. New children discover
  // the nearest ancestor, skipping empty animations/ directories naturally.
  if (!upstream && fs.existsSync(path.join(project, 'frame.md'))) {
    const verified = verifyInheritedFrame(project);
    if (!verified.ok) throw Error(verified.problems.join('; '));
    return { status: 'existing-project', ...verified };
  }
  let selected = upstream;
  if (!selected) {
    const limit = searchRoot ? path.resolve(searchRoot) : undefined;
    if (limit && project !== limit && !project.startsWith(limit + path.sep)) throw Error('Project is outside --search-root');
    let directory = path.dirname(project);
    while (directory !== project && limit !== project) {
      const candidate = path.join(directory, 'frame.md');
      if (fs.existsSync(candidate)) { selected = candidate; break; }
      if (directory === limit || fs.existsSync(path.join(directory, '.git'))) break;
      const next = path.dirname(directory);
      if (next === directory) break;
      directory = next;
    }
  }
  if (!selected && sourcePath) {
    const input = path.resolve(sourcePath);
    if (!fs.existsSync(input)) throw Error(`Source input is missing: ${input}`);
    let directory = fs.statSync(input).isDirectory() ? input : path.dirname(input);
    while (true) {
      const candidate = path.join(directory, 'frame.md');
      if (fs.existsSync(candidate)) { selected = candidate; break; }
      const next = path.dirname(directory);
      if (next === directory || fs.existsSync(path.join(directory, '.git'))) break;
      directory = next;
    }
  }
  if (!selected) return { status: 'no-upstream', inherited: false };
  const source = readFrame(selected);
  if (source.file === path.join(project, 'frame.md')) throw Error('Upstream must be outside the destination frame');
  const sourceDirectory = path.dirname(source.file);
  const companion = path.join(sourceDirectory, 'frame-resources.json');
  const declarations = fs.existsSync(companion) ? JSON.parse(fs.readFileSync(companion, 'utf8')) : { resources: [] };
  if (!Array.isArray(declarations.resources)) throw Error('frame-resources.json needs a resources array');
  const inheritedRecord = path.join(sourceDirectory, recordName);
  const parent = fs.existsSync(inheritedRecord) ? JSON.parse(fs.readFileSync(inheritedRecord, 'utf8')) : undefined;
  const parentCheck = verifyInheritedFrame(sourceDirectory);
  if (!parentCheck.ok) throw Error(parentCheck.problems.join('; '));
  const planned = new Map();
  for (const item of [...(parent?.resources ?? []), ...declarations.resources, ...resources]) {
    const destination = relative(item.path);
    if (['frame.md', recordName, 'frame-resources.json'].includes(destination) || destination.startsWith('assets/references/upstream-frame/')) throw Error('Reserved frame resource path');
    const file = path.resolve(sourceDirectory, item.source ?? item.path);
    const bytes = fs.readFileSync(file);
    if (item.sha256 && hash(bytes) !== item.sha256) throw Error(`Frame resource source drift: ${file}`);
    if (planned.has(destination) && !planned.get(destination).bytes.equals(bytes)) throw Error(`Conflicting frame resource: ${destination}`);
    planned.set(destination, { bytes, sourcePath: file, path: destination, sha256: hash(bytes) });
  }
  const snapshot = 'assets/references/upstream-frame/FRAME.md';
  const record = { schemaVersion: 'mav-mg-frame-inheritance/v1', styleId: styleId ?? declarations.styleId ?? parent?.styleId ?? 'upstream-frame', sourcePath: source.file, sourceSha256: hash(source.bytes), frameSha256: hash(source.bytes), snapshot, resources: [...planned.values()].map(({ bytes, ...item }) => item) };
  const writes = [{ path: 'frame.md', bytes: source.bytes }, { path: snapshot, bytes: source.bytes }, ...planned.values(), { path: recordName, bytes: Buffer.from(JSON.stringify(record, null, 2) + '\n') }];
  if (fs.existsSync(companion)) writes.push({ path: 'frame-resources.json', bytes: fs.readFileSync(companion) });
  // Resolve every dependency and conflict before the first write. --replace is
  // reserved for a user-authorized style change, not an automatic fallback.
  for (const item of writes) {
    const target = inside(project, item.path);
    if (fs.existsSync(target) && !fs.readFileSync(target).equals(item.bytes) && !replace) throw Error(`Existing project content differs: ${item.path}; preserve it or use --replace for an authorized style change`);
  }
  let count = 0;
  for (const item of writes) {
    const target = inside(project, item.path);
    if (!fs.existsSync(target) || !fs.readFileSync(target).equals(item.bytes)) {
      fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, item.bytes); count++;
    }
  }
  return { status: count ? 'inherited' : 'unchanged', inherited: true, sourcePath: source.file, frameSha256: record.frameSha256, styleId: record.styleId, resourceCount: record.resources.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = { resources: [] }; let check = false;
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
      const key = args[i];
      if (key === '--replace') { options.replace = true; continue; }
      if (key === '--check') { check = true; continue; }
      const field = { '--project': 'projectDirectory', '--upstream': 'upstream', '--source': 'sourcePath', '--search-root': 'searchRoot', '--style-id': 'styleId' }[key];
      if (!field || !args[i + 1] || args[i + 1].startsWith('--')) throw Error(`Unknown/incomplete argument: ${key}`);
      options[field] = args[++i];
    }
    if (!options.projectDirectory) throw Error('--project is required');
    const result = check ? verifyInheritedFrame(options.projectDirectory) : inheritFrame(options);
    console.log(JSON.stringify(result, null, 2));
    if (result.ok === false) process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
