# Salesforce Case Creation Test Plan

**Module:** Cases  
**Feature:** Case Record Creation  
**Seed File:** `tests/seed.spec.js`  
**Page Object:** `models/CasePage.js`  
**Data File:** `data/case-test-data.json`

---

## Prerequisites
- User is logged into Salesforce with appropriate permissions
- Cases module is accessible via App Launcher
- Required test data scenarios are available in the case data file

---

## Test Scenarios

### 1. Case Creation - Basic Information

#### 1.1 Create Case with Basic Required Fields
**Data:** `data/case-test-data.json` → `basicCase`  
**Steps:**
1. Navigate to Cases via App Launcher
2. Click New
3. Fill Subject using the data scenario value
4. Select Status, Priority, and optionally Description from the data scenario
5. Save the record
6. Verify success toast contains "Case"
7. Verify the Case detail page loads
8. Verify the record appears in the All Cases list view

#### 1.2 Create Case with All Standard Fields
**Data:** `data/case-test-data.json` → `allFields`  
**Steps:**
1. Navigate to Cases via App Launcher
2. Click New
3. Populate all available standard fields from the data scenario, including Type and Case Origin
4. Save the record
5. Verify success toast and detail page load
6. Verify the record appears in the list view

### 2. Field Validation

#### 2.1 Attempt to Save Case Without Required Subject
**Data:** `data/case-test-data.json` → `basicCase`  
**Steps:**
1. Navigate to Cases and click New
2. Leave Subject empty
3. Click Save
4. Verify validation error is shown
5. Verify the dialog remains open and the save action fails

#### 2.2 Save Case with Only Required Fields
**Data:** `data/case-test-data.json` → `basicCase`  
**Steps:**
1. Navigate to Cases and click New
2. Fill only Subject and required dependent values from the scenario
3. Click Save
4. Verify the record is created successfully
5. Verify detail page is loaded

### 3. Lookup and Picklist Handling

#### 3.1 Populate Lookup Fields for Contact and Account
**Data:** `data/case-test-data.json` → `basicCase`  
**Steps:**
1. Navigate to Cases and click New
2. Use the CasePage POM to populate Contact Name and Account Name via lookup search
3. Fill the required Subject field
4. Save the record
5. Verify record creation succeeds

#### 3.2 Select Status, Priority, and Case Origin Picklists
**Data:** `data/case-test-data.json` → `allFields`  
**Steps:**
1. Open a new Case form
2. Select Status, Priority, and Case Origin from the data scenario values
3. Save the record
4. Verify the new Case is created and the selected values are reflected on the detail page

### 4. Text Field Handling

#### 4.1 Enter Special Characters in Subject and Description
**Data:** `data/case-test-data.json` → `basicCase`  
**Steps:**
1. Open a new Case form
2. Enter a Subject and Description containing special characters or punctuation
3. Save the record
4. Verify the record is created and the values are retained correctly

### 5. Navigation and Form State

#### 5.1 Save and Navigate to Case Detail View
**Data:** `data/case-test-data.json` → `basicCase`  
**Steps:**
1. Open a new Case form
2. Fill required fields and save
3. Verify the URL changes to the Case detail page
4. Verify the Details tab or case header is visible

#### 5.2 Cancel Case Creation
**Data:** `data/case-test-data.json` → `basicCase`  
**Steps:**
1. Open a new Case form
2. Enter some values into the form
3. Click Cancel
4. Handle any discard confirmation prompt if it appears
5. Verify the form closes and no Case is created

### 6. Attachment Handling

#### 6.1 Upload a File Attachment to a Newly Created Case
**Data:** `data/case-test-data.json` → `basicCase`  
**Steps:**
1. Create a new Case successfully using the basic data scenario
2. Open the newly created Case detail page
3. Upload the file from the path "C:\Users\Admin\Downloads\Salesforce-logo.jpg"
4. Wait for the upload to complete
5. Verify the attachment is visible in the Case attachment area or related files section

### 7. Accessibility

#### 7.1 Create a Case Using Keyboard Only
**Data:** `data/case-test-data.json` → `basicCase`  
**Steps:**
1. Open a new Case form
2. Use keyboard navigation to move through the form fields
3. Enter values using keyboard input
4. Tab to Save and press Enter
5. Verify the Case is created successfully

---

## Required Assertions (every test)
- Use `sfStep()` wrapper for Allure steps
- Use `captureScreenshot()` after every major action
- Use `setAllureMeta()` in beforeEach
- Use `captureScreenshot()` on failure in afterEach
- Use the `CasePage` POM for all Salesforce interactions
- Use `loadData('case', '<scenario>')` for test data
- Use validators from `utils/validators.js` for form and record assertions
