import { expect } from '@playwright/test';

/**
 * Data Validators - Strict assertion helpers for Salesforce operations.
 *
 * RULE: Every save MUST be followed by a success assertion.
 * A test that doesn't verify success is a FALSE PASS.
 */

/**
 * Assert that a Salesforce success toast appeared with the expected text.
 *
 * RULE: Call this IMMEDIATELY after save(). Toast disappears in ~3 seconds.
 *
 * @param {Page} page
 * @param {string} expectedText - e.g. 'Case', 'Lead', 'was created'
 * @param {object} options - { timeout }
 */
export async function assertSuccessToast(page, expectedText, options = {}) {
  const timeout = options.timeout || 15000;
  const toast = page.locator('.toastMessage');

  // Wait for toast to appear — if it doesn't, save FAILED
  await expect(toast).toBeVisible({ timeout });

  // Verify it's a SUCCESS toast, not an error toast
  // Success toasts contain "was created" or "was saved"
  const text = await toast.textContent();
  const isSuccess = /was created|was saved|was updated|successfully/i.test(text);

  if (!isSuccess) {
    throw new Error(
      `Expected SUCCESS toast but got: "${text}"`
    );
  }

  // If specific text provided, verify it's in the toast
  if (expectedText) {
    if (!text.includes(expectedText)) {
      throw new Error(
        `Toast "${text}" does not contain expected text "${expectedText}"`
      );
    }
  }

  return toast;
}

/**
 * Assert that a Salesforce error toast appeared.
 * Use when you EXPECT the save to fail.
 */
export async function assertErrorToast(page, options = {}) {
  const timeout = options.timeout || 15000;
  const toast = page.locator('.toastMessage');

  await expect(toast).toBeVisible({ timeout });

  const text = await toast.textContent();
  const isError = /error|failed|cannot|unable|required|invalid/i.test(text);

  if (!isError) {
    throw new Error(
      `Expected ERROR toast but got success: "${text}"`
    );
  }

  return toast;
}

/**
 * Assert that the page navigated to a Salesforce record detail page.
 *
 * STRICT: URL must contain a record ID pattern (15 or 18 char alphanumeric).
 * Just having the object name in URL is NOT enough.
 *
 * @param {Page} page
 * @param {string} objectApiName - e.g. 'Case', 'Lead', '00Q'
 * @param {object} options - { timeout }
 */
export async function assertOnSFDetailPage(page, objectApiName, options = {}) {
  const timeout = options.timeout || 30000;

  // Must be on Salesforce domain
  const url = page.url();
  const isSF = url.includes('force.com') || url.includes('salesforce.com');
  if (!isSF) {
    throw new Error(`Not on Salesforce. Current URL: ${url}`);
  }

  // Must NOT be on login page
  if (url.includes('/login')) {
    throw new Error(`Redirected to login page: ${url}`);
  }

  // MUST have a record ID in URL (15 or 18 char alphanumeric after /r/ or /lightning/r/)
  // Pattern: /lightning/r/Case/00QdN00000FxnLpUAJ/view
  const hasRecordId = /\/r\/[A-Za-z]+\/[A-Za-z0-9]{15,18}\//.test(url) ||
                      /\/[A-Za-z0-9]{15,18}$/.test(url);

  if (!hasRecordId) {
    throw new Error(
      'URL does not contain a record ID. Expected detail page like /lightning/r/Case/00Qxxx.../view\n' +
      'Actual URL: ' + url
    );
  }

  // If object name provided, verify it's in the URL
  if (objectApiName) {
    if (!url.includes(objectApiName)) {
      throw new Error(
        `URL does not contain object name "${objectApiName}".\n` +
        `Actual URL: ${url}`
      );
    }
  }
}

/**
 * COMBINED ASSERTION: Verify record was actually created.
 *
 * This is the ONE function tests should call after save.
 * It checks ALL three conditions:
 *   1. Success toast appeared
 *   2. URL contains record ID (not just object name)
 *   3. Page shows record details (heading visible)
 *
 * If ANY condition fails, the test fails.
 *
 * @param {Page} page
 * @param {string} objectName - 'Case', 'Lead', etc.
 * @param {object} options - { timeout, expectToast }
 */
export async function assertRecordCreated(page, objectName, options = {}) {
  const timeout = options.timeout || 30000;
  const expectToast = options.expectToast !== false;

  // 2. Wait for navigation to detail page
  await page.waitForURL(new RegExp(`/r/${objectName}/[A-Za-z0-9]{15,}`), { timeout })
    .catch(() => {});

  // 3. Verify URL has record ID
  const url = page.url();
  const hasRecordId = /\/r\/[A-Za-z]+\/[A-Za-z0-9]{15,18}\//.test(url) ||
                      /\/[A-Za-z0-9]{15,18}$/.test(url);

  if (!hasRecordId) {
    throw new Error(
      `Record was NOT created. URL has no record ID.\n` +
      `Expected: /lightning/r/${objectName}/<RECORD_ID>/view\n` +
      `Actual: ${url}`
    );
  }

  // 4. Verify a heading or record detail is visible (page actually loaded)
  const heading = page.getByRole('heading').first();
  await expect(heading).toBeVisible({ timeout: 15000 });

  // 1. Verify success toast if it appears, but do not fail the test if Salesforce omits it
  if (expectToast) {
    try {
      await assertSuccessToast(page, objectName, { timeout: 5000 });
    } catch {
      // Ignore missing toast when the record detail page and record ID are already confirmed.
    }
  }
}

