# Framework Memory — SF Agentic POM Framework

## Stack
- **Playwright Test Agents** v1.60+ (official Microsoft — `npx playwright init-agents --loop=opencode`)
- **Agent files**: `.github/agents/` — Planner, Generator, Healer `.agent.md`
- **MCP**: `.vscode/mcp.json` — connects AI tools to Playwright's browser tools
- **Auth**: `utils/sf-helpers.js` globalSetup -> `reports/.auth-state.json` -> all tests reuse
- **Reports**: Allure HTML + Playwright HTML + JUnit (for CI)

---

## Non-Negotiable Assertion Rules

**RULE: Every save MUST be followed by `assertRecordCreated()`.**
A test that doesn't verify the record was actually created is a FALSE PASS.

```javascript
// ❌ WRONG — these pass even when record is NOT created
await objectPage.save();
await assertToast(page, 'Case');           // toast might not appear
await assertOnSFDetailPage(page, 'Case');  // URL might have /Case/ without record ID

// ✅ RIGHT — checks toast + URL record ID + heading in one call
await objectPage.save();
await assertRecordCreated(page, 'Case');
```

**RULE: NEVER use conditional toast checks.**
```javascript
// ❌ WRONG — if toast doesn't appear, test continues and passes
const toastVisible = await page.locator('.toastMessage').isVisible().catch(() => false);
if (toastVisible) { await assertToast(page, 'Case'); }

// ✅ RIGHT — fails immediately if toast doesn't appear
await assertRecordCreated(page, 'Case');
```

**RULE: Validation tests MUST assert dialog stays open.**
```javascript
await saveButton.click();
await assertValidationErrors(page);
await assertDialogStillOpen(page);  // confirms save didn't accidentally succeed
```

---

## Non-Negotiable Locator Rules
**NEVER use CSS class selectors or XPath with element IDs.**

Priority order for all locators:
1. `page.getByRole('button', { name: 'New' })` <- always first choice
2. `page.getByLabel('First Name')` <- for form fields
3. `page.getByPlaceholder('Search...')` <- for search inputs
4. `page.getByText('Success')` <- for text content
5. `page.locator('[aria-label="Close"]')` <- aria fallback
6. `page.locator('.toastMessage')` <- **ONLY** CSS exception (SF toast has no accessible selector)

---

## SF Lightning Patterns

### After every navigation or button click
```javascript
await waitForSFLoad(page);
```

### Toast assertion (assert immediately - toast disappears in ~3s)
```javascript
const toast = page.locator('.toastMessage');
await expect(toast).toBeVisible({ timeout: 15000 });
await expect(toast).toContainText('was created');
```

### Modal/Dialog interactions
```javascript
const dialog = page.getByRole('dialog');
await dialog.waitFor({ state: 'visible' });
await dialog.getByLabel('First Name').fill('value');
await dialog.getByRole('button', { name: 'Save' }).click();
```

### Picklist / Dropdown
```javascript
// Method A: Native select
await page.getByLabel('Stage').selectOption('Needs Analysis');

// Method B: SF custom picklist (click + option)
await page.getByLabel('Stage').click();
await page.getByRole('option', { name: 'Needs Analysis' }).click();
```

### Lookup field (Account Name etc.)
```javascript
import { fillLookup } from '../utils/locator-utils.js';
await fillLookup(page, 'Account Name', 'Acme Corp');
```

### Date field (SF requires MM/DD/YYYY)
```javascript
import { getDatePlusDays } from '../utils/locator-utils.js';
await page.getByLabel('Close Date').fill(getDatePlusDays(30));
```

### Switch list view to all records
```javascript
import { switchToAllRecords } from '../utils/sf-helpers.js';
await switchToAllRecords(page, 'Leads');
```

---

## Required Allure Annotations (every generated test)
```javascript
test.beforeEach(async () => {
  await setAllureMeta({
    epic: 'CRM',
    feature: 'Lead Management',
    story: 'Create New Lead',
    severity: 'critical',
  });
});
```

## Required afterEach (every generated test)
```javascript
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await captureScreenshot(page, `failure-${testInfo.title.replace(/\s+/g, '-')}`);
  }
});
```

---

## File Conventions
| File type | Location | Who creates it |
|-----------|----------|----------------|
| Task instructions | `tasks/*.md` | **You** |
| Test plans | `specs/*-plan.md` | Planner agent |
| Page Objects | `models/*.js` | **You** (manual) |
| Playwright tests | `tests/*.spec.js` | Generator agent |
| Healed tests | `tests/*.spec.js` (patched) | Healer agent |
| Auth state | `reports/.auth-state.json` | globalSetup |

---

## Lessons Learned
- SF spinners must clear before interacting - `waitForSFLoad()` handles this
- Timestamp test data (`Date.now()`) prevents collision between runs
- List views default to "Recently Viewed" - always switch to "All [Object]" for reliable lookup
- Account Name lookup fields: type text -> wait 900ms -> click autocomplete
- `waitForLoadState('networkidle')` can hang on SF - prefer `waitForSFLoad()`
- Always scope interactions to `page.getByRole('dialog')` when a modal is open
- Use `.first()` on buttons/links to avoid strict mode violations
- Use regex patterns for labels: `/first name/i` instead of exact string match
