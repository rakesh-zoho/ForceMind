#!/usr/bin/env node

/**
 * Self-Healing Test Runner
 *
 * Detects auth/login failures, automatically re-authenticates via
 * Playwright's globalSetup, and retries until all tests pass.
 *
 * Usage:  node scripts/self-heal.js [test-pattern] [--max-retries=N]
 * Example: node scripts/self-heal.js tests/lead-creation.spec.js --max-retries=3
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const AUTH_STATE_PATH = path.join(ROOT, 'reports', '.auth-state.json');
const CONFIG_PATH = path.join(ROOT, 'config', 'playwright.config.js');

const args = process.argv.slice(2);
const maxRetries = parseInt(args.find(a => a.startsWith('--max-retries='))?.split('=')[1] || '3');
const testPattern = args.filter(a => !a.startsWith('--'))[0] || 'tests/*.spec.js';

const C = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', bold: '\x1b[1m',
};

function log(color, msg) { console.log(`${color}${msg}${C.reset}`); }

function parseResults(output) {
  const p = output.match(/(\d+) passed/);
  const f = output.match(/(\d+) failed/);
  const s = output.match(/(\d+) skipped/);
  return {
    passed: p ? parseInt(p[1]) : 0,
    failed: f ? parseInt(f[1]) : 0,
    skipped: s ? parseInt(s[1]) : 0,
  };
}

function authFailureDetected(output) {
  const patterns = [
    /Auth state missing/i,
    /\/login\?/,
    /login\.salesforce\.com/i,
    /Your session has expired/i,
    /session timeout/i,
    /SF Login failed/i,
    /net::ERR_/i,
    /test skipped.*auth state/i,
  ];

  for (const line of output.split('\n')) {
    if (line.includes('failed') || line.includes('Error') || line.includes('skip')) {
      for (const pat of patterns) {
        if (pat.test(line)) return true;
      }
    }
  }

  const stats = parseResults(output);
  if (stats.failed > 0 && stats.passed === 0 && stats.skipped === 0) return true;

  return false;
}

function deleteAuthState() {
  if (fs.existsSync(AUTH_STATE_PATH)) {
    fs.unlinkSync(AUTH_STATE_PATH);
    log(C.yellow, '  Deleted stale auth state');
  }
}

function runTests(pattern, forceLogin = false) {
  return new Promise((resolve) => {
    const env = { ...process.env };
    if (forceLogin) env.FORCE_LOGIN = 'true';

    log(C.cyan, `\n  Running: playwright test ${pattern}${forceLogin ? ' (with fresh login)' : ''}`);

    const proc = spawn('npx', [
      'playwright', 'test',
      '--config', CONFIG_PATH,
      pattern,
    ], {
      cwd: ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
      env,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      const chunk = data.toString();
      stdout += chunk;
      process.stdout.write(chunk);
    });

    proc.stderr.on('data', (data) => {
      const chunk = data.toString();
      stderr += chunk;
      process.stderr.write(chunk);
    });

    proc.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

async function main() {
  log(C.bold, '\n╔══════════════════════════════════════════════╗');
  log(C.bold, '║   Self-Healing Test Runner                   ║');
  log(C.bold, '╚══════════════════════════════════════════════╝');
  log(C.cyan, `  Pattern:  ${testPattern}`);
  log(C.cyan, `  Retries:  ${maxRetries}\n`);

  // Step 1: Validate auth state
  log(C.yellow, 'Step 1: Checking auth state...');
  if (!fs.existsSync(AUTH_STATE_PATH)) {
    log(C.red, '  No auth state found. Creating fresh login...');
  } else {
    log(C.green, '  Auth state file found.');
  }

  let attempt = 0;
  let allPassed = false;
  let forceLogin = !fs.existsSync(AUTH_STATE_PATH);

  while (attempt <= maxRetries && !allPassed) {
    attempt++;

    if (attempt > 1) {
      log(C.yellow, `\n${'─'.repeat(50)}`);
      log(C.yellow, `  Retry ${attempt - 1}/${maxRetries}`);
      log(C.yellow, `${'─'.repeat(50)}`);
    }

    const result = await runTests(testPattern, forceLogin);
    const combined = result.stdout + result.stderr;
    const stats = parseResults(combined);

    log(C.bold, '\n  ─── Results ───');
    log(C.green, `  Passed:  ${stats.passed}`);
    log(C.red, `  Failed:  ${stats.failed}`);
    log(C.yellow, `  Skipped: ${stats.skipped}`);

    if (stats.failed === 0 && stats.skipped === 0) {
      allPassed = true;
      log(C.green, '\n  All tests passed!');
    } else if (authFailureDetected(combined)) {
      log(C.red, '\n  Auth/login failure detected!');

      if (attempt > maxRetries) {
        log(C.red, `  Max retries (${maxRetries}) exhausted.`);
        break;
      }

      log(C.yellow, '  → Clearing auth state and re-authenticating...');
      deleteAuthState();
      forceLogin = true;
      log(C.green, '  Will re-authenticate on next run...');
    } else {
      if (attempt > maxRetries) {
        log(C.red, `\n  Max retries (${maxRetries}) exhausted. ${stats.failed} test(s) still failing.`);
        break;
      }
      log(C.yellow, `\n  Non-auth failures detected. Retrying...`);
      forceLogin = false;
    }
  }

  log(C.bold, '\n╔══════════════════════════════════════════════╗');
  if (allPassed) {
    log(C.green, '║   ALL TESTS PASSED                           ║');
  } else {
    log(C.red, '║   SOME TESTS STILL FAILING                   ║');
  }
  log(C.bold, '╚══════════════════════════════════════════════╝\n');

  process.exit(allPassed ? 0 : 1);
}

main();
