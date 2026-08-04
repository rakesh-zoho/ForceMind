# Requirements Traceability Matrix — Contact CRUD via MCP

| Req ID | Requirement | Test ID | Test Name | Status | Priority |
|--------|-------------|---------|-----------|--------|----------|
| REQ-MCP-001 | Create Contact with minimal required fields | MCP-01 | Create Contact with Minimal Required Fields | ✅ Automated | P1 |
| REQ-MCP-002 | Create Contact with all standard fields | MCP-02 | Create Contact with All Standard Fields | ✅ Automated | P1 |
| REQ-MCP-003 | Create Contact linked to Account | MCP-03 | Create Contact Linked to Account | ✅ Automated | P1 |
| REQ-MCP-004 | Update Contact fields | MCP-04 | Update Contact Fields | ✅ Automated | P1 |
| REQ-MCP-005 | Delete Contact and verify | MCP-05 | Delete Contact and Verify | ✅ Automated | P1 |
| REQ-MCP-006 | Create multiple Contacts in batch | MCP-06 | Create Multiple Contacts in Batch | ✅ Automated | P2 |
| REQ-MCP-007 | Search Contact via SOSL | MCP-07 | Search Contact via SOSL | ✅ Automated | P2 |
| REQ-MCP-008 | Special characters in Contact fields | MCP-08 | Special Characters in Contact Fields | ✅ Automated | P3 |

---

## Coverage Summary

| Category | Count | Tests |
|----------|-------|-------|
| Positive (CRUD) | 5 | MCP-01, MCP-02, MCP-03, MCP-04, MCP-05 |
| Batch Operations | 1 | MCP-06 |
| Search | 1 | MCP-07 |
| Edge Cases | 1 | MCP-08 |
| **Total** | **8** | |

---

## Traceability to Task File Scenarios

| Task Scenario | RTM Req | RTM Test | Covered |
|---------------|---------|----------|---------|
| MCP-01 | REQ-MCP-001 | MCP-01 | ✅ |
| MCP-02 | REQ-MCP-002 | MCP-02 | ✅ |
| MCP-03 | REQ-MCP-003 | MCP-03 | ✅ |
| MCP-04 | REQ-MCP-004 | MCP-04 | ✅ |
| MCP-05 | REQ-MCP-005 | MCP-05 | ✅ |
| MCP-06 | REQ-MCP-006 | MCP-06 | ✅ |
| MCP-07 | REQ-MCP-007 | MCP-07 | ✅ |
| MCP-08 | REQ-MCP-008 | MCP-08 | ✅ |

---

## Notes
- All tests use Salesforce Hosted MCP API (no browser UI)
- Each test cleans up created records after verification
- Assertions are API-based (SOQL queries, not UI elements)
- No UI-specific scenarios (toast, navigation, list view) — these are covered in the existing `tests/contact-creation.spec.js`
