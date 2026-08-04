---
type: Salesforce Object
title: Case
description: Update Salesforce Cases with Random Internal Comments
tags:
  - salesforce
  - custom-object
  - case
status: draft
generated:
  by: forcemind/2.0
  at: '2026-08-04T13:28:33.348Z'
sources:
  - id: jira-story
    title: JIRA Story
    generated_from: jira
---
# Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Name | string | Yes | Record name |
| Status | picklist | Yes | Record status |

# Relationships

- No relationships defined

# Selectors

See [Lightning Selectors](/selectors/lightning-selectors.md#case)

# Test Coverage

- [Case Creation](/tests/case-creation.md) — TBD

# Known Issues

- Review picklist values after implementation
- Verify field labels match UI
