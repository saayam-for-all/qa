import { test, expect } from '@playwright/test';
import { loginTestData } from '../test-data';

const BASE_URL = 'https://test-saayam.netlify.app';

test.describe('Super Admin dashboard', () => {
  const { validCredentials } = loginTestData;
  const tableRows = (page) => page.locator('table[data-testid="table"] tr');
  const normalize = (value) => value.replace(/[_\s]+/g, ' ').trim().toUpperCase();
  const optionPattern = (value) => new RegExp(`^${value.replace(/[_\s]+/g, '[\\s_]+')}$`, 'i');
  const TYPE_OPTIONS = ['IN_PERSON', 'REMOTE'];
  const STATUS_OPTIONS = ['MANAGED', 'RESOLVED', 'CANCELLED'];
  const PRIORITY_OPTIONS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const CALAMITY_OPTIONS = ['YES', 'NO'];

  const openAllRequestsTab = async (page) => {
    await page.getByRole('button', { name: 'All Requests' }).click();
    await expect(page.locator('table[data-testid="table"]')).toBeVisible();
  };

  const selectFilterOption = async (page, filterName, optionName) => {
    await page.getByRole('button', { name: new RegExp(`^${filterName}`, 'i') }).first().click();
    const targetOption = page.getByRole('checkbox', { name: optionPattern(optionName) }).first();
    await expect(targetOption).toBeVisible({ timeout: 10000 });
    await targetOption.check();
    await page.keyboard.press('Escape');
  };

  const assertAllRowsMatchColumn = async (page, columnIndex, matcherFn) => {
    await expect
      .poll(async () => {
        const rows = tableRows(page);
        const rowCount = await rows.count();
        if (rowCount <= 1) return false;

        for (let i = 1; i < rowCount; i += 1) {
          const cellText = (await rows.nth(i).getByRole('cell').nth(columnIndex).innerText()).trim();
          if (!matcherFn(cellText)) return false;
        }

        return true;
      })
      .toBeTruthy();
  };

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);

    await page.getByRole('link', { name: 'Log In' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(validCredentials.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(validCredentials.password);
    await page.getByRole('button', { name: 'Log In' }).click();

    await page.waitForURL('**/dashboard');
    await page.getByRole('combobox').selectOption('superAdmin');

    await expect(page).toHaveURL(/view=superAdmin/);
    await expect(page.getByRole('heading', { name: 'Super Admin Dashboard' })).toBeVisible();
  });

  test('Super Admin Dashboard loads successfully', async ({ page }) => {
    await expect(page).toHaveURL(/view=superAdmin/);
    await expect(page.getByRole('heading', { name: 'Super Admin Dashboard' })).toBeVisible();
  });

  for (const typeValue of TYPE_OPTIONS) {
    test(`Filter by Type - ${typeValue}`, async ({ page }) => {
      await openAllRequestsTab(page);
      await selectFilterOption(page, 'Type', typeValue);
      await assertAllRowsMatchColumn(page, 5, (text) => normalize(text) === normalize(typeValue));
    });
  }

  for (const status of STATUS_OPTIONS) {
    test(`Filter by Status - ${status}`, async ({ page }) => {
      await openAllRequestsTab(page);
      await selectFilterOption(page, 'Status', status);
      await assertAllRowsMatchColumn(page, 0, (text) => normalize(text) === normalize(status));
    });
  }

  for (const priority of PRIORITY_OPTIONS) {
    test(`Filter by Priority - ${priority}`, async ({ page }) => {
      await openAllRequestsTab(page);
      await selectFilterOption(page, 'Priority', priority);
      await assertAllRowsMatchColumn(page, 7, (text) => normalize(text) === normalize(priority));
    });
  }

  for (const calamity of CALAMITY_OPTIONS) {
    test(`Filter by Calamity - ${calamity}`, async ({ page }) => {
      await openAllRequestsTab(page);
      await selectFilterOption(page, 'Calamity', calamity);
      const expected = calamity === 'YES' ? 'YES' : 'NO';
      await assertAllRowsMatchColumn(page, 8, (text) => normalize(text) === expected);
    });
  }

});
