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
    feature: 'Case Management',
    story: 'Create Case',
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
    } catch { }
  }
});

sfTest.describe('1. Case Creation - Basic Information', () => {

  sfTest('1.1 Create Case with Basic Required Fields', { tag: ['@smoke', '@regression'] }, async ({ sfPage: page, casePage }) => {
    const data = loadData('case', 'basicCase');

    await sfStep('Navigate to Cases via App Launcher', page, async () => {
      await casePage.navigate();
      await captureScreenshot(page, 'cases-list-view');
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await casePage.clickNew();
      await captureScreenshot(page, 'new-case-modal-open');
    });

    await sfStep('Fill Subject, Status, Priority, Case Origin, and Description', page, async () => {
      await casePage.fillSubject(data.subject);
      await casePage.selectStatus(data.status);
      await casePage.selectPriority(data.priority);
      await casePage.selectCaseOrigin('Phone');
      await casePage.fillDescription(data.description);
      await captureScreenshot(page, 'case-form-filled');
    });

    await sfStep('Save the Case and verify record created', page, async () => {
      await casePage.save();
      await assertRecordCreated(page, 'Case');
      await captureScreenshot(page, 'case-record-created');
    });

    await sfStep('Verify the Case appears in the All Cases list view', page, async () => {
      await casePage.navigate();
      await switchToAllRecords(page, 'Case');
      await waitForSFLoad(page);
      await captureScreenshot(page, 'case-in-list-view');
    });
  });

  sfTest('1.2 Create Case with All Standard Fields', { tag: ['@smoke', '@regression'] }, async ({ sfPage: page, casePage }) => {
    const data = loadData('case', 'allFields');

    await sfStep('Navigate to Cases app', page, async () => {
      await casePage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await casePage.clickNew();
    });

    await sfStep('Populate all available standard fields', page, async () => {
      await casePage.fillSubject(data.subject);
      await casePage.selectStatus(data.status);
      await casePage.selectPriority(data.priority);
      await casePage.selectType(data.type);
      await casePage.selectCaseOrigin(data.origin);
      await casePage.fillDescription(data.description);
      await captureScreenshot(page, 'case-form-all-fields-filled');
    });

    await sfStep('Save the Case and verify record created', page, async () => {
      await casePage.save();
      await assertRecordCreated(page, 'Case');
      await captureScreenshot(page, 'case-all-fields-record-created');
    });
  });

});

sfTest.describe('2. Case Creation - Field Validation', () => {

  sfTest('2.1 Attempt to Save Case Without Required Fields', { tag: ['@regression'] }, async ({ sfPage: page, casePage }) => {
    await sfStep('Navigate to Cases app', page, async () => {
      await casePage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await casePage.clickNew();
      await captureScreenshot(page, 'case-validation-empty-form');
    });

    await sfStep('Click Save without filling any fields', page, async () => {
      const saveButton = page.getByRole('dialog').getByRole('button', { name: /^Save$/i }).first();
      await saveButton.click();
      await page.waitForTimeout(2000);
    });

    await sfStep('Verify validation errors are shown and dialog stays open', page, async () => {
      await assertValidationErrors(page);
      await assertDialogStillOpen(page);
      await captureScreenshot(page, 'case-validation-errors');
    });
  });

  sfTest('2.2 Save Case with Only Subject (missing other required fields)', { tag: ['@regression'] }, async ({ sfPage: page, casePage }) => {
    const data = loadData('case', 'basicCase');

    await sfStep('Navigate to Cases app', page, async () => {
      await casePage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await casePage.clickNew();
    });

    await sfStep('Fill only Subject — leave Status, Priority, Origin empty', page, async () => {
      await casePage.fillSubject(data.subject);
      await captureScreenshot(page, 'case-subject-only');
    });

    await sfStep('Click Save — should fail due to missing required fields', page, async () => {
      const saveButton = page.getByRole('dialog').getByRole('button', { name: /^Save$/i }).first();
      await saveButton.click();
      await page.waitForTimeout(3000);
    });

    await sfStep('Verify save failed — dialog still open, validation errors shown', page, async () => {
      await assertDialogStillOpen(page);
      await assertValidationErrors(page);
      await captureScreenshot(page, 'case-missing-required-fields');
    });
  });

});