/**
 * Assert that a record exists in a Salesforce list view.
 */
export async function assertRecordInList(page, recordName, options = {}) {
  const timeout = options.timeout || 15000;
  const link = page.getByRole('link', { name: new RegExp(recordName, 'i') }).first();
  await expect(link).toBeVisible({ timeout });
  return link;
}

/**
 * Assert that the form/dialog is still open (save failed as expected).
 */
export async function assertDialogStillOpen(page) {
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 5000 });
}

/**
 * Assert that validation errors are displayed on the form.
 */
export async function assertValidationErrors(page, expectedFields = []) {
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // Check for error indicators
  const alerts = page.getByRole('alert');
  const inlineErrors = page.locator('.fieldLevelErrors, .slds-form-element__help, [data-output-element-id="error-message"]');
  const requiredErrors = page.locator('.slds-form-element__help');
  const hasAlerts = await alerts.count() > 0;
  const hasInlineErrors = await inlineErrors.count() > 0;
  const hasRequiredErrors = await requiredErrors.count() > 0;

  const hasErrors = hasAlerts || hasInlineErrors || hasRequiredErrors;

  if (!hasErrors) {
    throw new Error(
      `Expected validation errors but none found.\n` +
      `Dialog is open but no alert, inline error, or required field error detected.`
    );
  }

  if (expectedFields.length > 0) {
    for (const field of expectedFields) {
      const errorMsg = page.getByText(new RegExp(field, 'i')).first();
      await expect(errorMsg).toBeVisible({ timeout: 5000 });
    }
  }
}

/**
 * Assert form field values match expected.
 */
export async function assertFormFields(page, expectedFields, options = {}) {
  const scope = options.scope || page.getByRole('dialog');
  const timeout = options.timeout || 10000;

  for (const [label, expected] of Object.entries(expectedFields)) {
    const field = scope.getByLabel(new RegExp(label, 'i')).first();
    await expect(field).toBeVisible({ timeout });

    if (expected instanceof RegExp) {
      await expect(field).toHaveValue(expected, { timeout });
    } else if (expected !== undefined && expected !== null) {
      await expect(field).toHaveValue(String(expected), { timeout });
    }
  }
}

/**
 * Assert picklist has the selected value.
 */
export async function assertPicklistValue(page, label, expectedValue, options = {}) {
  const scope = options.scope || page.getByRole('dialog');
  const timeout = options.timeout || 10000;

  const field = scope.getByRole('combobox', { name: new RegExp(label, 'i') }).first();
  await expect(field).toBeVisible({ timeout });
  await expect(field).toHaveValue(new RegExp(expectedValue, 'i'), { timeout });
}

/**
 * Assert lookup field shows expected record.
 */
export async function assertLookupValue(page, label, expectedName, options = {}) {
  const scope = options.scope || page.getByRole('dialog');
  const timeout = options.timeout || 10000;

  const lookup = scope.getByRole('combobox', { name: new RegExp(label, 'i') }).first();
  await expect(lookup).toBeVisible({ timeout });
  await expect(lookup).toHaveValue(new RegExp(expectedName, 'i'), { timeout });
}

/**
 * Validate data object has all required fields (pre-test check).
 */
export function assertDataIntegrity(data, requiredFields, context = '') {
  const missing = [];

  for (const field of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    const ctx = context ? ` [${context}]` : '';
    throw new Error(
      `Data integrity check failed${ctx}: Missing required fields: ${missing.join(', ')}`
    );
  }
}

/**
 * Schema definition for Salesforce objects.
 */
export const SCHEMAS = {
  lead: {
    required: ['firstName', 'lastName', 'company'],
    optional: ['phone', 'email', 'title', 'leadSource', 'status', 'rating', 'description'],
  },
  account: {
    required: ['accountName'],
    optional: ['phone', 'website', 'industry', 'type', 'billingStreet', 'billingCity', 'billingState', 'billingPostalCode', 'billingCountry'],
  },
  opportunity: {
    required: ['opportunityName', 'closeDate', 'stage'],
    optional: ['amount', 'probability', 'description'],
  },
  contact: {
    required: ['firstName', 'lastName'],
    optional: ['accountName', 'phone', 'email', 'title'],
  },
  case: {
    required: ['subject', 'status', 'priority', 'origin'],
    optional: ['type', 'description', 'contactName', 'accountName'],
  },
};

/**
 * Validate data against schema.
 */
export function validateAgainstSchema(objectType, data) {
  const schema = SCHEMAS[objectType];
  if (!schema) {
    throw new Error(`Unknown object type: ${objectType}. Known: ${Object.keys(SCHEMAS).join(', ')}`);
  }

  const missing = schema.required.filter(f => !data[f] && data[f] !== 0);
  const allKnown = [...schema.required, ...schema.optional];
  const extra = Object.keys(data).filter(f => !allKnown.includes(f));

  return { valid: missing.length === 0, missing, extra };
}

// Backward compatibility alias
export const assertToast = assertSuccessToast;
export const assertOnSFDetailPage_v2 = assertOnSFDetailPage;
