---
type: Selector Map
title: Salesforce Lightning Selectors
description: Complete locator library for SF Lightning UI
tags:
  - selectors
  - salesforce
  - lightning
  - locators
status: stable
generated:
  by: forcemind/2.0
  at: 2026-08-03T10:00:00.000Z
verified:
  by: 'human:admin'
  at: 2026-08-03T12:00:00.000Z
stale_after: 2026-11-03T00:00:00.000Z
---

# Global Navigation

| Element | Selector | Notes |
|---------|----------|-------|
| App Launcher | `[title="App Launcher"]` | First match |
| Setup Gear | `[title="Setup"]` | Lightning only |
| User Menu | `.setupgear` | Profile dropdown |

# lead Object

| Element | Selector |
|---------|----------|
| js | `.js` |
| beforeEach | `.beforeEach` |
| afterEach | `.afterEach` |
| status | `.status` |
| title | `.title` |
| replace | `.replace` |
| toLowerCase | `.toLowerCase` |
| describe | `.describe` |
| navigate | `.navigate` |
| clickNew | `.clickNew` |
| fillRequiredFields | `.fillRequiredFields` |
| firstName | `.firstName` |
| lastName | `.lastName` |
| company | `.company` |
| save | `.save` |
| fillOptionalFields | `.fillOptionalFields` |
| phone | `.phone` |
| email | `.email` |
| leadSource | `.leadSource` |
| getByRole | `.getByRole` |
| first | `.first` |
| click | `.click` |
| waitForTimeout | `.waitForTimeout` |
| getByLabel | `.getByLabel` |
| fill | `.fill` |
| url | `.url` |
| toHaveValue | `.toHaveValue` |
| toBeVisible | `.toBeVisible` |
| toHaveURL | `.toHaveURL` |
| getByText | `.getByText` |
| isVisible | `.isVisible` |
| catch | `.catch` |
| toBeHidden | `.toBeHidden` |
| focus | `.focus` |
| keyboard | `.keyboard` |
| type | `.type` |
| press | `.press` |

# account Object

| Element | Selector |
|---------|----------|
| js | `.js` |
| beforeEach | `.beforeEach` |
| afterEach | `.afterEach` |
| status | `.status` |
| title | `.title` |
| replace | `.replace` |
| toLowerCase | `.toLowerCase` |
| describe | `.describe` |
| navigate | `.navigate` |
| clickNew | `.clickNew` |
| fillAccountName | `.fillAccountName` |
| accountName | `.accountName` |
| save | `.save` |
| fillPhone | `.fillPhone` |
| phone | `.phone` |
| fillWebsite | `.fillWebsite` |
| website | `.website` |
| selectIndustry | `.selectIndustry` |
| industry | `.industry` |
| selectType | `.selectType` |
| type | `.type` |
| fillBillingStreet | `.fillBillingStreet` |
| billingStreet | `.billingStreet` |
| fillBillingCity | `.fillBillingCity` |
| billingCity | `.billingCity` |
| fillBillingState | `.fillBillingState` |
| billingState | `.billingState` |
| fillBillingZip | `.fillBillingZip` |
| billingPostalCode | `.billingPostalCode` |
| fillBillingCountry | `.fillBillingCountry` |
| billingCountry | `.billingCountry` |
| fillEmployees | `.fillEmployees` |
| employees | `.employees` |
| fillAnnualRevenue | `.fillAnnualRevenue` |
| annualRevenue | `.annualRevenue` |
| fillDescription | `.fillDescription` |
| description | `.description` |
| getByRole | `.getByRole` |
| first | `.first` |
| toBeVisible | `.toBeVisible` |
| click | `.click` |
| isVisible | `.isVisible` |
| catch | `.catch` |
| toBeHidden | `.toBeHidden` |

# opportunity Object

