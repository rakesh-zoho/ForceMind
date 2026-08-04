# Task: Account Creation — End-to-End UI Automation

## Metadata
- Feature: Account Management
- Priority: P1
- Allure Epic: CRM
- Allure Feature: Account Management
- Allure Story: Account Creation
- Allure Severity: critical
- Coverage Scope: Positive, Negative, Boundary, Field Validation
- Test Case Count: 11
- Output Plan: specs/account-plan.md
- Output Spec: tests/account-creation.spec.js

## Objective
Automate Account object creation via Salesforce Lightning UI using Playwright + POM. Cover all standard fields, field validation, picklist handling, special characters, keyboard navigation, and form state management.

## Architecture
```
data/account-test-data.json  →  tests/account-creation.spec.js  →  models/AccountPage.js  →  Salesforce UI
        (DATA)                      (test logic)                       (POM)                  (UI)
```

## POM Available
`models/AccountPage.js` — already exists with these methods:
| Method | Purpose |
|---|---|
| `navigate()` | Navigate to Accounts app |
| `clickNew()` | Click New button, wait for modal |
| `fillAccountName(name)` | Fill Account Name field |
| `fillPhone(phone)` | Fill Phone field |
| `fillWebsite(website)` | Fill Website field |
| `fillBillingStreet(street)` | Fill Billing Street |
| `fillBillingCity(city)` | Fill Billing City |
| `fillBillingState(state)` | Fill Billing State |
| `fillBillingZip(zip)` | Fill Billing Postal Code |
| `fillBillingCountry(country)` | Fill Billing Country |
| `fillEmployees(count)` | Fill Employees field |
| `fillAnnualRevenue(amount)` | Fill Annual Revenue |
| `fillDescription(description)` | Fill Description |
| `selectIndustry(industry)` | Select Industry picklist |
| `selectType(type)` | Select Type picklist |
| `save()` | Click Save, wait for toast |
| `createAccount({...})` | Full flow: navigate + fill + save |

## Fixtures Available
`fixtures/fixtures.js` — `accountPage` fixture already registered.

## Preconditions
- User authenticated via `reports/.auth-state.json`
- Salesforce org accessible at `SF_URL`
- Account object accessible with create permission
- No duplicate rules blocking Account creation

## Data File
`data/account-test-data.json`

| Scenario Key | Purpose | Fields |
|---|---|---|
| `requiredFieldsOnly` | Create Account with name only | accountName |
| `allStandardFields` | Full field Account creation | name, phone, website, industry, type, billing (all), employees, annualRevenue, description |
| `phoneAndWebsite` | Account with phone + website | accountName, phone, website |
| `billingAddress` | Full billing address | accountName + all billing fields |
| `industryAndType` | Picklist-heavy scenario | accountName, industry, type |
| `specialCharacters` | Unicode, symbols, apostrophes | accountName with special chars |
| `longFieldValues` | Boundary — max length fields | accountName (255 chars), description (3000 chars) |
| `numericBoundary` | Boundary — numeric fields | employees (0, 999999999), annualRevenue (0, 999999999) |
| `negativeEmptyName` | Negative — save without name | empty accountName |
| `negativeInvalidWebsite` | Negative — invalid URL format | accountName + invalid website |

## Test Scenarios

| ID | Scenario | Data Key | Priority | Expected Result |
|---|---|---|---|---|
| ACC-01 | Create Account with required fields only | `requiredFieldsOnly` | P1 | Record created, toast + URL + heading verified |
| ACC-02 | Create Account with all standard fields | `allStandardFields` | P1 | All field values persist on detail page |
| ACC-03 | Create Account with phone and website | `phoneAndWebsite` | P1 | Phone and website values saved correctly |
| ACC-04 | Create Account with full billing address | `billingAddress` | P2 | All billing address fields saved |
| ACC-05 | Create Account with industry and type picklists | `industryAndType` | P2 | Picklist values saved correctly |
| ACC-06 | Create Account with special characters in name | `specialCharacters` | P2 | Unicode preserved, record created |
| ACC-07 | Create Account with long field values | `longFieldValues` | P3 | Fields accept max length without error |
| ACC-08 | Create Account with boundary numeric values | `numericBoundary` | P3 | Numeric fields accept boundary values |
| ACC-09 | Attempt to save Account without name | `negativeEmptyName` | P1 | Validation error shown, dialog stays open |
| ACC-10 | Create Account and verify in list view | `requiredFieldsOnly` | P1 | Account appears in All Accounts list |
| ACC-11 | Cancel Account creation with unsaved changes | `requiredFieldsOnly` | P2 | Dialog closes, no record created |

## Assertions

### Positive Scenarios (ACC-01 to ACC-08)
1. Toast message contains "Account" and "was created"
2. URL contains `/Account/` and a record ID
3. Page heading shows the Account name
4. For ACC-02: individual field values verified on detail page

### Negative Scenarios (ACC-09)
1. Validation error message displayed
2. Dialog remains open after Save click
3. No navigation away from the form

### List View (ACC-10)
1. Navigate to All Accounts list view
2. Account name appears in the list

### Cancel (ACC-11)
1. Click Cancel
2. Handle "discard" prompt if shown
3. Dialog closes
4. No new Account record created

## Agent Instructions

### Planner Agent
- Read this task file completely
- Explore the Account object in Salesforce via MCP if needed
- Create `specs/account-plan.md` with step-by-step test plan
- Map each scenario to specific POM methods from `models/AccountPage.js`
- Reference `memory/framework-memory.md` for assertion rules

### Generator Agent
- Read `specs/account-plan.md` for the test plan
- Read `data/account-test-data.json` for data scenarios
- Read `models/AccountPage.js` for available POM methods
- Generate `tests/account-creation.spec.js` following these rules:
  - Use `sfTest` fixture from `../fixtures/fixtures.js`
  - Import `captureScreenshot`, `sfStep`, `setAllureMeta` from `../utils/reporter-utils.js`
  - Import `loadData` from `../utils/data-factory.js`
  - Import `assertRecordCreated`, `assertValidationErrors`, `assertDialogStillOpen` from `../utils/validators.js`
  - Import `waitForSFLoad`, `switchToAllRecords` from `../utils/sf-helpers.js`
  - Every test MUST call `assertRecordCreated(page, 'Account')` after save
  - Every negative test MUST assert dialog stays open
  - Use `sfStep()` for every Allure step
  - Use `captureScreenshot()` at key points
  - Tag smoke tests with `@smoke` and regression tests with `@regression`
  - Run `npx playwright test account-creation --config config/playwright.config.js` to verify

### Healer Agent
- If tests fail, read the failure output
- Check `models/AccountPage.js` for correct method signatures
- Check `utils/locator-utils.js` for SF-specific patterns
- Check `memory/sf-selectors.md` for selector reference
- Fix the test code and re-run to verify

## Definition of Done
- [ ] `data/account-test-data.json` contains all 10 scenario keys
- [ ] `specs/account-plan.md` maps 1:1 to Test Scenarios table
- [ ] `specs/account-rtm.md` traces requirements to tests
- [ ] `tests/account-creation.spec.js` implements all 11 scenarios
- [ ] All P1 tests pass: ACC-01, ACC-02, ACC-03, ACC-09, ACC-10
- [ ] All P2 tests pass: ACC-04, ACC-05, ACC-06, ACC-11
- [ ] All P3 tests pass: ACC-07, ACC-08
- [ ] Every save assertion uses `assertRecordCreated(page, 'Account')`
- [ ] Every negative test asserts dialog stays open
