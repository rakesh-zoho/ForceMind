# Account Test Plan

**Module:** Accounts  
**Feature:** Account Creation, Validation, and List Verification  
**Page Object:** `models/AccountPage.js`  
**Data File:** `data/account-test-data.json`

---

## Prerequisites
- Salesforce authentication is available through the existing Playwright setup.
- The user has access to create Accounts in the target org.
- The Account page object is available in `models/AccountPage.js`.
- Test data is loaded from `data/account-test-data.json` using the shared data factory.

---

## Test Scenarios

### 1. Account Creation - Basic

#### ACC-01: Create Account with required fields only
- **Data Key:** `data/account-test-data.json` → `requiredFieldsOnly`
- **Steps:**
  1. Navigate to the Accounts app using `navigate()`.
  2. Open the new Account form with `clickNew()`.
  3. Fill the required Account Name using `fillAccountName()` with the value from `accountName`.
  4. Save the form with `save()`.
  5. Assert the record was created successfully.
  6. Assert the detail page opens for the new Account.
- **POM Methods:**
  - `navigate()`
  - `clickNew()`
  - `fillAccountName(name)`
  - `save()`
- **Assertions:**
  - Use `assertRecordCreated(page, 'Account')` immediately after save.
  - Assert the toast contains both "Account" and "was created".
  - Assert the URL contains `/Account/` and a record Id.
  - Assert the page heading contains the provided account name.

#### ACC-02: Create Account with all standard fields
- **Data Key:** `data/account-test-data.json` → `allStandardFields`
- **Steps:**
  1. Navigate to Accounts using `navigate()`.
  2. Open the new Account form with `clickNew()`.
  3. Populate the Account Name, Phone, Website, Industry, Type, Billing fields, Employees, Annual Revenue, and Description using the corresponding POM methods.
  4. Save the form with `save()`.
  5. Assert the record exists and the detail page loads.
  6. Verify the field values persist on the record detail page.
- **POM Methods:**
  - `navigate()`
  - `clickNew()`
  - `fillAccountName(name)`
  - `fillPhone(phone)`
  - `fillWebsite(website)`
  - `selectIndustry(industry)`
  - `selectType(type)`
  - `fillBillingStreet(street)`
  - `fillBillingCity(city)`
  - `fillBillingState(state)`
  - `fillBillingZip(zip)`
  - `fillBillingCountry(country)`
  - `fillEmployees(count)`
  - `fillAnnualRevenue(amount)`
  - `fillDescription(description)`
  - `save()`
- **Assertions:**
  - Use `assertRecordCreated(page, 'Account')` after save.
  - Assert the saved values for Phone, Website, Industry, Type, Billing address, Employees, Annual Revenue, and Description appear on the detail page.
  - Assert the page heading matches the Account Name from the data set.

#### ACC-03: Create Account with phone and website
- **Data Key:** `data/account-test-data.json` → `phoneAndWebsite`
- **Steps:**
  1. Open the Accounts app with `navigate()`.
  2. Start a new Account with `clickNew()`.
  3. Fill the Account Name, Phone, and Website values from the data key.
  4. Save the record with `save()`.
  5. Assert the record detail page is shown.
- **POM Methods:**
  - `navigate()`
  - `clickNew()`
  - `fillAccountName(name)`
  - `fillPhone(phone)`
  - `fillWebsite(website)`
  - `save()`
- **Assertions:**
  - Use `assertRecordCreated(page, 'Account')` after save.
  - Assert the Phone and Website values are present on the detail page.
  - Assert the Account Name is shown in the page heading.

#### ACC-04: Create Account with full billing address
- **Data Key:** `data/account-test-data.json` → `billingAddress`
- **Steps:**
  1. Open the Accounts app with `navigate()`.
  2. Start a new Account with `clickNew()`.
  3. Fill the Account Name and the billing address fields from the data set.
  4. Save the form with `save()`.
  5. Assert the detail page is loaded and the address is persisted.
- **POM Methods:**
  - `navigate()`
  - `clickNew()`
  - `fillAccountName(name)`
  - `fillBillingStreet(street)`
  - `fillBillingCity(city)`
  - `fillBillingState(state)`
  - `fillBillingZip(zip)`
  - `fillBillingCountry(country)`
  - `save()`
- **Assertions:**
  - Use `assertRecordCreated(page, 'Account')` after save.
  - Assert the full billing address is visible on the detail page.
  - Assert the record heading matches the Account Name.

#### ACC-05: Create Account with industry and type picklists
- **Data Key:** `data/account-test-data.json` → `industryAndType`
- **Steps:**
  1. Open the Accounts app with `navigate()`.
  2. Start a new Account with `clickNew()`.
  3. Fill the Account Name.
  4. Select the Industry and Type values from the data key using the relevant picklist POM methods.
  5. Save the record with `save()`.
  6. Confirm the detail page loads and the picklist values are stored.
- **POM Methods:**
  - `navigate()`
  - `clickNew()`
  - `fillAccountName(name)`
  - `selectIndustry(industry)`
  - `selectType(type)`
  - `save()`
- **Assertions:**
  - Use `assertRecordCreated(page, 'Account')` after save.
  - Assert the selected Industry and Type values appear on the detail page.
  - Assert the page heading shows the Account Name.

