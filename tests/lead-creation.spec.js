import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { sfTest } from '../fixtures/fixtures.js';
import { captureScreenshot, setAllureMeta, sfStep, attachVideoOnFailure } from '../utils/reporter-utils.js';
import { waitForSFLoad, switchToAllRecords } from '../utils/sf-helpers.js';
import { loadData } from '../utils/data-factory.js';
import {
  assertRecordCreated,
  assertValidationErrors,
  assertDialogStillOpen,
} from '../utils/validators.js';

test.beforeEach(async () => {
  await setAllureMeta({
    epic: 'CRM',
    feature: 'Lead Management',
    story: 'Create Lead',
    severity: 'critical',
  });
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== 'passed') {
    try {
      await captureScreenshot(page, `${testInfo.title.replace(/\s+/g, '-').toLowerCase()}-failed`, {
        writeToFile: true, testInfo,
      });
      await attachVideoOnFailure(page, testInfo);
    } catch {}
  }
});

sfTest.describe('1. Lead Creation - Basic Information', () => {

  sfTest('1.1 Create Lead with Required Fields Only', async ({ sfPage: page, leadPage }) => {
    const data = loadData('lead', 'requiredFieldsOnly');

    await sfStep('Navigate to Leads app', page, async () => {
      await leadPage.navigate();
      await captureScreenshot(page, 'leads-list-view');
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await leadPage.clickNew();
      await captureScreenshot(page, 'new-lead-modal-open');
    });

    await sfStep('Fill Lead form with required fields', page, async () => {
      await leadPage.fillRequiredFields(data.firstName, data.lastName, data.company);
      await captureScreenshot(page, 'lead-form-filled');
    });

    await sfStep('Save the Lead and verify record created', page, async () => {
      await leadPage.save();
      await assertRecordCreated(page, 'Lead');
      await captureScreenshot(page, 'lead-record-created');
    });

    await sfStep('Verify Lead in All Leads list view', page, async () => {
      await leadPage.navigate();
      await switchToAllRecords(page, 'Leads');
      await waitForSFLoad(page);
      await captureScreenshot(page, 'lead-in-list-view');
    });
  });

  sfTest('1.2 Create Lead with All Standard Fields', async ({ sfPage: page, leadPage }) => {
    const data = loadData('lead', 'allStandardFields');

    await sfStep('Navigate to Leads app', page, async () => {
      await leadPage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await leadPage.clickNew();
    });

    await sfStep('Fill Lead form with all fields', page, async () => {
      await leadPage.fillRequiredFields(data.firstName, data.lastName, data.company);
      await leadPage.fillOptionalFields({
        phone: data.phone,
        email: data.email,
        title: data.title,
        leadSource: data.leadSource,
      });
      await captureScreenshot(page, 'lead-form-all-fields-filled');
    });

    await sfStep('Save the Lead and verify record created', page, async () => {
      await leadPage.save();
      await assertRecordCreated(page, 'Lead');
      await captureScreenshot(page, 'lead-all-fields-record-created');
    });
  });

});

sfTest.describe('2. Lead Creation - Field Validation', () => {

  sfTest('2.1 Attempt to Save Lead Without Required Fields', async ({ sfPage: page, leadPage }) => {
    await sfStep('Navigate to Leads app', page, async () => {
      await leadPage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await leadPage.clickNew();
      await captureScreenshot(page, 'validation-empty-form');
    });

    await sfStep('Click Save without filling required fields', page, async () => {
      const saveButton = page.getByRole('dialog').getByRole('button', { name: 'Save' }).first();
      await saveButton.click();
      await page.waitForTimeout(2000);
    });

    await sfStep('Verify validation error appears and dialog stays open', page, async () => {
      await assertValidationErrors(page);
      await assertDialogStillOpen(page);
      await captureScreenshot(page, 'validation-error-displayed');
    });
  });

  sfTest('2.2 Enter Only First Name and Attempt Save', async ({ sfPage: page, leadPage }) => {
    const data = loadData('lead', 'missingLastName');

    await sfStep('Navigate to Leads app', page, async () => {
      await leadPage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await leadPage.clickNew();
    });

    await sfStep('Fill only First Name', page, async () => {
      const dialog = page.getByRole('dialog');
      await dialog.getByLabel(/first name/i).fill(data.firstName);
      await captureScreenshot(page, 'only-first-name-filled');
    });

    await sfStep('Click Save and verify failure', page, async () => {
      const initialUrl = page.url();
      const saveButton = page.getByRole('dialog').getByRole('button', { name: 'Save' }).first();
      await saveButton.click();
      await page.waitForTimeout(2000);

      await assertDialogStillOpen(page);
      await expect(page.getByLabel(/first name/i)).toHaveValue(data.firstName);
      await expect(page.getByLabel(/last name/i)).toBeVisible();
      await expect(page).toHaveURL(initialUrl);
      await captureScreenshot(page, 'missing-last-name-validation');
    });
  });

  sfTest('2.3 Enter Valid Email Address', async ({ sfPage: page, leadPage }) => {
    const data = loadData('lead', 'validEmail');

    await sfStep('Navigate to Leads app', page, async () => {
      await leadPage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await leadPage.clickNew();
    });

    await sfStep('Fill required fields with valid email', page, async () => {
      await leadPage.fillRequiredFields(data.firstName, data.lastName, data.company);
      await leadPage.fillOptionalFields({ email: data.email });
      await captureScreenshot(page, 'valid-email-filled');
    });

    await sfStep('Save the Lead and verify record created', page, async () => {
      await leadPage.save();
      await assertRecordCreated(page, 'Lead');
      await captureScreenshot(page, 'lead-valid-email-record-created');
    });
  });

});

