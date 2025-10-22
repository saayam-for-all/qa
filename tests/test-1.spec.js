import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://test-saayam.netlify.app/');
  await page.locator('#header').getByRole('button', { name: 'Donate' }).click();
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'PayPal' }).click();
  const page1 = await page1Promise;
});