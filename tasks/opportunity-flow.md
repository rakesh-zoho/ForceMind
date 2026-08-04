# Task: Automate Salesforce Opportunity Creation Flow
## Metadata
- Feature: Opportunity Management
- Priority: P1
- Allure Epic: CRM
- Allure Feature: Opportunity Management
- Allure Story: Create New Opportunity
- Allure Severity: critical (file-level baseline — individual scenarios override, see Agent Instructions)
- Coverage Scope: Positive, Negative/Validation, Boundary, Edge Case, Field-Dependency, Navigation, Data-Integrity, List-View, File Upload
- Test Case Count: 43
- Output Plan: specs/opportunity-flow-plan.md
- Output Spec: tests/opportunity-creation.spec.js

## Objective
Create a new Opportunity via Salesforce Lightning UI and validate the full creation flow end-to-end:
- **Positive** — record saves with required-only and full-field input, from multiple entry points; entered values persist accurately
- **Negative/validation** — missing required fields, bad formats, and duplicate submissions are blocked or handled correctly
- **Boundary** — field length limits and numeric extremes (zero, negative, large)
- **Edge cases** — whitespace handling, special characters, unusual-but-valid dates, rapid/duplicate-submission robustness, multi-match lookups
- **Field dependencies** — Stage-driven behavior (Probability, Closed Won/Lost rules)
- **Navigation** — Cancel and browser-back are handled safely with no orphan or duplicate records
- **Data integrity** — saved values match input exactly on the detail page, after a refresh, and in the list view
- **File attachments** — uploading valid and invalid files to a saved Opportunity behaves correctly

## Preconditions
- Auth from seed fixture (storageState: reports/.auth-state.json)
- Opportunities tab visible in navigation
- Test data uses a dynamically-generated, unique Opportunity Name per run (e.g. a `{{uuid}}` or `{{timestamp}}` suffix, same templating style as `{{datePlus30}}`) so repeated runs don't collide — **except NEG-07**, which deliberately reuses a fixed name to test duplicate handling
- Test file fixtures available on disk (see Test File Fixtures)
- **Environment assumptions to confirm before first run** (see Assumptions & Environment Notes for detail):
  - Single default Opportunity Record Type is active
  - Org is single-currency
  - No custom validation rules beyond the standard required fields (Name, Close Date, Stage)
  - At least one test Account exists with an Opportunities related list (for POS-04)
  - At least two test Accounts with similar/matching names exist (for EDG-08)

## Data File
`data/opportunity-test-data.json` — `requiredFieldsOnly` and `allStandardFields` already exist. Add the scenarios below.

| Scenario Key | Purpose | Notes |
|---|---|---|
| `requiredFieldsOnly` | Positive — minimum viable record | No Account, no Amount |
| `allStandardFields` |  Positive — full field coverage | Include Account, Amount, Description, and other layout fields |
| `missingOpportunityName` | Negative — Name left blank | All other fields valid |
| `missingCloseDate` | Negative — Close Date left blank | All other fields valid |
| `missingStage` | Negative — Stage left unselected | All other fields valid |
| `invalidAmountFormat` | Negative — non-numeric Amount | Letters or symbols in place of digits |
| `invalidCloseDateFormat` | Negative — non-date text in Close Date | e.g. `"abcd"` instead of a date |
| `duplicateOpportunityName` | Negative — fixed (non-unique) Name + Account | Intentionally reused across two save attempts |
| `nonExistentAccount` | Negative — Account search with no matches | Empty-state check; not save-blocking since Account is optional |
| `boundaryMaxLengthName` | Boundary — Name at 120 characters | Salesforce standard field limit, exact length |
| `overMaxLengthName` | Boundary — Name at 121+ characters | Confirms client-side cap vs. a save-time error |
| `zeroAmount` | Boundary — Amount = 0 | Confirms $0.00 formatting, not treated as blank |
| `negativeAmount` | Boundary — Amount is negative | No standard OOTB restriction — confirm actual org behavior |
| `largeAmount` | Boundary — 9-digit Amount | Confirms thousands-separator formatting |
| `maxLengthDescription` | Boundary — Description at 32,000 characters | Standard long-text-area limit — confirm no truncation |
| `whitespaceOnlyName` | Edge — Name is only spaces | Confirm treated as blank (required error) |
| `paddedWhitespaceName` | Edge — Name has leading/trailing spaces | Confirm whether saved value is trimmed |
| `specialCharactersName` | Edge — unicode/punctuation in Name | Accented characters, `&`, apostrophe, emoji |
| `closeDateToday` | Edge — Close Date = today | Confirm accepted |
| `closeDateFarPast` | Edge — Close Date years in the past | Confirm accepted, no date-range validation |
| `closeDateFarFuture` | Edge — Close Date years in the future | Confirm accepted |
| `accountLookupMultiMatch` | Edge — Account search term matching 2+ accounts | Requires seeded accounts with similar names |
| `closedWonStage` | Field-dependency — Stage = Closed Won | Check Probability and any org-specific required fields |
| `closedLostStage` | Field-dependency — Stage = Closed Lost | Check Probability and any org-specific required fields |

