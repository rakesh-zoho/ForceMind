---
type: Salesforce Object
title: Case
description: Represents a customer support case
resource: https://yourorg.lightning.force.com/lightning/r/Case/
tags: [salesforce, crm, case, support]
status: stable
generated: { by: forcemind/2.0, at: 2026-08-03T10:00:00Z }
verified: { by: human:admin, at: 2026-08-03T12:00:00Z }
stale_after: 2026-11-03
sources:
  - id: sf-schema
    resource: https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_case.htm
    title: Salesforce Case Object Reference
---

# Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Subject | string | Yes | Case subject |
| Status | picklist | Yes | Case status |
| Priority | picklist | Yes | Case priority |
| Origin | picklist | Yes | Case origin |
| AccountId | lookup | No | Related account |
| ContactId | lookup | No | Related contact |
| Description | textarea | No | Case details |

# Relationships

- Belongs to Account (lookup)
- Belongs to Contact (lookup)
- Can have attachments

# Test Coverage

- [Case Creation](/tests/case-creation.md) — 10 tests