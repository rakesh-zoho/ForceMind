import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class LeadPage extends BasePage {
  constructor(page) {
    super(page);
    this.newButton = page.getByRole('button', { name: /^New$/ }).first();
    this.saveButton = page.getByRole('dialog').getByRole('button', { name: /^Save$/i }).first();
    this.cancelButton = page.getByRole('dialog').getByRole('button', { name: /^Cancel$/i }).first();
    this.toastMessage = page.locator('.toastMessage');
  }

  async navigate() {
    const dialog = this.page.getByRole('dialog');
    if (await dialog.isVisible().catch(() => false)) {
      await this.page.keyboard.press('Escape').catch(() => null);
      await this.page.waitForTimeout(1000);
    }
    const listbox = this.page.locator('div[role="listbox"]:visible');
    if (await listbox.isVisible({ timeout: 1000 }).catch(() => false)) {
      await this.page.keyboard.press('Escape').catch(() => null);
      await this.page.waitForTimeout(500);
    }
    await this.navigateToApp('Leads');
  }

  async clickNew() {
    await expect(this.newButton).toBeVisible({ timeout: 15000 });
    await this.newButton.click();
    await this.waitForSFLoad();
    const newLeadDialog = this.page.getByRole('dialog').filter({ hasText: /first name|last name|company/i }).first();
    await expect(newLeadDialog).toBeVisible({ timeout: 15000 });
  }

  async fillRequiredFields(firstName, lastName, company) {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel(/first name/i).fill(firstName);
    await dialog.getByLabel(/last name/i).fill(lastName);
    await dialog.getByLabel(/company/i).fill(company);
  }

  async fillOptionalFields({ phone, email, title, leadSource, status, rating, description } = {}) {
    const dialog = this.page.getByRole('dialog');
    if (phone) await dialog.getByLabel(/phone/i).fill(phone);
    if (email) await dialog.getByLabel(/email/i).fill(email);
    if (title) await dialog.getByLabel(/title/i).fill(title);
    if (description) await dialog.getByLabel(/description/i).fill(description);
    if (leadSource) await this.selectPicklist('Lead Source', leadSource);
    if (status) await this.selectPicklist('Status', status);
    if (rating) await this.selectPicklist('Rating', rating);
  }

  async save() {
    const saveBtn = this.page.getByRole('dialog').getByRole('button', { name: /^Save$/i }).first();
    await expect(saveBtn).toBeVisible({ timeout: 20000 });
    await saveBtn.click();
    await this.waitForSFLoad();
  }

  async cancel() {
    await this.cancelButton.click();
    await this.waitForSFLoad();
  }

  async createLead({ firstName, lastName, company, phone, email, title, leadSource, status, rating }) {
    await this.navigate();
    await this.clickNew();
    await this.fillRequiredFields(firstName, lastName, company);
    await this.fillOptionalFields({ phone, email, title, leadSource, status, rating });
    await this.save();
    await this.assertSuccessToast('Lead');
  }

  async verifyLeadInList(leadName) {
    await switchToAllRecords(this.page, 'Leads');
    const link = this.page.getByRole('link', { name: new RegExp(leadName, 'i') });
    await expect(link).toBeVisible({ timeout: 15000 });
    return link;
  }

  async navigateToLead(leadName) {
    await this.navigate();
    await this.waitForSFLoad();
    const leadLink = this.page.getByRole('link', { name: new RegExp(leadName, 'i') }).first();
    if (await leadLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await leadLink.click();
      await this.waitForSFLoad();
      return;
    }
    const { switchToAllRecords } = await import('../utils/sf-helpers.js');
    await switchToAllRecords(this.page, 'Leads');
    await this.waitForSFLoad();
    const link = this.page.getByRole('link', { name: new RegExp(leadName, 'i') }).first();
    await expect(link).toBeVisible({ timeout: 15000 });
    await link.click();
    await this.waitForSFLoad();
  }

  async clickConvert() {
    const convertButton = this.page.getByRole('button', { name: /convert/i }).first();
    if (!(await convertButton.isVisible({ timeout: 5000 }).catch(() => false))) {
      const actionsButton = this.page.locator('button, a').filter({ hasText: /actions/i }).first();
      if (await actionsButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await actionsButton.click();
        await this.page.waitForTimeout(1000);
      }
    }
    const convertBtn = this.page.getByRole('button', { name: /convert/i }).first();
    await expect(convertBtn).toBeVisible({ timeout: 15000 });
    await convertBtn.click();
    await this.waitForSFLoad();
    const convertDialog = this.page.getByRole('dialog').filter({ hasText: /convert lead/i }).first();
    await expect(convertDialog).toBeVisible({ timeout: 15000 });
  }

  async convertLead({ createOpportunity = true, opportunityName = null } = {}) {
    const dialog = this.page.getByRole('dialog').filter({ hasText: /convert lead/i }).first();
    await expect(dialog).toBeVisible({ timeout: 15000 });

    if (!createOpportunity) {
      const noOppRadio = dialog.getByRole('radio', { name: /don.t create/i }).first();
      if (await noOppRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
        await noOppRadio.click();
      } else {
        const noOppOption = dialog.locator('label, span').filter({ hasText: /don.t create/i }).first();
        if (await noOppOption.isVisible({ timeout: 3000 }).catch(() => false)) {
          await noOppOption.click();
        }
      }
    }

    if (opportunityName) {
      const oppNameField = dialog.getByLabel(/opportunity name/i).first();
      if (await oppNameField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await oppNameField.fill(opportunityName);
      }
    }

    const convertBtn = dialog.getByRole('button', { name: /^convert$/i }).first();
    await expect(convertBtn).toBeVisible({ timeout: 10000 });
    await convertBtn.click();
    await this.waitForSFLoad();
  }

  async verifyConversionSuccess() {
    const successMessage = this.page.getByText(/your lead has been converted/i).first();
    await expect(successMessage).toBeVisible({ timeout: 30000 });
    return successMessage;
  }

  async getConvertedAccountName() {
    const accountLink = this.page.getByRole('link', { name: /.+/ }).filter({ hasText: /.+/ }).first();
    const links = this.page.locator('.leadConvertResult a, .slds-card a').filter({ hasText: /.+/ });
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      if (href && href.includes('/Account/')) {
        return await links.nth(i).textContent();
      }
    }
    return null;
  }

  async getConvertedContactName() {
    const links = this.page.locator('.leadConvertResult a, .slds-card a').filter({ hasText: /.+/ });
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      if (href && href.includes('/Contact/')) {
        return await links.nth(i).textContent();
      }
    }
    return null;
  }

  async clickGoToNewAccount() {
    const btn = this.page.getByRole('button', { name: /go to.*account/i }).first();
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await btn.click();
      await this.waitForSFLoad();
    }
  }

  async clickGoToNewContact() {
    const btn = this.page.getByRole('button', { name: /go to.*contact/i }).first();
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await btn.click();
      await this.waitForSFLoad();
    }
  }
}
