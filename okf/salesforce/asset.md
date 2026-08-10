---
type: Salesforce Object
title: Asset
description: Automate Salesforce Asset Object
tags:
  - salesforce
  - custom-object
  - asset
status: draft
generated:
  by: forcemind/2.0
  at: '2026-08-05T16:38:42.787Z'
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

See [Lightning Selectors](/selectors/lightning-selectors.md#asset)

# Test Coverage

- [Asset Creation](/tests/asset-creation.md) — TBD

# Known Issues

- Review picklist values after implementation
- Verify field labels match UI
