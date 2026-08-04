import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', 'data');

/**
 * Data Factory - The pillar of data-driven Salesforce testing.
 *
 * Loads test data from JSON files, resolves templates ({{timestamp}}, {{datePlusN}}),
 * merges overrides, and provides validation schemas.
 *
 * Usage:
 *   import { loadData, dataScenarios } from '../utils/data-factory.js';
 *   const data = loadData('lead', 'allStandardFields');
 *   // data.firstName = "Jane", data.lastName = "Smith-1721847123456"
 */

const templateResolvers = {
  '{{timestamp}}': () => Date.now().toString(),
  '{{datePlus30}}': () => getDatePlusDays(30),
  '{{datePlus60}}': () => getDatePlusDays(60),
  '{{datePlus90}}': () => getDatePlusDays(90),
  '{{uuid}}': () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  '{{randomEmail}}': () => `test.${Date.now()}@agentic-automation.com`,
  '{{randomPhone}}': () => `+1-555-${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
};

function getDatePlusDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function resolveTemplates(obj) {
  if (typeof obj === 'string') {
    let result = obj;
    for (const [template, resolver] of Object.entries(templateResolvers)) {
      while (result.includes(template)) {
        result = result.replace(template, resolver());
      }
    }
    return result;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => resolveTemplates(item));
  }

  if (obj && typeof obj === 'object') {
    const resolved = {};
    for (const [key, value] of Object.entries(obj)) {
      resolved[key] = resolveTemplates(value);
    }
    return resolved;
  }

  return obj;
}

/**
 * Load test data from a JSON file and resolve templates.
 *
 * @param {string} objectName - e.g. 'lead', 'account', 'opportunity'
 * @param {string} scenario - key in the JSON file, e.g. 'requiredFieldsOnly'
 * @param {object} overrides - merge on top of loaded data
 * @returns {object} resolved test data
 */
export function loadData(objectName, scenario = 'requiredFieldsOnly', overrides = {}) {
  const filePath = path.join(DATA_DIR, `${objectName}-test-data.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Test data file not found: ${filePath}`);
  }

  const allData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const scenarioData = allData[scenario];

  if (!scenarioData) {
    const available = Object.keys(allData).join(', ');
    throw new Error(
      `Scenario "${scenario}" not found in ${objectName}-test-data.json. Available: ${available}`
    );
  }

  const merged = Array.isArray(scenarioData)
    ? scenarioData.map(item => ({ ...item, ...overrides }))
    : { ...scenarioData, ...overrides };
  return resolveTemplates(merged);
}

/**
 * List all available scenarios for a given object.
 */
export function listScenarios(objectName) {
  const filePath = path.join(DATA_DIR, `${objectName}-test-data.json`);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const allData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return Object.keys(allData);
}

/**
 * Load raw (unresolved) data for inspection.
 */
export function loadRawData(objectName) {
  const filePath = path.join(DATA_DIR, `${objectName}-test-data.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Test data file not found: ${filePath}`);
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/**
 * Generate a Playwright test.describe.parallel data-driven test set.
 * Returns an array of [scenarioName, testData] tuples for use in test loops.
 *
 * Usage:
 *   const scenarios = dataScenarios('lead', ['requiredFieldsOnly', 'allStandardFields']);
 *   for (const [name, data] of scenarios) {
 *     test(`Create lead: ${name}`, async ({ leadPage }) => { ... });
 *   }
 */
export function dataScenarios(objectName, scenarioNames = null) {
  const allData = loadRawData(objectName);
  const names = scenarioNames || Object.keys(allData);

  return names.map(name => [name, resolveTemplates(allData[name])]);
}

/**
 * Validate that required fields are present and non-empty.
 *
 * @param {object} data - test data object
 * @param {string[]} requiredFields - field names that must exist and be non-empty
 * @returns {{ valid: boolean, missing: string[] }}
 */
export function validateData(data, requiredFields) {
  const missing = [];

  for (const field of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      missing.push(field);
    }
  }

  return { valid: missing.length === 0, missing };
}

/**
 * Create a data-driven test matrix for Playwright's test.describe.
 * Each entry becomes a test case with its own data.
 *
 * @param {string} objectName
 * @param {string[]} scenarios - specific scenarios to include (null = all)
 * @returns {Array<{name: string, data: object}>}
 */
export function testDataMatrix(objectName, scenarios = null) {
  const allData = loadRawData(objectName);
  const names = scenarios || Object.keys(allData);

  return names.map(name => ({
    name,
    data: resolveTemplates(allData[name]),
  }));
}

export { templateResolvers, getDatePlusDays };
