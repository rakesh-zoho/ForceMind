# ForceMind — Quick Start Guide

> **AI-Driven Salesforce Test Automation Framework**
> Built on Playwright + Page Object Model + Data-Driven Testing + Self-Healing

---

## Architecture Overview

```
ForceMind/
├── config/                 # Playwright config, CI/CD
│   └── playwright.config.js
├── data/                   # ← DATA IS THE PILLAR
│   ├── lead-test-data.json
│   ├── account-test-data.json
│   ├── opportunity-test-data.json
│   ├── contact-test-data.json
│   └── case-test-data.json
├── models/                 # Page Object Models
│   ├── BasePage.js
│   ├── LeadPage.js
│   ├── AccountPage.js
│   ├── OpportunityPage.js
│   ├── ContactPage.js
│   └── CasePage.js
├── utils/                  # Core utilities
│   ├── data-factory.js     # Data loading, templates, scenarios
│   ├── validators.js       # Schema & assertion helpers
│   ├── locator-utils.js    # SF-specific element interactions
│   ├── sf-helpers.js       # Navigation, auth, SF load detection
│   ├── reporter-utils.js   # Allure + screenshot reporting
│   └── logger.js           # Structured logging
├── fixtures/
│   └── fixtures.js         # Playwright test fixtures (sfTest)
├── specs/                  # Test plans (markdown)
├── tests/                  # Test specs
├── scripts/
│   └── self-heal.js        # Self-healing test runner
├── agents/                 # AI agent prompts
├── memory/                 # Agent memory files
├── tasks/                  # Agent task files
└── reports/                # Test artifacts (gitignored)
```

---

## Core Principle: DATA First

Every test is driven by structured JSON data, not hardcoded values.

### Data File Format (`data/<object>-test-data.json`)

```json
{
  "scenarioName": {
    "field1": "static value",
    "field2": "dynamic-{{timestamp}}",
    "field3": "{{datePlus30}}"
  }
}
```

### Available Templates

| Template | Resolves To |
|---|---|
| `{{timestamp}}` | Unix timestamp (e.g., `1721847123456`) |
| `{{datePlus30}}` | Date 30 days from now (`MM/DD/YYYY`) |
| `{{datePlus60}}` | Date 60 days from now |
| `{{datePlus90}}` | Date 90 days from now |
| `{{uuid}}` | UUID or unique string |
| `{{randomEmail}}` | `test.<timestamp>@agentic-automation.com` |
| `{{randomPhone}}` | `+1-555-XXX-XXXX` |

### Loading Data in Tests

```javascript
import { loadData, listScenarios } from '../utils/data-factory.js';

// Load a specific scenario
const data = loadData('lead', 'allStandardFields');
// data.firstName = "Jane", data.lastName = "Smith-1721847123456"

// Load with overrides
const data = loadData('lead', 'requiredFieldsOnly', {
  lastName: 'CustomName',
  company: 'Override Corp',
});

// List available scenarios
const scenarios = listScenarios('lead');
// ['requiredFieldsOnly', 'allStandardFields', 'specialCharacters', ...]
```

---

## Step-by-Step: Automate a New Salesforce Object

### Step 1: Create Test Data File

Create `data/<object>-test-data.json`:

```json
{
  "basic": {
    "name": "My Object-{{timestamp}}",
    "description": "Basic test record",
    "status": "Active"
  },
  "withPicklists": {
    "name": "Full Object-{{timestamp}}",
    "description": "Complete test record",
    "status": "Active",
    "priority": "High",
    "category": "Type A"
  },
  "validation": {
    "name": "",
    "description": "",
    "status": ""
  }
}
```

### Step 2: Create Page Object

Create `models/<Object>Page.js`:

