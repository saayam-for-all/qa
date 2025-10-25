import { test, expect } from '@playwright/test';

test('Saayam donate flow - PayPal integration', async ({ page }) => {
  await page.goto('https://test-saayam.netlify.app/');
  await page.locator('#header').getByRole('button', { name: 'Donate' }).click();
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'PayPal' }).click();
  const page1 = await page1Promise;
  
  // Verify PayPal popup opened
  expect(page1).toBeTruthy();
});

test('should handle closed PayPal popup gracefully', async ({ page }) => {
    await page.goto('https://test-saayam.netlify.app/');
    await page.locator('#header').getByRole('button', { name: 'Donate' }).click();

    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'PayPal' }).click();
    const page1 = await page1Promise;

    // Close the PayPal popup immediately
    await page1.close();

    // Verify popup is closed
    expect(page1.isClosed()).toBeTruthy();

    // Verify main page is still functional
    await expect(page).toHaveURL('https://test-saayam.netlify.app/donate ');
    await expect(page.locator('#header').getByRole('button', { name: 'Donate' })).toBeVisible();
});

test('should not proceed without clicking PayPal button', async ({ page }) => {
    await page.goto('https://test-saayam.netlify.app/');
    await page.locator('#header').getByRole('button', { name: 'Donate' }).click();

    // Wait a moment to ensure no popup appears
    await page.waitForTimeout(2000);

    // Verify no popup was opened
    const context = page.context();
    expect(context.pages()).toHaveLength(1);
});