Illustrative shape only — match the existing file's key naming/casing:
```json
{
  "specialCharactersName": {
    "opportunityName": "O'Brien & Söns — 100% Deal 🎉 {{uuid}}",
    "closeDate": "{{datePlus30}}",
    "stage": "Prospecting"
  }
}
```

## Test File Fixtures
File upload scenarios need real files on disk, not JSON data — store under `data/files/` (or the existing fixture convention, if one exists) and reference by relative path.

| Fixture File | Used By | Notes |
|---|---|---|
| `valid-proposal.pdf` | FUP-01, FUP-02, FUP-07 | Small valid PDF, under 1MB |
| `valid-contract.docx` | FUP-02 | Second file for the multi-upload test |
| `blocked-file.exe` | FUP-03 | Confirm actual blocked extensions in Setup → File Upload and Download Security first |
| `oversized-file.pdf` | FUP-04 | Exceeds the org's max file size — confirm the actual configured limit first |
| `special-chars-filename-日本語-🎉.pdf` | FUP-06 | Unicode/special characters in the filename itself |
| `empty-file.txt` | FUP-08 | Zero-byte file |

## Test Scenarios
The full coverage matrix — each row becomes one discrete test. Priority is scenario-level (drives Allure severity and run order), distinct from the file-level Priority in Metadata.

