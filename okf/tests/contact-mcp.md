---
type: Test Plan
title: Contact MCP CRUD Tests
description: Tests for contact CRUD via MCP
tags: [test, contact, mcp, crud]
status: stable
generated: { by: forcemind/2.0, at: 2026-08-03T10:00:00Z }
verified: { by: human:admin, at: 2026-08-03T12:00:00Z }
---

# Contact MCP CRUD Tests

6 tests covering contact CRUD via MCP.

## Create

1. Create contact via MCP with required fields
2. Create contact via MCP with all fields

## Read

3. Read contact via MCP
4. List contacts via MCP

## Update

5. Update contact via MCP

## Delete

6. Delete contact via MCP

## Coverage

- File: `tests/contact-mcp-crud.spec.js`
- MCP Client: `utils/sf-api-client.js`