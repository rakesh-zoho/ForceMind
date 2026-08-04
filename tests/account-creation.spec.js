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
        feature: 'Account Management',
        story: 'Account Creation',
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

sfTest.describe('1. Account Creation - Core Scenarios', () => {
    sfTest('ACC-01 Create Account with required fields only', { tag: ['@smoke', '@regression'] }, async ({ sfPage: page, accountPage }) => {
        const data = loadData('account', 'requiredFieldsOnly');

        await sfStep('Navigate to Accounts app', page, async () => {
            await accountPage.navigate();
            await waitForSFLoad(page);
            await captureScreenshot(page, 'accounts-home');
        });

        await sfStep('Open the new Account form', page, async () => {
            await accountPage.clickNew();
            await captureScreenshot(page, 'account-new-form');
        });

        await sfStep('Fill the required Account Name', page, async () => {
            await accountPage.fillAccountName(data.accountName);
            await captureScreenshot(page, 'account-name-filled');
        });

        await sfStep('Save the Account and verify record creation', page, async () => {
            await accountPage.save();
            await assertRecordCreated(page, 'Account');
            await captureScreenshot(page, 'account-created');
        });
    });

    sfTest('ACC-02 Create Account with all standard fields', { tag: ['@smoke', '@regression'] }, async ({ sfPage: page, accountPage }) => {
        const data = loadData('account', 'allStandardFields');

        await sfStep('Navigate to Accounts app', page, async () => {
            await accountPage.navigate();
            await waitForSFLoad(page);
        });

        await sfStep('Open a new Account form', page, async () => {
            await accountPage.clickNew();
        });

        await sfStep('Populate all standard fields', page, async () => {
            await accountPage.fillAccountName(data.accountName);
            await accountPage.fillPhone(data.phone);
            await accountPage.fillWebsite(data.website);
            await accountPage.selectIndustry(data.industry);
            await accountPage.selectType(data.type);
            await accountPage.fillBillingStreet(data.billingStreet);
            await accountPage.fillBillingCity(data.billingCity);
            await accountPage.fillBillingState(data.billingState);
            await accountPage.fillBillingZip(data.billingPostalCode);
            await accountPage.fillBillingCountry(data.billingCountry);
            await accountPage.fillEmployees(data.employees);
            await accountPage.fillAnnualRevenue(data.annualRevenue);
            await accountPage.fillDescription(data.description);
            await captureScreenshot(page, 'account-all-fields-filled');
        });

        await sfStep('Save the Account and verify creation', page, async () => {
            await accountPage.save();
            await assertRecordCreated(page, 'Account');
            await captureScreenshot(page, 'account-all-fields-created');
        });
    });

    sfTest('ACC-03 Create Account with phone and website', { tag: ['@smoke', '@regression'] }, async ({ sfPage: page, accountPage }) => {
        const data = loadData('account', 'phoneAndWebsite');

        await sfStep('Open the new Account form', page, async () => {
            await accountPage.navigate();
            await accountPage.clickNew();
        });

        await sfStep('Fill phone and website values', page, async () => {
            await accountPage.fillAccountName(data.accountName);
            await accountPage.fillPhone(data.phone);
            await accountPage.fillWebsite(data.website);
            await captureScreenshot(page, 'account-phone-website-filled');
        });

        await sfStep('Save the Account and verify creation', page, async () => {
            await accountPage.save();
            await assertRecordCreated(page, 'Account');
        });
    });

    sfTest('ACC-04 Create Account with full billing address', { tag: ['@regression'] }, async ({ sfPage: page, accountPage }) => {
        const data = loadData('account', 'billingAddress');

        await sfStep('Open the new Account form', page, async () => {
            await accountPage.navigate();
            await accountPage.clickNew();
        });

        await sfStep('Fill the billing address fields', page, async () => {
            await accountPage.fillAccountName(data.accountName);
            await accountPage.fillBillingStreet(data.billingStreet);
            await accountPage.fillBillingCity(data.billingCity);
            await accountPage.fillBillingState(data.billingState);
            await accountPage.fillBillingZip(data.billingPostalCode);
            await accountPage.fillBillingCountry(data.billingCountry);
            await captureScreenshot(page, 'account-billing-address-filled');
        });

        await sfStep('Save the Account and verify creation', page, async () => {
            await accountPage.save();
            await assertRecordCreated(page, 'Account');
        });
    });

    sfTest('ACC-05 Create Account with industry and type picklists', { tag: ['@regression'] }, async ({ sfPage: page, accountPage }) => {
        const data = loadData('account', 'industryAndType');

        await sfStep('Open the new Account form', page, async () => {
            await accountPage.navigate();
            await accountPage.clickNew();
        });

        await sfStep('Select industry and type values', page, async () => {
            await accountPage.fillAccountName(data.accountName);
            await accountPage.selectIndustry(data.industry);
            await accountPage.selectType(data.type);
            await captureScreenshot(page, 'account-picklists-filled');
        });

        await sfStep('Save the Account and verify creation', page, async () => {
            await accountPage.save();
            await assertRecordCreated(page, 'Account');
        });
    });
});

