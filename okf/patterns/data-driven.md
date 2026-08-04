---
type: Framework Pattern
title: Data Driven Testing
description: Data-driven testing approach using fixtures
tags: [pattern, data-driven, fixtures]
status: stable
generated: { by: forcemind/2.0, at: 2026-08-03T10:00:00Z }
verified: { by: human:admin, at: 2026-08-03T12:00:00Z }
---

# Data Driven Testing

Test data stored in `data/` directory as JSON fixtures.

## Structure

```json
{
  "leads": {
    "minimal": {
      "lastName": "Test Lead",
      "company": "Test Corp"
    },
    "complete": {
      "firstName": "John",
      "lastName": "Doe",
      "company": "Acme Inc",
      "email": "john@acme.com",
      "phone": "555-0100"
    }
  }
}
```

## Usage

```javascript
import testData from '../data/test-data.json';

test('create lead', async ({ page }) => {
  const lead = testData.leads.minimal;
  await leadPage.fillForm(lead);
});
```