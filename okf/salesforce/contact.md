---
type: Salesforce Object
title: Contact
description: Represents a person associated with an account
resource: https://yourorg.lightning.force.com/lightning/r/Contact/
tags: [salesforce, crm, contact, core-object]
status: stable
generated: { by: forcemind/2.0, at: 2026-08-03T10:00:00Z }
verified: { by: human:admin, at: 2026-08-03T12:00:00Z }
stale_after: 2026-11-03
sources:
  - id: sf-schema
    resource: https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_contact.htm
    title: Salesforce Contact Object Reference
---

# Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| FirstName | string | No | First name |
| LastName | string | Yes | Last name |
| AccountId | lookup | Yes | Related account |
| Email | email | No | Email address |
| Phone | phone | No | Phone number |
| Title | string | No | Job title |
| Department | string | No | Department |

# Relationships

- Belongs to Account (master-detail)
- Can be created from Lead conversion

# Test Coverage

- [Contact MCP CRUD](/tests/contact-mcp.md) — 6 tests