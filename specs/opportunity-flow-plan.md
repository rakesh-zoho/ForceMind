# Salesforce Opportunity Creation Test Plan

**Module:** Opportunities  
**Feature:** Opportunity Record Creation  
**Seed File:** `tests/seed.spec.js`  
**Page Object:** `models/OpportunityPage.js`  
**Data File:** `data/opportunity-test-data.json`

---

## Prerequisites
- User is logged into Salesforce with appropriate permissions
- Opportunities module is accessible via App Launcher
- Required test data scenarios are available in the opportunity data file
- A test Account exists for lookup scenarios

---

## Test Scenarios

### 1. Opportunity Creation - Basic Information

#### 1.1 Create Opportunity with Required Fields Only
**Data:** `data/opportunity-test-data.json` → `requiredFieldsOnly`  
**Steps:**
1. Navigate to Opportunities via App Launcher
2. Click New
3. Fill Opportunity Name (required)
4. Select Stage (required picklist)
5. Fill Close Date (required)
6. Save the record
7. Verify success toast contains "Opportunity"
8. Verify the Opportunity detail page loads
9. Verify the record appears in the All Opportunities list view

#### 1.2 Create Opportunity with All Standard Fields
**Data:** `data/opportunity-test-data.json` → `allStandardFields`  
**Steps:**
1. Navigate to Opportunities via App Launcher
2. Click New
3. Populate all available standard fields: Name, Stage, Close Date, Amount, Description
4. Save the record
5. Verify success toast and detail page load
6. Verify all entered values persist on the detail page

#### 1.3 Create Opportunity with Description Populated
**Data:** `data/opportunity-test-data.json` → `withDescription`  
**Steps:**
1. Navigate to Opportunities and click New
2. Fill all required fields plus Description
3. Save the record
4. Verify success toast and detail page load
5. Verify full description text persists on the detail page

### 2. Opportunity Creation - Field Validation

#### 2.1 Attempt to Save Opportunity Without Name
**Data:** `data/opportunity-test-data.json` → `missingName`  
**Steps:**
1. Navigate to Opportunities and click New
2. Leave Opportunity Name empty
3. Fill all other required fields
4. Click Save
5. Verify validation error is shown on the Name field
6. Verify the dialog remains open

#### 2.2 Attempt to Save Opportunity Without Stage
**Data:** `data/opportunity-test-data.json` → `missingStage`  
**Steps:**
1. Navigate to Opportunities and click New
2. Leave Stage unselected
3. Fill all other required fields
4. Click Save
5. Verify validation error is shown on the Stage field
6. Verify the dialog remains open

#### 2.3 Attempt to Save Opportunity Without Close Date
**Data:** `data/opportunity-test-data.json` → `missingCloseDate`  
**Steps:**
1. Navigate to Opportunities and click New
2. Leave Close Date empty
3. Fill all other required fields
4. Click Save
5. Verify validation error is shown on the Close Date field
6. Verify the dialog remains open

#### 2.4 Enter Non-Numeric Value in Amount Field
**Data:** `data/opportunity-test-data.json` → `invalidAmount`  
**Steps:**
1. Navigate to Opportunities and click New
2. Fill all required fields
3. Enter "abc" in the Amount field
4. Click Save
5. Verify the dialog remains open or the input is rejected

### 3. Opportunity Creation - Picklist and Lookup Handling

#### 3.1 Select Stage Picklist Value
**Data:** `data/opportunity-test-data.json` → `requiredFieldsOnly`  
**Steps:**
1. Navigate to Opportunities and click New
2. Fill required fields
3. Select "Qualification" from the Stage picklist
4. Save the record
5. Verify the selected Stage value persists on the detail page

#### 3.2 Populate Account Lookup Field
**Data:** `data/opportunity-test-data.json` → `withAccount`  
**Steps:**
1. Navigate to Opportunities and click New
2. Fill all required fields
3. Search and select an Account in the Account Name lookup
4. Save the record
5. Verify the Account link is visible on the detail page

### 4. Opportunity Creation - Text Field Handling

#### 4.1 Enter Special Characters in Opportunity Name
**Data:** `data/opportunity-test-data.json` → `specialCharacters`  
**Steps:**
1. Navigate to Opportunities and click New
2. Fill required fields with special characters in the Name
3. Save the record
4. Verify the record is created
5. Verify the special characters are retained correctly on the detail page

### 5. Opportunity Creation - Navigation and Form State

#### 5.1 Save and Navigate to Opportunity Detail View
**Data:** `data/opportunity-test-data.json` → `requiredFieldsOnly`  
**Steps:**
1. Navigate to Opportunities and click New
2. Fill required fields and save
3. Verify the URL changes to the Opportunity detail page
4. Verify a heading or record detail is visible

#### 5.2 Cancel Opportunity Creation
**Data:** `data/opportunity-test-data.json` → `requiredFieldsOnly`  
**Steps:**
1. Navigate to Opportunities and click New
2. Enter some values into the form
3. Click Cancel
4. Handle any discard confirmation prompt if it appears
5. Verify the form closes and no Opportunity is created

### 6. Opportunity Creation - Attachment Handling

#### 6.1 Upload a File Attachment to a Newly Created Opportunity
**Data:** `data/opportunity-test-data.json` → `requiredFieldsOnly`  
**Fixture:** `C:/Users/Admin/Downloads/Salesforce-logo.jpg`  
**Steps:**
1. Create a new Opportunity successfully
2. Open the newly created Opportunity detail page
3. Upload the attachment file
4. Wait for the upload to complete
5. Verify the attachment is visible in the Files related list

---

## Required Assertions (every test)
- Use `sfStep()` wrapper for Allure steps
- Use `captureScreenshot()` after every major action
- Use `setAllureMeta()` in beforeEach
- Use `captureScreenshot()` on failure in afterEach
- Use the `OpportunityPage` POM for all Salesforce interactions
- Use `loadData('opportunity', '<scenario>')` for test data
- Use `assertRecordCreated(page, 'Opportunity')` for every save
- Use `assertValidationErrors(page)` for negative scenarios
- Use `assertDialogStillOpen(page)` when save is expected to fail
