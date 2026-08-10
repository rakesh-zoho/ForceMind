
# SF-216 Asset Object Creation Tests

This test plan covers the creation scenarios for the Salesforce Asset object as defined in SF-216.

## Test Scenarios

### Scenario 1: Create Asset with Required Fields Only
**ID:** sf-216-01  
**Priority:** P2  
**Description:** Verify Asset creation with only mandatory fields  
**Data Key:** `requiredFieldsOnly`  
**Preconditions:** User logged in with appropriate permissions  

**Steps:**
1. Navigate to Asset object page using POM method `navigate()`
2. Click "New" button using POM method `clickNew()`
3. Fill required fields from `requiredFieldsOnly` data scenario
   - Asset Name (if required)
   - Product (if required)
   - Serial Number (if required)
4. Save record using POM method `save()`
5. Wait for page load and navigation to detail view

**Assertions:**
1. Toast message contains "Asset" and "was created"
2. URL contains `/Asset/` and a valid record ID
3. Page heading shows the Asset name
4. Record is successfully created and visible in detail view

### Scenario 2: Attempt to Save Asset Without Required Fields
**ID:** sf-216-02  
**Priority:** P2  
**Description:** Verify validation errors when saving without required fields  
**Data Key:** `negativeValidation`  
**Preconditions:** User logged in with appropriate permissions  

**Steps:**
1. Navigate to Asset object page using POM method `navigate()`
2. Click "New" button using POM method `clickNew()`
3. Fill form with incomplete data from `negativeValidation` scenario
   - Omit one or more required fields
4. Attempt to save record using POM method `save()`

**Assertions:**
1. Validation error messages appear for missing required fields
2. Dialog/form remains open (no navigation to detail page)
3. No record is created
4. Form fields show appropriate error states

### Scenario 3: Create Asset with Boundary Field Values
**ID:** sf-216-03  
**Priority:** P2  
**Description:** Verify Asset creation with maximum field lengths and boundary values  
**Data Key:** `boundaryValues`  
**Preconditions:** User logged in with appropriate permissions  

**Steps:**
1. Navigate to Asset object page using POM method `navigate()`
2. Click "New" button using POM method `clickNew()`
3. Fill form with boundary value data from `boundaryValues` scenario
   - Maximum length strings
   - Edge case numeric values
   - Special characters if applicable
4. Save record using POM method `save()`
5. Wait for page load and navigation to detail view

**Assertions:**
1. Record is successfully created without field validation errors
2. All fields accept and display boundary values correctly
3. Toast message confirms successful creation
4. Detail view shows all entered values accurately

## Mapping to POM Methods

| Scenario | POM Methods Used | Data Source |
|----------|------------------|-------------|
| sf-216-01 | `navigate()`, `clickNew()`, `fillRequiredFields()`, `save()` | `requiredFieldsOnly` |
| sf-216-02 | `navigate()`, `clickNew()`, `fillForm()`, `save()` (expect failure) | `negativeValidation` |
| sf-216-03 | `navigate()`, `clickNew()`, `fillBoundaryFields()`, `save()` | `boundaryValues` |

## File Dependencies

1. **Data File:** `data/sf-216-test-data.json` with scenarios:
   - `requiredFieldsOnly`: Minimal required field values
   - `negativeValidation`: Missing required fields
   - `boundaryValues`: Maximum/edge case values

2. **Page Object:** `models/AssetPage.js` (or extend `models/AutomatePage.js`)
   - Required methods: `navigate()`, `clickNew()`, `save()`, `fillRequiredFields()`
   - Optional methods: `fillBoundaryFields()`, `fillOptionalFields()`

3. **Test File:** `tests/sf-216-creation.spec.js`
   - Must use `sfTest` fixture from `../fixtures/fixtures.js`
   - Must import `sfStep` for Allure steps
   - Must call `assertRecordCreated(page, 'Asset')` after every successful save

## Assertions Summary

| Assertion Type | Implementation | Allure Step |
|----------------|----------------|-------------|
| Toast Message | `assertRecordCreated(page, 'Asset')` | "Verify creation toast" |
| URL Validation | `page.waitForURL('**/Asset/**')` | "Verify detail page URL" |
| Heading Check | `page.locator('lightning-formatted-text').first()` | "Verify Asset name heading" |
| Error Handling | `expect(formError).toBeVisible()` | "Verify validation error" |

## Coverage Gaps to Address

1. **POM Methods:** Need to verify existing methods in `models/AutomatePage.js` or create `models/AssetPage.js`
2. **Field Mapping:** Need to identify actual Asset object fields in Salesforce
3. **Data Scenarios:** Need to create appropriate test data for boundary values
4. **Assertion Rules:** Must follow framework conventions for `assertRecordCreated`

## Next Steps

1. Explore Asset object in Salesforce via MCP to identify fields and selectors
2. Create `models/AssetPage.js` with required methods
3. Create `data/sf-216-test-data.json` with three scenarios
4. Generate test code in `tests/sf-216-creation.spec.js`
5. Verify all tests pass and follow framework conventions

## Framework Compliance Checklist

- [ ] Uses `sfTest` fixture from fixtures
- [ ] All saves use `assertRecordCreated(page, 'Asset')`
- [ ] Every user action wrapped in `sfStep()` for Allure
- [ ] Uses `captureScreenshot()` on test failures
- [ ] Follows locator priority: role > label > placeholder > text
- [ ] Uses `waitForSFLoad(page)` after navigation
- [ ] No CSS class selectors except `.toastMessage`
```

## Key Observations and Recommendations:

1. **Naming Confusion:** The task file mentions "Automate" but the JIRA title refers to "Asset". I've assumed this is about the **Asset** object, which is a standard Salesforce object.

2. **Missing POM:** You'll need to either:
   - Create a new `models/AssetPage.js` page object, OR
   - Extend `models/AutomatePage.js` with Asset-specific methods

3. **Field Identification:** The Asset object schema isn't detailed in the OKF. You'll need to explore it via MCP to identify:
   - Required fields (likely Name, Product, SerialNumber)
   - Optional fields for boundary testing
   - Picklist values

4. **Data File Structure:** Based on other data files, `data/sf-216-test-data.json` should look like:
```json
{
  "assets": {
    "requiredFieldsOnly": {
      "name": "Test Asset 001",
      "serialNumber": "SN-12345",
      "product": "Product ABC"
    },
    "negativeValidation": {
      "serialNumber": "SN-67890"
      // Missing required fields intentionally
    },
    "boundaryValues": {
      "name": "A".repeat(255),  // Max length test
      "serialNumber": "SN-" + "9".repeat(20),
      "description": "Test with special chars: !@#$%^&*()_+"
    }
  }
}
```

5. **Framework Compliance:** The plan follows all framework conventions including:
   - `sfTest` fixture usage
   - `assertRecordCreated()` after saves
   - `sfStep()` for Allure steps
   - Proper locator strategies
   - `waitForSFLoad()` after navigation

