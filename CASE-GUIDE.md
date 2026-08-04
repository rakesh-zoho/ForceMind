# ForceMind — Complete Guide for Case Object Automation

> This document walks you through the **entire workflow** — from understanding the framework
> to running tests for the Case object. Follow each section in order.

---

## Table of Contents

1. [How the Framework Works](#1-how-the-framework-works)
2. [The Three Agents](#2-the-three-agents)
3. [What's Already Built for Case](#3-whats-already-built-for-case)
4. [Step-by-Step: Generate Plan with Planner Agent](#4-step-by-step-generate-plan-with-planner-agent)
5. [Step-by-Step: Generate Code with Generator Agent](#5-step-by-step-generate-code-with-generator-agent)
6. [Step-by-Step: Run and Heal with Healer Agent](#6-step-by-step-run-and-heal-with-healer-agent)
7. [Running the Tests](#7-running-the-tests)
8. [Understanding the Code](#8-understanding-the-code)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. How the Framework Works

### The Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOUR WORKFLOW                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Write Task File        tasks/case-creation.md                │
│         ↓                                                          │
│  2. Planner Agent          Explores SF UI → specs/case-plan.md   │
│         ↓                                                          │
│  3. Generator Agent        Reads plan → tests/case-creation.spec.js│
│         ↓                                                          │
│  4. Run Tests              npm run test:case                      │
│         ↓                                                          │
│  5. Healer Agent           Fixes any failures automatically       │
│         ↓                                                          │
│  6. All Pass               npm run test:heal (self-healing)       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### The Layers

```
┌──────────────────────────────────────────────────────────────┐
│  LAYER 1: DATA (the pillar)                                  │
│  data/case-test-data.json — JSON scenarios with templates    │
│  {{timestamp}} → unique values every run                     │
├──────────────────────────────────────────────────────────────┤
│  LAYER 2: PAGE OBJECTS (POM)                                 │
│  models/CasePage.js — methods like navigate(), clickNew()    │
│  models/BasePage.js — shared: fillField(), selectPicklist()  │
├──────────────────────────────────────────────────────────────┤
│  LAYER 3: UTILITIES                                          │
│  utils/data-factory.js — loads JSON, resolves templates      │
│  utils/validators.js — assertToast(), assertOnSFDetailPage() │
│  utils/locator-utils.js — SF-specific element interactions   │
│  utils/sf-helpers.js — auth, navigation, load detection      │
├──────────────────────────────────────────────────────────────┤
│  LAYER 4: TESTS                                              │
│  tests/case-creation.spec.js — the actual test file          │
│  fixtures/fixtures.js — injects casePage into tests          │
├──────────────────────────────────────────────────────────────┤
│  LAYER 5: REPORTING                                          │
│  Allure reports + screenshots + video + traces               │
└──────────────────────────────────────────────────────────────┘
```

### Key Concept: Data is the Pillar

Every test reads its data from JSON files, NOT from hardcoded values:

```javascript
// ❌ WRONG — hardcoded
await casePage.fillSubject('Test Case-123');

// ✅ RIGHT — data-driven
const data = loadData('case', 'basicCase');
await casePage.fillSubject(data.subject);
// data.subject = "Test Case-1721847123456" (unique every run)
```

---

## 2. The Three Agents

### Planner Agent
**Job:** Explore the Salesforce UI and create a structured test plan

**Input:** `tasks/case-creation.md` (your task description)
**Output:** `specs/case-creation-plan.md` (detailed test scenarios with steps)

**How it works:**
1. Opens Salesforce in a real browser via MCP
2. Navigates to the Cases object
3. Clicks "New" to see the form
4. Identifies all fields, picklists, lookups
5. Designs test scenarios (happy path, validation, edge cases)
6. Saves a markdown plan with step-by-step instructions

### Generator Agent
**Job:** Turn the test plan into executable Playwright code

**Input:** `specs/case-creation-plan.md` (the plan)
**Output:** `tests/case-creation.spec.js` (the test file)

**How it works:**
1. Reads the test plan
2. Opens Salesforce in a real browser
3. Executes each step manually to verify it works
4. Records what works and what fails
5. Generates a test file using our POM + data factory + validators
6. Saves the spec file

### Healer Agent
**Job:** Fix failing tests automatically

**Input:** Failing `tests/*.spec.js`
**Output:** Fixed test file

**How it works:**
1. Runs all tests to find failures
2. For each failure, opens the browser and debugs
3. Identifies root cause (selector changed, timing, auth, etc.)
4. Fixes the code
5. Re-runs to verify
6. Repeats until all pass

---

## 3. What's Already Built for Case

### ✅ Task File — `tasks/case-creation.md`
Defines what to automate. Already has:
- Metadata (epic, feature, story, severity)
- Steps to automate
- Required assertions
- Agent instructions

### ✅ Data File — `data/case-test-data.json`
```json
{
  "basicCase": {
    "subject": "Test Case-{{timestamp}}",
    "status": "New",
    "priority": "Medium",
    "description": "Automated test case for validation"
  },
  "allFields": {
    "subject": "Full Case-{{timestamp}}",
    "status": "Working",
    "priority": "High",
    "type": "Problem",
    "origin": "Phone",
    "description": "Comprehensive test case with all standard fields"
  }
}
```

### ✅ Page Object — `models/CasePage.js`
Methods available:
| Method | What It Does |
|---|---|
| `navigate()` | Opens Cases app via App Launcher |
| `clickNew()` | Clicks New, waits for dialog |
| `fillContactName(term)` | Lookup field — type + autocomplete |
| `fillAccountName(term)` | Lookup field — type + autocomplete |
| `fillSubject(text)` | Text field |
| `fillDescription(text)` | Text field |
| `selectStatus(value)` | Picklist — Status |
| `selectPriority(value)` | Picklist — Priority |
| `selectCaseOrigin(value)` | Picklist — Case Origin |
| `save()` | Clicks Save button |
| `createCase({...})` | Full flow: navigate → fill → save → toast |

### ✅ Fixture — `fixtures/fixtures.js`
`casePage` is already registered — tests get it automatically:
```javascript
sfTest('my test', async ({ casePage }) => {
  // casePage is an instance of CasePage with auth
});
```

### ❌ What's Missing
- **Test plan** — `specs/case-creation-plan.md` (Planner will create this)
- **Test spec** — `tests/case-creation.spec.js` (Generator will create this)

---

## 4. Step-by-Step: Generate Plan with Planner Agent

### Prerequisites
- Salesforce credentials in `.env`
- Auth state valid (`reports/.auth-state.json` exists)

### Step 1: Open VS Code / Copilot Chat

### Step 2: Ask the Planner Agent

Type this in Copilot Chat:

```
@playwright-test-planner Create a test plan for the Case object in Salesforce.

Task file: tasks/case-creation.md
Data file: data/case-test-data.json (has basicCase and allFields scenarios)
Page Object: models/CasePage.js
Output: specs/case-creation-plan.md

The Case object has these fields:
- Subject (required text)
- Status (picklist: New, Working, Escalated, Closed)
- Priority (picklist: Low, Medium, High)
- Case Origin (picklist: Phone, Email, Web)
- Contact Name (lookup)
- Account Name (lookup)
- Description (text area)

Include tests for:
1. Basic case creation with required fields
2. Case creation with all fields
3. Validation — empty form submit
4. Picklist selections
5. Cancel flow
6. Keyboard accessibility
```

### Step 3: What the Planner Does

1. Opens Salesforce in browser
2. Navigates to Cases
3. Clicks New — sees the form
4. Identifies every field, picklist, button
5. Takes screenshots of the UI
6. Designs 6+ test scenarios
7. Saves to `specs/case-creation-plan.md`

### Step 4: Verify the Output

Check `specs/case-creation-plan.md` was created with structured scenarios like:

```markdown
### 1. Case Creation - Basic Information
#### 1.1 Create Case with Required Fields Only
**Data:** `data/case-test-data.json` → `basicCase`
**Steps:**
1. Navigate to Cases
2. Click New
3. Fill Subject = "Test Case-1721847123456"
4. Select Status = "New"
5. Click Save
6. Verify toast contains "Case"
7. Verify detail page loaded
```

---

## 5. Step-by-Step: Generate Code with Generator Agent

### Step 1: Ask the Generator Agent

```
@playwright-test-generator Generate tests from the Case test plan.

Plan file: specs/case-creation-plan.md
Data file: data/case-test-data.json
Page Object: models/CasePage.js
Output: tests/case-creation.spec.js

Use our framework patterns:
- Import sfTest from fixtures/fixtures.js
- Use loadData('case', 'scenarioName') for data
- Use assertToast(page, 'Case') for assertions
- Use assertOnSFDetailPage(page, 'Case') for detail verification
- Wrap steps in sfStep() for Allure reporting
- Capture screenshots after every major action
```

### Step 2: What the Generator Does

1. Reads `specs/case-creation-plan.md`
2. Opens Salesforce in browser
3. For each test scenario:
   - Executes the steps manually
   - Verifies selectors work
   - Records what passes/fails
4. Generates code using our patterns
5. Saves to `tests/case-creation.spec.js`

### Step 3: What the Generated Code Looks Like

```javascript
import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { sfTest } from '../fixtures/fixtures.js';
import { captureScreenshot, setAllureMeta, sfStep } from '../utils/reporter-utils.js';
import { waitForSFLoad, switchToAllRecords } from '../utils/sf-helpers.js';
import { loadData } from '../utils/data-factory.js';
import { assertToast, assertOnSFDetailPage, assertValidationErrors } from '../utils/validators.js';

test.beforeEach(async () => {
  await setAllureMeta({
    epic: 'CRM',
    feature: 'Case Management',
    story: 'Create Case',
    severity: 'critical',
  });
});

sfTest.describe('1. Case Creation - Basic Information', () => {

  sfTest('1.1 Create Case with Required Fields', async ({ sfPage: page, casePage }) => {
    const data = loadData('case', 'basicCase');

    await sfStep('Navigate to Cases', page, async () => {
      await casePage.navigate();
    });

    await sfStep('Click New', page, async () => {
      await casePage.clickNew();
    });

    await sfStep('Fill Case form', page, async () => {
      await casePage.fillSubject(data.subject);
      await casePage.selectStatus(data.status);
      await casePage.selectPriority(data.priority);
      await captureScreenshot(page, 'case-form-filled');
    });

    await sfStep('Save the Case', page, async () => {
      await casePage.save();
      await assertToast(page, 'Case');
      await captureScreenshot(page, 'case-saved');
    });

    await sfStep('Verify detail page', page, async () => {
      await waitForSFLoad(page);
      await assertOnSFDetailPage(page, 'Case');
      await captureScreenshot(page, 'case-detail');
    });
  });

});
```

### Step 4: Run the Tests

```bash
npm run test:case
```

---

## 6. Step-by-Step: Run and Heal with Healer Agent

### If Tests Pass → Done! 🎉

### If Tests Fail → Ask the Healer

```
@playwright-test-healer Some Case tests are failing. Please fix them.

Run: npm run test:case
Fix: tests/case-creation.spec.js
Use SF-specific patterns from memory/framework-memory.md
```

### What the Healer Does

1. Runs `npm run test:case`
2. Identifies which tests fail
3. For each failure:
   - Opens browser to the failing step
   - Takes a snapshot of the page
   - Reads error messages
   - Identifies root cause (wrong selector, timing, auth, etc.)
   - Fixes the code
   - Re-runs to verify
4. Repeats until all tests pass

### Common Case Object Failures and Fixes

| Failure | Cause | Healer Fix |
|---|---|---|
| `Subject field not found` | Wrong label | Use `getByLabel(/subject/i)` |
| `Status picklist empty` | SF picklist loaded slowly | Add `waitForSFLoad()` before picklist |
| `Contact Name lookup timeout` | No test contacts exist | Create test contact first or skip lookup |
| `Toast not found` | Toast disappeared | Assert immediately after save |
| `Dialog closed` | Picklist Escape closed dialog | Fix `selectPicklist()` in locator-utils |
| `Auth expired` | Session timed out | Delete auth state, re-login |

---

## 7. Running the Tests

### Basic Commands

```bash
# Run Case tests only
npm run test:case

# Run with self-healing (recommended)
node scripts/self-heal.js tests/case-creation.spec.js

# Run all tests
npm test

# Debug mode (step through)
npm run test:debug -- tests/case-creation.spec.js

# Headed mode (watch browser)
npm run test:headed -- tests/case-creation.spec.js
```

### Self-Healing (Best for CI/Demo)

```bash
# This will:
# 1. Check auth state
# 2. Re-login if needed
# 3. Run tests
# 4. Retry failures up to 3 times
npm run test:heal:lead
```

### Reports

```bash
# Allure report (best)
npm run report:allure

# Playwright HTML report
npm run report:pw
```

---

## 8. Understanding the Code

### How Data Flows

```
data/case-test-data.json
        ↓
   loadData('case', 'basicCase')
        ↓
   { subject: "Test Case-1721847123456", status: "New", ... }
        ↓
   casePage.fillSubject(data.subject)
        ↓
   BasePage.fillField('Subject', 'Test Case-1721847123456')
        ↓
   dialog.getByLabel(/subject/i).fill('Test Case-1721847123456')
        ↓
   Salesforce UI
```

### How POM Works

```javascript
// fixtures/fixtures.js creates authenticated page + POM
sfTest('my test', async ({ casePage }) => {
  // casePage.page = authenticated Playwright page
  // casePage methods = BasePage methods + Case-specific methods
});

// BasePage provides shared methods
class BasePage {
  fillField(label, value)      // generic form fill
  selectPicklist(label, value)  // SF picklist interaction
  fillLookup(label, value)      // SF lookup autocomplete
  waitForSFLoad()               // wait for SF spinners
  navigateToApp(name)           // App Launcher navigation
}

// CasePage extends BasePage with Case-specific methods
class CasePage extends BasePage {
  navigate()                    // → navigateToApp('Cases')
  clickNew()                    // → clicks New button
  fillSubject(text)             // → fillField('Subject', text)
  selectStatus(value)           // → selectPicklist('Status', value)
  save()                        // → clicks Save button
}
```

### How Validators Work

```javascript
// Instead of writing this every time:
const toast = page.locator('.toastMessage');
await expect(toast).toBeVisible({ timeout: 15000 });
await expect(toast).toContainText('Case');

// Write this:
await assertToast(page, 'Case');

// Instead of this for URL check:
await expect(page).toHaveURL(/\/Case\//, { timeout: 30000 });

// Write this:
await assertOnSFDetailPage(page, 'Case');
```

---

## 9. Troubleshooting

### "Auth state expired"
```bash
# Delete stale auth and re-login
rm reports/.auth-state.json
npm run test:case
# globalSetup will re-login automatically
```

### "Subject field not found"
The Case form may use different labels. Check with browser:
```bash
npm run test:debug -- tests/case-creation.spec.js
# Step through to see actual field labels
```

### "Picklist shows empty"
SF picklists load dynamically. Add wait:
```javascript
await casePage.waitForSFLoad();
await casePage.selectStatus('New');
```

### "Toast not found"
Toast disappears in ~3 seconds. Assert immediately:
```javascript
await casePage.save();
await assertToast(page, 'Case');  // RIGHT after save, no delays
```

### "Two dialogs on page"
Filter the dialog:
```javascript
const dialog = page.getByRole('dialog').filter({ hasText: /subject/i });
await expect(dialog).toBeVisible();
```

### "Test data conflict (duplicate names)"
The `{{timestamp}}` template ensures uniqueness. If still conflicting:
```json
{
  "myScenario": {
    "subject": "Case-{{uuid}}"
  }
}
```

---

## Quick Reference Card

| Action | Code |
|---|---|
| Load data | `const data = loadData('case', 'basicCase')` |
| Navigate | `await casePage.navigate()` |
| Click New | `await casePage.clickNew()` |
| Fill text | `await casePage.fillSubject(data.subject)` |
| Pick picklist | `await casePage.selectStatus(data.status)` |
| Fill lookup | `await casePage.fillContactName('John')` |
| Save | `await casePage.save()` |
| Assert toast | `await assertToast(page, 'Case')` |
| Assert detail | `await assertOnSFDetailPage(page, 'Case')` |
| Screenshot | `await captureScreenshot(page, 'name')` |
| Allure step | `await sfStep('Step Name', page, async () => { ... })` |
| List view | `await switchToAllRecords(page, 'Cases')` |
| Run tests | `npm run test:case` |
| Self-heal | `npm run test:heal:lead` |