sfTest.describe('2. Account Creation - Special Cases', () => {
    sfTest('ACC-06 Create Account with special characters in name', { tag: ['@regression'] }, async ({ sfPage: page, accountPage }) => {
        const data = loadData('account', 'specialCharacters');

        await sfStep('Open a new Account form', page, async () => {
            await accountPage.navigate();
            await accountPage.clickNew();
        });

        await sfStep('Fill the special-character Account Name', page, async () => {
            await accountPage.fillAccountName(data.accountName);
            await captureScreenshot(page, 'account-special-chars-filled');
        });

        await sfStep('Save the Account and verify creation', page, async () => {
            await accountPage.save();
            await assertRecordCreated(page, 'Account');
        });
    });

    sfTest('ACC-07 Create Account with long field values', { tag: ['@regression'] }, async ({ sfPage: page, accountPage }) => {
        const data = loadData('account', 'longFieldValues');

        await sfStep('Open a new Account form', page, async () => {
            await accountPage.navigate();
            await accountPage.clickNew();
        });

        await sfStep('Fill long Account Name and Description', page, async () => {
            await accountPage.fillAccountName(data.accountName);
            await accountPage.fillDescription(data.description);
            await captureScreenshot(page, 'account-long-values-filled');
        });

        await sfStep('Save the Account and verify creation', page, async () => {
            await accountPage.save();
            await assertRecordCreated(page, 'Account');
        });
    });

    sfTest('ACC-08 Create Account with boundary numeric values', { tag: ['@regression'] }, async ({ sfPage: page, accountPage }) => {
        const data = loadData('account', 'numericBoundary');

        await sfStep('Open a new Account form', page, async () => {
            await accountPage.navigate();
            await accountPage.clickNew();
        });

        await sfStep('Fill boundary numeric values', page, async () => {
            await accountPage.fillAccountName(data.accountName);
            await accountPage.fillEmployees(data.employees);
            await accountPage.fillAnnualRevenue(data.annualRevenue);
            await captureScreenshot(page, 'account-boundary-numbers-filled');
        });

        await sfStep('Save the Account and verify creation', page, async () => {
            await accountPage.save();
            await assertRecordCreated(page, 'Account');
        });
    });
});

sfTest.describe('3. Account Creation - Validation and Form State', () => {
    sfTest('ACC-09 Attempt to save Account without name', { tag: ['@regression'] }, async ({ sfPage: page, accountPage }) => {
        const data = loadData('account', 'negativeEmptyName');

        await sfStep('Open a new Account form', page, async () => {
            await accountPage.navigate();
            await accountPage.clickNew();
            await captureScreenshot(page, 'account-validation-empty-form');
        });

        await sfStep('Leave Account Name blank and save', page, async () => {
            await accountPage.fillAccountName(data.accountName);
            await accountPage.save();
        });

        await sfStep('Verify validation errors and dialog remains open', page, async () => {
            await assertValidationErrors(page);
            await assertDialogStillOpen(page);
            await captureScreenshot(page, 'account-validation-errors');
        });
    });

    sfTest('ACC-10 Create Account and verify it appears in list view', { tag: ['@smoke', '@regression'] }, async ({ sfPage: page, accountPage }) => {
        const data = loadData('account', 'requiredFieldsOnly');

        await sfStep('Create an Account and verify record creation', page, async () => {
            await accountPage.navigate();
            await accountPage.clickNew();
            await accountPage.fillAccountName(data.accountName);
            await accountPage.save();
            await assertRecordCreated(page, 'Account');
        });

        await sfStep('Switch to the All Accounts list view', page, async () => {
            await switchToAllRecords(page, 'Account');
            await waitForSFLoad(page);
            await captureScreenshot(page, 'account-list-view');
        });
    });

    sfTest('ACC-11 Cancel Account creation with unsaved changes', { tag: ['@regression'] }, async ({ sfPage: page, accountPage }) => {
        const data = loadData('account', 'requiredFieldsOnly');

        await sfStep('Open a new Account form and enter a value', page, async () => {
            await accountPage.navigate();
            await accountPage.clickNew();
            await accountPage.fillAccountName(data.accountName);
            await captureScreenshot(page, 'account-before-cancel');
        });

        await sfStep('Cancel the form and handle discard prompt', page, async () => {
            const dialog = page.getByRole('dialog');
            const cancelButton = dialog.getByRole('button', { name: /^cancel$/i }).first();
            await expect(cancelButton).toBeVisible();
            await cancelButton.click();

            const discardButton = page.getByRole('button', { name: /discard|leave|yes/i }).first();
            if (await discardButton.isVisible().catch(() => false)) {
                await discardButton.click();
            }

            await expect(dialog).toBeHidden({ timeout: 15000 }).catch(() => null);
            await captureScreenshot(page, 'account-cancelled');
        });
    });
});
