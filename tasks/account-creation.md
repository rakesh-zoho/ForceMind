# Task: Automate Salesforce Account Creation Flow

## Metadata
- Feature: Account Management
- Priority: P1
- Allure Epic: CRM
- Allure Feature: Account Management
- Allure Story: Create New Account
- Allure Severity: critical
- Output Plan: specs/account-creation-plan.md
- Output Spec: tests/account-creation.spec.js

## Objective
Create a new Account via Salesforce Lightning UI and verify it appears in the list view.

## Preconditions
- Auth from seed fixture (storageState: reports/.auth-state.json)
- Accounts tab visible in navigation

## Data File
`data/account-test-data.json` — already exists with `requiredFieldsOnly` and `allStandardFields` scenarios.

## Steps to Automate
1. Navigate to Accounts via App Launcher
2. Click New
3. Fill Account Name (required), Phone, Website, Industry, Type, Billing Address
4. Save and assert success toast
5. Verify in All Accounts list view

## Required Assertions
1. Toast visible and contains "Account"
2. Account appears in list view

## Agent Instructions
- Use AccountPage POM from `models/AccountPage.js`
- Use `loadData('account', 'scenarioName')` for test data
- Use `assertToast(page, 'Account')` for toast
- Use `assertOnSFDetailPage(page, 'Account')` for detail verification
- Use validators from `utils/validators.js` for assertions
- Wrap every step in `sfStep()` for Allure reporting
- Capture screenshots after every major action
- See `memory/pom-patterns.md` for POM patterns
- See `memory/sf-selectors.md` for element locators
