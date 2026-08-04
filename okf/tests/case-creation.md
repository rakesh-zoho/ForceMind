---
type: Test Plan
title: Case Creation Tests
description: Tests for creating Salesforce cases
tags: [test, case, creation]
status: stable
generated: { by: forcemind/2.0, at: 2026-08-03T10:00:00Z }
verified: { by: human:admin, at: 2026-08-03T12:00:00Z }
---

# Case Creation Tests

10 tests covering case creation scenarios.

## Happy Path

1. Create case with basic required fields
2. Create case with all standard fields

## Validation

3. Attempt save without required subject
4. Save case with only subject (missing other required fields)

## UI Interactions

5. Select status, priority, and case origin picklists
6. Populate lookup fields for contact and account

## Edge Cases

7. Enter special characters in subject and description

## Navigation

8. Save and navigate to case detail view
9. Cancel case creation

## File Attachment

10. Upload file attachment to case

## Coverage

- File: `tests/case-creation.spec.js`
- Page Object: `models/case-page.js`