import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class ContactPage extends BasePage {
  constructor(page) {
    super(page);
    this.newButton = page.getByRole('button', { name: /^New$/ }).first();
    this.saveButton = page.getByRole('dialog').getByRole('button', { name: /^Save$/i }).first();
    this.cancelButton = page.getByRole('dialog').getByRole('button', { name: /^Cancel$/i }).first();
    this.toastMessage = page.locator('.toastMessage');
  }

  async navigate() {
    await this.navigateToApp('Contacts');
  }

  async clickNew() {
    await expect(this.newButton).toBeVisible({ timeout: 15000 });
    await this.newButton.click();
    await this.waitForSFLoad();
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 15000 });
  }

  async fillRequiredFields(firstName, lastName) {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel(/first name/i).fill(firstName);
    await dialog.getByLabel(/last name/i).fill(lastName);
  }

  async fillOptionalFields({ accountName, email, phone, title, department } = {}) {
    const dialog = this.page.getByRole('dialog');
    if (accountName) await this.fillLookup('Account Name', accountName);
    if (email) await dialog.getByLabel(/email/i).fill(email);
    if (phone) await dialog.getByLabel(/phone/i).fill(phone);
    if (title) await dialog.getByLabel(/title/i).fill(title);
    if (department) await dialog.getByLabel(/department/i).fill(department);
  }

  async save() {
    await expect(this.saveButton).toBeVisible();
    await this.saveButton.click();
    await this.waitForSFLoad();
  }

  async cancel() {
    await this.cancelButton.click();
    await this.waitForSFLoad();
  }

  async createContact({ firstName, lastName, accountName, email, phone, title, department }) {
    await this.navigate();
    await this.clickNew();
    await this.fillRequiredFields(firstName, lastName);
    await this.fillOptionalFields({ accountName, email, phone, title, department });
    await this.save();
    await this.assertSuccessToast('Contact');
  }
}
