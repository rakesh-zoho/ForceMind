import { chromium } from 'playwright';
import dotenv from 'dotenv';
dotenv.config();

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({ storageState: './reports/.auth-state.json' });
const page = await context.newPage();

await page.goto(`${process.env.SF_URL}/lightning/o/Case/home`, { waitUntil: 'domcontentloaded', timeout: 120000 });
console.log('opened case home', page.url());
await page.waitForTimeout(8000);

await page.getByRole('button', { name: /^New$/ }).first().click();
await page.waitForTimeout(2000);

const dialog = page.getByRole('dialog');
await dialog.getByLabel(/subject/i).first().fill('Upload debug ' + Date.now());
await dialog.getByLabel(/status/i).first().click();
await page.getByRole('option').filter({ hasText: 'New' }).first().click();
await dialog.getByLabel(/priority/i).first().click();
await page.getByRole('option').filter({ hasText: 'Medium' }).first().click();
await dialog.getByLabel(/case origin/i).first().click();
await page.getByRole('option').filter({ hasText: 'Phone' }).first().click();
await dialog.getByLabel(/description/i).first().fill('debug');
await page.getByRole('dialog').getByRole('button', { name: /^Save$/i }).first().click();
await page.waitForTimeout(7000);
console.log('after save URL', page.url());

const relatedLike = await page.locator('button, a, span').evaluateAll(els => els.map(e => ({
    tag: e.tagName,
    text: (e.innerText || '').slice(0, 140),
    role: e.getAttribute('role'),
    title: e.getAttribute('title'),
    ariaSelected: e.getAttribute('aria-selected')
})));

const filtered = relatedLike.filter(x => /related|upload|attach|file/i.test(x.text) || /related|upload|attach|file/i.test(x.title || ''));
console.log(JSON.stringify(filtered.slice(0, 200), null, 2));