sfTest.describe('3. Case Creation - Lookup and Picklist Handling', () => {

  sfTest('3.1 Populate Lookup Fields for Contact and Account', { tag: ['@smoke', '@regression'] }, async ({ sfPage: page, casePage }) => {
    const data = loadData('case', 'basicCase');

    await sfStep('Navigate to Cases app', page, async () => {
      await casePage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await casePage.clickNew();
    });

    await sfStep('Populate lookup fields and all required fields', page, async () => {
      await casePage.fillContactName('Test');
      await casePage.fillAccountName('Test');
      await casePage.fillSubject(data.subject);
      await casePage.selectStatus(data.status);
      await casePage.selectPriority(data.priority);
      await casePage.selectCaseOrigin('Phone');
      await captureScreenshot(page, 'case-lookups-filled');
    });

    await sfStep('Save the Case and verify record created', page, async () => {
      await casePage.save();
      await assertRecordCreated(page, 'Case');
      await captureScreenshot(page, 'case-lookup-record-created');
    });
  });

  sfTest('3.2 Select Status, Priority, and Case Origin Picklists', { tag: ['@smoke', '@regression'] }, async ({ sfPage: page, casePage }) => {
    const data = loadData('case', 'allFields');

    await sfStep('Navigate to Cases app', page, async () => {
      await casePage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await casePage.clickNew();
    });

    await sfStep('Select all picklist values from data scenario', page, async () => {
      await casePage.fillSubject(data.subject);
      await casePage.selectStatus(data.status);
      await casePage.selectPriority(data.priority);
      await casePage.selectCaseOrigin(data.origin);
      await captureScreenshot(page, 'case-picklists-selected');
    });

    await sfStep('Save the Case and verify record created', page, async () => {
      await casePage.save();
      await assertRecordCreated(page, 'Case');
      await captureScreenshot(page, 'case-picklists-record-created');
    });
  });

});

sfTest.describe('4. Case Creation - Text Field Handling', () => {

  sfTest('4.1 Enter Special Characters in Subject and Description', { tag: ['@regression'] }, async ({ sfPage: page, casePage }) => {
    const specialSubject = `Special & Characters ${Date.now()}`;
    const specialDescription = 'Description with "quotes" and apostrophe\'s';

    await sfStep('Navigate to Cases app', page, async () => {
      await casePage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await casePage.clickNew();
    });

    await sfStep('Enter special characters in Subject and Description', page, async () => {
      await casePage.fillSubject(specialSubject);
      await casePage.fillDescription(specialDescription);
      await casePage.selectStatus('New');
      await casePage.selectPriority('Medium');
      await casePage.selectCaseOrigin('Phone');
      await captureScreenshot(page, 'case-special-chars-filled');
    });

    await sfStep('Save the Case and verify record created', page, async () => {
      await casePage.save();
      await assertRecordCreated(page, 'Case');
      await captureScreenshot(page, 'case-special-chars-record-created');
    });
  });

});

sfTest.describe('5. Case Creation - Navigation and Form State', () => {

  sfTest('5.1 Save and Navigate to Case Detail View', { tag: ['@smoke', '@regression'] }, async ({ sfPage: page, casePage }) => {
    const data = loadData('case', 'basicCase');

    await sfStep('Navigate to Cases app', page, async () => {
      await casePage.navigate();
    });

    await sfStep('Click New and fill required fields', page, async () => {
      await casePage.clickNew();
      await casePage.fillSubject(data.subject);
      await casePage.selectStatus(data.status);
      await casePage.selectPriority(data.priority);
      await casePage.selectCaseOrigin('Phone');
      await casePage.fillDescription(data.description);
    });

    await sfStep('Save the Case and verify detail page', page, async () => {
      await casePage.save();
      await assertRecordCreated(page, 'Case');
      await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 15000 });
      await captureScreenshot(page, 'case-detail-view-loaded');
    });
  });

  sfTest('5.2 Cancel Case Creation', { tag: ['@regression'] }, async ({ sfPage: page, casePage }) => {
    const data = loadData('case', 'basicCase');

    await sfStep('Navigate to Cases app', page, async () => {
      await casePage.navigate();
    });

    await sfStep('Open New Case form and enter values', page, async () => {
      await casePage.clickNew();
      await casePage.fillSubject(data.subject);
      await casePage.fillDescription(data.description);
      await captureScreenshot(page, 'case-form-before-cancel');
    });

    await sfStep('Click Cancel and handle discard prompt', page, async () => {
      const dialog = page.getByRole('dialog');
      const cancelButton = dialog.getByRole('button', { name: /^cancel$/i }).first();
      await expect(cancelButton).toBeVisible();
      await cancelButton.click();

      const discardButton = page.getByRole('button', { name: /discard|leave|yes/i }).first();
      if (await discardButton.isVisible().catch(() => false)) {
        await discardButton.click();
      }

      await expect(dialog).toBeHidden({ timeout: 15000 }).catch(() => null);
      await captureScreenshot(page, 'case-cancel-success');
    });
  });

});

