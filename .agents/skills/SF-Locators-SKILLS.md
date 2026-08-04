---
name: SF-Locators
description: >
  Complete locator strategy guide for Salesforce Lightning UI tests.
  Load when writing new UI tests or debugging "element not found" errors.
---

# Locators Skill — Salesforce Lightning

## The Golden Rule

Salesforce Lightning uses Web Components (LWC). DOM structure and class names
change between every SF release. The ONLY stable way to locate elements is via
the **accessibility tree** — roles, labels, text, and ARIA attributes.

## Decision Tree

```
Is it a button, link, checkbox, or heading?
  -> getByRole('button'|'link'|'checkbox', { name: '...' })

Is it a form input with a visible label?
  -> getByLabel('Field Label')

Is it a search box or input with placeholder text?
  -> getByPlaceholder('Search...')

Is it static text on the page?
  -> getByText('exact text')

Is it the SF toast message?
  -> page.locator('.toastMessage')  <- ONLY allowed CSS exception

None of the above?
  -> page.locator('[aria-label="..."]')
```

## POM Method Mapping

| SF Action | POM Method |
|---|---|
| Fill form field | `page.fillField('Label', 'value')` |
| Select picklist | `page.selectPicklist('Label', 'value')` |
| Fill lookup | `page.fillLookup('Label', 'value')` |
| Click button | `page.clickButton('Save')` |
| Assert toast | `page.assertSuccessToast('text')` |
| Wait for load | `page.waitForSFLoad()` |
| Navigate to app | `page.navigateToApp('Leads')` |
