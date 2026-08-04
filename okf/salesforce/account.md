---
type: Salesforce Object
title: Account
description: Represents a business or person account
resource: https://yourorg.lightning.force.com/lightning/r/Account/
tags: [salesforce, crm, account, core-object]
status: stable
generated: { by: forcemind/2.0, at: 2026-08-03T10:00:00Z }
verified: { by: human:admin, at: 2026-08-03T12:00:00Z }
stale_after: 2026-11-03
sources:
  - id: sf-schema
    resource: https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_account.htm
    title: Salesforce Account Object Reference
---

# Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Name | string | Yes | Account name |
| Phone | phone | No | Business phone |
| Website | url | No | Company website |
| Industry | picklist | No | Business industry |
| Type | picklist | No | Account type |
| BillingStreet | string | No | Billing address |
| BillingCity | string | No | Billing city |
| BillingState | string | No | Billing state |
| BillingPostalCode | string | No | Billing zip |

# Relationships

- Has many Contacts (master-detail)
- Has many Opportunities (lookup)
- Has many Cases (lookup)

# Test Coverage

- [Account Creation](/tests/account-creation.md) — 11 tests