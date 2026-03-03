#!/usr/bin/env node
/**
 * Cross-platform runner for db backup/restore.
 * Usage: node scripts/run-db-script.js backup | restore [path]
 * On Windows runs .ps1, otherwise runs .sh (bash).
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const action = process.argv[2]; // 'backup' | 'restore'
const extraArgs = process.argv.slice(3);
const scriptsDir = __dirname;
const isWin = process.platform === 'win32';

if (action !== 'backup' && action !== 'restore') {
  console.error('Usage: node run-db-script.js backup | restore [path]');
  process.exit(1);
}

let result;
if (isWin) {
  const scriptPath = path.join(scriptsDir, `${action}-db.ps1`);
  result = spawnSync(
    'powershell',
    ['-ExecutionPolicy', 'Bypass', '-File', scriptPath, ...extraArgs],
    { stdio: 'inherit', shell: true, cwd: path.join(__dirname, '..') }
  );
} else {
  const scriptPath = path.join(scriptsDir, `${action}-db.sh`);
  result = spawnSync('bash', [scriptPath, ...extraArgs], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
}

const code = result.status != null ? result.status : result.signal ? 1 : 0;
process.exit(code);
