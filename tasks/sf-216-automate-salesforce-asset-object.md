# Task: Automate Salesforce Asset Object

## Metadata
- JIRA: SF-216 (https://nexturn-team-salesforce.atlassian.net/browse/SF-216)
- Feature: Automate Management
- Priority: P2
- Sprint: Unscheduled
- Story Points: N/A
- Allure Epic: CRM
- Allure Feature: Automate Management
- Allure Story: Automate Creation
- Allure Severity: normal
- Coverage Scope: Positive, Negative, Boundary
- Output Plan: specs/sf-216-plan.md
- Output Spec: tests/sf-216-creation.spec.js

## Objective
Story Title
Automate Salesforce Asset Object Lifecycle and Business Processes
User Story
As a Service Operations user,
I want the Salesforce Asset object to be automatically managed through configurable business automation,
So that asset records are created, updated, and maintained with minimal manual effort while ensuring data accuracy and consistency.

Business Value
Automating the Asset object reduces manual data entry, improves data quality, streamlines service operations, and ensures consistent asset lifecycle management.

Scope
Develop automation for the Salesforce Asset object using Salesforce declarative tools (Flow) and Apex where required.
The automation should:


Functional Requirements
Asset Creation Automation

Asset Update Automation

Validation & Data Quality

Notifications

Security


Acceptance Criteria
AC1
Given a qualifying business transaction,
When the transaction reaches the defined completion stage,
Then an Asset record is automatically created.
AC2
Given an Asset is created automatically,
When the record is saved,
Then all required fields are populated correctly.
AC3
Given an existing Asset,
When the related business data changes,
Then the Asset record is updated according to the defined business rules.
AC4
Given an Asset already exists for the same qualifying transaction,
When automation executes,
Then a duplicate Asset is not created.
AC5
Given automation encounters an error,
When processing fails,
Then the error is logged and the appropriate notification is generated.

Technical Notes


Definition of Done




## Architecture
```
data/sf-216-test-data.json  ->  tests/sf-216-creation.spec.js  ->  models/AutomatePage.js  ->  Salesforce UI
         (DATA)                      (test logic)                           (POM)                  (UI)
```

## POM Available
`models/AutomatePage.js` -- check existing methods or extend with new ones.

| Method | Purpose |
|---|---|
| `navigate()` | Navigate to app |
| `clickNew()` | Open new record form |
| `save()` | Save record |

## Data File
`data/sf-216-test-data.json`

| Scenario Key | Purpose |
|---|---|
| `requiredFieldsOnly` | Create record with minimal required fields |
| `negativeValidation` | Negative validation test |
| `boundaryValues` | Boundary testing with max length and numeric limits |

## Test Scenarios

| ID | Scenario | Data Key | Priority | Expected Result |
|---|---|---|---|---|
| sf-216-01 | Create Automate with required fields only | `requiredFieldsOnly` | P2 | Record created, toast + URL + heading verified |
| sf-216-02 | Attempt to save Automate without required fields | `negativeValidation` | P2 | Validation error shown, dialog stays open |
| sf-216-03 | Create Automate with boundary field values | `boundaryValues` | P2 | Fields accept boundary values without error |

## Assertions
1. Toast message contains "Automate" and "was created"
2. URL contains `/Automate/` and a record ID
3. Page heading shows the Automate name

## Agent Instructions

### Planner Agent
- Read this task file completely
- Explore the Automate object in Salesforce via MCP if needed
- Create `specs/sf-216-plan.md` with step-by-step test plan
- Map each scenario to POM methods from `models/AutomatePage.js`
- Reference `memory/framework-memory.md` for assertion rules

### Generator Agent
- Read `specs/sf-216-plan.md` for the test plan
- Read `data/sf-216-test-data.json` for data scenarios
- Read `models/AutomatePage.js` for available POM methods
- Generate `tests/sf-216-creation.spec.js` following framework rules:
  - Use `sfTest` fixture from `../fixtures/fixtures.js`
  - Import from `../utils/reporter-utils.js` and `../utils/validators.js`
  - Every test MUST call `assertRecordCreated(page, 'Automate')` after save
  - Use `sfStep()` for every Allure step
  - Use `loadData('sf-216', '<scenario-key>')` for data

### Healer Agent
- If tests fail, read the failure output
- Check `models/AutomatePage.js` for correct method signatures
- Fix the test code and re-run to verify

## Definition of Done
- [ ] `data/sf-216-test-data.json` created with all scenarios
- [ ] `specs/sf-216-plan.md` maps 1:1 to Test Scenarios table
- [ ] `tests/sf-216-creation.spec.js` implements all scenarios
- [ ] Every save uses `assertRecordCreated(page, 'Automate')`