| ID | Scenario | Data Key / Fixture | Priority | Expected Result |
|---|---|---|---|---|
| POS-01 | Create with required fields only | `requiredFieldsOnly` | P1 | Success toast, detail page loads, record in list view |
| POS-02 | Create with all standard fields | `allStandardFields` | P1 | Same as above; every entered value persists |
| POS-03 | Stage selection auto-populates Probability | `requiredFieldsOnly` | P2 | Probability reflects the Stage's default %, if the field is on the layout |
| POS-04 | Create Opportunity from an Account's detail page | `requiredFieldsOnly` | P2 | Account field pre-populated from context; saves and links correctly |
| POS-05 | Create with Description (long text area) populated | `allStandardFields` | P2 | Full description text persists and renders on the detail page |
| POS-06 | "Save & New" creates the record and reopens a blank form | `requiredFieldsOnly` | P3 | First record saves successfully; a fresh New form displays, not the detail page |
| NEG-01 | Save blocked — Name blank | `missingOpportunityName` | P1 | Inline required error, no navigation, no record created |
| NEG-02 | Save blocked — Close Date blank | `missingCloseDate` | P1 | Inline required error, no record created |
| NEG-03 | Save blocked — Stage unselected | `missingStage` | P1 | Inline required error, no record created |
| NEG-04 | Amount rejects non-numeric input | `invalidAmountFormat` | P2 | Inline format error or input rejected, no record created |
| NEG-05 | Account lookup — no matching results | `nonExistentAccount` | P3 | Lookup shows an empty state; Opportunity still saves without Account |
| NEG-06 | Close Date rejects non-date text | `invalidCloseDateFormat` | P2 | Inline format error, no record created |
| NEG-07 | Duplicate Name + Account submitted twice | `duplicateOpportunityName` | P3 | Document actual behavior — no standard OOTB duplicate rule for Opportunity, likely saves both unless org has a custom rule |
| BND-01 | Name at 120-character limit | `boundaryMaxLengthName` | P2 | Saves successfully, full string persists |
| BND-02 | Name beyond 120 characters | `overMaxLengthName` | P2 | Input capped at 120 chars, or a save-time error — confirm actual behavior |
| BND-03 | Amount = 0 | `zeroAmount` | P3 | Saves successfully, displays as $0.00 |
| BND-04 | Amount is negative | `negativeAmount` | P3 | Confirm whether org accepts or rejects — no standard restriction exists |
| BND-05 | Amount at large 9-digit value | `largeAmount` | P3 | Saves successfully, correctly formatted |
| BND-06 | Description at max length (32,000 chars) | `maxLengthDescription` | P3 | Saves without truncation |
| EDG-01 | Name with only whitespace | `whitespaceOnlyName` | P2 | Confirm treated as blank — required error |
| EDG-02 | Name with leading/trailing whitespace | `paddedWhitespaceName` | P3 | Confirm whether saved value is trimmed or preserved |
| EDG-03 | Special/unicode characters in Name | `specialCharactersName` | P3 | Saves successfully, renders correctly on detail page and list view |
| EDG-04 | Close Date set to today | `closeDateToday` | P3 | Accepted — no restriction on present-day close dates |
| EDG-05 | Close Date far in the past | `closeDateFarPast` | P3 | Confirm accepted — no standard date-range validation |
| EDG-06 | Close Date far in the future | `closeDateFarFuture` | P3 | Confirm accepted |
| EDG-07 | Rapid double-click on Save | `requiredFieldsOnly` | P2 | Exactly one record created, no duplicate |
| EDG-08 | Account lookup with multiple matching results | `accountLookupMultiMatch` | P3 | Correct account selectable from the match list and applied |
| DEP-01 | Stage = Closed Won | `closedWonStage` | P2 | Saves; Probability and any org-specific rules honored |
| DEP-02 | Stage = Closed Lost | `closedLostStage` | P2 | Saves; Probability and any org-specific rules honored |
| NAV-01 | Cancel on New Opportunity form | `allStandardFields` (fill, don't save) | P2 | Form closes, no toast, no record created |
| NAV-02 | Browser back during form fill, before save | `requiredFieldsOnly` (fill, don't save) | P3 | No orphan record created, safe return to prior view |
| NAV-03 | Browser back immediately after a successful save | `requiredFieldsOnly` | P3 | No duplicate re-submission, page in a sane state |
| INT-01 | Field values match on detail page | `allStandardFields` | P1 | Each field's displayed value equals the input value exactly |
| INT-02 | Field values persist after a page refresh | `allStandardFields` | P2 | Same checks as INT-01, confirmed after reload, not just client-side state |
| LST-01 | New record's list view columns match input | `requiredFieldsOnly` | P1 | Row's Name/Account/Stage/Amount/Close Date columns match |
| FUP-01 | Upload a single valid file to a saved Opportunity | `valid-proposal.pdf` | P1 | File appears in Files related list with correct name/type |
| FUP-02 | Upload multiple files in one action | `valid-proposal.pdf` + `valid-contract.docx` | P2 | Both files appear in the Files list |
| FUP-03 | Upload a blocked/disallowed file type | `blocked-file.exe` | P2 | Rejected with a warning — confirm org's actual blocked-type list |
| FUP-04 | Upload a file exceeding max allowed size | `oversized-file.pdf` | P2 | Rejected with a size-limit error — confirm org's actual limit |
| FUP-05 | Trigger upload with no file selected | n/a | P3 | Upload control is a no-op or disabled; no broken state |
| FUP-06 | Upload a file with a long/special-character filename | `special-chars-filename-日本語-🎉.pdf` | P3 | Saves successfully, filename renders correctly |
| FUP-07 | Upload a file with the same name as an existing attachment | `valid-proposal.pdf` (re-uploaded) | P3 | Confirm actual versioning/duplicate-name behavior |
| FUP-08 | Upload a zero-byte file | `empty-file.txt` | P3 | Confirm accepted vs. rejected |

## Steps to Automate

### Core Flow (POS-01, POS-02, POS-03, DEP-01, DEP-02, INT-01, LST-01)
1. Navigate to Opportunities via App Launcher
2. Click New
3. Fill Opportunity Name (required), Account Name (lookup, optional), Close Date (required), Stage (required/picklist), Amount (optional)
4. Save and assert success toast
5. Verify detail page loaded, then each entered field's value on it (INT-01)
6. Verify in All Opportunities list view, including column values (LST-01)

### Alternate Entry Point Flow (POS-04)
1. Navigate to a test Account's detail page
2. Open the Opportunities related list → New
3. Assert Account is pre-populated from context
4. Complete remaining required fields, save, and assert the Account link matches

### Save & New Flow (POS-06)
1. Navigate to Opportunities → New, fill required fields
2. Click "Save & New" instead of Save
3. Assert the first record saved (toast/list view) and a fresh blank New form is now displayed

### Negative Flow (NEG-01–NEG-04, NEG-06)
1. Navigate to Opportunities → New
2. Fill all fields per the data scenario except the one under test
3. Click Save
4. Assert an inline validation error on the specific field, no toast, no navigation, no new list-view record

### Lookup Empty-State Flow (NEG-05)
1. Navigate to Opportunities → New, fill required fields
2. Search the Account lookup with a non-matching value, assert a "no results" state
3. Leave Account blank and save — assert success (Account is optional)

### Duplicate & Robustness Flow (NEG-07, EDG-07)
1. **NEG-07:** Create one Opportunity, then repeat with an identical Name + Account. Assert and document actual behavior (both save vs. a duplicate warning).
2. **EDG-07:** Fill a new Opportunity form and click Save twice in rapid succession. Assert exactly one record is created (check list-view count before/after, not just toast count).

### Multi-Match Lookup Flow (EDG-08)
1. Navigate to Opportunities → New, fill required fields
2. Search the Account lookup with a term matching 2+ seeded accounts
3. Assert multiple results appear, select the intended one, save, and verify it was applied

### Boundary & Edge Value Flow (BND-01–BND-06, EDG-01–EDG-06)
1. Navigate to Opportunities → New
2. Fill fields per the data scenario, entering the boundary/edge value under test
3. Save and assert the outcome per the scenario table (success with correct formatting, capped/rejected input, or accepted-despite-unusual)

### Cancel Flow (NAV-01)
1. Navigate to Opportunities → New, fill fields per data scenario, but don't save
2. Click Cancel, assert return to the previous view, no toast, no new record

### Browser Navigation Flow (NAV-02, NAV-03)
1. **NAV-02:** Fill the form partially, don't save, trigger browser back. Assert no orphan record and a safe return.
2. **NAV-03:** Complete a successful save, then trigger browser back. Assert no duplicate re-submission and a sane page state.

### Data Persistence Flow (INT-02)
1. Complete Core Flow through save
2. Reload the detail page (`page.reload()`)
3. Re-verify all field values match the original input, post-reload

### File Upload Flow (FUP-01–FUP-08)
0. Setup: create a base Opportunity first (reuse Core Flow) or reuse a previously created test record
1. Open the Files related list/component on the Opportunity detail page
2. Trigger the upload using the fixture(s) under test (`setInputFiles()` on the underlying file input)
3. Assert the outcome per scenario: file(s) appear in the Files list with correct name, or the expected rejection/error state

## Required Assertions

### Positive Scenarios
1. Toast visible and contains "Opportunity"
2. Detail page loaded (URL contains `/Opportunity/`)
3. Each entered field's displayed value matches the input exactly
4. Record appears in the All Opportunities list view with matching column values

### Negative Scenarios
1. No success toast appears
2. URL remains on the New Opportunity form (no navigation to a detail page)
3. Inline error is visible on the specific invalid/omitted field
4. No new record is added to the list view (record count unchanged)

### Boundary & Edge Scenarios
1. Save succeeds unless the scenario is explicitly expected to error (`overMaxLengthName`, `negativeAmount`, `whitespaceOnlyName` — confirm expected behavior first)
2. Value renders on the detail page with correct formatting (currency separators, exact string for special/whitespace characters)
3. For robustness scenarios (EDG-07, NAV-03): exactly one record exists after the interaction, verified by list-view count, not just UI toast state

### Navigation Scenarios
1. No toast appears (Cancel, NAV-02)
2. No new record is created
3. User returns to a sane prior view (list view or App Launcher)

### File Upload Scenarios
1. **Positive:** file appears in the Files related list with the correct name; no error toast
2. **Negative:** an appropriate error/warning is shown; the file is not added to the Files list
3. **Edge:** actual behavior is documented per scenario (accepted vs. rejected), since some outcomes depend on org configuration

## Assumptions & Environment Notes
Confirm these against the target org before finalizing the plan — they affect which scenarios apply as written:
- **Record Type:** Assumed single default Opportunity Record Type. If multiple exist, insert a Record Type selection step before field entry in every flow above.
- **Currency:** Assumed single-currency org. If multi-currency is enabled, Amount will have an adjacent Currency picklist — extend data scenarios accordingly.
- **Duplicate Rules:** Not enabled for Opportunity by default in Salesforce (unlike Lead/Contact/Account). If the org has custom duplicate rules configured, NEG-07's expected result changes accordingly.
- **Custom Validation Rules:** Only the standard required fields (Name, Close Date, Stage) are assumed. Org-specific rules (e.g. "Amount required when Stage = Negotiation") aren't covered here — add scenarios if confirmed present.
- **Probability field visibility:** POS-03, DEP-01, and DEP-02 assume Probability is present on the New Opportunity form layout. If it isn't, mark those assertions as skipped with a documented reason rather than failing.
- **File Upload:** Assumes the standard Lightning Files related list/component on the Opportunity page layout, not a custom upload component. Actual max file size and any admin-configured blocked file types are not verified here — confirm in Setup → File Upload and Download Security before finalizing FUP-03/FUP-04.
- **Multi-account seed data:** EDG-08 requires 2+ Accounts with similar/matching names already seeded in the target org; coordinate with test data setup if they don't exist.
- **Scope note:** File upload (FUP-*) is technically a post-creation action on an already-saved Opportunity, not part of the New Opportunity form itself. It's included here as an extension of "Opportunity Management" rather than split into a separate story — reorganize if you'd prefer it standalone.

## Out of Scope
- Opportunity edit, update, or delete flows (other than Cancel/back-button robustness above)
- Opportunity Products, Line Items, or Price Book configuration
- Approval processes or automation triggered by Opportunity changes
- Profile/permission-based access testing (different user roles)
- Bulk creation via Data Loader or REST API
- Mobile/responsive Salesforce app testing
- Localization/multi-language field labels
- Accessibility (screen reader, keyboard-only navigation)
- Deleting, downloading, or previewing uploaded files
- File version history / replace-file workflows beyond the duplicate-filename check in FUP-07

## Agent Instructions
- Use OpportunityPage POM from `models/OpportunityPage.js`
- Use `loadData('opportunity', 'scenarioName')` for test data
- Account Name is a lookup field — use `fillLookup(page, 'Account Name', 'value')`
- Close Date uses `{{datePlus30}}` template for MM/DD/YYYY format
- Stage is a picklist — use `selectPicklist('Stage', 'value')`
- Amount renders as currency — enter digits only
- Use `assertToast(page, 'Opportunity')` for toast
- Use `assertOnSFDetailPage(page, 'Opportunity')` for detail verification
- For negative scenarios, check `memory/pom-patterns.md` / `OpportunityPage.js` for an existing inline-error helper (e.g. `assertFieldError`); if none exists, implement one following the same pattern as `assertToast`
- For INT-01/INT-02, check for an existing `assertFieldValue(page, label, value)` helper before writing ad-hoc assertions
- For NAV-01, use the standard Cancel button — check `memory/sf-selectors.md` for the established locator
- File upload needs a new POM capability — propose `uploadFile(page, filePath)` / `uploadFiles(page, [filePaths])` using Playwright's `setInputFiles()` on the underlying file input rather than simulating drag-drop; add a matching `assertFileInFilesList(page, fileName)` helper
- Store file fixtures at `data/files/` (or the existing convention in `memory/pom-patterns.md`) and reference by relative path
- For EDG-07/NAV-03 (rapid-click / back-button robustness), assert record count via list-view row count before/after rather than relying on toast count, which is timing-sensitive
- For EDG-08, confirm the required multi-match seed accounts exist before implementing, or seed them in a setup hook
- Tag each generated test with Allure severity by scenario Priority: P1 → critical, P2 → normal, P3 → minor
- Generate the plan file (`specs/opportunity-flow-plan.md`) as a 1:1 mapping of the Test Scenarios table above before writing the spec
- See `memory/pom-patterns.md` for POM patterns
- See `memory/sf-selectors.md` for element locators

## Definition of Done
- [ ] All P1 scenarios automated and passing
- [ ] All P2 scenarios automated and passing, or explicitly skipped with a documented reason
- [ ] All P3 scenarios automated and passing, or explicitly skipped with a documented reason
- [ ] `data/opportunity-test-data.json` contains every scenario key listed above
- [ ] Test file fixtures created and stored per the Test File Fixtures table
- [ ] File-type/size restrictions confirmed with the org admin before finalizing FUP-03/FUP-04 expected results
- [ ] `specs/opportunity-flow-plan.md` maps 1:1 to the Test Scenarios table
- [ ] `tests/opportunity-creation.spec.js` implements each scenario as a discrete, Allure-tagged test
- [ ] Assumptions in Environment Notes confirmed against the target org (or scenarios adjusted accordingly)
- [ ] Dynamic test data naming confirmed to avoid collisions across repeated runs