| Element | Selector |
|---------|----------|
| js | `.js` |
| beforeEach | `.beforeEach` |
| afterEach | `.afterEach` |
| status | `.status` |
| title | `.title` |
| replace | `.replace` |
| toLowerCase | `.toLowerCase` |
| describe | `.describe` |
| navigate | `.navigate` |
| clickNew | `.clickNew` |
| fillRequiredFields | `.fillRequiredFields` |
| opportunityName | `.opportunityName` |
| stage | `.stage` |
| closeDate | `.closeDate` |
| accountName | `.accountName` |
| save | `.save` |
| fillOptionalFields | `.fillOptionalFields` |
| amount | `.amount` |
| description | `.description` |
| fillDescription | `.fillDescription` |
| selectStage | `.selectStage` |
| fillCloseDate | `.fillCloseDate` |
| fillLookup | `.fillLookup` |
| getByRole | `.getByRole` |
| first | `.first` |
| click | `.click` |
| waitForTimeout | `.waitForTimeout` |
| fillName | `.fillName` |
| fillAmount | `.fillAmount` |
| isVisible | `.isVisible` |
| catch | `.catch` |
| toBeVisible | `.toBeVisible` |
| cancel | `.cancel` |
| toBeHidden | `.toBeHidden` |
| jpg | `.jpg` |
| uploadAttachment | `.uploadAttachment` |

# case Object

| Element | Selector |
|---------|----------|
| js | `.js` |
| beforeEach | `.beforeEach` |
| afterEach | `.afterEach` |
| status | `.status` |
| title | `.title` |
| replace | `.replace` |
| toLowerCase | `.toLowerCase` |
| describe | `.describe` |
| navigate | `.navigate` |
| clickNew | `.clickNew` |
| fillSubject | `.fillSubject` |
| subject | `.subject` |
| selectStatus | `.selectStatus` |
| selectPriority | `.selectPriority` |
| priority | `.priority` |
| selectCaseOrigin | `.selectCaseOrigin` |
| fillDescription | `.fillDescription` |
| description | `.description` |
| save | `.save` |
| selectType | `.selectType` |
| type | `.type` |
| origin | `.origin` |
| getByRole | `.getByRole` |
| first | `.first` |
| click | `.click` |
| waitForTimeout | `.waitForTimeout` |
| fillContactName | `.fillContactName` |
| fillAccountName | `.fillAccountName` |
| now | `.now` |
| toBeVisible | `.toBeVisible` |
| isVisible | `.isVisible` |
| catch | `.catch` |
| toBeHidden | `.toBeHidden` |
| jpg | `.jpg` |
| uploadAttachment | `.uploadAttachment` |
| getByLabel | `.getByLabel` |
| focus | `.focus` |
| keyboard | `.keyboard` |
| press | `.press` |

# Thoren Object

| Element | Selector |
|---------|----------|
| Thoren Name | `input[placeholder="Thoren Name"]` |
| Status | `select[name="Status"]` |
| Amount | `input[placeholder="Amount"]` |

**Notes:**
- Thoren Name: Main name field
- Status: Picklist field
- Amount: Currency field

# contact mcp-crud Object

| Element | Selector |
|---------|----------|
| js | `.js` |
| env | `.env` |
| CLEANUP | `.CLEANUP` |
| beforeAll | `.beforeAll` |
| beforeEach | `.beforeEach` |
| afterEach | `.afterEach` |
| status | `.status` |
| error | `.error` |
| title | `.title` |
| describe | `.describe` |
| firstName | `.firstName` |
| lastName | `.lastName` |
| id | `.id` |
| request | `.request` |
| success | `.success` |
| errors | `.errors` |
| toBe | `.toBe` |
| toBeTruthy | `.toBeTruthy` |
| totalSize | `.totalSize` |
| records | `.records` |
| FirstName | `.FirstName` |
| LastName | `.LastName` |
| phone | `.phone` |
| email | `.email` |
| department | `.department` |
| birthdate | `.birthdate` |
| Phone | `.Phone` |
| Email | `.Email` |
| Title | `.Title` |
| Department | `.Department` |
| map | `.map` |
| Id | `.Id` |
| Name | `.Name` |
| toBeGreaterThanOrEqual | `.toBeGreaterThanOrEqual` |
| AccountId | `.AccountId` |
| now | `.now` |
| com | `.com` |
| push | `.push` |
| length | `.length` |
| join | `.join` |
| searchTerm | `.searchTerm` |
| searchRecords | `.searchRecords` |
| some | `.some` |

# seed Object

| Element | Selector |
|---------|----------|
| js | `.js` |
| skip | `.skip` |
| existsSync | `.existsSync` |
| auth-state | `.auth-state` |
| json | `.json` |
| use | `.use` |
| goto | `.goto` |
| env | `.env` |
| SF_URL | `.SF_URL` |
| waitForTimeout | `.waitForTimeout` |
| url | `.url` |
| includes | `.includes` |
| com | `.com` |
| toBeTruthy | `.toBeTruthy` |

