# Requirements Traceability Matrix — Account Creation (UI)

| Req ID | Requirement | Test ID | Test Name | Status | Priority |
|--------|-------------|---------|-----------|--------|----------|
| REQ-ACC-001 | Create Account with required fields only | ACC-01 | Create Account with required fields only | ✅ Automated | P1 |
| REQ-ACC-002 | Create Account with all standard fields | ACC-02 | Create Account with all standard fields | ✅ Automated | P1 |
| REQ-ACC-003 | Create Account with phone and website | ACC-03 | Create Account with phone and website | ✅ Automated | P1 |
| REQ-ACC-004 | Create Account with full billing address | ACC-04 | Create Account with full billing address | ✅ Automated | P2 |
| REQ-ACC-005 | Create Account with industry and type picklists | ACC-05 | Create Account with industry and type picklists | ✅ Automated | P2 |
| REQ-ACC-006 | Create Account with special characters in name | ACC-06 | Create Account with special characters in name | ✅ Automated | P2 |
| REQ-ACC-007 | Create Account with long field values | ACC-07 | Create Account with long field values | ✅ Automated | P3 |
| REQ-ACC-008 | Create Account with boundary numeric values | ACC-08 | Create Account with boundary numeric values | ✅ Automated | P3 |
| REQ-ACC-009 | Attempt to save Account without name (validation) | ACC-09 | Attempt to save Account without name | ✅ Automated | P1 |
| REQ-ACC-010 | Create Account and verify in list view | ACC-10 | Create Account and verify it appears in list view | ✅ Automated | P1 |
| REQ-ACC-011 | Cancel Account creation with unsaved changes | ACC-11 | Cancel Account creation with unsaved changes | ✅ Automated | P2 |

---

## Coverage Summary

| Category | Count | Tests |
|----------|-------|-------|
| Positive (Creation) | 8 | ACC-01, ACC-02, ACC-03, ACC-04, ACC-05, ACC-06, ACC-07, ACC-08 |
| Validation (Negative) | 1 | ACC-09 |
| List View Verification | 1 | ACC-10 |
| Cancel / Form State | 1 | ACC-11 |
| **Total** | **11** | |

---

## Traceability to Task File Scenarios

| Task Scenario | RTM Req | RTM Test | Covered |
|---------------|---------|----------|---------|
| ACC-01 | REQ-ACC-001 | ACC-01 | ✅ |
| ACC-02 | REQ-ACC-002 | ACC-02 | ✅ |
| ACC-03 | REQ-ACC-003 | ACC-03 | ✅ |
| ACC-04 | REQ-ACC-004 | ACC-04 | ✅ |
| ACC-05 | REQ-ACC-005 | ACC-05 | ✅ |
| ACC-06 | REQ-ACC-006 | ACC-06 | ✅ |
| ACC-07 | REQ-ACC-007 | ACC-07 | ✅ |
| ACC-08 | REQ-ACC-008 | ACC-08 | ✅ |
| ACC-09 | REQ-ACC-009 | ACC-09 | ✅ |
| ACC-10 | REQ-ACC-010 | ACC-10 | ✅ |
| ACC-11 | REQ-ACC-011 | ACC-11 | ✅ |

---

## Notes
- All tests use Playwright UI automation with Page Object Model (`models/AccountPage.js`)
- Each positive test asserts record creation via `assertRecordCreated(page, 'Account')`
- Validation tests assert dialog stays open via `assertDialogStillOpen(page)`
- Test data loaded from `data/account-test-data.json` via `loadData('account', '<scenario>')`
- Account object requires Account Name as the only mandatory field
- Picklist selections (Industry, Type) use `selectPicklist()` POM method
- Date format for org is DD/MM/YYYY