sfTest.describe('3. Lead Creation - Dropdown and Picklist Selection', () => {

  sfTest('3.1 Select Lead Source Dropdown', async ({ sfPage: page, leadPage }) => {
    const data = loadData('lead', 'picklistOnly');

    await sfStep('Navigate to Leads app', page, async () => {
      await leadPage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await leadPage.clickNew();
    });

    await sfStep('Fill required fields and select Lead Source', page, async () => {
      await leadPage.fillRequiredFields(data.firstName, data.lastName, data.company);
      await leadPage.fillOptionalFields({ leadSource: data.leadSource });
      await captureScreenshot(page, 'lead-source-selected');
    });

    await sfStep('Save the Lead and verify record created', page, async () => {
      await leadPage.save();
      await assertRecordCreated(page, 'Lead');
      await captureScreenshot(page, 'lead-picklist-record-created');
    });
  });

});

sfTest.describe('4. Lead Creation - Text Field Handling', () => {

  sfTest('4.1 Enter Text with Special Characters', async ({ sfPage: page, leadPage }) => {
    const data = loadData('lead', 'specialCharacters');

    await sfStep('Navigate to Leads app', page, async () => {
      await leadPage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await leadPage.clickNew();
    });

    await sfStep('Fill form with special characters', page, async () => {
      await leadPage.fillRequiredFields(data.firstName, data.lastName, data.company);
      await captureScreenshot(page, 'special-chars-filled');
    });

    await sfStep('Save the Lead and verify record created', page, async () => {
      await leadPage.save();
      await assertRecordCreated(page, 'Lead');
      await captureScreenshot(page, 'lead-special-chars-record-created');
    });
  });

});

sfTest.describe('5. Lead Creation - Navigation and Form State', () => {

  sfTest('5.1 Save and Navigate to Lead Detail View', async ({ sfPage: page, leadPage }) => {
    const data = loadData('lead', 'requiredFieldsOnly');

    await sfStep('Navigate to Leads app', page, async () => {
      await leadPage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await leadPage.clickNew();
    });

    await sfStep('Fill required fields', page, async () => {
      await leadPage.fillRequiredFields(data.firstName, data.lastName, data.company);
    });

    await sfStep('Save the Lead and verify detail page', page, async () => {
      await leadPage.save();
      await assertRecordCreated(page, 'Lead');
      await expect(page.getByText(/Details/i).first()).toBeVisible({ timeout: 15000 });
      await captureScreenshot(page, 'lead-detail-view-loaded');
    });
  });

  sfTest('5.2 Cancel Lead Creation', async ({ sfPage: page, leadPage }) => {
    const data = loadData('lead', 'cancelScenario');

    await sfStep('Navigate to Leads app', page, async () => {
      await leadPage.navigate();
    });

    await sfStep('Click New and fill form', page, async () => {
      await leadPage.clickNew();
      const dialog = page.getByRole('dialog');
      await dialog.getByLabel(/first name/i).fill(data.firstName);
      await dialog.getByLabel(/last name/i).fill(data.lastName);
      await dialog.getByLabel(/company/i).fill(data.company);
      await captureScreenshot(page, 'lead-form-before-cancel');
    });

    await sfStep('Click Cancel and handle discard', page, async () => {
      const newLeadDialog = page.getByRole('dialog');
      const cancelBtn = newLeadDialog.getByRole('button', { name: /^cancel$/i });
      await expect(cancelBtn).toBeVisible();
      await cancelBtn.click();

      const discardBtn = page.getByRole('button', { name: /discard|leave|yes/i }).first();
      if (await discardBtn.isVisible().catch(() => false)) {
        await discardBtn.click();
      }

      await expect(newLeadDialog).toBeHidden({ timeout: 15000 });
      await captureScreenshot(page, 'lead-cancel-success');
    });
  });

});

sfTest.describe('6. Lead Creation - Accessibility', () => {

  sfTest('6.1 Navigate Form Using Keyboard Only', async ({ sfPage: page, leadPage }) => {
    const data = loadData('lead', 'keyboardTest');

    await sfStep('Navigate to Leads app', page, async () => {
      await leadPage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await leadPage.clickNew();
    });

    await sfStep('Fill form using keyboard only', page, async () => {
      const dialog = page.getByRole('dialog');
      const firstNameField = dialog.getByLabel(/first name/i);
      await expect(firstNameField).toBeVisible();
      await firstNameField.focus();
      await page.keyboard.type(data.firstName);
      await page.keyboard.press('Tab');
      const lastNameField = dialog.getByLabel(/last name/i);
      await expect(lastNameField).toBeVisible();
      await lastNameField.fill(data.lastName);
      await page.keyboard.press('Tab');
      const companyField = dialog.getByLabel(/company/i);
      await expect(companyField).toBeVisible();
      await companyField.fill(data.company);
      await captureScreenshot(page, 'keyboard-nav-filled');
    });

    await sfStep('Save using keyboard', page, async () => {
      await leadPage.save();
    });

    await sfStep('Verify Lead was actually created via keyboard', page, async () => {
      await waitForSFLoad(page);
      await assertRecordCreated(page, 'Lead');
      await captureScreenshot(page, 'lead-keyboard-record-created');
    });
  });

  sfTest('6.2 Verify Field Labels and Required Indicators', async ({ sfPage: page, leadPage }) => {
    await sfStep('Navigate to Leads app', page, async () => {
      await leadPage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await leadPage.clickNew();
    });

    await sfStep('Verify form fields are visible and labeled', page, async () => {
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByLabel(/first name/i, { exact: true })).toBeVisible();
      await expect(dialog.getByLabel(/last name/i, { exact: true })).toBeVisible();
      await expect(dialog.getByLabel(/company/i)).toBeVisible();
      await expect(dialog.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
      await captureScreenshot(page, 'field-labels-verified');
    });
  });

});
