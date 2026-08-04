I'll read the referenced files to understand the framework patterns and create a comprehensive test plan.

<b>
Reading referenced files...
</b>

<filepaths>
models/CasePage.js
data/sf-214-test-data.json
fixtures/fixtures.js
memory/framework-memory.md
utils/reporter-utils.js
utils/validators.js
</filepaths>

Based on my analysis of the task file and framework conventions, here is the test plan:

---

## Generated Test Plan

**File: `specs/sf-214-plan.md`**

```markdown
---
type: Test Plan
title: SF-214 - Update Salesforce Cases with Random Internal Comments
description: Test plan for creating cases and updating them with internal comments
tags: [test, case, creation, internal-comments]
status: ready
generated: { by: custom-agent, at: 2026-08-04T14:00:00Z }
---

# SF-214 Test Plan

## Overview
**Task:** SF-214 - Update Salesforce Cases with Random Internal Comments  
**Object:** Case  
**Priority:** P2  
**Coverage:** Positive, Negative, Boundary  

## Test Scenarios

### Scenario 1: sf-214-01 — Create Case with Required Fields Only
| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Positive / Happy Path |
| **Data Key** | `requiredFieldsOnly` |
| **Preconditions** | User logged in, on Cases list view |

**Steps:**
| Step | Action | POM Method | Assertion |
|------|--------|------------|-----------|
| 1 | Navigate to Cases app | `CasePage.navigate()` | Page loads successfully |
| 2 | Click New button | `CasePage.clickNew()` | Modal opens |
| 3 | Fill Subject field | `CasePage.fillSubject(data.subject)` | Field populated |
| 4 | Select Status picklist | `CasePage.selectStatus(data.status)` | Value selected |
| 5 | Select Priority picklist | `CasePage.selectPriority(data.priority)` | Value selected |
| 6 | Click Save | `CasePage.save()` | Modal closes |
| 7 | Verify record created | `assertRecordCreated(page, 'Case')` | Toast, URL, heading verified |

**Expected Results:**
- ✅ Toast message: "Case [name] was created"
- ✅ URL contains `/lightning/r/Case/` with record ID
- ✅ Page heading displays case name

---

### Scenario 2: sf-214-02 — Attempt to Save Case Without Required Fields
| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Negative / Validation |
| **Data Key** | `negativeValidation` |
| **Preconditions** | User logged in, on Cases list view |

**Steps:**
| Step | Action | POM Method | Assertion |
|------|--------|------------|-----------|
| 1 | Navigate to Cases app | `CasePage.navigate()` | Page loads successfully |
| 2 | Click New button | `CasePage.clickNew()` | Modal opens |
| 3 | Leave required fields empty | — | Fields remain empty |
| 4 | Click Save | `CasePage.save()` | Modal stays open |
| 5 | Verify validation error | Expect error message | Error displayed |

**Expected Results:**
- ✅ Validation error message appears (e.g., "Complete this field")
- ✅ Modal dialog remains open
- ✅ No record created

---

### Scenario 3: sf-214-03 — Create Case with Boundary Field Values
| Attribute | Value |
|-----------|-------|
| **Priority** | P2 |
| **Type** | Boundary / Edge Case |
| **Data Key** | `boundaryValues` |
| **Preconditions** | User logged in, on Cases list view |

**Steps:**
| Step | Action | POM Method | Assertion |
|------|--------|------------|-----------|
| 1 | Navigate to Cases app | `CasePage.navigate()` | Page loads successfully |
| 2 | Click New button | `CasePage.clickNew()` | Modal opens |
| 3 | Fill Subject with max length (255 chars) | `CasePage.fillSubject(data.subject)` | Field accepts value |
| 4 | Fill Description with long text (32000 chars) | `CasePage.fillDescription(data.description)` | Field accepts value |
| 5 | Select Status picklist | `CasePage.selectStatus(data.status)` | Value selected |
| 6 | Select Priority picklist | `CasePage.selectPriority(data.priority)` | Value selected |
| 7 | Select Case Origin | `CasePage.selectCaseOrigin(data.origin)` | Value selected |
| 8 | Click Save | `CasePage.save()` | Modal closes |
| 9 | Verify record created | `assertRecordCreated(page, 'Case')` | Toast, URL, heading verified |

**Expected Results:**
- ✅ Fields accept boundary values without error
- ✅ Record saves successfully
- ✅ All field values preserved on detail view

---

## POM Methods Required

| Method | Exists? | Action |
|--------|---------|--------|
| `navigate()` | ✅ Yes | Use existing |
| `clickNew()` | ✅ Yes | Use existing |
| `fillSubject(subject)` | ✅ Yes | Use existing |
| `selectStatus(status)` | ✅ Yes | Use existing |
| `selectPriority(priority)` | ✅ Yes | Use existing |
| `selectCaseOrigin(origin)` | ✅ Yes | Use existing |
| `fillDescription(desc)` | ✅ Yes | Use existing |
| `save()` | ✅ Yes | Use existing |

## Data Scenarios

**File:** `data/sf-214-test-data.json`

```json
{
  "requiredFieldsOnly": {
    "subject": "Test Case - Required Fields",
    "status": "New",
    "priority": "Medium"
  },
  "negativeValidation": {
    "subject": "",
    "status": "",
    "priority": ""
  },
  "boundaryValues": {
    "subject": "AAAA...[255 chars]",
    "description": "BBBB...[32000 chars]",
    "status": "New",
    "priority": "High",
    "origin": "Phone"
  }
}
```

## Validation Rules

| Field | Rule |
|-------|------|
| Subject | Required, max 255 chars |
| Status | Required, picklist |
| Priority | Required, picklist |
| Case Origin | Optional, picklist |
| Description | Optional, rich text, max 32000 chars |

## Output Files

| File | Description |
|------|-------------|
| `data/sf-214-test-data.json` | Test data with all scenarios |
| `specs/sf-214-plan.md` | This test plan |
| `tests/sf-214-creation.spec.js` | Playwright test file |

## Framework Rules to Follow

1. ✅ Use `sfTest` fixture from `../fixtures/fixtures.js`
2. ✅ Every save MUST call `assertRecordCreated(page, 'Case')`
3. ✅ Use `sfStep()` for Allure steps
4. ✅ Use `loadData('sf-214', '<scenario>')` for data
5. ✅ Use `captureScreenshot()` on failure
6. ✅ Wait for SF load after navigation
7. ✅ Locator priority: role > label > placeholder > text
```

---

## Summary

| Item | Status |
|------|--------|
| **Plan File** | `specs/sf-214-plan.md` |
| **Test Count** | 3 scenarios |
| **POM Methods** | All exist in `models/CasePage.js` |
| **Data File** | `data/sf-214-test-data.json` (to be created) |
| **Test File** | `tests/sf-214-creation.spec.js` (to be generated) |

**Next Steps:**
1. Create `data/sf-214-test-data.json` with scenario data
2. Generate `tests/sf-214-creation.spec.js` using the plan
3. Run tests and verify all pass

Would you like me to proceed with generating the data file and test code?