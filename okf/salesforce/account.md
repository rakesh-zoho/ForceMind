---
type: Salesforce Object
title: Account
description: 'Story: Automate Salesforce Account Creation'
tags:
  - salesforce
  - custom-object
  - account
status: draft
generated:
  by: forcemind/2.0
  at: '2026-08-04T10:12:27.742Z'
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

See [Lightning Selectors](/selectors/lightning-selectors.md#account)

# Test Coverage

- [Account Creation](/tests/account-creation.md) — TBD

# Known Issues

- Review picklist values after implementation
- Verify field labels match UI