### 2. Account Creation - Special Cases

#### ACC-06: Create Account with special characters in name
- **Data Key:** `data/account-test-data.json` → `specialCharacters`
- **Steps:**
  1. Open the Accounts app with `navigate()`.
  2. Start a new Account with `clickNew()`.
  3. Fill the Account Name using the special-character value from the data set.
  4. Save with `save()`.
  5. Assert the record is created successfully.
- **POM Methods:**
  - `navigate()`
  - `clickNew()`
  - `fillAccountName(name)`
  - `save()`
- **Assertions:**
  - Use `assertRecordCreated(page, 'Account')` after save.
  - Assert the Account Name appears exactly as entered, including special characters and punctuation.
  - Assert the detail page heading matches the special-character name.

#### ACC-07: Create Account with long field values
- **Data Key:** `data/account-test-data.json` → `longFieldValues`
- **Steps:**
  1. Open the Accounts app with `navigate()`.
  2. Start a new Account with `clickNew()`.
  3. Fill the long Account Name and Description values from the data file.
  4. Save the form with `save()`.
  5. Assert the record is created without truncation or validation failure.
- **POM Methods:**
  - `navigate()`
  - `clickNew()`
  - `fillAccountName(name)`
  - `fillDescription(description)`
  - `save()`
- **Assertions:**
  - Use `assertRecordCreated(page, 'Account')` after save.
  - Assert the long Account Name and Description are preserved on the detail page.
  - Assert the record loads successfully without errors.

#### ACC-08: Create Account with boundary numeric values
- **Data Key:** `data/account-test-data.json` → `numericBoundary`
- **Steps:**
  1. Open the Accounts app with `navigate()`.
  2. Start a new Account with `clickNew()`.
  3. Fill the Account Name and the boundary numeric values for Employees and Annual Revenue.
  4. Save the form with `save()`.
  5. Assert the record is created correctly.
- **POM Methods:**
  - `navigate()`
  - `clickNew()`
  - `fillAccountName(name)`
  - `fillEmployees(count)`
  - `fillAnnualRevenue(amount)`
  - `save()`
- **Assertions:**
  - Use `assertRecordCreated(page, 'Account')` after save.
  - Assert the boundary values are preserved on the detail page.
  - Assert no validation error is shown for valid boundary values.

### 3. Validation and Form State

#### ACC-09: Attempt to save Account without name
- **Data Key:** `data/account-test-data.json` → `negativeEmptyName`
- **Steps:**
  1. Open the Accounts app with `navigate()`.
  2. Start a new Account with `clickNew()`.
  3. Leave the Account Name blank, using the empty value from the data key.
  4. Click Save using the dialog Save button.
  5. Assert validation behavior prevents successful save.
- **POM Methods:**
  - `navigate()`
  - `clickNew()`
  - `save()`
- **Assertions:**
  - Assert validation errors are shown using `assertValidationErrors(page)`.
  - Assert the dialog remains open using `assertDialogStillOpen(page)`.
  - Assert the user remains on the Account form and does not navigate away.

#### ACC-10: Create Account and verify it appears in list view
- **Data Key:** `data/account-test-data.json` → `requiredFieldsOnly`
- **Steps:**
  1. Open the Accounts app with `navigate()`.
  2. Start a new Account with `clickNew()`.
  3. Fill the required Account Name from the data set.
  4. Save the record with `save()`.
  5. Assert the record was created.
  6. Switch to the All Accounts list view and verify the record appears in the list.
- **POM Methods:**
  - `navigate()`
  - `clickNew()`
  - `fillAccountName(name)`
  - `save()`
- **Assertions:**
  - Use `assertRecordCreated(page, 'Account')` after save.
  - Assert the new Account appears in the All Accounts list view.
  - Assert the list row contains the created Account Name.

#### ACC-11: Cancel Account creation with unsaved changes
- **Data Key:** `data/account-test-data.json` → `requiredFieldsOnly`
- **Steps:**
  1. Open the Accounts app with `navigate()`.
  2. Start a new Account with `clickNew()`.
  3. Fill the Account Name from the data set.
  4. Click Cancel on the dialog.
  5. If a discard confirmation appears, accept it.
  6. Assert the form closes and no new record is created.
- **POM Methods:**
  - `navigate()`
  - `clickNew()`
  - `fillAccountName(name)`
  - Use the existing `cancelButton` locator from `AccountPage` for the Cancel action.
- **Assertions:**
  - Assert the dialog closes after Cancel is clicked.
  - Assert no new Account record is created after the cancel action.
  - Assert the user returns to the Accounts page without the unsaved form open.

---

## Automation Notes
- For every positive scenario, save must be followed by `assertRecordCreated(page, 'Account')`.
- For validation scenarios, assert the dialog stays open and validation errors appear.
- Every major interaction should be wrapped in `sfStep()` and accompanied by `captureScreenshot()` where appropriate.
- Use `setAllureMeta()` in `beforeEach` and `captureScreenshot()` on failure in `afterEach`.
- Use `loadData('account', '<scenario-key>')` to retrieve the requested data scenario.
