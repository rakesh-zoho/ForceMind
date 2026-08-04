# Task: Update Salesforce Cases with Random Internal Comments

## Metadata
- JIRA: SF-214 (https://nexturn-team-salesforce.atlassian.net/browse/SF-214)
- Feature: Case Management
- Priority: P2
- Sprint: Unscheduled
- Story Points: N/A
- Allure Epic: CRM
- Allure Feature: Case Management
- Allure Story: Case Creation
- Allure Severity: normal
- Coverage Scope: Positive, Negative, Boundary
- Output Plan: specs/sf-214-plan.md
- Output Spec: tests/sf-214-creation.spec.js

## Objective
Summary
Add random internal comments to Salesforce Cases that were created on 3rd August.
User Story
As a Salesforce Support Administrator,I want to update all Salesforce Cases created on 3rd August by adding random internal comments,So that the cases have sample internal activity for testing, validation, or demonstration purposes.
Description
Identify all Salesforce Cases with a Created Date of 3rd August. For each identified case, add a single random Internal Comment. The comments should be visible only to internal users and must not trigger customer-facing notifications.
Sample Internal Comments

Acceptance Criteria

Definition of Done




## Architecture
```
data/sf-214-test-data.json  ->  tests/sf-214-creation.spec.js  ->  models/CasePage.js  ->  Salesforce UI
         (DATA)                      (test logic)                           (POM)                  (UI)
```

## POM Available
`models/CasePage.js` -- check existing methods or extend with new ones.

| Method | Purpose |
|---|---|
| `navigate()` | Navigate to app |
| `clickNew()` | Open new record form |
| `save()` | Save record |

## Data File
`data/sf-214-test-data.json`

| Scenario Key | Purpose |
|---|---|
| `requiredFieldsOnly` | Create record with minimal required fields |
| `negativeValidation` | Negative validation test |
| `boundaryValues` | Boundary testing with max length and numeric limits |

## Test Scenarios

| ID | Scenario | Data Key | Priority | Expected Result |
|---|---|---|---|---|
| sf-214-01 | Create Case with required fields only | `requiredFieldsOnly` | P2 | Record created, toast + URL + heading verified |
| sf-214-02 | Attempt to save Case without required fields | `negativeValidation` | P2 | Validation error shown, dialog stays open |
| sf-214-03 | Create Case with boundary field values | `boundaryValues` | P2 | Fields accept boundary values without error |

## Assertions
1. Toast message contains "Case" and "was created"
2. URL contains `/Case/` and a record ID
3. Page heading shows the Case name

## Agent Instructions

### Planner Agent
- Read this task file completely
- Explore the Case object in Salesforce via MCP if needed
- Create `specs/sf-214-plan.md` with step-by-step test plan
- Map each scenario to POM methods from `models/CasePage.js`
- Reference `memory/framework-memory.md` for assertion rules

### Generator Agent
- Read `specs/sf-214-plan.md` for the test plan
- Read `data/sf-214-test-data.json` for data scenarios
- Read `models/CasePage.js` for available POM methods
- Generate `tests/sf-214-creation.spec.js` following framework rules:
  - Use `sfTest` fixture from `../fixtures/fixtures.js`
  - Import from `../utils/reporter-utils.js` and `../utils/validators.js`
  - Every test MUST call `assertRecordCreated(page, 'Case')` after save
  - Use `sfStep()` for every Allure step
  - Use `loadData('sf-214', '<scenario-key>')` for data

### Healer Agent
- If tests fail, read the failure output
- Check `models/CasePage.js` for correct method signatures
- Fix the test code and re-run to verify

## Definition of Done
- [ ] `data/sf-214-test-data.json` created with all scenarios
- [ ] `specs/sf-214-plan.md` maps 1:1 to Test Scenarios table
- [ ] `tests/sf-214-creation.spec.js` implements all scenarios
- [ ] Every save uses `assertRecordCreated(page, 'Case')`