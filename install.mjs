import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInstaller } from './scripts/install-delivery.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
if (args.includes('--help')) {
  runInstaller({ args });
} else {
  const temporaryParent = fs.realpathSync(os.tmpdir());
  const staging = fs.mkdtempSync(path.join(temporaryParent, 'mav-mg-public-'));
  const companions = fs.readdirSync(path.join(root, 'vendor/skills')).sort();
  const skip = new Set(['.git', 'node_modules', '__pycache__', '.cache', '.hyperframes', 'vendor']);
  const entries = [];
  function copy(source, destination, relative) {
    for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
      if (skip.has(entry.name) || entry.name.startsWith('.env')) continue;
      if (entry.isSymbolicLink()) throw new Error(`Unexpected linked source: ${entry.name}`);
      const from = path.join(source, entry.name), to = path.join(destination, entry.name);
      const name = `${relative}/${entry.name}`;
      if (entry.isDirectory()) copy(from, to, name);
      else if (entry.isFile()) {
        fs.mkdirSync(path.dirname(to), { recursive: true });
        fs.copyFileSync(from, to);
        entries.push(`${crypto.createHash('sha256').update(fs.readFileSync(to)).digest('hex')}  ${name}`);
      }
    }
  }
  try {
    copy(root, path.join(staging, 'skills/xiangsu-mg'), 'skills/xiangsu-mg');
    for (const name of companions) copy(path.join(root, 'vendor/skills', name), path.join(staging, 'skills', name), `skills/${name}`);
    const runtime = JSON.parse(fs.readFileSync(path.join(root, 'runtime/package.json')));
    fs.writeFileSync(path.join(staging, 'delivery.json'), JSON.stringify({ schemaVersion: 1, cliVersion: runtime.dependencies.hyperframes, skills: ['xiangsu-mg', ...companions] }));
    fs.writeFileSync(path.join(staging, 'MANIFEST.sha256'), entries.sort().join('\n') + '\n');
    runInstaller({ bundleRoot: staging, args });
  } finally {
    const resolved = fs.realpathSync(staging);
    if (path.dirname(resolved) !== temporaryParent || !path.basename(resolved).startsWith('mav-mg-public-')) throw new Error('Unexpected installer temporary path');
    fs.rmSync(resolved, { recursive: true, force: true });
  }
}
