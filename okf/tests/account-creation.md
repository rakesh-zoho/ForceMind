---
type: Test Plan
title: Account Creation Tests
description: Tests for creating Salesforce accounts
tags: [test, account, creation]
status: stable
generated: { by: forcemind/2.0, at: 2026-08-03T10:00:00Z }
verified: { by: human:admin, at: 2026-08-03T12:00:00Z }
---

# Account Creation Tests

11 tests covering account creation scenarios.

## Happy Path

1. Create account with required fields only
2. Create account with all standard fields
3. Create account with full billing address
4. Create account with industry and type picklists

## Edge Cases

5. Create account with long field values
6. Create account with boundary numeric values

## Validation

7. Attempt save without name
8. Create account and verify in list view
9. Cancel account creation with unsaved changes

## Coverage

- File: `tests/account-creation.spec.js`
- Page Object: `models/account-page.js`