---
type: Salesforce Object
title: Thoren
description: Custom Thoren object for project milestone tracking
tags:
  - salesforce
  - custom-object
  - thoren
status: draft
generated:
  by: forcemind/2.0
  at: '2026-08-03T12:37:52.813Z'
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

See [Lightning Selectors](/selectors/lightning-selectors.md#thoren)

# Test Coverage

- [Thoren Creation](/tests/thoren-creation.md) — TBD

# Known Issues

- Review picklist values after implementation
- Verify field labels match UI
