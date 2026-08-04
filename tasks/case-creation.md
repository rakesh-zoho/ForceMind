# Task: Automate Salesforce Case Creation Flow

## Metadata
- Feature: Case Management
- Priority: P1
- Allure Epic: CRM
- Allure Feature: Case Management
- Allure Story: Create New Case
- Allure Severity: critical
- Output Plan: specs/case-creation-plan.md
- Output Spec: tests/case-creation.spec.js

## Objective
Create a new Case via Salesforce Lightning UI and verify it appears in the list view.

## Preconditions
- Auth from seed fixture (storageState: reports/.auth-state.json)
- Cases tab visible in navigation

## Data File
`data/case-test-data.json` — already exists with `basicCase` and `allFields` scenarios.

## Steps to Automate
1. Navigate to Cases via App Launcher
2. Click New
3. Fill Contact Name (lookup), Account Name (lookup), Subject (required), Status (picklist), Priority (picklist), Case Origin (picklist), Description
4. Save and assert success toast
5. Verify detail page loaded
6. Verify in All Cases list view
7. Upload a file attachment to the Case (optional) File Path - "C:\Users\Admin\Downloads\Salesforce-logo.jpg"

## Required Assertions
1. Toast visible and contains "Case"
2. Detail page loaded
3. Case appears in list view

## Agent Instructions
- Use CasePage POM from `models/CasePage.js`
- Use `loadData('case', 'scenarioName')` for test data
- Contact Name and Account Name are lookups — use `fillLookup()`
- Status, Priority, Case Origin are picklists — use `selectPicklist()`
- Subject is the required field
- Use `assertToast(page, 'Case')` for toast
- Use `assertOnSFDetailPage(page, 'Case')` for detail verification
- See `memory/pom-patterns.md` for POM patterns
- See `memory/sf-selectors.md` for element locators
