import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export const runtimeDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../runtime');
export function runtimeRequire(root = runtimeDirectory) {
  return createRequire(path.join(root, 'package.json'));
}
export function runtimeEnvironment(root = runtimeDirectory) {
  const require = runtimeRequire(root);
  const directories = [path.dirname(require('ffmpeg-static')), path.dirname(require('ffprobe-static').path)];
  return { ...process.env, PATH: [...directories, process.env.PATH ?? ''].join(path.delimiter) };
}
export function npmInstall(root = runtimeDirectory) {
  // Run npm through Node on Windows, without interpolating paths into shell code.
  const npmCli = path.join(path.dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
  const args = ['ci', '--no-audit', '--no-fund'];
  const execution = fs.existsSync(npmCli)
    ? spawnSync(process.execPath, [npmCli, ...args], { cwd: root, stdio: 'inherit' })
    : spawnSync('npm', args, { cwd: root, stdio: 'inherit' });
  if (execution.error || execution.status !== 0) throw new Error(`Runtime dependency installation failed: ${execution.error?.message ?? execution.status}`);
}
export function runHyperframes(args, { root = runtimeDirectory, capture = false } = {}) {
  const cli = path.join(root, 'node_modules/hyperframes/bin/hyperframes.mjs');
  if (!fs.existsSync(cli)) throw new Error('Run the bundle install.mjs first to prepare HyperFrames.');
  return spawnSync(process.execPath, [cli, ...args], {
    env: runtimeEnvironment(root), encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit',
  });
}
export function prepareRuntime(root = runtimeDirectory) {
  npmInstall(root);
  for (const args of [['--help'], ['browser', 'ensure'], ['doctor', '--json']]) {
    console.log(`Preparing bundled HyperFrames: ${args.join(' ')}`);
    const execution = runHyperframes(args, { root, capture: args[0] === 'doctor' });
    if (execution.error || execution.status !== 0) throw new Error(`HyperFrames ${args.join(' ')} failed: ${execution.error?.message ?? execution.stderr ?? execution.status}`);
    if (args[0] === 'doctor') {
      const doctor = JSON.parse(execution.stdout.trim());
      const required = ['Node.js', 'FFmpeg', 'FFprobe', 'Chrome'];
      const missing = required.filter(name => doctor.checks?.find(check => check.name === name)?.ok !== true);
      if (missing.length) throw new Error(`Required runtime checks failed: ${missing.join(', ')}`);
      console.log(`Required runtime checks passed: ${required.join(', ')}`);
    }
  }
}
