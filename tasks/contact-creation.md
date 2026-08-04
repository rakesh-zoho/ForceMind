# Task: Automate Salesforce Contact Creation Flow

## Metadata
- Feature: Contact Management
- Priority: P1
- Allure Epic: CRM
- Allure Feature: Contact Management
- Allure Story: Create New Contact
- Allure Severity: critical
- Output Plan: specs/contact-creation-plan.md
- Output Spec: tests/contact-creation.spec.js

## Objective
Create a new Contact via Salesforce Lightning UI and verify it appears in the list view.

## Preconditions
- Auth from seed fixture (storageState: reports/.auth-state.json)
- Contacts tab visible in navigation

## Data File
`data/contact-test-data.json` — already exists with `requiredFieldsOnly` and `allStandardFields` scenarios.

## Steps to Automate
1. Navigate to Contacts via App Launcher
2. Click New
3. Fill First Name, Last Name (required), Account Name (lookup), Email, Phone, Title
4. Save and assert success toast
5. Verify detail page loaded
6. Verify in All Contacts list view

## Required Assertions
1. Toast visible and contains "Contact"
2. Detail page loaded
3. Contact appears in list view

## Agent Instructions
- Use ContactPage POM from `models/ContactPage.js`
- Use `loadData('contact', 'scenarioName')` for test data
- Account Name is a lookup — use `fillLookup(page, 'Account Name', 'value')`
- Use `assertToast(page, 'Contact')` for toast
- Use `assertOnSFDetailPage(page, 'Contact')` for detail verification
- See `memory/pom-patterns.md` for POM patterns
- See `memory/sf-selectors.md` for element locators
