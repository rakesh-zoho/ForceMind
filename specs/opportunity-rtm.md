# Requirements Traceability Matrix — Opportunity Creation

| Req ID | Requirement | Test ID | Test Name | Status | Priority |
|--------|-------------|---------|-----------|--------|----------|
| REQ-OPP-001 | Create Opportunity with required fields | OPP-01 | Create Opportunity with Required Fields Only | ✅ Automated | P1 |
| REQ-OPP-002 | Create Opportunity with all fields | OPP-02 | Create Opportunity with All Standard Fields | ✅ Automated | P1 |
| REQ-OPP-003 | Create Opportunity with Description | OPP-03 | Create Opportunity with Description Populated | ✅ Automated | P2 |
| REQ-OPP-004 | Validate Name required field | OPP-04 | Attempt to Save Opportunity Without Name | ✅ Automated | P1 |
| REQ-OPP-005 | Validate Stage required field | OPP-05 | Attempt to Save Opportunity Without Stage | ✅ Automated | P1 |
| REQ-OPP-006 | Validate Close Date required field | OPP-06 | Attempt to Save Opportunity Without Close Date | ✅ Automated | P1 |
| REQ-OPP-007 | Validate Amount accepts only numeric | OPP-07 | Enter Non-Numeric Value in Amount Field | ✅ Automated | P2 |
| REQ-OPP-008 | Stage picklist selection | OPP-08 | Select Stage Picklist Value | ✅ Automated | P2 |
| REQ-OPP-009 | Account lookup population | OPP-09 | Populate Account Lookup Field | ✅ Automated | P2 |
| REQ-OPP-010 | Special characters in Name | OPP-10 | Enter Special Characters in Opportunity Name | ✅ Automated | P3 |
| REQ-OPP-011 | Navigate to detail view after save | OPP-11 | Save and Navigate to Opportunity Detail View | ✅ Automated | P1 |
| REQ-OPP-012 | Cancel discards form | OPP-12 | Cancel Opportunity Creation | ✅ Automated | P2 |
| REQ-OPP-013 | File upload to saved Opportunity | OPP-13 | Upload a File Attachment to a Newly Created Opportunity | ✅ Automated | P1 |
| REQ-OPP-014 | Detail page shows correct values | OPP-11 | Save and Navigate to Opportunity Detail View | ✅ Automated | P1 |
| REQ-OPP-015 | Record appears in list view | OPP-01 | Create Opportunity with Required Fields Only | ✅ Automated | P1 |
| REQ-OPP-016 | Validation errors on missing required fields | OPP-04, OPP-05, OPP-06 | Field validation tests | ✅ Automated | P1 |
| REQ-OPP-017 | Form closes on Cancel without saving | OPP-12 | Cancel Opportunity Creation | ✅ Automated | P2 |
| REQ-OPP-018 | Description persists after save | OPP-03 | Create Opportunity with Description Populated | ✅ Automated | P2 |

---

## Coverage Summary

| Category | Count | Tests |
|----------|-------|-------|
| Positive (Happy Path) | 3 | OPP-01, OPP-02, OPP-03 |
| Negative (Validation) | 4 | OPP-04, OPP-05, OPP-06, OPP-07 |
| Picklist/Lookup | 2 | OPP-08, OPP-09 |
| Text Fields | 1 | OPP-10 |
| Navigation | 2 | OPP-11, OPP-12 |
| Attachment | 1 | OPP-13 |
| **Total** | **13** | |

---

## Traceability to Task File Scenarios

| Task Scenario | RTM Req | RTM Test | Covered |
|---------------|---------|----------|---------|
| POS-01 | REQ-OPP-001 | OPP-01 | ✅ |
| POS-02 | REQ-OPP-002 | OPP-02 | ✅ |
| POS-05 | REQ-OPP-003 | OPP-03 | ✅ |
| NEG-01 | REQ-OPP-004 | OPP-04 | ✅ |
| NEG-03 | REQ-OPP-005 | OPP-05 | ✅ |
| NEG-02 | REQ-OPP-006 | OPP-06 | ✅ |
| NEG-04 | REQ-OPP-007 | OPP-07 | ✅ |
| POS-03 | REQ-OPP-008 | OPP-08 | ✅ |
| POS-04 | REQ-OPP-009 | OPP-09 | ✅ |
| EDG-03 | REQ-OPP-010 | OPP-10 | ✅ |
| INT-01 | REQ-OPP-014 | OPP-11 | ✅ |
| NAV-01 | REQ-OPP-017 | OPP-12 | ✅ |
| FUP-01 | REQ-OPP-013 | OPP-13 | ✅ |
| LST-01 | REQ-OPP-015 | OPP-01 | ✅ |
| BND-01–06 | — | — | ❌ Deferred |
| EDG-01–08 | — | — | ❌ Deferred |
| DEP-01–02 | — | — | ❌ Deferred |
| NAV-02–03 | — | — | ❌ Deferred |
| FUP-02–08 | — | — | ❌ Deferred |

---

## Notes
- BND (Boundary), EDG (Edge), DEP (Field Dependency), NAV (Browser Back), and FUP (File Upload) scenarios are deferred to a follow-up phase
- These deferred scenarios require additional setup (seed data, file fixtures, org-specific validation rules) that needs to be confirmed with the target org
- Core P1 and P2 scenarios are covered in this phase
