import { test, expect } from '@playwright/test';

test.describe('Saayam Donate Page E2E Tests (#45)', () => {
  test('Donate page loads successfully', async ({ page }) => {
    await page.goto('/donate');

    await expect(page).toHaveURL(/\/donate$/);

    await expect(
      page.getByRole('heading', { name: 'Make a donation' })
    ).toBeVisible();
  });

  test('Breadcrumb is visible', async ({ page }) => {
    await page.goto('/donate');

    await expect(
      page.getByText('Home', { exact: true }).first()
    ).toBeVisible();

    await expect(
      page.getByText('Donate', { exact: true }).first()
    ).toBeVisible();
  });

  test('All donation buttons are visible', async ({ page }) => {
    await page.goto('/donate');

    await expect(
      page.getByRole('button', { name: /PayPal/i })
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: /Stripe/i })
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: /Charity Navigator/i })
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: /Benevity/i })
    ).toBeVisible();
  });

  test('FAQ items are visible and clickable', async ({ page }) => {
    await page.goto('/donate');

    const firstQuestion = page.getByText(
      'Are donations tax deductible?'
    );

    const secondQuestion = page.getByText(
      'How will my donation be used?'
    );

    const thirdQuestion = page.getByText(
      'Can I cancel recurring donations?'
    );

    await expect(firstQuestion).toBeVisible();
    await firstQuestion.click();

    await expect(secondQuestion).toBeVisible();
    await secondQuestion.click();

    await expect(thirdQuestion).toBeVisible();
    await thirdQuestion.click();
  });

  test('Clicking PayPal opens the PayPal donation page', async ({ page }) => {
    await page.goto('/donate');

    await page.evaluate(() => {
      window.openedPayPalUrl = '';

      window.open = (url) => {
        window.openedPayPalUrl = String(url);
        return null;
      };
    });

    await page.getByRole('button', { name: /PayPal/i }).click();

    await expect
      .poll(async () => {
        return await page.evaluate(() => window.openedPayPalUrl);
      })
      .toMatch(/paypal\.com/i);
  });

  test('Clicking Stripe opens the Stripe donation form', async ({ page }) => {
    await page.goto('/donate');

    await page.getByRole('button', { name: /Stripe/i }).click();

    await expect(
      page.getByText('One-Time', { exact: true })
    ).toBeVisible();

    await expect(
      page.getByText('Monthly', { exact: true })
    ).toBeVisible();

    await expect(
      page.locator('button').filter({ hasText: /^Donate$/ }).last()
    ).toBeVisible();
  });

  test('Clicking Charity Navigator opens the correct page', async ({ page }) => {
    await page.goto('/donate');

    const charityNavigatorButton = page.getByRole('button', {
      name: /Charity Navigator/i
    });

    const [charityPage] = await Promise.all([
      page.waitForEvent('popup'),
      charityNavigatorButton.click()
    ]);

    await charityPage.waitForLoadState('domcontentloaded');

    await expect(charityPage).toHaveURL(/charitynavigator\.org/i);

    await expect(
      charityPage
        .getByRole('heading', { name: 'SAAYAM FOR ALL' })
        .first()
    ).toBeVisible();
  });

  test('Clicking Benevity opens the Benevity information page', async ({ page }) => {
    await page.goto('/donate');

    await page.getByRole('button', { name: /Benevity/i }).click();

    await expect(
      page.getByText(/Double Your Impact through Benevity/i)
    ).toBeVisible();

    await expect(
      page.getByText(/How to Donate/i)
    ).toBeVisible();

    await expect(
      page.getByRole('link', { name: /Search on Benevity/i })
    ).toBeVisible();
  });
});