# Salesforce Contact CRUD Test Plan (MCP API-Based)

**Module:** Contacts  
**Feature:** Contact CRUD via Salesforce Hosted MCP  
**MCP Server:** `platform/sobject-all`  
**Data File:** `data/contact-mcp-test-data.json`

---

## Prerequisites
- Salesforce Hosted MCP configured in `.vscode/mcp.json`
- External Client App (ECA) with `mcp_api` scope enabled
- User authenticated via OAuth in VS Code
- Contact object accessible with CRUD permissions
- Test Account "Test" exists (for linked Contact scenarios)

---

## Test Scenarios

### 1. Contact Creation - Basic

#### MCP-01: Create Contact with Minimal Required Fields
**Data:** `data/contact-mcp-test-data.json` → `minimalRequired`  
**Steps:**
1. Call `createSobjectRecord` with `sobject-name: "Contact"` and `body: { FirstName, LastName }`
2. Assert response contains `id` (record ID)
3. Call `soql_query` with `SELECT Id, FirstName, LastName FROM Contact WHERE Id = '{id}'`
4. Assert SOQL returns 1 record with matching FirstName and LastName
5. Call `deleteSobjectRecord` to clean up

#### MCP-02: Create Contact with All Standard Fields
**Data:** `data/contact-mcp-test-data.json` → `allStandardFields`  
**Steps:**
1. Call `createSobjectRecord` with full field body: FirstName, LastName, Phone, Email, Title, Department, Birthdate
2. Assert response contains `id`
3. Call `soql_query` with all fields
4. Assert every field value matches input exactly
5. Call `deleteSobjectRecord` to clean up

### 2. Contact Creation - Relationships

#### MCP-03: Create Contact Linked to Account
**Data:** `data/contact-mcp-test-data.json` → `linkedToAccount`  
**Steps:**
1. Query Account "Test" via `soql_query`: `SELECT Id FROM Account WHERE Name = 'Test' LIMIT 1`
2. Call `createSobjectRecord` with `AccountId` set to queried Account ID
3. Assert response contains `id`
4. Call `soql_query` with `AccountId` field
5. Assert `AccountId` matches the Test Account ID
6. Call `deleteSobjectRecord` to clean up

### 3. Contact Update

#### MCP-04: Update Contact Fields
**Data:** `data/contact-mcp-test-data.json` → `updateFields`  
**Steps:**
1. Call `createSobjectRecord` with initial fields
2. Assert record created
3. Call `updateSobjectRecord` with new Email and Phone values
4. Assert update returns success
5. Call `soql_query` to verify updated values
6. Assert Email and Phone match new values
7. Call `deleteSobjectRecord` to clean up

### 4. Contact Deletion

#### MCP-05: Delete Contact and Verify
**Data:** `data/contact-mcp-test-data.json` → `minimalRequired`  
**Steps:**
1. Call `createSobjectRecord` with required fields
2. Assert record created
3. Call `deleteSobjectRecord` with the record ID
4. Assert delete returns success
5. Call `soql_query` with the deleted ID
6. Assert SOQL returns empty result set

### 5. Contact Batch Operations

#### MCP-06: Create Multiple Contacts in Batch
**Data:** `data/contact-mcp-test-data.json` → `batchCreate`  
**Steps:**
1. Call `createSobjectRecord` 3 times with each batch scenario
2. Assert all 3 responses contain IDs
3. Call `soql_query` with `LastName LIKE 'Contact-%'` to find all
4. Assert at least 3 records found
5. Call `deleteSobjectRecord` for all 3 records

### 6. Contact Search

#### MCP-07: Search Contact via SOSL
**Data:** `data/contact-mcp-test-data.json` → `soslSearch`  
**Steps:**
1. Call `createSobjectRecord` with searchable Contact
2. Assert record created
3. Call `find` with SOSL: `FIND {Searchable} IN NAME FIELDS RETURNING Contact(Id, FirstName, LastName)`
4. Assert search results contain the created Contact
5. Call `deleteSobjectRecord` to clean up

### 7. Contact Edge Cases

#### MCP-08: Special Characters in Contact Fields
**Data:** `data/contact-mcp-test-data.json` → `specialCharacters`  
**Steps:**
1. Call `createSobjectRecord` with unicode characters (François, O'Sullivan)
2. Assert record created
3. Call `soql_query` to verify fields
4. Assert special characters preserved correctly
5. Call `deleteSobjectRecord` to clean up

---

## Required Assertions (every test)
- Use `sfStep()` wrapper for Allure steps
- Use `captureScreenshot()` after every major action (if applicable)
- Use `setAllureMeta()` in beforeEach
- Use `createSobjectRecord` for creation — assert `id` in response
- Use `soql_query` for verification — assert field values match input
- Use `updateSobjectRecord` for updates — assert success
- Use `deleteSobjectRecord` for cleanup — assert empty result on re-query
- Use `find` for SOSL search — assert results contain target record

## Cleanup Strategy
Each test must clean up its own created records:
1. Store record IDs during creation
2. After assertions, call `deleteSobjectRecord` for each ID
3. Use `test.afterAll` as a safety net for any missed records
