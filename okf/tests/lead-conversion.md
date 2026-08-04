---
type: Test Plan
title: Lead Conversion Tests
description: Tests for converting leads to accounts
tags: [test, lead, conversion]
status: stable
generated: { by: forcemind/2.0, at: 2026-08-03T10:00:00Z }
verified: { by: human:admin, at: 2026-08-03T12:00:00Z }
---

# Lead Conversion Tests

3 tests covering lead conversion scenarios.

## Scenarios

1. Convert lead and verify account/contact created
2. Convert lead without creating opportunity
3. Convert lead with all standard fields

## Verification

- Account created with correct name
- Contact created with correct details
- Opportunity created (if selected)
- Lead status changed to Converted

## Coverage

- File: `tests/lead-conversion.spec.js`
- Dependencies: Lead creation, Account verification