import { runHyperframes } from './runtime.mjs';
try {
  const execution = runHyperframes(process.argv.slice(2));
  if (execution.error) throw execution.error;
  process.exitCode = execution.status ?? 1;
} catch (error) { console.error(error.message); process.exitCode = 1; }
