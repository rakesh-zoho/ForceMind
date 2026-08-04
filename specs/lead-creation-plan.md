# Salesforce Lead Creation Test Plan

**Module:** Leads  
**Feature:** Lead Record Creation  
**Seed File:** `tests/seed.spec.js`  
**Page Object:** `models/LeadPage.js`

---

## Prerequisites
- User is logged into Salesforce with appropriate permissions
- Leads module is accessible via App Launcher

---

## Test Scenarios

### 1. Lead Creation - Basic Information

#### 1.1 Create Lead with Required Fields Only
**Steps:**
1. Navigate to Leads app via App Launcher
2. Click "New" button
3. Fill First Name = "John", Last Name = "Doe-[timestamp]", Company = "Acme Corporation"
4. Click Save
5. Verify success toast contains "Lead" and "was created"
6. Verify URL contains "/Lead/" (detail page loaded)
7. Navigate back to Leads list, switch to "All Leads", verify record visible

#### 1.2 Create Lead with All Standard Fields
**Steps:**
1. Navigate to Leads app
2. Click "New"
3. Fill all required fields + optional: Phone, Email, Title, Lead Source = "Web"
4. Click Save
5. Verify success toast
6. Verify detail page loaded

### 2. Field Validation

#### 2.1 Attempt to Save Lead Without Required Fields
**Steps:**
1. Navigate to Leads, click New
2. Leave all fields empty, click Save
3. Verify validation error appears (alert role)
4. Verify dialog stays open (save failed)

#### 2.2 Enter Only First Name and Attempt Save
**Steps:**
1. Navigate to Leads, click New
2. Fill only First Name = "Michael"
3. Click Save
4. Verify save failed - form still visible, URL unchanged
5. Verify Last Name field still visible

#### 2.3 Enter Valid Email Address
**Steps:**
1. Navigate to Leads, click New
2. Fill required fields + Email = "robert.brown@enterprise.com"
3. Save successfully
4. Verify detail page loaded

### 3. Dropdown and Picklist Selection

#### 3.1 Select Lead Source Dropdown
**Steps:**
1. Navigate to Leads, click New
2. Fill required fields
3. Select Lead Source = "Web"
4. Save successfully

#### 3.2 Select Rating Picklist (if available)
**Steps:**
1. Navigate to Leads, click New
2. Fill required fields
3. Select Rating = "Warm" (skip if field not present)
4. Save successfully

### 4. Text Field Handling

#### 4.1 Enter Text with Special Characters
**Steps:**
1. Navigate to Leads, click New
2. Fill First Name = "François", Last Name = "O'Sullivan", Company = "Société Générale & Partners"
3. Save successfully
4. Verify detail page loaded

### 5. Navigation and Form State

#### 5.1 Save and Navigate to Lead Detail View
**Steps:**
1. Navigate to Leads, click New
2. Fill required fields
3. Save
4. Verify URL changes to Lead detail page
5. Verify "Details" tab visible

#### 5.2 Cancel Lead Creation
**Steps:**
1. Navigate to Leads, click New
2. Fill some fields
3. Click Cancel
4. Handle "Discard Changes" confirmation if present
5. Verify dialog closed, no record created

### 6. Accessibility

#### 6.1 Navigate Form Using Keyboard Only
**Steps:**
1. Navigate to Leads, click New
2. Focus First Name, type via keyboard
3. Tab through fields
4. Type in Company field via keyboard
5. Tab to Save, press Enter
6. Verify Lead created

#### 6.2 Verify Field Labels and Required Indicators
**Steps:**
1. Navigate to Leads, click New
2. Verify First Name, Last Name, Company fields visible (scoped to dialog)
3. Verify Save button visible

---

## Required Assertions (every test)
- `sfStep()` wrapper for Allure steps
- `captureScreenshot()` after every major action
- `setAllureMeta()` in beforeEach
- `captureScreenshot()` on failure in afterEach
- `expect()` assertions after every action
- Use `LeadPage` POM for all SF interactions
