---
name: code-review
description: >
  Code review standards for the SF Agentic Framework.
---

# Code Review Skill

## Severity Levels

| Level | Meaning |
|---|---|
| BLOCKER | Will cause test failure or CI break |
| WARNING | Weakens reliability or maintainability |
| SUGGESTION | Quality improvement |

## Locator Rules

### NEVER use:
- CSS class selectors
- XPath with DOM IDs
- `data-id` or `data-testid`
- `nth-child` selectors
- Auto-generated IDs

### ALWAYS use:
- `getByRole` + accessible name
- `getByLabel` for form fields
- `getByPlaceholder` for search boxes
- `getByText` for text content
- `.toastMessage` (only CSS exception)

## Allure 3 Rules

```js
// WRONG - Allure 2 style
await allure.attachment('screenshot', buffer, 'image/png');

// CORRECT - Allure 3 style
await allure.attachment('screenshot', buffer, { contentType: 'image/png' });
```

All label functions must be awaited:
```js
await allure.epic('CRM');
await allure.feature('Lead Management');
await allure.story('Create Lead');
await allure.severity('critical');
```

## SF Timing Rules

- `waitForSFLoad()` after every navigation/click
- Toast assertions IMMEDIATELY after save (disappears in ~3s)
- Dialog interactions scoped to `page.getByRole('dialog')`

## Test Structure Rules

- Auth state: `test.use({ storageState: './reports/.auth-state.json' })`
- Unique test data: `uniqueName('prefix')` or `Date.now()`
- afterEach: capture screenshot on failure
- sfStep() wrappers for Allure step tracking
- POM classes for all SF interactions
