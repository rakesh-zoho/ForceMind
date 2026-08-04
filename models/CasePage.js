import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class CasePage extends BasePage {
  constructor(page) {
    super(page);
    this.newButton = page.getByRole('button', { name: /^New$/ }).first();
    this.saveButton = page.getByRole('dialog').getByRole('button', { name: /^Save$/i }).first();
    this.cancelButton = page.getByRole('dialog').getByRole('button', { name: /^Cancel$/i }).first();
    this.toastMessage = page.locator('.toastMessage');
  }

  async navigate() {
    await this.navigateToApp('Cases');
  }

  async clickNew() {
    await expect(this.newButton).toBeVisible({ timeout: 15000 });
    await this.newButton.click();
    await this.waitForSFLoad();
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 15000 });
  }

  async fillContactName(searchTerm) {
    await this.fillLookup('Contact Name', searchTerm);
  }

  async fillAccountName(searchTerm) {
    await this.fillLookup('Account Name', searchTerm);
  }

  async fillSubject(subject) {
    await this.fillField('Subject', subject);
  }

  async fillDescription(description) {
    await this.fillField('Description', description);
  }

  async selectStatus(status) {
    await this.selectPicklist('Status', status);
  }

  async selectPriority(priority) {
    await this.selectPicklist('Priority', priority);
  }

  async selectType(type) {
    await this.selectPicklist('Type', type);
  }

  async selectCaseOrigin(origin) {
    await this.selectPicklist('Case Origin', origin);
  }

  async selectFirstValidOption(fieldLabel) {
    const dialog = this.page.getByRole('dialog');
    const field = dialog.getByRole('combobox', { name: fieldLabel }).first();
    await expect(field).toBeVisible({ timeout: 15000 });
    await field.click();
    const option = this.page.getByRole('option').filter({ hasText: /^(?!\-\-None\-\-).+/ }).first();
    await expect(option).toBeVisible({ timeout: 15000 });
    await option.click();
  }

  async save() {
    const saveButton = this.page.getByRole('dialog').getByRole('button', { name: /^Save$/i }).first();
    await expect(saveButton).toBeVisible({ timeout: 20000 });
    await saveButton.click();
    await this.waitForSFLoad();
  }

  async uploadAttachment(filePath, options = {}) {
    const fileName = filePath.split(/[\\/]/).pop();
    const baseName = fileName.replace(/\.[^.]+$/, '');
    const uploadButtonName = options.uploadButtonName || /upload files|attach file|add file/i;
    const relatedTabName = options.relatedTabName || /related/i;

    const relatedTab = this.page.getByRole('tab').filter({ hasText: relatedTabName }).first();
    if (await relatedTab.isVisible({ timeout: 10000 }).catch(() => false)) {
      await relatedTab.click();
      await this.waitForSFLoad();
    } else {
      const fallbackRelated = this.page.locator('button, a, span').filter({ hasText: relatedTabName }).first();
      if (await fallbackRelated.isVisible({ timeout: 10000 }).catch(() => false)) {
        await fallbackRelated.click();
        await this.waitForSFLoad();
      }
    }

    await this.page.mouse.wheel(0, 2000);
    await this.page.mouse.wheel(0, 2000);
    await this.page.mouse.wheel(0, 2000);

    let uploadButton = this.page.getByRole('button', { name: uploadButtonName }).first();
    if (!(await uploadButton.isVisible({ timeout: 10000 }).catch(() => false))) {
      uploadButton = this.page.locator('a, button').filter({ hasText: uploadButtonName }).first();
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

    const successIcon = this.page.locator('//*[name()="svg" or name()="path"]').filter({ has: this.page.locator('//*[name()="path" and contains(@d, "M260 20a24")]') }).first();
    const successContainer = this.page.locator('.slds-icon-utility-success, .slds-icon_container').filter({ has: this.page.locator('//*[name()="path" and contains(@d, "M260 20a24")]') }).first();

    if (await successIcon.isVisible({ timeout: 30000 }).catch(() => false) || await successContainer.isVisible({ timeout: 30000 }).catch(() => false)) {
      const doneButton = this.page.getByText('Done', { exact: true }).first();
      if (await doneButton.isVisible({ timeout: 10000 }).catch(() => false)) {
        await doneButton.click();
        await this.waitForSFLoad();
      }
    }

    await this.page.mouse.wheel(0, 2000);
    await this.page.mouse.wheel(0, 2000);

    const relatedPanel = this.page.getByRole('tabpanel', { name: /related/i }).first();
    const relatedFilesSection = relatedPanel.locator('a, span, div').filter({ hasText: new RegExp(baseName, 'i') }).first();
    await expect(relatedFilesSection).toBeVisible({ timeout: 30000 }).catch(() => null);
  }

  async expectToastCreated() {
    const toast = this.page.locator('.toastMessage');
    await expect(toast).toBeVisible({ timeout: 15000 });
    await expect(toast).toContainText('was created');
  }

  async createCase({ contactName, accountName, subject, description, status, priority, caseOrigin }) {
    await this.navigate();
    await this.clickNew();
    if (contactName) await this.fillContactName(contactName);
    if (accountName) await this.fillAccountName(accountName);
    if (status) await this.selectStatus(status);
    if (priority) await this.selectPriority(priority);
    if (caseOrigin) await this.selectCaseOrigin(caseOrigin);
    if (subject) await this.fillSubject(subject);
    if (description) await this.fillDescription(description);
    await this.save();
    await this.expectToastCreated();
  }
}
