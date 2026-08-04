# Task: Story: Automate Salesforce Account Creation

## Metadata
- JIRA: SF-39 (https://nexturn-team-salesforce.atlassian.net/browse/SF-39)
- Feature: Account Management
- Priority: P1
- Sprint: Unscheduled
- Story Points: N/A
- Allure Epic: CRM
- Allure Feature: Account Management
- Allure Story: Account Creation
- Allure Severity: critical
- Coverage Scope: Positive, Negative, Boundary
- Output Plan: specs/sf-39-plan.md
- Output Spec: tests/sf-39-creation.spec.js

## Objective
Summary
Automate the Salesforce Lightning Account creation flow and verify the account is created successfully.
Priority
P1
Module
Account Management
Objective
Create a new Account record in Salesforce and verify:

Preconditions

Test Data

Steps
1. Open Accounts

2. Create New Account

3. Fill Account Details

4. Validate Creation

5. Verify in List View

6. Edit Account

Expected Results

Automation Notes

Tags




## Architecture
```
data/sf-39-test-data.json  ->  tests/sf-39-creation.spec.js  ->  models/AccountPage.js  ->  Salesforce UI
         (DATA)                      (test logic)                           (POM)                  (UI)
```

## POM Available
`models/AccountPage.js` -- check existing methods or extend with new ones.

| Method | Purpose |
|---|---|
| `navigate()` | Navigate to app |
| `clickNew()` | Open new record form |
| `save()` | Save record |

## Data File
`data/sf-39-test-data.json`

| Scenario Key | Purpose |
|---|---|
| `requiredFieldsOnly` | Create record with minimal required fields |
| `allStandardFields` | Full field creation with all available fields |
| `verifyInList` | List view verification |
| `boundaryValues` | Boundary testing with max length and numeric limits |

## Test Scenarios

| ID | Scenario | Data Key | Priority | Expected Result |
|---|---|---|---|---|
| sf-39-01 | Create Account with required fields only | `requiredFieldsOnly` | P1 | Record created, toast + URL + heading verified |
| sf-39-02 | Create Account with all standard fields | `allStandardFields` | P1 | All field values persist on detail page |
| sf-39-03 | Create Account and verify in list view | `verifyInList` | P1 | Record appears in list view |
| sf-39-04 | Create Account with boundary field values | `boundaryValues` | P1 | Fields accept boundary values without error |

## Assertions
1. Toast message contains "Account" and "was created"
2. URL contains `/Account/` and a record ID
3. Page heading shows the Account name

## Agent Instructions

### Planner Agent
- Read this task file completely
- Explore the Account object in Salesforce via MCP if needed
- Create `specs/sf-39-plan.md` with step-by-step test plan
- Map each scenario to POM methods from `models/AccountPage.js`
- Reference `memory/framework-memory.md` for assertion rules

### Generator Agent
- Read `specs/sf-39-plan.md` for the test plan
- Read `data/sf-39-test-data.json` for data scenarios
- Read `models/AccountPage.js` for available POM methods
- Generate `tests/sf-39-creation.spec.js` following framework rules:
  - Use `sfTest` fixture from `../fixtures/fixtures.js`
  - Import from `../utils/reporter-utils.js` and `../utils/validators.js`
  - Every test MUST call `assertRecordCreated(page, 'Account')` after save
  - Use `sfStep()` for every Allure step
  - Use `loadData('sf-39', '<scenario-key>')` for data

### Healer Agent
- If tests fail, read the failure output
- Check `models/AccountPage.js` for correct method signatures
- Fix the test code and re-run to verify

## Definition of Done
- [ ] `data/sf-39-test-data.json` created with all scenarios
- [ ] `specs/sf-39-plan.md` maps 1:1 to Test Scenarios table
- [ ] `tests/sf-39-creation.spec.js` implements all scenarios
- [ ] Every save uses `assertRecordCreated(page, 'Account')`