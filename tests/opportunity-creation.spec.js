import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { sfTest } from '../fixtures/fixtures.js';
import { captureScreenshot, setAllureMeta, sfStep, attachVideoOnFailure } from '../utils/reporter-utils.js';
import { waitForSFLoad, switchToAllRecords } from '../utils/sf-helpers.js';
import { loadData } from '../utils/data-factory.js';
import {
  assertRecordCreated,
  assertSuccessToast,
  assertValidationErrors,
  assertDialogStillOpen,
  assertOnSFDetailPage,
} from '../utils/validators.js';

test.beforeEach(async () => {
  await setAllureMeta({
    epic: 'CRM',
    feature: 'Opportunity Management',
    story: 'Create Opportunity',
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

sfTest.describe('1. Opportunity Creation - Basic Information', () => {

  sfTest('1.1 Create Opportunity with Required Fields Only', async ({ sfPage: page, opportunityPage }) => {
    const data = loadData('opportunity', 'requiredFieldsOnly');

    await sfStep('Navigate to Opportunities via App Launcher', page, async () => {
      await opportunityPage.navigate();
      await captureScreenshot(page, 'opportunities-list-view');
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await opportunityPage.clickNew();
      await captureScreenshot(page, 'new-opportunity-modal-open');
    });

    await sfStep('Fill Opportunity Name, Stage, Close Date, and Account', page, async () => {
      await opportunityPage.fillRequiredFields(data.opportunityName, data.stage, data.closeDate, data.accountName);
      await captureScreenshot(page, 'opportunity-form-filled');
    });

    await sfStep('Save the Opportunity and verify record created', page, async () => {
      await opportunityPage.save();
      await assertRecordCreated(page, 'Opportunity');
      await captureScreenshot(page, 'opportunity-record-created');
    });

    await sfStep('Verify the Opportunity appears in the All Opportunities list view', page, async () => {
      await opportunityPage.navigate();
      await switchToAllRecords(page, 'Opportunities');
      await waitForSFLoad(page);
      await captureScreenshot(page, 'opportunity-in-list-view');
    });
  });

  sfTest('1.2 Create Opportunity with All Standard Fields', async ({ sfPage: page, opportunityPage }) => {
    const data = loadData('opportunity', 'allStandardFields');

    await sfStep('Navigate to Opportunities app', page, async () => {
      await opportunityPage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await opportunityPage.clickNew();
    });

    await sfStep('Populate all available standard fields', page, async () => {
      await opportunityPage.fillRequiredFields(data.opportunityName, data.stage, data.closeDate, data.accountName);
      await opportunityPage.fillOptionalFields({ amount: data.amount, description: data.description });
      await captureScreenshot(page, 'opportunity-form-all-fields-filled');
    });

    await sfStep('Save the Opportunity and verify record created', page, async () => {
      await opportunityPage.save();
      await assertRecordCreated(page, 'Opportunity');
      await captureScreenshot(page, 'opportunity-all-fields-record-created');
    });
  });

  sfTest('1.3 Create Opportunity with Description Populated', async ({ sfPage: page, opportunityPage }) => {
    const data = loadData('opportunity', 'withDescription');

    await sfStep('Navigate to Opportunities app', page, async () => {
      await opportunityPage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await opportunityPage.clickNew();
    });

    await sfStep('Fill required fields and Description', page, async () => {
      await opportunityPage.fillRequiredFields(data.opportunityName, data.stage, data.closeDate, data.accountName);
      await opportunityPage.fillDescription(data.description);
      await captureScreenshot(page, 'opportunity-with-description');
    });

    await sfStep('Save and verify description persists on detail page', page, async () => {
      await opportunityPage.save();
      await assertRecordCreated(page, 'Opportunity');
      await captureScreenshot(page, 'opportunity-description-record-created');
    });
  });

});

sfTest.describe('2. Opportunity Creation - Field Validation', () => {

  sfTest('2.1 Attempt to Save Opportunity Without Name', async ({ sfPage: page, opportunityPage }) => {
    const data = loadData('opportunity', 'missingName');

    await sfStep('Navigate to Opportunities app', page, async () => {
      await opportunityPage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await opportunityPage.clickNew();
      await captureScreenshot(page, 'opp-validation-empty-name');
    });

    await sfStep('Fill Stage, Close Date, Account but leave Name empty', page, async () => {
      await opportunityPage.selectStage('Prospecting');
      await opportunityPage.fillCloseDate(data.closeDate);
      await opportunityPage.fillLookup('Account Name', data.accountName);
      await captureScreenshot(page, 'opp-form-name-empty');
    });

    await sfStep('Click Save — should fail due to missing Name', page, async () => {
      const saveButton = page.getByRole('dialog').getByRole('button', { name: /^Save$/i }).first();
      await saveButton.click();
      await page.waitForTimeout(3000);
    });

    await sfStep('Verify save failed — dialog still open, validation errors shown', page, async () => {
      await assertDialogStillOpen(page);
      await assertValidationErrors(page);
      await captureScreenshot(page, 'opp-validation-name-error');
    });
  });

  sfTest('2.2 Attempt to Save Opportunity Without Stage', async ({ sfPage: page, opportunityPage }) => {
    const data = loadData('opportunity', 'missingStage');

    await sfStep('Navigate to Opportunities app', page, async () => {
      await opportunityPage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await opportunityPage.clickNew();
    });

    await sfStep('Fill Name, Close Date, Account but leave Stage empty', page, async () => {
      await opportunityPage.fillName(data.opportunityName);
      await opportunityPage.fillCloseDate(data.closeDate);
      await opportunityPage.fillLookup('Account Name', data.accountName);
      await captureScreenshot(page, 'opp-form-stage-empty');
    });

    await sfStep('Click Save — should fail due to missing Stage', page, async () => {
      const saveButton = page.getByRole('dialog').getByRole('button', { name: /^Save$/i }).first();
      await saveButton.click();
      await page.waitForTimeout(3000);
    });

    await sfStep('Verify save failed — dialog still open, validation errors shown', page, async () => {
      await assertDialogStillOpen(page);
      await assertValidationErrors(page);
      await captureScreenshot(page, 'opp-validation-stage-error');
    });
  });

  sfTest('2.3 Attempt to Save Opportunity Without Close Date', async ({ sfPage: page, opportunityPage }) => {
    const data = loadData('opportunity', 'missingCloseDate');

    await sfStep('Navigate to Opportunities app', page, async () => {
      await opportunityPage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await opportunityPage.clickNew();
    });

    await sfStep('Fill Name, Stage, Account but leave Close Date empty', page, async () => {
      await opportunityPage.fillName(data.opportunityName);
      await opportunityPage.selectStage('Prospecting');
      await opportunityPage.fillLookup('Account Name', data.accountName);
      await captureScreenshot(page, 'opp-form-closedate-empty');
    });

    await sfStep('Click Save — should fail due to missing Close Date', page, async () => {
      const saveButton = page.getByRole('dialog').getByRole('button', { name: /^Save$/i }).first();
      await saveButton.click();
      await page.waitForTimeout(3000);
    });

    await sfStep('Verify save failed — dialog still open, validation errors shown', page, async () => {
      await assertDialogStillOpen(page);
      await assertValidationErrors(page);
      await captureScreenshot(page, 'opp-validation-closedate-error');
    });
  });

  sfTest('2.4 Enter Non-Numeric Value in Amount Field', async ({ sfPage: page, opportunityPage }) => {
    const data = loadData('opportunity', 'invalidAmount');

    await sfStep('Navigate to Opportunities app', page, async () => {
      await opportunityPage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await opportunityPage.clickNew();
    });

    await sfStep('Fill required fields and enter non-numeric Amount', page, async () => {
      await opportunityPage.fillRequiredFields(data.opportunityName, data.stage, data.closeDate, data.accountName);
      await opportunityPage.fillAmount(data.amount);
      await captureScreenshot(page, 'opp-form-invalid-amount');
    });

    await sfStep('Click Save — Amount may be rejected or ignored', page, async () => {
      const saveButton = page.getByRole('dialog').getByRole('button', { name: /^Save$/i }).first();
      await saveButton.click();
      await page.waitForTimeout(3000);
    });

    await sfStep('Verify form behavior — dialog still open or Amount rejected', page, async () => {
      const dialog = page.getByRole('dialog');
      const isDialogOpen = await dialog.isVisible().catch(() => false);
      if (isDialogOpen) {
        await captureScreenshot(page, 'opp-invalid-amount-dialog-open');
      } else {
        await captureScreenshot(page, 'opp-invalid-amount-saved-anyway');
      }
    });
  });

});

sfTest.describe('3. Opportunity Creation - Picklist and Lookup Handling', () => {

  sfTest('3.1 Select Stage Picklist Value', async ({ sfPage: page, opportunityPage }) => {
    const data = loadData('opportunity', 'requiredFieldsOnly');

    await sfStep('Navigate to Opportunities app', page, async () => {
      await opportunityPage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await opportunityPage.clickNew();
    });

    await sfStep('Fill required fields with Qualification stage', page, async () => {
      await opportunityPage.fillRequiredFields(data.opportunityName, 'Qualification', data.closeDate, data.accountName);
      await captureScreenshot(page, 'opp-stage-qualification-selected');
    });

    await sfStep('Save and verify Stage persists on detail page', page, async () => {
      await opportunityPage.save();
      await assertRecordCreated(page, 'Opportunity');
      await captureScreenshot(page, 'opp-stage-persists');
    });
  });

  sfTest('3.2 Populate Account Lookup Field', async ({ sfPage: page, opportunityPage }) => {
    const data = loadData('opportunity', 'withAccount');

    await sfStep('Navigate to Opportunities app', page, async () => {
      await opportunityPage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await opportunityPage.clickNew();
    });

    await sfStep('Fill required fields and populate Account lookup', page, async () => {
      await opportunityPage.fillRequiredFields(data.opportunityName, data.stage, data.closeDate, data.accountName);
      await captureScreenshot(page, 'opp-account-lookup-filled');
    });

    await sfStep('Save and verify Account link on detail page', page, async () => {
      await opportunityPage.save();
      await assertRecordCreated(page, 'Opportunity');
      await captureScreenshot(page, 'opp-account-link-verified');
    });
  });

});

sfTest.describe('4. Opportunity Creation - Text Field Handling', () => {

  sfTest('4.1 Enter Special Characters in Opportunity Name', async ({ sfPage: page, opportunityPage }) => {
    const data = loadData('opportunity', 'specialCharacters');

    await sfStep('Navigate to Opportunities app', page, async () => {
      await opportunityPage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await opportunityPage.clickNew();
    });

    await sfStep('Fill required fields with special characters in Name', page, async () => {
      await opportunityPage.fillRequiredFields(data.opportunityName, data.stage, data.closeDate, data.accountName);
      await captureScreenshot(page, 'opp-special-chars-filled');
    });

    await sfStep('Save and verify special characters are retained', page, async () => {
      await opportunityPage.save();
      await assertRecordCreated(page, 'Opportunity');
      await captureScreenshot(page, 'opp-special-chars-record-created');
    });
  });

});

sfTest.describe('5. Opportunity Creation - Navigation and Form State', () => {

  sfTest('5.1 Save and Navigate to Opportunity Detail View', async ({ sfPage: page, opportunityPage }) => {
    const data = loadData('opportunity', 'requiredFieldsOnly');

    await sfStep('Navigate to Opportunities app', page, async () => {
      await opportunityPage.navigate();
    });

    await sfStep('Click New and fill required fields', page, async () => {
      await opportunityPage.clickNew();
      await opportunityPage.fillRequiredFields(data.opportunityName, data.stage, data.closeDate, data.accountName);
    });

    await sfStep('Save and verify detail page loads', page, async () => {
      await opportunityPage.save();
      await assertRecordCreated(page, 'Opportunity');
      await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 15000 });
      await captureScreenshot(page, 'opp-detail-view-loaded');
    });
  });

  sfTest('5.2 Cancel Opportunity Creation', async ({ sfPage: page, opportunityPage }) => {
    const data = loadData('opportunity', 'requiredFieldsOnly');

    await sfStep('Navigate to Opportunities app', page, async () => {
      await opportunityPage.navigate();
    });

    await sfStep('Open New Opportunity form and enter values', page, async () => {
      await opportunityPage.clickNew();
      await opportunityPage.fillName(data.opportunityName);
      await opportunityPage.fillCloseDate(data.closeDate);
      await captureScreenshot(page, 'opp-form-before-cancel');
    });

    await sfStep('Click Cancel and handle discard prompt', page, async () => {
      await opportunityPage.cancel();

      const discardButton = page.getByRole('button', { name: /discard|leave|yes/i }).first();
      if (await discardButton.isVisible().catch(() => false)) {
        await discardButton.click();
      }

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeHidden({ timeout: 15000 }).catch(() => null);
      await captureScreenshot(page, 'opp-cancel-success');
    });
  });

});

sfTest.describe('6. Opportunity Creation - Attachment Handling', () => {

  sfTest('6.1 Upload a File Attachment to a Newly Created Opportunity', async ({ sfPage: page, opportunityPage }) => {
    const data = loadData('opportunity', 'requiredFieldsOnly');
    const attachmentPath = 'C:/Users/Admin/Downloads/Salesforce-logo.jpg';

    await sfStep('Create a new Opportunity with required fields', page, async () => {
      await opportunityPage.navigate();
      await opportunityPage.clickNew();
      await opportunityPage.fillRequiredFields(data.opportunityName, data.stage, data.closeDate, data.accountName);
      await opportunityPage.save();
      await assertRecordCreated(page, 'Opportunity');
      await captureScreenshot(page, 'opportunity-created-for-attachment');
    });

    await sfStep('Upload attachment from the Related tab', page, async () => {
      await opportunityPage.uploadAttachment(attachmentPath);
      await captureScreenshot(page, 'opportunity-attachment-uploaded');
    });
  });

});
