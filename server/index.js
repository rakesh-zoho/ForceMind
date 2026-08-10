import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { spawn, exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync, writeFileSync, readdirSync, rmSync, cpSync, mkdirSync } from 'fs';
import { JiraClient } from '../utils/jira-client.js';
import { issuesToTaskFiles } from '../utils/jira-to-task.js';
import { chatStream, getActiveConfig, getOkfContext, reloadEnv } from '../utils/llm-client.js';
import { readConcept, buildGraph, checkStaleness } from '../okf-utils/okf-reader.js';
import { generateOkfFromStory, generateOkfFromJiraIssue, saveOkfFile, listOkfFiles } from '../okf-utils/okf-generator.js';
import { updateObjectSelectors, batchUpdateSelectors } from '../okf-utils/okf-selector-updater.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPORTS = path.join(ROOT, 'reports');
const TASKS_DIR = path.join(ROOT, 'tasks');
const MODELS_DIR = path.join(ROOT, 'models');
const PROMPTS_DIR = path.join(ROOT, 'prompts');
const SPECS_DIR = path.join(ROOT, 'specs');
const TESTS_DIR = path.join(ROOT, 'tests');
const DATA_DIR = path.join(ROOT, 'data');

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/vendor/ansi_up', express.static(path.join(ROOT, 'node_modules', 'ansi_up')));

const SUITES = [
  { id: 'lead', label: 'Lead Creation', cmd: 'npm run test:lead' },
  { id: 'lead-conversion', label: 'Lead Conversion', cmd: 'npm run test:conversion' },
  { id: 'opportunity', label: 'Opportunity Creation', cmd: 'npm run test:opportunity' },
  { id: 'account', label: 'Account Creation', cmd: 'npm run test:account' },
  { id: 'case', label: 'Case Creation', cmd: 'npm run test:case' },
  { id: 'contact-mcp', label: 'Contact MCP (API)', cmd: 'npm run test:contact-mcp:keep' },
  { id: 'all', label: 'All Tests', cmd: 'npm test' },
];

let activeProcess = null;
let lastTestEnd = null;

function killProcess() {
  if (!activeProcess) return;
  try { exec(`taskkill /PID ${activeProcess.pid} /F /T`, () => {}); } catch (e) {}
  activeProcess = null;
}

function runCmd(cmd, cwd = ROOT) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd, timeout: 120000, env: { ...process.env, FORCE_COLOR: '0' } }, (err, stdout, stderr) => {
      if (err) reject(err);
      else resolve(stdout);
    });
  });
}

function copyPwReport() {
  const src = path.join(ROOT, 'config', 'reports', 'playwright-report');
  const dest = path.join(REPORTS, 'playwright-report');
  if (existsSync(src)) {
    if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
    mkdirSync(dest, { recursive: true });
    cpSync(src, dest, { recursive: true });
    return true;
  }
  return false;
}

function clearOldResults() {
  // Clear allure-results so each run starts fresh
  const allureResults = path.join(REPORTS, 'allure-results');
  if (existsSync(allureResults)) rmSync(allureResults, { recursive: true, force: true });

  // Clear old PW report so stale data doesn't persist
  const pwReport = path.join(REPORTS, 'playwright-report');
  if (existsSync(pwReport)) rmSync(pwReport, { recursive: true, force: true });

  // Clear config/reports PW report too
  const configPwReport = path.join(ROOT, 'config', 'reports', 'playwright-report');
  if (existsSync(configPwReport)) rmSync(configPwReport, { recursive: true, force: true });

  // Clear test-results
  const testResults = path.join(REPORTS, 'test-results');
  if (existsSync(testResults)) rmSync(testResults, { recursive: true, force: true });
  const configTestResults = path.join(ROOT, 'config', 'reports', 'test-results');
  if (existsSync(configTestResults)) rmSync(configTestResults, { recursive: true, force: true });
}

// API: Suites
app.get('/api/suites', (req, res) => res.json(SUITES));

// API: Stop
app.post('/api/run/stop', (req, res) => {
  killProcess();
  res.json({ success: true });
});

// API: Get .env content
app.get('/api/env', (req, res) => {
  const envPath = path.join(ROOT, '.env');
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf8');
    res.json({ success: true, content });
  } else {
    res.json({ success: false, content: '' });
  }
});

