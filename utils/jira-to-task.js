import fs from 'fs';
import path from 'path';

/**
 * Converts JIRA issues into framework task files (tasks/<key>-<slug>.md).
 *
 * Task file format matches the pattern in tasks/account-flow.md:
 * - Metadata (Feature, Priority, Allure tags)
 * - Objective
 * - Architecture
 * - POM Available (discovered from models/)
 * - Data File reference
 * - Test Scenarios table
 * - Agent Instructions
 */

/**
 * Convert a single JIRA issue to a task file markdown string.
 * @param {object} issue - Formatted issue from JiraClient._formatIssue()
 * @param {object} options - { pomMethods, dataKeys }
 * @returns {string} Markdown content
 */
export function issueToTaskMarkdown(issue, options = {}) {
  const pomMethods = options.pomMethods || [];
  const dataKeys = options.dataKeys || [];
  const objectName = deriveObjectName(issue);

  const priorityMap = { Highest: 'P1', High: 'P1', Medium: 'P2', Low: 'P3', Lowest: 'P3' };
  const priority = priorityMap[issue.priority] || 'P2';
  const allureSeverity = issue.priority === 'Highest' || issue.priority === 'High' ? 'critical' : 'normal';

  // Build test scenarios from description/acceptance criteria
  const scenarios = parseScenarios(issue);
  const slug = slugify(issue.key);
  const acceptCriteria = issue.acceptanceCriteria ? '\n## Acceptance Criteria\n' + issue.acceptanceCriteria : '';

  // Build POM methods table
  let pomTable = '| `navigate()` | Navigate to app |\n| `clickNew()` | Open new record form |\n| `save()` | Save record |';
  if (pomMethods.length > 0) {
    pomTable = pomMethods.map(m => '| `' + m.name + '` | ' + m.description + ' |').join('\n');
  }

  // Build scenarios table
  const scenariosTable = scenarios.map((s, i) =>
    '| ' + slug + '-' + String(i + 1).padStart(2, '0') + ' | ' + s.scenario + ' | `' + s.key + '` | ' + priority + ' | ' + s.expected + ' |'
  ).join('\n');

  const scenariosKeys = scenarios.map(s => '| `' + s.key + '` | ' + s.description + ' |').join('\n');

  const md = [
    '# Task: ' + issue.summary,
    '',
    '## Metadata',
    '- JIRA: ' + issue.key + ' (' + issue.url + ')',
    '- Feature: ' + objectName + ' Management',
    '- Priority: ' + priority,
    '- Sprint: ' + (issue.sprint || 'Unscheduled'),
    '- Story Points: ' + (issue.storyPoints || 'N/A'),
    '- Allure Epic: CRM',
    '- Allure Feature: ' + objectName + ' Management',
    '- Allure Story: ' + objectName + ' Creation',
    '- Allure Severity: ' + allureSeverity,
    '- Coverage Scope: Positive, Negative, Boundary',
    '- Output Plan: specs/' + slug + '-plan.md',
    '- Output Spec: tests/' + slug + '-creation.spec.js',
    '',
    '## Objective',
    issue.description || issue.summary,
    '',
    acceptCriteria,
    '',
    '## Architecture',
    '```',
    'data/' + slug + '-test-data.json  ->  tests/' + slug + '-creation.spec.js  ->  models/' + objectName + 'Page.js  ->  Salesforce UI',
    '         (DATA)                      (test logic)                           (POM)                  (UI)',
    '```',
    '',
    '## POM Available',
    '`models/' + objectName + 'Page.js` -- check existing methods or extend with new ones.',
    '',
    '| Method | Purpose |',
    '|---|---|',
    pomTable,
    '',
    '## Data File',
    '`data/' + slug + '-test-data.json`',
    '',
    '| Scenario Key | Purpose |',
    '|---|---|',
    scenariosKeys,
    '',
    '## Test Scenarios',
    '',
    '| ID | Scenario | Data Key | Priority | Expected Result |',
    '|---|---|---|---|---|',
    scenariosTable,
    '',
    '## Assertions',
    '1. Toast message contains "' + objectName + '" and "was created"',
    '2. URL contains `/' + objectName + '/` and a record ID',
    '3. Page heading shows the ' + objectName + ' name',
    '',
    '## Agent Instructions',
    '',
    '### Planner Agent',
    '- Read this task file completely',
    '- Explore the ' + objectName + ' object in Salesforce via MCP if needed',
    '- Create `specs/' + slug + '-plan.md` with step-by-step test plan',
    '- Map each scenario to POM methods from `models/' + objectName + 'Page.js`',
    '- Reference `memory/framework-memory.md` for assertion rules',
    '',
    '### Generator Agent',
    '- Read `specs/' + slug + '-plan.md` for the test plan',
    '- Read `data/' + slug + '-test-data.json` for data scenarios',
    '- Read `models/' + objectName + 'Page.js` for available POM methods',
    '- Generate `tests/' + slug + '-creation.spec.js` following framework rules:',
    '  - Use `sfTest` fixture from `../fixtures/fixtures.js`',
    '  - Import from `../utils/reporter-utils.js` and `../utils/validators.js`',
    '  - Every test MUST call `assertRecordCreated(page, \'' + objectName + '\')` after save',
    '  - Use `sfStep()` for every Allure step',
    '  - Use `loadData(\'' + slug + '\', \'<scenario-key>\')` for data',
    '',
    '### Healer Agent',
    '- If tests fail, read the failure output',
    '- Check `models/' + objectName + 'Page.js` for correct method signatures',
    '- Fix the test code and re-run to verify',
    '',
    '## Definition of Done',
    '- [ ] `data/' + slug + '-test-data.json` created with all scenarios',
    '- [ ] `specs/' + slug + '-plan.md` maps 1:1 to Test Scenarios table',
    '- [ ] `tests/' + slug + '-creation.spec.js` implements all scenarios',
    '- [ ] Every save uses `assertRecordCreated(page, \'' + objectName + '\')`',
  ].join('\n');

  return md;
}

