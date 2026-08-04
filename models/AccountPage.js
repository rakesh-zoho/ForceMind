import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';

export class AccountPage extends BasePage {
  constructor(page) {
    super(page);
    this.newButton = page.getByRole('button', { name: /^New$/ }).first();
    this.saveButton = page.getByRole('dialog').getByRole('button', { name: /^Save$/i }).first();
    this.cancelButton = page.getByRole('dialog').getByRole('button', { name: /^Cancel$/i }).first();
    this.toastMessage = page.locator('.toastMessage');
  }

  async navigate() {
    await this.navigateToApp('Accounts');
  }

  async clickNew() {
    await expect(this.newButton).toBeVisible({ timeout: 15000 });
    await this.newButton.click();
    await this.waitForSFLoad();
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 15000 });
  }

  async fillAccountName(name) {
    await this.fillField(/account name/i, name);
  }

  async fillPhone(phone) {
    await this.fillField(/phone/i, phone);
  }

  async fillWebsite(website) {
    await this.fillField(/website/i, website);
  }

  async fillBillingStreet(street) {
    await this.fillField(/billing street/i, street);
  }

  async fillBillingCity(city) {
    await this.fillField(/billing city/i, city);
  }

  async fillBillingState(state) {
    await this.fillField(/billing state/i, state);
  }

  async fillBillingZip(zip) {
    await this.fillField(/billing postal code|billing zip/i, zip);
  }

  async fillBillingCountry(country) {
    await this.fillField(/billing country/i, country);
  }

  async fillEmployees(count) {
    await this.fillField(/employees/i, count);
  }

  async fillAnnualRevenue(amount) {
    await this.fillField(/annual revenue/i, amount);
  }

  async fillDescription(description) {
    await this.fillField(/description/i, description);
  }

  async selectIndustry(industry) {
    await this.selectPicklist(/industry/i, industry);
  }

  async selectType(type) {
    await this.selectPicklist(/type/i, type);
  }

  async save() {
    await expect(this.saveButton).toBeVisible();
    await this.saveButton.click();
    await this.waitForSFLoad();

    const toast = this.page.locator('.toastMessage');
    const hasToast = await toast.isVisible().catch(() => false);

    if (hasToast) {
      const toastText = await toast.textContent();
      return toastText || '';
    }

    const url = this.page.url();
    const hasRecordId = /\/r\/[A-Za-z]+\/[A-Za-z0-9]{15,18}\//.test(url) || /\/[A-Za-z0-9]{15,18}$/.test(url);
    if (hasRecordId) {
      return '';
    }

    return '';
  }

  async createAccount({ name, phone, website, industry, type, billingStreet, billingCity, billingState, billingZip, billingCountry, employees, annualRevenue, description }) {
    await this.navigate();
    await this.clickNew();
    if (name) await this.fillAccountName(name);
    if (phone) await this.fillPhone(phone);
    if (website) await this.fillWebsite(website);
    if (industry) await this.selectIndustry(industry);
    if (type) await this.selectType(type);
    if (billingStreet) await this.fillBillingStreet(billingStreet);
    if (billingCity) await this.fillBillingCity(billingCity);
    if (billingState) await this.fillBillingState(billingState);
    if (billingZip) await this.fillBillingZip(billingZip);
    if (billingCountry) await this.fillBillingCountry(billingCountry);
    if (employees) await this.fillEmployees(employees);
    if (annualRevenue) await this.fillAnnualRevenue(annualRevenue);
    if (description) await this.fillDescription(description);
    return await this.save();
  }
}