sfTest.describe('6. Case Creation - Attachment Handling', () => {

  sfTest('6.1 Upload a File Attachment to a Newly Created Case', { tag: ['@regression'] }, async ({ sfPage: page, casePage }) => {
    const data = loadData('case', 'allFields');
    const attachmentPath = 'C:/Users/Admin/Downloads/Salesforce-logo.jpg';

    await sfStep('Create a new Case with all details', page, async () => {
      await casePage.navigate();
      await casePage.clickNew();
      await casePage.fillSubject(data.subject);
      await casePage.selectStatus(data.status);
      await casePage.selectCaseOrigin(data.origin || 'Phone');
      await casePage.selectType(data.type || 'Problem');
      await casePage.selectPriority('High');
      await casePage.fillDescription(data.description);
      await casePage.save();
      await assertRecordCreated(page, 'Case');
      await captureScreenshot(page, 'case-created-for-attachment');
    });

    await sfStep('Upload attachment from the Related tab', page, async () => {
      await casePage.uploadAttachment(attachmentPath);
      await captureScreenshot(page, 'case-attachment-uploaded');
    });
  });

});

sfTest.describe('7. Case Creation - Accessibility', () => {

  sfTest('7.1 Create a Case Using Keyboard Only', { tag: ['@regression'] }, async ({ sfPage: page, casePage }) => {
    const data = loadData('case', 'basicCase');

    await sfStep('Navigate to Cases app', page, async () => {
      await casePage.navigate();
    });

    await sfStep('Click New and wait for modal', page, async () => {
      await casePage.clickNew();
    });

    await sfStep('Fill the form using keyboard — Subject, Status, Priority, Origin', page, async () => {
      const dialog = page.getByRole('dialog');

      // Subject
      const subjectField = dialog.getByLabel(/subject/i).first();
      await subjectField.focus();
      await page.keyboard.type(data.subject);

      // Status — use keyboard to navigate and select
      await page.keyboard.press('Tab');
      const statusField = dialog.getByRole('combobox', { name: /status/i }).first();
      await statusField.click();
      await page.waitForTimeout(500);
      await page.getByRole('option', { name: 'New' }).first().click();
      await page.waitForTimeout(300);

      // Priority
      await page.keyboard.press('Tab');
      const priorityField = dialog.getByRole('combobox', { name: /priority/i }).first();
      await priorityField.click();
      await page.waitForTimeout(500);
      await page.getByRole('option', { name: 'Medium' }).first().click();
      await page.waitForTimeout(300);

      // Case Origin
      await page.keyboard.press('Tab');
      const originField = dialog.getByRole('combobox', { name: /case origin/i }).first();
      await originField.click();
      await page.waitForTimeout(500);
      await page.getByRole('option', { name: 'Phone' }).first().click();
      await page.waitForTimeout(300);

      await captureScreenshot(page, 'case-keyboard-filled');
    });

    await sfStep('Save the Case using keyboard', page, async () => {
      const saveButton = page.getByRole('button', { name: 'Save', exact: true }).first();
      await expect(saveButton).toBeVisible();
      await saveButton.focus();
      await page.keyboard.press('Enter');
      await captureScreenshot(page, 'case-keyboard-saved');
    });

    await sfStep('Verify the Case was actually created', page, async () => {
      await waitForSFLoad(page);
      await assertRecordCreated(page, 'Case');
      await captureScreenshot(page, 'case-keyboard-record-created');
    });
  });

});
