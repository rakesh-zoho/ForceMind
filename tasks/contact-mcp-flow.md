# Task: Automate Contact CRUD via Salesforce Hosted MCP (API-Only)

## Metadata
- Feature: Contact Management
- Priority: P1
- Allure Epic: CRM
- Allure Feature: Contact Management (MCP)
- Allure Story: Contact CRUD via API
- Allure Severity: critical
- Coverage Scope: Positive, Negative, Boundary, Edge Case
- Test Case Count: 8
- Output Plan: specs/contact-mcp-plan.md
- Output Spec: tests/contact-mcp-crud.spec.js

## Objective
Automate Contact object CRUD operations using Salesforce Hosted MCP (`platform/sobject-all`) — **no browser UI**. All interactions go through the MCP API layer:
- **Create** — Contact with minimal and full fields
- **Read** — SOQL query to verify records
- **Update** — Modify Contact fields
- **Delete** — Remove Contact and verify deletion
- **Search** — SOSL search across objects
- **Batch** — Create multiple Contacts in one operation

## Architecture
```
Test File → SF MCP Tools → Salesforce API → Contact Record
                ↓
          SOQL Query → Verify Record
                ↓
          Delete → Cleanup
```

## MCP Tools Used
| Tool | Purpose |
|------|---------|
| `createSobjectRecord` | Create Contact |
| `soql_query` | Query/verify Contact |
| `updateSobjectRecord` | Update Contact |
| `deleteSobjectRecord` | Delete Contact |
| `find` | SOSL search |
| `getObjectSchema` | Get Contact field schema |

## Preconditions
- Salesforce Hosted MCP configured in `.vscode/mcp.json`
- External Client App (ECA) with `mcp_api` scope enabled
- User authenticated via OAuth in VS Code
- Contact object accessible with CRUD permissions

## Data File
`data/contact-mcp-test-data.json`

| Scenario Key | Purpose | Notes |
|---|---|---|
| `minimalRequired` | Create Contact with required fields only | FirstName + LastName |
| `allStandardFields` | Create Contact with all standard fields | Phone, Email, Title, Dept, Birthdate |
| `linkedToAccount` | Create Contact linked to Account | Account lookup field |
| `updateFields` | Update Contact after creation | Change Email, Phone |
| `batchCreate` | Create multiple Contacts | 3 Contacts in batch |
| `specialCharacters` | Create Contact with unicode | Accent, apostrophe, symbols |
| `soslSearch` | Search Contact via SOSL | Text search across objects |
| `negativeMissingLastName` | Negative — missing required field | Should fail on API |

## Test Scenarios

| ID | Scenario | Data Key | Priority | Expected Result |
|---|---|---|---|---|
| MCP-01 | Create Contact with minimal required fields | `minimalRequired` | P1 | Record created, SOQL returns correct fields |
| MCP-02 | Create Contact with all standard fields | `allStandardFields` | P1 | All field values persist correctly |
| MCP-03 | Create Contact linked to Account | `linkedToAccount` | P1 | Contact created with AccountId populated |
| MCP-04 | Update Contact fields | `updateFields` | P1 | SOQL shows updated values |
| MCP-05 | Delete Contact and verify | `minimalRequired` | P1 | SOQL returns empty after delete |
| MCP-06 | Create multiple Contacts in batch | `batchCreate` | P2 | All 3 records created and queryable |
| MCP-07 | Search Contact via SOSL | `soslSearch` | P2 | SOSL returns matching Contact |
| MCP-08 | Special characters in Contact fields | `specialCharacters` | P3 | Unicode preserved correctly |

## Assertions (API-Based)

### Positive Scenarios
1. `createSobjectRecord` returns success + record ID
2. `soql_query` returns the created record with correct field values
3. `updateSobjectRecord` returns success
4. Post-update SOQL confirms new field values
5. `deleteSobjectRecord` returns success
6. Post-delete SOQL returns empty result set

### Negative Scenarios
1. `createSobjectRecord` with missing LastName returns error
2. Error message indicates required field violation

### Search Scenarios
1. `find` with SOSL returns matching Contact
2. Returned record ID matches created Contact

## Assumptions & Environment Notes
- **Org Type**: Production (`nexturninc6.my.salesforce.com`)
- **MCP Endpoint**: `https://api.salesforce.com/platform/mcp/v1/platform/sobject-all`
- **OAuth**: ECA with `mcp_api` scope configured
- **Record Types**: Single default Contact Record Type assumed
- **Duplicate Rules**: Not enabled for Contact by default
- **Field Permissions**: Test user has full CRUD on Contact object

## Out of Scope
- UI-based testing (Playwright browser)
- Contact conversion flows
- Contact merge/duplicate detection
- Approval processes
- Profile/permission-based access testing
- Mobile/responsive testing

## Agent Instructions
- Use `createSobjectRecord` tool with `sobject-name: "Contact"` and `body` object
- Use `soql_query` tool with SOQL: `SELECT Id, FirstName, LastName, Email, Phone, Title, Department, Birthdate, AccountId FROM Contact WHERE Id = '{recordId}'`
- Use `updateSobjectRecord` tool with `sobject-name: "Contact"`, `id`, and `body`
- Use `deleteSobjectRecord` tool with `sobject-name: "Contact"` and `id`
- Use `find` tool with SOSL: `FIND {SearchTerm} IN NAME FIELDS RETURNING Contact(Id, FirstName, LastName, Email)`
- Use `getObjectSchema` tool with `object-name: "Contact"` to verify field availability
- All tests run headless — no browser automation
- Each test must clean up its own records (delete after verification)
- Use Allure steps (`sfStep`) for each API operation
- Tag each test with Allure severity by scenario Priority

## Definition of Done
- [ ] All P1 scenarios automated and passing
- [ ] All P2 scenarios automated and passing
- [ ] All P3 scenarios automated and passing
- [ ] `data/contact-mcp-test-data.json` contains all scenario keys
- [ ] `specs/contact-mcp-plan.md` maps 1:1 to Test Scenarios table
- [ ] `specs/contact-mcp-rtm.md` traces requirements to tests
- [ ] `tests/contact-mcp-crud.spec.js` implements each scenario as discrete test
- [ ] All tests clean up created records after verification