```javascript
import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class MyObjectPage extends BasePage {
  constructor(page) {
    super(page);
    this.newButton = page.getByRole('button', { name: /^New$/ }).first();
    this.saveButton = page.getByRole('dialog').getByRole('button', { name: 'Save' }).first();
  }

  async navigate() {
    await this.navigateToApp('My Custom App');
  }

  async clickNew() {
    await expect(this.newButton).toBeVisible({ timeout: 15000 });
    await this.newButton.click();
    await this.waitForSFLoad();
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 15000 });
  }

  async fillFields({ name, description, status, priority, category } = {}) {
    const dialog = this.page.getByRole('dialog');
    if (name) await dialog.getByLabel(/name/i).fill(name);
    if (description) await dialog.getByLabel(/description/i).fill(description);
    if (status) await this.selectPicklist('Status', status);
    if (priority) await this.selectPicklist('Priority', priority);
    if (category) await this.selectPicklist('Category', category);
  }

  async save() {
    await expect(this.saveButton).toBeVisible({ timeout: 10000 });
    await this.saveButton.click();
  }
}
```

### Step 3: Register in Fixtures

Add to `fixtures/fixtures.js`:

```javascript
import { MyObjectPage } from '../models/MyObjectPage.js';

// Inside sfTest.extend({}):
myObjectPage: async ({ sfPage }, use) => {
  await use(new MyObjectPage(sfPage));
},
```

### Step 4: Create Test Spec

Create `tests/my-object-creation.spec.js`:

```javascript
import { test, expect } from '@playwright/test';
import { sfTest } from '../fixtures/fixtures.js';
import { loadData } from '../utils/data-factory.js';
import { captureScreenshot, setAllureMeta, sfStep } from '../utils/reporter-utils.js';
import { waitForSFLoad } from '../utils/sf-helpers.js';
import { assertToast, assertOnSFDetailPage } from '../utils/validators.js';

test.beforeEach(async () => {
  await setAllureMeta({
    epic: 'CRM',
    feature: 'My Object Management',
    story: 'Create My Object',
    severity: 'critical',
  });
});

sfTest('Create My Object with basic fields', async ({ sfPage: page, myObjectPage }) => {
  const data = loadData('myObject', 'basic');

  await sfStep('Navigate to My Object app', page, async () => {
    await myObjectPage.navigate();
  });

  await sfStep('Click New', page, async () => {
    await myObjectPage.clickNew();
  });

  await sfStep('Fill fields from data', page, async () => {
    await myObjectPage.fillFields(data);
    await captureScreenshot(page, 'form-filled');
  });

  await sfStep('Save', page, async () => {
    await myObjectPage.save();
    await assertToast(page, 'My Object');
    await captureScreenshot(page, 'saved');
  });

  await sfStep('Verify detail page', page, async () => {
    await waitForSFLoad(page);
    await assertOnSFDetailPage(page, 'MyObject__c');
    await captureScreenshot(page, 'detail-page');
  });
});
```

### Step 5: Add npm Script

In `package.json`, add:

```json
"test:myobject": "npx playwright test --config=config/playwright.config.js tests/my-object-creation.spec.js"
```

---

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run specific object tests
npm run test:lead
npm run test:account
npm run test:myobject

# Run with headed browser
npm run test:headed

# Debug mode (step through)
npm run test:debug
```

### Self-Healing Runner (Recommended for CI/CD)

```bash
# Run with auto-healing (detects auth failures, retries)
npm run test:heal

# Heal specific tests
npm run test:heal:lead