// API: Save .env content
app.post('/api/env', (req, res) => {
  try {
    const envPath = path.join(ROOT, '.env');
    writeFileSync(envPath, req.body.content, 'utf8');
    reloadEnv(); // Reload env vars immediately
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// API: Generate reports from existing test results (no re-run)
app.post('/api/reports/generate', async (req, res) => {
  const errors = [];

  // 1. Allure report from existing allure-results
  try {
    const allureDir = path.join(REPORTS, 'allure-report');
    if (existsSync(allureDir)) rmSync(allureDir, { recursive: true, force: true });
    await runCmd('npx allure generate reports/allure-results --clean -o reports/allure-report');
  } catch (e) {
    errors.push('Allure: ' + e.message);
  }

  // 2. Playwright report — copy from config/reports if it exists (from last test run)
  const pwCopied = copyPwReport();
  if (!pwCopied) {
    errors.push('Playwright: No test results found. Run tests first.');
  }

  res.json({ success: errors.length === 0, errors });
});

// API: Auto-generate reports after test completion (called by WebSocket done handler)
app.post('/api/reports/auto-generate', async (req, res) => {
  try {
    // Allure
    const allureDir = path.join(REPORTS, 'allure-report');
    if (existsSync(allureDir)) rmSync(allureDir, { recursive: true, force: true });
    await runCmd('npx allure generate reports/allure-results --clean -o reports/allure-report').catch(() => {});

    // Playwright — copy from config/reports
    copyPwReport();

    res.json({ success: true });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// API: Check reports
app.get('/api/reports', (req, res) => {
  const pwDir = path.join(REPORTS, 'playwright-report');
  const allureDir = path.join(REPORTS, 'allure-report');
  const resultsDir = path.join(REPORTS, 'allure-results');
  const testResults = path.join(REPORTS, 'test-results');

  res.json({
    playwright: existsSync(pwDir),
    allure: existsSync(allureDir),
    hasResults: existsSync(resultsDir),
    hasTestResults: existsSync(testResults),
  });
});

// Serve reports — fallback to config/reports for Playwright
app.use('/reports', (req, res, next) => {
  const primaryPath = path.join(REPORTS, req.path);
  if (!existsSync(primaryPath) && req.path.includes('playwright-report')) {
    const altPath = path.join(ROOT, 'config', 'reports', req.path);
    if (existsSync(altPath)) {
      return res.sendFile(altPath);
    }
  }
  next();
}, express.static(REPORTS));

// ─── JIRA API ────────────────────────────────────────────────────────

// API: JIRA config status
app.get('/api/jira/status', (req, res) => {
  const jira = new JiraClient();
  res.json({
    configured: !!(jira.host && jira.email && jira.token),
    host: jira.host || '',
    projectKey: jira.projectKey || ''
  });
});

// ─── LLM Agent API ─────────────────────────────────────────────────

const GITHUB_AGENTS_DIR = path.join(ROOT, '.github', 'agents');

// Load agents from both prompts/ and .github/agents/
function loadAllAgents() {
  const agents = [];
  
  // Dashboard agents from prompts/
  agents.push(
    { id: 'planner', name: 'Planner Agent', description: 'Analyze tasks and create test plans', prompt: 'planner.md', source: 'dashboard' },
    { id: 'generator', name: 'Generator Agent', description: 'Generate Playwright test code from plans', prompt: 'generator.md', source: 'dashboard' },
    { id: 'healer', name: 'Healer Agent', description: 'Diagnose and fix failing tests', prompt: 'healer.md', source: 'dashboard' },
    { id: 'custom', name: 'Custom Agent', description: 'Flexible assistant for any task', prompt: 'custom.md', source: 'dashboard' }
  );
  
  // Load .github/agents/*.agent.md files
  if (existsSync(GITHUB_AGENTS_DIR)) {
    try {
      const files = readdirSync(GITHUB_AGENTS_DIR).filter(f => f.endsWith('.agent.md'));
      for (const file of files) {
        const id = file.replace('.agent.md', '');
        const name = id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        agents.push({
          id: `gh-${id}`,
          name: name,
          description: `${name} (from .github/agents)`,
          prompt: path.join('.github', 'agents', file),
          source: 'github'
        });
      }
    } catch (e) {
      console.warn('Failed to load .github/agents:', e.message);
    }
  }
  
  return agents;
}

let AGENTS = loadAllAgents();

// API: List available agents
app.get('/api/agents', (req, res) => {
  reloadEnv(); // Reload .env to pick up changes
  AGENTS = loadAllAgents(); // Refresh agents list
  const config = getActiveConfig();
  res.json({ agents: AGENTS, llm: config });
});

// API: List project files for @ mentions
app.get('/api/files', (req, res) => {
  const dirs = {
    tasks: TASKS_DIR,
    specs: SPECS_DIR,
    models: MODELS_DIR,
    tests: TESTS_DIR,
    data: DATA_DIR,
    memory: path.join(ROOT, 'memory'),
    prompts: PROMPTS_DIR,
    utils: path.join(ROOT, 'utils'),
    fixtures: path.join(ROOT, 'fixtures'),
  };

  const files = [];
  for (const [dir, dirPath] of Object.entries(dirs)) {
    if (!existsSync(dirPath)) continue;
    try {
      const entries = readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && !entry.name.startsWith('.')) {
          files.push({ dir, name: entry.name, path: dir + '/' + entry.name });
        }
      }
    } catch {}
  }

  res.json({ files });
});

// API: Save file content
app.post('/api/save-file', (req, res) => {
  try {
    const { filePath, content } = req.body;
    if (!filePath || content === undefined) {
      return res.json({ success: false, error: 'Provide filePath and content' });
    }

    // Resolve path relative to root, prevent directory traversal
    const resolved = path.resolve(ROOT, filePath);
    if (!resolved.startsWith(ROOT)) {
      return res.json({ success: false, error: 'Invalid path' });
    }

    // Create directory if needed
    const dir = path.dirname(resolved);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    writeFileSync(resolved, content, 'utf8');
    res.json({ success: true, path: path.relative(ROOT, resolved) });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// API: Read file content (for preview)
app.get('/api/read-file', (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) return res.json({ success: false, error: 'Provide path' });

    const resolved = path.resolve(ROOT, filePath);
    if (!resolved.startsWith(ROOT) || !existsSync(resolved)) {
      return res.json({ success: false, error: 'File not found' });
    }

    const content = readFileSync(resolved, 'utf8');
    res.json({ success: true, content, path: path.relative(ROOT, resolved) });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// API: Fetch stories from JIRA project
app.get('/api/jira/stories', async (req, res) => {
  try {
    const jira = new JiraClient();
    if (!jira.host || !jira.token) {
      return res.json({ success: false, error: 'JIRA not configured. Set JIRA_HOST, JIRA_EMAIL, JIRA_API_TOKEN in .env' });
    }

    const { sprint, status, type, maxResults } = req.query;
    const result = await jira.getIssuesByProject(jira.projectKey, {
      sprint,
      status,
      type,
      maxResults: parseInt(maxResults) || 50
    });

    res.json({ success: true, total: result.total, issues: result.issues });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// API: Fetch single issue
app.get('/api/jira/issue/:key', async (req, res) => {
  try {
    const jira = new JiraClient();
    const issue = await jira.getIssue(req.params.key);
    res.json({ success: true, issue });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// API: Generate task files from JIRA issues
app.post('/api/jira/generate-tasks', async (req, res) => {
  try {
    const { issueKeys, autoGenerateOkf } = req.body;
    if (!issueKeys || !Array.isArray(issueKeys) || issueKeys.length === 0) {
      return res.json({ success: false, error: 'Provide issueKeys array' });
    }

    const jira = new JiraClient();
    const issues = [];

    for (const key of issueKeys) {
      try {
        const issue = await jira.getIssue(key);
        issues.push(issue);
      } catch (e) {
        console.warn(`Failed to fetch ${key}:`, e.message);
      }
    }

    if (issues.length === 0) {
      return res.json({ success: false, error: 'No issues found for the provided keys' });
    }

    const created = issuesToTaskFiles(issues, TASKS_DIR);
    
    // Auto-generate OKF files if requested
    let okfFiles = [];
    if (autoGenerateOkf) {
      for (const issue of issues) {
        try {
          const objectName = issue.fields?.issuetype?.name || 'Custom';
          const content = generateOkfFromJiraIssue(issue, objectName);
          const filePath = saveOkfFile(objectName.toLowerCase(), content);
          okfFiles.push(path.relative(ROOT, filePath));
        } catch (e) {
          console.warn(`Failed to generate OKF for ${issue.key}:`, e.message);
        }
      }
    }

    res.json({
      success: true,
      count: created.length,
      files: created.map(f => ({ key: f.key, summary: f.summary, fileName: f.fileName })),
      okfFiles
    });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// ─── OKF API ──────────────────────────────────────────────────────────

app.get('/api/okf/bundle', (req, res) => {
  try {
    res.json(buildGraph());
  } catch (e) {
    res.json({ error: e.message });
  }
});

app.get('/api/okf/concept/{*path}', (req, res) => {
  try {
    const conceptPath = Array.isArray(req.params.path) 
      ? req.params.path.join('/') 
      : (req.params.path || '').replace(/,/g, '/');
    res.json(readConcept(conceptPath));
  } catch (e) {
    res.json({ error: e.message });
  }
});

app.get('/api/okf/staleness', (req, res) => {
  try {
    res.json(checkStaleness());
  } catch (e) {
    res.json({ error: e.message });
  }
});

// OKF Status endpoint - returns count, staleness, and freshness
app.get('/api/okf/status', (req, res) => {
  try {
    const graph = buildGraph();
    const stale = checkStaleness();
    const okfPath = path.join(ROOT, 'okf');
    
    // Get last modified time of OKF files
    let lastModified = null;
    const walkForTime = (dir) => {
      if (!existsSync(dir)) return;
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkForTime(fullPath);
        } else if (entry.name.endsWith('.md')) {
          try {
            const stat = { mtime: require('fs').statSync(fullPath).mtime };
            if (!lastModified || stat.mtime > lastModified) {
              lastModified = stat.mtime;
            }
          } catch {}
        }
      }
    };
    walkForTime(okfPath);
    
    res.json({
      total: graph.nodes?.length || 0,
      stale: stale.length,
      staleFiles: stale,
      lastModified: lastModified,
      fresh: stale.length === 0
    });
  } catch (e) {
    res.json({ error: e.message, total: 0, stale: 0, fresh: true });
  }
});

// ─── OKF Generator API ────────────────────────────────────────────────

app.post('/api/okf/generate', (req, res) => {
  try {
    const { objectName, storyContent, fields, relationships, isCustom, mode, storyId } = req.body;
    
    if (!objectName) {
      return res.json({ success: false, error: 'objectName is required' });
    }
    
    const content = generateOkfFromStory(storyContent || '', objectName, {
      fields: fields || [],
      relationships: relationships || [],
      isCustom: isCustom !== false
    });
    
    const filePath = saveOkfFile(objectName, content, { mode, storyId });
    res.json({ 
      success: true, 
      path: path.relative(ROOT, filePath),
      objectName 
    });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

app.post('/api/okf/generate-from-jira', async (req, res) => {
  try {
    const { issueKey, objectName } = req.body;
    
    if (!issueKey) {
      return res.json({ success: false, error: 'issueKey is required' });
    }
    
    const jira = new JiraClient();
    const issue = await jira.getIssue(issueKey);
    
    const content = generateOkfFromJiraIssue(issue, objectName || issue.fields?.issuetype?.name || 'Custom');
    
    const filePath = saveOkfFile(objectName || 'custom', content);
    res.json({ 
      success: true, 
      path: path.relative(ROOT, filePath),
      issueKey,
      objectName: objectName || 'custom'
    });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

app.get('/api/okf/list', (req, res) => {
  try {
    res.json(listOkfFiles());
  } catch (e) {
    res.json({ error: e.message });
  }
});

// ─── Selector Update API ──────────────────────────────────────────────

app.post('/api/okf/selectors/update', (req, res) => {
  try {
    const { objectName, selectors } = req.body;
    
    if (!objectName || !selectors) {
      return res.json({ success: false, error: 'objectName and selectors required' });
    }
    
    const filePath = updateObjectSelectors(objectName, selectors);
    res.json({ 
      success: true, 
      path: path.relative(ROOT, filePath),
      objectName,
      count: selectors.length
    });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

app.post('/api/okf/selectors/refresh', (req, res) => {
  try {
    const updates = batchUpdateSelectors();
    res.json({ 
      success: true, 
      updated: updates.length,
      details: updates
    });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// ─── Healer API ──────────────────────────────────────────────────────

// API: Run a test file and capture output
app.post('/api/healer/run-test', async (req, res) => {
  try {
    const { testFile } = req.body;
    if (!testFile) return res.json({ success: false, error: 'testFile is required' });
    
    const resolved = path.resolve(ROOT, testFile);
    if (!resolved.startsWith(ROOT) || !existsSync(resolved)) {
      return res.json({ success: false, error: 'Test file not found' });
    }
    
    // Run the test and capture output
    const cmd = `npx playwright test "${resolved}" --reporter=line`;
    const result = await new Promise((resolve, reject) => {
      exec(cmd, { cwd: ROOT, timeout: 180000, env: { ...process.env, FORCE_COLOR: '0' } }, (err, stdout, stderr) => {
        resolve({ stdout, stderr, exitCode: err?.code || 0 });
      });
    });
    
    // Parse test results
    const passed = (result.stdout.match(/(\d+)\s+passed/) || [0, 0])[1];
    const failed = (result.stdout.match(/(\d+)\s+failed/) || [0, 0])[1];
    const output = result.stdout + (result.stderr ? '\n' + result.stderr : '');
    
    res.json({ 
      success: true, 
      passed: parseInt(passed),
      failed: parseInt(failed),
      output,
      testFile: resolved
    });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// API: Run test and get failure details for healer
app.post('/api/healer/analyze', async (req, res) => {
  try {
    const { testFile } = req.body;
    if (!testFile) return res.json({ success: false, error: 'testFile is required' });
    
    const resolved = path.resolve(ROOT, testFile);
    if (!resolved.startsWith(ROOT) || !existsSync(resolved)) {
      return res.json({ success: false, error: 'Test file not found' });
    }
    
    // Run test with JSON reporter for detailed output
    const cmd = `npx playwright test "${resolved}" --reporter=json`;
    const result = await new Promise((resolve, reject) => {
      exec(cmd, { cwd: ROOT, timeout: 180000, env: { ...process.env, FORCE_COLOR: '0' } }, (err, stdout, stderr) => {
        resolve({ stdout, stderr, exitCode: err?.code || 0 });
      });
    });
    
    let testResults = null;
    try {
      // Extract JSON from output (may have other text)
      const jsonMatch = result.stdout.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        testResults = JSON.parse(jsonMatch[0]);
      }
    } catch {}
    
    // Also run with line reporter for readable output
    const cmdLine = `npx playwright test "${resolved}" --reporter=line`;
    const lineResult = await new Promise((resolve, reject) => {
      exec(cmdLine, { cwd: ROOT, timeout: 180000, env: { ...process.env, FORCE_COLOR: '0' } }, (err, stdout, stderr) => {
        resolve({ stdout, stderr, exitCode: err?.code || 0 });
      });
    });
    
    // Extract failure details
    const failures = [];
    if (testResults?.suites) {
      for (const suite of testResults.suites) {
        for (const spec of suite.specs || []) {
          for (const test of spec.tests || []) {
            for (const result of test.results || []) {
              if (result.status === 'failed' || result.status === 'timedOut') {
                failures.push({
                  title: spec.title,
                  suite: suite.title,
                  status: result.status,
                  error: result.error?.message || 'Unknown error',
                  stack: result.error?.stack || '',
                  steps: result.steps || []
                });
              }
            }
          }
        }
      }
    }
    
    res.json({ 
      success: true, 
      testFile: resolved,
      exitCode: result.exitCode,
      output: lineResult.stdout + (lineResult.stderr ? '\n' + lineResult.stderr : ''),
      failures,
      totalTests: testResults?.stats?.expected || 0,
      failedTests: testResults?.stats?.unexpected || 0,
      passedTests: testResults?.stats?.expected || 0
    });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// WebSocket
wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    let msg;
    try { msg = JSON.parse(data.toString()); } catch (e) { return; }

    if (msg.type === 'run') {
      killProcess();
      const suite = SUITES.find(s => s.id === msg.suite);
      if (!suite) return ws.send(JSON.stringify({ type: 'error', data: 'Unknown suite\n' }));
      runCommand(suite.cmd, ws);
    }

    if (msg.type === 'exec') {
      killProcess();
      runCommand(msg.cmd, ws);
    }

    if (msg.type === 'stop') {
      killProcess();
      ws.send(JSON.stringify({ type: 'system', data: '\r\n■ Terminated\r\n' }));
    }

    if (msg.type === 'chat') {
      handleChatMessage(msg.message, ws);
    }

    if (msg.type === 'llm-chat') {
      handleLlmChat(msg, ws);
    }
  });
});

// ─── Chat Handler ────────────────────────────────────────────────────

function loadAgentPrompt(agentId) {
  const agent = AGENTS.find(a => a.id === agentId);
  if (!agent) throw new Error(`Unknown agent: ${agentId}`);
  
  // Handle .github/agents path (relative to ROOT) or prompts/ directory
  let promptPath;
  if (agent.source === 'github') {
    promptPath = path.join(ROOT, agent.prompt);
  } else {
    promptPath = path.join(PROMPTS_DIR, agent.prompt);
  }
  
  if (!existsSync(promptPath)) throw new Error(`Prompt not found: ${agent.prompt}`);
  return readFileSync(promptPath, 'utf8');
}

function loadFileContent(filePath) {
  const resolved = path.resolve(ROOT, filePath);
  if (!resolved.startsWith(ROOT) || !existsSync(resolved)) return null;
  try {
    const content = readFileSync(resolved, 'utf8');
    const rel = path.relative(ROOT, resolved);
    return { path: rel, content };
  } catch {
    return null;
  }
}

function parseAtMentions(text) {
  const matches = text.match(/@[\w\/\-_.]+/g);
  if (!matches) return [];
  return [...new Set(matches.map(m => m.slice(1)))];
}

async function handleLlmChat(msg, ws) {
  const send = (type, data) => {
    if (ws.readyState === 1) ws.send(JSON.stringify({ type, data }));
  };

  const { agent, message, files: mentionedFiles } = msg;

  try {
    // Load agent system prompt
    const systemPrompt = loadAgentPrompt(agent);

    // Build messages array
    const messages = [{ role: 'system', content: systemPrompt }];

    // Automatically inject OKF context for agents
    try {
      const okfContext = getOkfContext();
      if (okfContext) {
        messages[0].content += '\n\n## OKF Knowledge Base\nThe following OKF files contain Salesforce object schemas, selectors, and patterns:\n\n' + okfContext;
      }
    } catch (e) {
      // OKF not available, continue without it
    }

    // Load referenced file contents
    let fileContext = '';
    if (mentionedFiles && mentionedFiles.length > 0) {
      const loaded = [];
      for (const fp of mentionedFiles) {
        const file = loadFileContent(fp);
        if (file) {
          loaded.push(file);
          fileContext += '\n\n--- File: ' + file.path + ' ---\n' + file.content;
        }
      }
      if (loaded.length > 0) {
        send('llm-info', 'Loaded ' + loaded.length + ' file(s): ' + loaded.map(f => f.path).join(', '));
      }
    }

    // Parse @ mentions from message text
    const atMentions = parseAtMentions(message);
    for (const mention of atMentions) {
      if (!mentionedFiles || !mentionedFiles.includes(mention)) {
        const file = loadFileContent(mention);
        if (file) {
          fileContext += '\n\n--- File: ' + file.path + ' ---\n' + file.content;
        }
      }
    }

    // Build user message with file context
    let userContent = message;
    if (fileContext) {
      userContent = '## Referenced Files\n' + fileContext + '\n\n## User Request\n' + message;
    }
    messages.push({ role: 'user', content: userContent });

    // Stream response from LLM
    send('llm-start', '');
    const stream = await chatStream(messages);

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Detect provider from first chunk
        let parsed = null;
        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6).trim();
          if (data === '[DONE]') {
            // Process and save files from complete response
            await processAndSaveFiles(fullContent, agent, send);
            send('llm-done', fullContent);
            return;
          }
          try {
            // OpenAI / GitHub format
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) { parsed = { content: delta }; }
            // Anthropic format
            if (json.type === 'message_stop') { 
              await processAndSaveFiles(fullContent, agent, send);
              send('llm-done', fullContent); 
              return; 
            }
            if (json.type === 'content_block_delta' && json.delta?.text) { parsed = { content: json.delta.text }; }
          } catch {}
        } else if (trimmed.startsWith('event: ')) {
          // Anthropic event type line — skip
        } else {
          // Try parsing as raw JSON (Anthropic sometimes sends bare JSON)
          try {
            const json = JSON.parse(trimmed);
            if (json.type === 'message_stop') { 
              await processAndSaveFiles(fullContent, agent, send);
              send('llm-done', fullContent); 
              return; 
            }
            if (json.type === 'content_block_delta' && json.delta?.text) { parsed = { content: json.delta.text }; }
          } catch {}
        }

        if (parsed?.content) {
          fullContent += parsed.content;
          send('llm-delta', parsed.content);
        }
      }
    }

    // Process and save files from complete response
    await processAndSaveFiles(fullContent, agent, send);
    send('llm-done', fullContent);
  } catch (e) {
    send('llm-error', e.message);
  }
}

// ─── Auto-save files from agent responses ─────────────────────────────
async function processAndSaveFiles(content, agent, send) {
  if (agent !== 'generator' && agent !== 'healer') return;

  // Extract code blocks with file paths
  const codeBlockRegex = /```(?:javascript|js|json|markdown|md)?\s*\n(?:(?:\/\/?\s*)?(?:File:?\s*)?(?:Save\s+(?:to\s+)?|Path:?\s*)?[\/\w\-\.]+\.(?:js|json|md))\n([\s\S]*?)```/gi;
  const fileSaveRegex = /(?:\/\/?\s*)?(?:File:?\s*)?(?:Save\s+(?:to\s+)?|Path:?\s*)([\/\w\-\.]+\.(?:js|json|md))/i;
  
  // Also look for explicit file path mentions before code blocks
  const explicitPathRegex = /(?:^|\n)(?:##?\s*)?(?:File|Path|Save\s+to|Output)[:\s]+([\/\w\-\.]+\.(?:js|json|md))\s*\n```/gi;

  const savedFiles = [];
  
  // Find all code blocks
  const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
  
  for (const block of codeBlocks) {
    // Extract the code content
    const codeMatch = block.match(/```(?:\w+)?\s*\n([\s\S]*?)```/);
    if (!codeMatch) continue;
    const code = codeMatch[1].trim();
    
    // Try to find file path in the block or surrounding text
    let filePath = null;
    
    // Check for path in the code block header
    const headerMatch = block.match(/```(?:\w+)?\s+([\/\w\-\.]+\.(?:js|json|md))/);
    if (headerMatch) {
      filePath = headerMatch[1];
    }
    
    // Check for path comment at start of code
    if (!filePath) {
      const commentMatch = code.match(/^(?:\/\/|#|\/\*|\*)\s*(?:File|Path|Save\s*to)[:\s]+([\/\w\-\.]+\.(?:js|json|md))/i);
      if (commentMatch) {
        filePath = commentMatch[1];
      }
    }
    
    // Check for explicit path in text before the code block
    if (!filePath) {
      const blockIndex = content.indexOf(block);
      const textBefore = content.substring(Math.max(0, blockIndex - 200), blockIndex);
      const pathMatch = textBefore.match(/(?:File|Path|Save\s+to|Output)[:\s]+([\/\w\-\.]+\.(?:js|json|md))\s*$/i);
      if (pathMatch) {
        filePath = pathMatch[1];
      }
    }
    
    // For generator agent, infer paths from content
    if (!filePath && agent === 'generator') {
      // Check if it looks like a test file
      if (code.includes('test.describe') || code.includes('test(')) {
        // Extract test name from describe block
        const describeMatch = code.match(/test\.describe\(['"]([^'"]+)/);
        if (describeMatch) {
          const testName = describeMatch[1].toLowerCase().replace(/[^a-z0-9]+/g, '-');
          filePath = `tests/${testName}.spec.js`;
        }
      }
      // Check if it looks like a POM file
      else if (code.includes('Page') && (code.includes('navigate') || code.includes('click'))) {
        const classMatch = code.match(/class\s+(\w+Page)/);
        if (classMatch) {
          const pageName = classMatch[1].replace('Page', '').toLowerCase();
          filePath = `models/${pageName}Page.js`;
        }
      }
      // Check if it looks like JSON data
      else if (code.trim().startsWith('{') && code.trim().endsWith('}')) {
        try {
          const json = JSON.parse(code);
          if (json.scenarios) {
            filePath = `data/test-data.json`;
          }
        } catch {}
      }
    }
    
    if (filePath) {
      // Ensure directory exists
      const fullPath = path.join(ROOT, filePath);
      const dir = path.dirname(fullPath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      
      // Save the file
      try {
        writeFileSync(fullPath, code, 'utf8');
        savedFiles.push(filePath);
        send('llm-info', `✅ Saved: ${filePath}`);
      } catch (e) {
        send('llm-error', `Failed to save ${filePath}: ${e.message}`);
      }
    }
  }
  
  if (savedFiles.length > 0) {
    send('llm-info', `\n📁 Auto-saved ${savedFiles.length} file(s): ${savedFiles.join(', ')}`);
  }
}

async function handleChatMessage(message, ws) {
  const send = (type, data) => {
    if (ws.readyState === 1) ws.send(JSON.stringify({ type, data }));
  };

  const cmd = message.trim().toLowerCase();

  // Fetch stories from JIRA
  if (cmd.startsWith('fetch') || cmd.startsWith('get stories') || cmd.startsWith('list stories')) {
    send('chat', '\x1b[33mFetching stories from JIRA...\x1b[0m\r\n');
    try {
      const jira = new JiraClient();
      if (!jira.host || !jira.token) {
        send('chat', '\x1b[31mJIRA not configured. Set JIRA_HOST, JIRA_EMAIL, JIRA_API_TOKEN in .env\x1b[0m\r\n');
        return;
      }

      // Parse optional filters from message
      let filters = {};
      if (cmd.includes('sprint')) {
        const sprintMatch = message.match(/sprint\s+(\S+)/i);
        if (sprintMatch) filters.sprint = sprintMatch[1];
      }
      if (cmd.includes('done') || cmd.includes('completed')) {
        filters.status = 'Done';
      } else if (cmd.includes('progress') || cmd.includes('active')) {
        filters.status = 'In Progress';
      }

      const result = await jira.getIssuesByProject(jira.projectKey, filters);

      if (result.issues.length === 0) {
        send('chat', `\x1b[33mNo stories found in project ${jira.projectKey}\x1b[0m\r\n`);
        return;
      }

      send('chat', `\x1b[32mFound ${result.total} stories in ${jira.projectKey}:\x1b[0m\r\n\r\n`);
      for (const issue of result.issues) {
        const statusColor = issue.status === 'Done' ? '\x1b[32m' : issue.status === 'In Progress' ? '\x1b[33m' : '\x1b[36m';
        send('chat', `  \x1b[1m${issue.key}\x1b[0m — ${issue.summary}\r\n`);
        send('chat', `    Status: ${statusColor}${issue.status}\x1b[0m  Priority: ${issue.priority}  Type: ${issue.issueType}\r\n\r\n`);
      }

      send('chat', `\x1b[33mTo generate task files, type: generate ${result.issues[0].key}\x1b[0m\r\n`);
    } catch (e) {
      send('chat', `\x1b[31mError: ${e.message}\x1b[0m\r\n`);
    }
    return;
  }

  // Generate task files from JIRA issue keys
  if (cmd.startsWith('generate') || cmd.startsWith('convert')) {
    // Extract issue keys from message
    const keys = message.match(/[A-Z][A-Z0-9]+-\d+/g);
    if (!keys || keys.length === 0) {
      send('chat', '\x1b[33mProvide issue keys to generate. Example: generate SF-101 SF-102\x1b[0m\r\n');
      return;
    }

    send('chat', `\x1b[33mGenerating task files for ${keys.length} issue(s)...\x1b[0m\r\n`);
    try {
      const jira = new JiraClient();
      const issues = [];

      for (const key of keys) {
        try {
          const issue = await jira.getIssue(key);
          issues.push(issue);
          send('chat', `  \x1b[32mFetched: ${key} — ${issue.summary}\x1b[0m\r\n`);
        } catch (e) {
          send('chat', `  \x1b[31mFailed to fetch ${key}: ${e.message}\x1b[0m\r\n`);
        }
      }

      if (issues.length === 0) {
        send('chat', '\x1b[31mNo issues fetched. Check issue keys and JIRA config.\x1b[0m\r\n');
        return;
      }

      const created = issuesToTaskFiles(issues, TASKS_DIR);

      send('chat', `\r\n\x1b[32mCreated ${created.length} task file(s):\x1b[0m\r\n\r\n`);
      for (const f of created) {
        send('chat', `  \x1b[1m${f.fileName}\x1b[0m\r\n`);
        send('chat', `    JIRA: ${f.key} — ${f.summary}\x1b[0m\r\n`);
        send('chat', `    Path: tasks/${f.fileName}\r\n\r\n`);
      }

      // Auto-generate OKF files from JIRA issues
      send('chat', '\x1b[33mGenerating OKF files...\x1b[0m\r\n');
      let okfCount = 0;
      for (const issue of issues) {
        try {
          const objectName = issue.fields?.issuetype?.name || 'Custom';
          const content = generateOkfFromJiraIssue(issue, objectName);
          const filePath = saveOkfFile(objectName.toLowerCase(), content);
          const relPath = path.relative(ROOT, filePath);
          send('chat', `  \x1b[32mOKF: ${relPath}\x1b[0m\r\n`);
          okfCount++;
        } catch (e) {
          send('chat', `  \x1b[31mOKF failed for ${issue.key}: ${e.message}\x1b[0m\r\n`);
        }
      }

      send('chat', '\x1b[36mNext steps:\x1b[0m\r\n');
      send('chat', '  1. Review the task files in tasks/ folder\r\n');
      send('chat', '  2. Run Planner agent to generate test plan\r\n');
      send('chat', '  3. Run Generator agent to create test code\r\n');
    } catch (e) {
      send('chat', `\x1b[31mError: ${e.message}\x1b[0m\r\n`);
    }
    return;
  }

  // Generate task files for all stories in project
  if (cmd.startsWith('generate all') || cmd.startsWith('convert all')) {
    send('chat', '\x1b[33mFetching all stories and generating task files...\x1b[0m\r\n');
    try {
      const jira = new JiraClient();
      const result = await jira.getIssuesByProject(jira.projectKey, { maxResults: 20 });

      if (result.issues.length === 0) {
        send('chat', `\x1b[33mNo stories found in project ${jira.projectKey}\x1b[0m\r\n`);
        return;
      }

      const created = issuesToTaskFiles(result.issues, TASKS_DIR);

      send('chat', `\r\n\x1b[32mCreated ${created.length} task file(s) from ${jira.projectKey}:\x1b[0m\r\n\r\n`);
      for (const f of created) {
        send('chat', `  \x1b[1m${f.fileName}\x1b[0m — ${f.key}\r\n`);
      }
    } catch (e) {
      send('chat', `\x1b[31mError: ${e.message}\x1b[0m\r\n`);
    }
    return;
  }

  // Help
  if (cmd === 'help' || cmd === '?') {
    send('chat', '\r\n\x1b[1mAvailable JIRA Commands:\x1b[0m\r\n\r\n');
    send('chat', '  \x1b[36mfetch\x1b[0m                    — List all stories in project\r\n');
    send('chat', '  \x1b[36mfetch sprint SprintName\x1b[0m  — List stories in a sprint\r\n');
    send('chat', '  \x1b[36mgenerate SF-101 SF-102\x1b[0m  — Generate task files for issues\r\n');
    send('chat', '  \x1b[36mgenerate all\x1b[0m             — Generate task files for all stories\r\n');
    send('chat', '  \x1b[36mhelp\x1b[0m                     — Show this help\r\n\r\n');
    return;
  }

  // Unknown command
  send('chat', `\x1b[33mUnknown command: "${message}"\x1b[0m\r\n`);
  send('chat', '\x1b[36mType "help" for available commands.\x1b[0m\r\n');
}

function runCommand(cmd, ws) {
  ws.send(JSON.stringify({ type: 'system', data: `\x1b[36m$ ${cmd}\x1b[0m\r\n\r\n` }));

  // Clear old results before each run
  clearOldResults();

  const child = spawn(cmd, [], {
    cwd: ROOT,
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1', TERM: 'xterm-256color' },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  activeProcess = child;

  child.stdout.on('data', (chunk) => {
    if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'stdout', data: chunk.toString('utf8') }));
  });

  child.stderr.on('data', (chunk) => {
    if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'stderr', data: chunk.toString('utf8') }));
  });

  child.on('close', (code) => {
    activeProcess = null;
    lastTestEnd = Date.now();
    // Copy PW report from config/reports to reports/ so it can be served
    copyPwReport();
    if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'done', code }));
  });

  child.on('error', (err) => {
    activeProcess = null;
    if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'error', data: err.message + '\r\n' }));
  });
}

const PORT = process.env.PORT || process.env.DASHBOARD_PORT || 3000;
server.listen(PORT, () => console.log('Dashboard: http://localhost:' + PORT));
