import { test, expect } from '@playwright/test';

const BASE_URL = 'https://test-saayam.netlify.app';

test.describe('Super Admin - All Requests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);

    await page.getByRole('link', { name: 'Log In' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill('saayamqa@yahoo.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('Saayamforall@123');
    await page.getByRole('button', { name: 'Log In' }).click();

    await page.waitForURL('**/dashboard');
    await page.getByRole('combobox').selectOption('superAdmin');

    await expect(page).toHaveURL(/view=superAdmin/);
  });

  test('Navigate to All Requests tab', async ({ page }) => {
    await page.getByRole('button', { name: 'All Requests' }).click();
    await expect(page.locator('table[data-testid="table"]')).toBeVisible();
  });

  test('Filter by Status - CANCELLED', async ({ page }) => {
    await page.getByRole('button', { name: 'All Requests' }).click();

    await page.getByRole('button', { name: /status/i }).first().click();
    await page.getByRole('checkbox', { name: 'CANCELLED' }).check();

    await expect(
      page.getByRole('cell', { name: 'CANCELLED' }).first()
    ).toBeVisible();
  });

  test('Filter by Type - IN_PERSON', async ({ page }) => {
    await page.getByRole('button', { name: 'All Requests' }).click();

    await page.getByRole('button', { name: /type/i }).first().click();
    await page.getByRole('checkbox', { name: 'IN_PERSON' }).check();

    await expect(
      page.getByTestId('map-data-one').first()
    ).toBeVisible();
  });

  test('Filter by Priority - LOW', async ({ page }) => {
    await page.getByRole('button', { name: 'All Requests' }).click();

    await page.getByRole('button', { name: /priority/i }).first().click();
    await page.getByRole('checkbox', { name: 'LOW' }).check();

    await expect(
      page.getByRole('cell', { name: 'LOW' }).first()
    ).toBeVisible();
  });

});
