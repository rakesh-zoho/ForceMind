---
type: Salesforce Object
title: Lead
description: Represents a sales lead before conversion
resource: https://yourorg.lightning.force.com/lightning/r/Lead/
tags: [salesforce, crm, lead, core-object]
status: stable
generated: { by: forcemind/2.0, at: 2026-08-03T10:00:00Z }
verified: { by: human:admin, at: 2026-08-03T12:00:00Z }
stale_after: 2026-11-03
sources:
  - id: sf-schema
    resource: https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_lead.htm
    title: Salesforce Lead Object Reference
    author: team:salesforce
    last_modified: 2026-07-15
---

# Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| FirstName | string | No | Lead first name |
| LastName | string | Yes | Lead last name |
| Company | string | Yes | Company name |
| Email | email | No | Contact email |
| Phone | phone | No | Contact phone |
| Title | string | No | Job title |
| LeadSource | picklist | No | Lead source |
| Status | picklist | Yes | Lead status |

# Relationships

- Converts to [Account](/salesforce/account.md), [Contact](/salesforce/contact.md), [Opportunity](/salesforce/opportunity.md)
- Owned by User (lookup)

# Selectors

See [Lightning Selectors](/selectors/lightning-selectors.md#lead)

# Test Coverage

- [Lead Creation](/tests/lead-creation.md) — 8 tests
- [Lead Conversion](/tests/lead-conversion.md) — 3 tests

# Known Issues

- Picklist values may change between SF releases
- Lookup search requires exact match for automation