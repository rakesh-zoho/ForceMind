---
type: Test Plan
title: Opportunity Creation Tests
description: Tests for creating Salesforce opportunities
tags: [test, opportunity, creation]
status: stable
generated: { by: forcemind/2.0, at: 2026-08-03T10:00:00Z }
verified: { by: human:admin, at: 2026-08-03T12:00:00Z }
---

# Opportunity Creation Tests

8 tests covering opportunity creation scenarios.

## Happy Path

1. Create opportunity with required fields only
2. Create opportunity with all standard fields
3. Create opportunity with description populated

## Validation

4. Attempt save without required fields
5. Enter special characters in opportunity name

## Navigation

6. Save and navigate to opportunity detail view
7. Cancel opportunity creation

## File Attachment

8. Upload file attachment to opportunity

## Coverage

- File: `tests/opportunity-creation.spec.js`
- Page Object: `models/opportunity-page.js`