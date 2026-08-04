# POM Patterns — SF Agentic Framework

## Architecture
All page objects extend `BasePage`. Tests use POM via Playwright fixtures.

## BasePage Methods
| Method | Purpose |
|---|---|
| `navigateToApp(appName)` | Navigate via App Launcher |
| `waitForSFLoad()` | Wait for SF spinners to clear |
| `clickButton(name)` | Click a button by name |
| `fillField(label, value)` | Fill a form field by label |
| `selectPicklist(label, value)` | Select a picklist value |
| `fillLookup(label, value)` | Fill a lookup field with autocomplete |
| `assertSuccessToast(expectedText)` | Assert success toast appears |
| `getDatePlusDays(days)` | Get date in MM/DD/YYYY format |
| `uniqueName(prefix)` | Generate unique test data name |

## Page Object Classes
| Class | File | Methods |
|---|---|---|
| `LeadPage` | `models/LeadPage.js` | `navigate()`, `clickNew()`, `fillRequiredFields()`, `fillOptionalFields()`, `save()`, `cancel()`, `createLead()` |
| `OpportunityPage` | `models/OpportunityPage.js` | `navigate()`, `clickNew()`, `fillRequiredFields()`, `fillOptionalFields()`, `save()`, `cancel()`, `createOpportunity()` |
| `AccountPage` | `models/AccountPage.js` | `navigate()`, `clickNew()`, `fillAccountName()`, `fillPhone()`, `fillWebsite()`, `selectIndustry()`, `selectType()`, `save()`, `createAccount()` |
| `ContactPage` | `models/ContactPage.js` | `navigate()`, `clickNew()`, `fillRequiredFields()`, `fillOptionalFields()`, `save()`, `cancel()`, `createContact()` |
| `CasePage` | `models/CasePage.js` | `navigate()`, `clickNew()`, `fillContactName()`, `fillAccountName()`, `fillSubject()`, `selectStatus()`, `selectPriority()`, `save()`, `createCase()` |

## Test File Pattern
```javascript
import { sfTest, expect } from '../fixtures/fixtures.js';
import { captureScreenshot, setAllureMeta, sfStep } from '../utils/reporter-utils.js';

sfTest.describe('Feature Name', () => {
  sfTest.beforeEach(async () => {
    await setAllureMeta({ epic: 'CRM', feature: 'Feature', story: 'Story', severity: 'critical' });
  });

  sfTest.afterEach(async ({ sfPage: page }, testInfo) => {
    if (testInfo.status !== 'passed') {
      await captureScreenshot(page, testInfo.title);
    }
  });

  sfTest('1.1 Test Title', async ({ leadPage }) => {
    await sfStep('Navigate to Leads', leadPage.page, async () => {
      await leadPage.navigate();
    });

    await sfStep('Create Lead', leadPage.page, async () => {
      await leadPage.clickNew();
      await leadPage.fillRequiredFields('John', 'Doe', 'Acme Corp');
      await leadPage.save();
      await leadPage.assertSuccessToast('Lead');
    });
  });
});
```

## Fixture Injection
POM objects are injected via `fixtures/fixtures.js`:
```javascript
export const sfTest = base.extend({
  sfPage: async ({ browser }, use) => { /* auth + navigation */ },
  leadPage: async ({ sfPage }, use) => { await use(new LeadPage(sfPage)); },
  opportunityPage: async ({ sfPage }, use) => { await use(new OpportunityPage(sfPage)); },
  // ...
});
```

## Usage in Tests
```javascript
sfTest('Create Lead', async ({ leadPage }) => {
  // leadPage is an instance of LeadPage with authenticated page
  await leadPage.navigate();
  await leadPage.clickNew();
  await leadPage.fillRequiredFields('John', 'Doe', 'Acme Corp');
  await leadPage.save();
});
```
