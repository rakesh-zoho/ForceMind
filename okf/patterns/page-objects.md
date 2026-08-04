---
type: Framework Pattern
title: Page Objects
description: Page Object Model pattern for SF Lightning
tags: [pattern, page-object, framework]
status: stable
generated: { by: forcemind/2.0, at: 2026-08-03T10:00:00Z }
verified: { by: human:admin, at: 2026-08-03T12:00:00Z }
---

# Page Object Model

Each Salesforce object has a corresponding page object in `models/`.

## Structure

```javascript
class LeadPage {
  constructor(page) {
    this.page = page;
    this.firstName = page.locator('input[placeholder="First Name"]');
    this.lastName = page.locator('input[placeholder="Last Name"]');
    this.company = page.locator('input[placeholder="Company"]');
  }

  async fillForm(data) {
    await this.firstName.fill(data.firstName);
    await this.lastName.fill(data.lastName);
    await this.company.fill(data.company);
  }

  async save() {
    await this.page.click('button[name="Save"]');
  }
}
```

## Conventions

- One page object per SF object
- Locators in constructor
- Methods for user actions
- Wait for page load in navigation methods