---
type: Framework Pattern
title: Self Healing Locators
description: Fallback locator strategy for resilient tests
tags: [pattern, self-healing, locators]
status: stable
generated: { by: forcemind/2.0, at: 2026-08-03T10:00:00Z }
verified: { by: human:admin, at: 2026-08-03T12:00:00Z }
---

# Self Healing Locators

Fallback locator strategy when primary selectors fail.

## Strategy

1. Try primary selector (placeholder, label)
2. Fall back to role-based selector
3. Fall back to text content
4. Log failure for selector update

## Implementation

```javascript
async function findField(page, label) {
  const strategies = [
    page.locator(`input[placeholder="${label}"]`),
    page.getByLabel(label),
    page.getByRole('textbox', { name: label }),
  ];

  for (const locator of strategies) {
    if (await locator.isVisible()) return locator;
  }
  throw new FieldNotFoundError(label);
}
```