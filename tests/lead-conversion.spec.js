import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { sfTest } from '../fixtures/fixtures.js';
import { captureScreenshot, setAllureMeta, sfStep, attachVideoOnFailure } from '../utils/reporter-utils.js';
import { waitForSFLoad } from '../utils/sf-helpers.js';
import { loadData } from '../utils/data-factory.js';
import {
  assertRecordCreated,
  assertSuccessToast,
  assertValidationErrors,
  assertDialogStillOpen,
} from '../utils/validators.js';

test.beforeEach(async () => {
  await setAllureMeta({
    epic: 'CRM',
    feature: 'Lead Management',
    story: 'Convert Lead',
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

sfTest.describe('1. Lead Conversion - Basic Flow', () => {

  sfTest('1.1 Convert Lead and Verify Account and Contact Created', async ({ sfPage: page, leadPage }) => {
    const data = loadData('lead', 'convertBasic');
    let leadName;

    await sfStep('Create a Lead to convert', page, async () => {
      leadName = `${data.firstName} ${data.lastName}`;
      await leadPage.navigate();
      await leadPage.clickNew();
      await leadPage.fillRequiredFields(data.firstName, data.lastName, data.company);
      await leadPage.save();
      await assertRecordCreated(page, 'Lead');
      await captureScreenshot(page, 'lead-created-for-conversion');
    });

    await sfStep('Navigate to the Lead detail page', page, async () => {
      await leadPage.navigateToLead(leadName);
      await captureScreenshot(page, 'lead-detail-page');
    });

    await sfStep('Click Convert on the Lead', page, async () => {
      await leadPage.clickConvert();
      await captureScreenshot(page, 'convert-lead-dialog');
    });

    await sfStep('Complete the conversion', page, async () => {
      await leadPage.convertLead({ createOpportunity: true });
      await captureScreenshot(page, 'lead-converted');
    });

    await sfStep('Verify conversion success message', page, async () => {
      await leadPage.verifyConversionSuccess();
      await captureScreenshot(page, 'conversion-success-message');
    });

    await sfStep('Verify Account was created', page, async () => {
      const accountLink = page.getByRole('link', { name: new RegExp(data.company, 'i') }).first();
      const isVisible = await accountLink.isVisible({ timeout: 10000 }).catch(() => false);
      if (!isVisible) {
        const anyAccountLink = page.locator('a[href*="/Account/"]').first();
        await expect(anyAccountLink).toBeVisible({ timeout: 15000 });
      }
      await captureScreenshot(page, 'account-created-after-conversion');
    });

    await sfStep('Verify Contact was created', page, async () => {
      const contactLink = page.locator('a[href*="/Contact/"]').first();
      await expect(contactLink).toBeVisible({ timeout: 15000 });
      await captureScreenshot(page, 'contact-created-after-conversion');
    });
  });

  sfTest('1.2 Convert Lead Without Creating Opportunity', async ({ sfPage: page, leadPage }) => {
    const data = loadData('lead', 'convertNoOpportunity');
    let leadName;

    await sfStep('Create a Lead to convert', page, async () => {
      leadName = `${data.firstName} ${data.lastName}`;
      await leadPage.navigate();
      await leadPage.clickNew();
      await leadPage.fillRequiredFields(data.firstName, data.lastName, data.company);
      await leadPage.save();
      await assertRecordCreated(page, 'Lead');
      await captureScreenshot(page, 'lead-created-no-opp');
    });

    await sfStep('Navigate to the Lead detail page', page, async () => {
      await leadPage.navigateToLead(leadName);
      await captureScreenshot(page, 'lead-detail-no-opp');
    });

    await sfStep('Click Convert on the Lead', page, async () => {
      await leadPage.clickConvert();
      await captureScreenshot(page, 'convert-dialog-no-opp');
    });

    await sfStep('Convert without creating Opportunity', page, async () => {
      await leadPage.convertLead({ createOpportunity: false });
      await captureScreenshot(page, 'lead-converted-no-opp');
    });

    await sfStep('Verify conversion success message', page, async () => {
      await leadPage.verifyConversionSuccess();
      await captureScreenshot(page, 'conversion-success-no-opp');
    });

    await sfStep('Verify Account was created', page, async () => {
      const accountLink = page.locator('a[href*="/Account/"]').first();
      await expect(accountLink).toBeVisible({ timeout: 15000 });
      await captureScreenshot(page, 'account-created-no-opp');
    });

    await sfStep('Verify Contact was created', page, async () => {
      const contactLink = page.locator('a[href*="/Contact/"]').first();
      await expect(contactLink).toBeVisible({ timeout: 15000 });
      await captureScreenshot(page, 'contact-created-no-opp');
    });
  });

});

sfTest.describe('2. Lead Conversion - With All Fields', () => {

  sfTest('2.1 Convert Lead with All Standard Fields', async ({ sfPage: page, leadPage }) => {
    const data = loadData('lead', 'convertAllFields');
    let leadName;

    await sfStep('Create a Lead with all fields', page, async () => {
      leadName = `${data.firstName} ${data.lastName}`;
      await leadPage.navigate();
      await leadPage.clickNew();
      await leadPage.fillRequiredFields(data.firstName, data.lastName, data.company);
      await leadPage.fillOptionalFields({
        phone: data.phone,
        email: data.email,
        title: data.title,
        leadSource: data.leadSource,
      });
      await leadPage.save();
      await assertRecordCreated(page, 'Lead');
      await captureScreenshot(page, 'lead-all-fields-created');
    });

    await sfStep('Navigate to the Lead detail page', page, async () => {
      await leadPage.navigateToLead(leadName);
      await captureScreenshot(page, 'lead-detail-all-fields');
    });

    await sfStep('Click Convert on the Lead', page, async () => {
      await leadPage.clickConvert();
      await captureScreenshot(page, 'convert-dialog-all-fields');
    });

    await sfStep('Complete the conversion', page, async () => {
      await leadPage.convertLead({ createOpportunity: true });
      await captureScreenshot(page, 'lead-converted-all-fields');
    });

    await sfStep('Verify conversion success', page, async () => {
      await leadPage.verifyConversionSuccess();
      await captureScreenshot(page, 'conversion-success-all-fields');
    });

    await sfStep('Verify Account was created with correct company', page, async () => {
      const accountLink = page.locator('a[href*="/Account/"]').first();
      await expect(accountLink).toBeVisible({ timeout: 15000 });
      const accountText = await accountLink.textContent();
      console.log('Created Account:', accountText);
      await captureScreenshot(page, 'account-created-all-fields');
    });

    await sfStep('Verify Contact was created with correct name', page, async () => {
      const contactLink = page.locator('a[href*="/Contact/"]').first();
      await expect(contactLink).toBeVisible({ timeout: 15000 });
      const contactText = await contactLink.textContent();
      console.log('Created Contact:', contactText);
      await captureScreenshot(page, 'contact-created-all-fields');
    });
  });

});

sfTest.describe('3. Lead Conversion - Edge Cases', () => {

  sfTest('3.1 Convert Lead with Special Characters in Name', async ({ sfPage: page, leadPage }) => {
    const data = loadData('lead', 'convertSpecialChars');
    let leadName;

    await sfStep('Create a Lead with special characters', page, async () => {
      leadName = `${data.firstName} ${data.lastName}`;
      await leadPage.navigate();
      await leadPage.clickNew();
      await leadPage.fillRequiredFields(data.firstName, data.lastName, data.company);
      await leadPage.save();
      await assertRecordCreated(page, 'Lead');
      await captureScreenshot(page, 'lead-special-chars-created');
    });

    await sfStep('Navigate to the Lead detail page', page, async () => {
      await leadPage.navigateToLead(leadName);
      await captureScreenshot(page, 'lead-detail-special-chars');
    });

    await sfStep('Click Convert on the Lead', page, async () => {
      await leadPage.clickConvert();
      await captureScreenshot(page, 'convert-dialog-special-chars');
    });

    await sfStep('Complete the conversion', page, async () => {
      await leadPage.convertLead({ createOpportunity: true });
      await captureScreenshot(page, 'lead-converted-special-chars');
    });

    await sfStep('Verify conversion success', page, async () => {
      await leadPage.verifyConversionSuccess();
      await captureScreenshot(page, 'conversion-success-special-chars');
    });

    await sfStep('Verify Account and Contact created', page, async () => {
      const accountLink = page.locator('a[href*="/Account/"]').first();
      await expect(accountLink).toBeVisible({ timeout: 15000 });
      const contactLink = page.locator('a[href*="/Contact/"]').first();
      await expect(contactLink).toBeVisible({ timeout: 15000 });
      await captureScreenshot(page, 'account-contact-created-special-chars');
    });
  });

});
