---
type: Salesforce Object
title: Opportunity
description: Represents a sales deal or pipeline item
resource: https://yourorg.lightning.force.com/lightning/r/Opportunity/
tags: [salesforce, crm, opportunity, core-object]
status: stable
generated: { by: forcemind/2.0, at: 2026-08-03T10:00:00Z }
verified: { by: human:admin, at: 2026-08-03T12:00:00Z }
stale_after: 2026-11-03
sources:
  - id: sf-schema
    resource: https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_opportunity.htm
    title: Salesforce Opportunity Object Reference
---

# Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Name | string | Yes | Opportunity name |
| AccountId | lookup | Yes | Related account |
| StageName | picklist | Yes | Sales stage |
| CloseDate | date | Yes | Expected close date |
| Amount | currency | No | Deal amount |
| Probability | percent | No | Win probability |
| Description | textarea | No | Opportunity details |

# Relationships

- Belongs to Account (lookup)
- Has many Contacts (via Account)

# Test Coverage

- [Opportunity Creation](/tests/opportunity-creation.md) — 8 tests