/**
 * Convert multiple JIRA issues to task files and save them.
 * @param {Array} issues - Array of formatted JIRA issues
 * @param {string} tasksDir - Directory to save task files
 * @param {object} options - { pomMethods }
 * @returns {Array<{ key, filePath, summary }>} Created files
 */
export function issuesToTaskFiles(issues, tasksDir, options = {}) {
  const created = [];

  for (const issue of issues) {
    const md = issueToTaskMarkdown(issue, options);
    const fileName = `${slugify(issue.key)}-${slugify(issue.summary).slice(0, 50)}.md`;
    const filePath = path.join(tasksDir, fileName);

    fs.mkdirSync(tasksDir, { recursive: true });
    fs.writeFileSync(filePath, md, 'utf8');

    created.push({
      key: issue.key,
      summary: issue.summary,
      filePath,
      fileName
    });
  }

  return created;
}

/**
 * Parse test scenarios from issue description and acceptance criteria.
 * @param {object} issue
 * @returns {Array<{ key, scenario, description, expected }>}
 */
function parseScenarios(issue) {
  const scenarios = [];

  // Basic creation scenario
  scenarios.push({
    key: 'requiredFieldsOnly',
    scenario: `Create ${deriveObjectName(issue)} with required fields only`,
    description: 'Create record with minimal required fields',
    expected: 'Record created, toast + URL + heading verified'
  });

  // If description mentions specific fields, add scenarios
  const desc = (issue.description + ' ' + issue.acceptanceCriteria).toLowerCase();

  if (desc.includes('all fields') || desc.includes('full') || desc.includes('complete')) {
    scenarios.push({
      key: 'allStandardFields',
      scenario: `Create ${deriveObjectName(issue)} with all standard fields`,
      description: 'Full field creation with all available fields',
      expected: 'All field values persist on detail page'
    });
  }

  if (desc.includes('special') || desc.includes('unicode') || desc.includes('character')) {
    scenarios.push({
      key: 'specialCharacters',
      scenario: `Create ${deriveObjectName(issue)} with special characters`,
      description: 'Unicode and special characters in fields',
      expected: 'Special characters preserved correctly'
    });
  }

  if (desc.includes('validation') || desc.includes('required') || desc.includes('error')) {
    scenarios.push({
      key: 'negativeValidation',
      scenario: `Attempt to save ${deriveObjectName(issue)} without required fields`,
      description: 'Negative validation test',
      expected: 'Validation error shown, dialog stays open'
    });
  }

  if (desc.includes('list') || desc.includes('view')) {
    scenarios.push({
      key: 'verifyInList',
      scenario: `Create ${deriveObjectName(issue)} and verify in list view`,
      description: 'List view verification',
      expected: 'Record appears in list view'
    });
  }

  if (desc.includes('cancel') || desc.includes('discard')) {
    scenarios.push({
      key: 'cancelCreation',
      scenario: `Cancel ${deriveObjectName(issue)} creation with unsaved changes`,
      description: 'Cancel and discard changes',
      expected: 'Dialog closes, no record created'
    });
  }

  // Always add boundary test
  scenarios.push({
    key: 'boundaryValues',
    scenario: `Create ${deriveObjectName(issue)} with boundary field values`,
    description: 'Boundary testing with max length and numeric limits',
    expected: 'Fields accept boundary values without error'
  });

  return scenarios;
}

/**
 * Derive the Salesforce object name from the issue.
 * @param {object} issue
 * @returns {string} e.g. "Account", "Contact", "Lead"
 */
function deriveObjectName(issue) {
  const text = `${issue.summary} ${issue.description} ${issue.labels.join(' ')}`.toLowerCase();

  const objects = ['Account', 'Contact', 'Lead', 'Opportunity', 'Case', 'Campaign', 'Product', 'Quote', 'Order'];
  for (const obj of objects) {
    if (text.includes(obj.toLowerCase())) return obj;
  }

  // Fallback: use first word of summary
  return issue.summary.split(/\s+/)[0] || 'Record';
}

/**
 * Slugify a string for file names.
 * @param {string} str
 * @returns {string}
 */
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * List available POM methods from a model file (basic parse).
 * @param {string} modelsDir - Path to models/ directory
 * @param {string} objectName - e.g. "Account"
 * @returns {Array<{ name, description }>}
 */
export function discoverPomMethods(modelsDir, objectName) {
  const methods = [
    { name: 'navigate()', description: 'Navigate to app' },
    { name: 'clickNew()', description: 'Open new record form' },
    { name: 'save()', description: 'Save record' }
  ];

  const fileName = `${objectName}Page.js`;
  const filePath = path.join(modelsDir, fileName);

  if (!fs.existsSync(filePath)) return methods;

  const content = fs.readFileSync(filePath, 'utf8');
  const asyncMethods = content.match(/async\s+(\w+)\s*\(/g) || [];

  for (const match of asyncMethods) {
    const name = match.replace(/async\s+/, '').replace(/\s*\(/, '()');
    if (!methods.find(m => m.name === name)) {
      methods.push({ name, description: `${name} method` });
    }
  }

  return methods;
}
