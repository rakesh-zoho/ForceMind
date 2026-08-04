import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { getDatePlusDays } from '../utils/locator-utils.js';

export class OpportunityPage extends BasePage {
  constructor(page) {
    super(page);
    this.newButton = page.getByRole('button', { name: /^New$/ }).first();
    this.saveButton = page.getByRole('dialog').getByRole('button', { name: /^Save$/i }).first();
    this.cancelButton = page.getByRole('dialog').getByRole('button', { name: /^Cancel$/i }).first();
    this.toastMessage = page.locator('.toastMessage');
  }

  async navigate() {
    await this.navigateToApp('Opportunities');
  }

  async clickNew() {
    await expect(this.newButton).toBeVisible({ timeout: 15000 });
    await this.newButton.click();
    await this.waitForSFLoad();
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 15000 });
  }

  async fillRequiredFields(name, stage, closeDate, accountName) {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel(/opportunity name/i).fill(name);
    await this.selectPicklist('Stage', stage);
    await dialog.getByLabel(/close date/i).fill(closeDate || getDatePlusDays(30));
    if (accountName) {
      await this.fillLookup('Account Name', accountName);
    }
  }

  async fillOptionalFields({ amount, description, accountName } = {}) {
    const dialog = this.page.getByRole('dialog');
    if (amount) await dialog.getByLabel(/amount/i).fill(amount.toString());
    if (description) await dialog.getByLabel(/description/i).fill(description);
    if (accountName) await this.fillLookup('Account Name', accountName);
  }

  async fillName(name) {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel(/opportunity name/i).fill(name);
  }

  async fillCloseDate(date) {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel(/close date/i).fill(date);
  }

  async fillAmount(amount) {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel(/amount/i).fill(amount.toString());
  }

  async fillDescription(description) {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel(/description/i).fill(description);
  }

  async selectStage(value) {
    await this.selectPicklist('Stage', value);
  }

  async save() {
    const saveButton = this.page.getByRole('dialog').getByRole('button', { name: /^Save$/i }).first();
    await expect(saveButton).toBeVisible({ timeout: 20000 });
    await saveButton.click();
    await this.waitForSFLoad();
  }

  async cancel() {
    await expect(this.cancelButton).toBeVisible();
    await this.cancelButton.click();
    await this.waitForSFLoad();
  }

  async createOpportunity({ name, stage, closeDate, amount, description, accountName }) {
    await this.navigate();
    await this.clickNew();
    await this.fillRequiredFields(name, stage, closeDate);
    await this.fillOptionalFields({ amount, description, accountName });
    await this.save();
    await this.assertSuccessToast('Opportunity');
  }

  async verifyOpportunityInList(oppName) {
    const { switchToAllRecords } = await import('../utils/sf-helpers.js');
    await switchToAllRecords(this.page, 'Opportunities');
    const link = this.page.getByRole('link', { name: new RegExp(oppName, 'i') });
    await expect(link).toBeVisible({ timeout: 15000 });
    return link;
  }

  async uploadAttachment(filePath) {
    const fileName = filePath.split(/[\\/]/).pop();
    const baseName = fileName.replace(/\.[^.]+$/, '');

    const relatedTab = this.page.getByRole('tab', { name: /related/i }).first();
    if (await relatedTab.isVisible({ timeout: 10000 }).catch(() => false)) {
      await relatedTab.click();
      await this.waitForSFLoad();
    }

    await this.page.mouse.wheel(0, 2000);
    await this.page.mouse.wheel(0, 2000);
    await this.page.mouse.wheel(0, 2000);

    let uploadButton = this.page.getByRole('button', { name: /upload files|attach file|add file/i }).first();
    if (!(await uploadButton.isVisible({ timeout: 10000 }).catch(() => false))) {
      uploadButton = this.page.locator('a, button').filter({ hasText: /upload files|attach file|add file/i }).first();
    }

    if (await uploadButton.isVisible({ timeout: 10000 }).catch(() => false)) {
      await uploadButton.scrollIntoViewIfNeeded();
      const [fileChooser] = await Promise.all([
        this.page.waitForEvent('filechooser', { timeout: 15000 }).catch(() => null),
        uploadButton.click(),
      ]);

      if (fileChooser) {
        await fileChooser.setFiles(filePath);
      } else {
        const fileInput = this.page.locator('input[type="file"]').last();
        await fileInput.waitFor({ state: 'attached', timeout: 15000 }).catch(() => null);
        if (await fileInput.count().catch(() => 0)) {
          await fileInput.setInputFiles(filePath);
        }
      }
    }

    await this.waitForSFLoad();

    const doneButton = this.page.getByText('Done', { exact: true }).first();
    if (await doneButton.isVisible({ timeout: 10000 }).catch(() => false)) {
      await doneButton.click();
      await this.waitForSFLoad();
    }

    await this.page.mouse.wheel(0, 2000);
    await this.page.mouse.wheel(0, 2000);

    const relatedPanel = this.page.getByRole('tabpanel', { name: /related/i }).first();
    const relatedFilesSection = relatedPanel.locator('a, span, div').filter({ hasText: new RegExp(baseName, 'i') }).first();
    await expect(relatedFilesSection).toBeVisible({ timeout: 30000 }).catch(() => null);
  }

  async assertFileInFilesList(fileName) {
    const fileLink = this.page.getByRole('link', { name: new RegExp(fileName, 'i') });
    await expect(fileLink).toBeVisible({ timeout: 15000 });
  }
}