# Custom pattern + max retries
node scripts/self-heal.js tests/*.spec.js --max-retries=3
```

The self-healer will:
1. Validate auth state before running
2. If auth expired/missing → auto re-login
3. Re-run all tests
4. Repeat until all pass (up to max retries)

### CI/CD

```bash
# GitHub Actions (auto-triggered on push)
# See .github/workflows/playwright.yml

# Jenkins
# See Jenkinsfile
```

---

## Generating Test Plans (AI-Assisted)

### Option 1: Use the Planner Agent

Ask the AI agent to create a test plan:

```
Create a test plan for [Object Name] in Salesforce.
Object API: [ObjectName__c]
Fields: [list fields]
Key scenarios: CRUD operations, validation rules, edge cases
```

The planner generates `specs/<object>-creation-plan.md` with structured scenarios.

### Option 2: Manual Template

Copy `specs/lead-creation-plan.md` and modify:

```markdown
# [Object Name] Test Plan

**Module:** [App Name]
**Feature:** [Feature]
**Page Object:** `models/[Object]Page.js`

## Test Scenarios

### 1. Basic CRUD
#### 1.1 Create Record with Required Fields
**Data:** `data/[object]-test-data.json` → `requiredFieldsOnly`
**Steps:**
1. Navigate to [App]
2. Click New
3. Fill required fields from data
4. Save
5. Verify toast + detail page

### 2. Validation
#### 2.1 Empty Form Submit
...
```

---

## Data Validation Utilities

### Schema Definitions (`utils/validators.js`)

Every object has a defined schema:

```javascript
import { SCHEMAS, validateAgainstSchema } from '../utils/validators.js';

const result = validateAgainstSchema('lead', testData);
// { valid: true, missing: [], extra: [] }
```

### Assertion Helpers

```javascript
import {
  assertToast,              // Verify success toast
  assertOnSFDetailPage,     // Verify on SF detail page (not login)
  assertFormFields,         // Verify form field values
  assertPicklistValue,      // Verify dropdown selection
  assertRecordInList,       // Verify record in list view
  assertValidationErrors,   // Verify validation errors shown
  assertDataIntegrity,      // Verify data object completeness
} from '../utils/validators.js';
```

---

## Self-Healing Flow

```
┌─────────────────────────────────────────────────┐
│              SELF-HEAL RUNNER                    │
├─────────────────────────────────────────────────┤
│                                                   │
│  1. Check auth state exists?                      │
│     ├─ No  → Login → Save auth → Run tests        │
│     └─ Yes → Validate auth (navigate to SF)       │
│              ├─ Valid   → Run tests                │
│              └─ Stale   → Delete → Re-login        │
│                                                   │
│  2. Run tests                                     │
│     ├─ All pass → DONE                            │
│     └─ Failures detected                          │
│         ├─ Auth failure? → Clear state → Re-login │
│         └─ Other failure? → Retry (no re-login)   │
│                                                   │
│  3. Repeat up to --max-retries                    │
│                                                   │
└─────────────────────────────────────────────────┘
```

---

## Adding a New Scenario

1. **Add data** to `data/<object>-test-data.json`:
```json
{
  "newScenario": {
    "field1": "value-{{timestamp}}",
    "field2": "{{datePlus30}}"
  }
}
```

2. **Add test** in `tests/<object>-spec.js`:
```javascript
sfTest('Test new scenario', async ({ sfPage: page, objectPage }) => {
  const data = loadData('object', 'newScenario');
  // ... test logic using data
});
```

3. **Run**:
```bash
npm run test:object
```

---

## Debugging

```bash
# View Allure reports
npm run report:allure

# View Playwright report
npm run report:pw

# Show traces
npx playwright show-trace config/reports/test-results/<test-name>/trace.zip

# Check screenshots
ls reports/screenshots/

# Verbose logging
LOG_LEVEL=debug npm run test:lead
```

---

## Framework Conventions

| Convention | Rule |
|---|---|
| **Data** | All test data lives in `data/*.json` — never hardcode in tests |
| **Templates** | Use `{{timestamp}}` for unique values, `{{datePlusN}}` for dates |
| **POM** | All SF interactions go through page objects in `models/` |
| **Assertions** | Use validators from `utils/validators.js` |
| **Screenshots** | `captureScreenshot()` after every major action |
| **Steps** | Wrap test logic in `sfStep()` for Allure reporting |
| **Auth** | Never commit `.auth-state.json` — it's gitignored |
| **Healing** | Use `npm run test:heal` for CI/CD, not raw `npm test` |

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Auth state expired | Run `npm run test:heal` — it auto-fixes |
| `strict mode violation` (2 dialogs) | Scope dialog with `.filter({ hasText: /keyword/ })` |
| Picklist Save fails | Ensure `selectPicklist()` doesn't press Escape |
| Toast not found | SF toasts disappear in ~3s — assert immediately after save |
| `networkidle` timeout | Use `waitForSFLoad()` instead — SF Lightning never settles |
| Test data stale | Re-run — `{{timestamp}}` templates generate fresh data each run |
