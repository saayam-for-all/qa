const { test, expect } = require('@playwright/test');

test.describe('Saayam Donate Page E2E Tests', () => {

  const donateUrl = 'https://test-saayam.netlify.app/donate';

  test.beforeEach(async ({ page }) => {
    await page.goto(donateUrl);
  });

  test('Donate page loads correctly', async ({ page }) => {
    // The main heading
    await expect(page.getByRole('heading', { name: /make a donation/i })).toBeVisible();

    // Donation help text
    await expect(page.getByText(/your donation helps us create lasting change/i)).toBeVisible();

    // Donation platform buttons
    await expect(page.getByRole('button', { name: /paypal/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /stripe/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /charity navigator/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /benevity/i })).toBeVisible();
  });

  test('Clicking PayPal opens the correct external link', async ({ page, context }) => {
    const [newTab] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /paypal/i }).click(),
    ]);

    await newTab.waitForLoadState();
    expect(newTab.url()).toContain('paypal'); // Loose check (PayPal redirects)
  });

  test('Clicking Stripe opens the correct external link', async ({ page, context }) => {
    const [newTab] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /stripe/i }).click(),
    ]);

    await newTab.waitForLoadState();
    expect(newTab.url()).toContain('stripe'); 
  });

  test('Clicking Charity Navigator opens correct link', async ({ page, context }) => {
    const [newTab] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /charity navigator/i }).click(),
    ]);

    await newTab.waitForLoadState();
    expect(newTab.url().toLowerCase()).toContain('charity');
  });

  test('Clicking Benevity opens correct link', async ({ page, context }) => {
    const [newTab] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /benevity/i }).click(),
    ]);

    await newTab.waitForLoadState();
    expect(newTab.url().toLowerCase()).toContain('benevity');
  });

});
