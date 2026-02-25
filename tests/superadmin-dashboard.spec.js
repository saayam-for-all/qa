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
  const fillAddressAndReturnToDashboard = async (page) => {
    await page.getByRole('link', { name: /edit profile/i }).click();
    await page.waitForURL('**/profile**');

    const personalInfoTab = page.getByRole('link', { name: /personal information/i });
    if (await personalInfoTab.isVisible().catch(() => false)) {
      await personalInfoTab.click();
    }

    const editButton = page.getByRole('button', { name: /^edit$/i }).first();
    if (await editButton.isVisible().catch(() => false)) {
      await editButton.click();
    }

    await page.locator('label:has-text("Street Address")').first().locator('..').locator('input').fill('1049 W Adams St');
    await page.locator('label:has-text("City")').first().locator('..').locator('input').fill('Chicago');

    const stateInput = page.locator('label:has-text("State")').first().locator('..').locator('input');
    await stateInput.click();
    await stateInput.fill('Illinois');
    await stateInput.press('Enter');

    await page.locator('label:has-text("Zip Code")').first().locator('..').locator('input').fill('60608');
    await page.getByRole('button', { name: /^save$/i }).click();

    const backToDashboard = page.getByRole('button', { name: /back to dashboard/i });
    await backToDashboard.click();
    await page.waitForURL('**/dashboard**');
    if (!/view=superAdmin/.test(page.url())) {
      await page
        .locator('select')
        .filter({ has: page.locator('option[value="superAdmin"]') })
        .first()
        .selectOption('superAdmin');
      await expect(page).toHaveURL(/view=superAdmin/);
    }
  };
  const openDashboardLinkWithAddressPrereq = async (page, linkName, headingMatcher) => {
    await page.getByRole('link', { name: linkName }).click();

    const targetVisible = await page.getByRole('heading', { name: headingMatcher }).isVisible().catch(() => false);
    if (targetVisible) return;

    const addressWarningVisible = await page
      .getByText(/Please add your address in Profile to continue/i)
      .isVisible()
      .catch(() => false);

    if (addressWarningVisible) {
      await fillAddressAndReturnToDashboard(page);
      await page.getByRole('link', { name: linkName }).click();
    }

    await expect(page.getByRole('heading', { name: headingMatcher })).toBeVisible();
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

    await page.getByRole('banner').getByRole('button', { name: 'Log In' }).click();
    await page.getByRole('main').getByRole('textbox', { name: 'Email' }).fill(validCredentials.email);
    await page.getByRole('main').getByRole('textbox', { name: 'Password' }).fill(validCredentials.password);
    await page.getByRole('main').getByRole('button', { name: 'Log In' }).click();

    await page.waitForURL('**/dashboard');
    await page.locator('select').filter({ has: page.locator('option[value="superAdmin"]') }).first().selectOption('superAdmin');

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

  test('Rows per view updates summary and visible row count', async ({ page }) => {
    await openAllRequestsTab(page);

    const rowsPerView = page.locator('select').filter({ hasText: /rows/i }).first();
    const bodyRows = page.locator('table[data-testid="table"] tbody tr');
    const summary = page.getByText(/Showing data \d+-\d+ of \d+ entries/i).first();

    const getTotalEntries = async () => {
      const text = (await summary.innerText()).trim();
      const match = text.match(/of\s+(\d+)\s+entries/i);
      return match ? Number(match[1]) : 0;
    };

    const expectRowsPerView = async (size) => {
      await rowsPerView.selectOption({ label: `${size} rows` });
      const total = await getTotalEntries();
      const expectedVisible = Math.min(size, total);

      await expect(summary).toContainText(new RegExp(`Showing data 1-${expectedVisible} of ${total} entries`, 'i'));
      await expect(bodyRows).toHaveCount(expectedVisible);
    };

    await expectRowsPerView(10);
    await expectRowsPerView(20);
    await expectRowsPerView(5);
  });

  test('Application Analytics - Requests tab loads core charts and controls', async ({ page }) => {
    await page.getByRole('button', { name: /^analytics$/i }).click();
    await page.getByRole('button', { name: /^application analytics$/i }).click();
    await page.getByRole('button', { name: /^requests$/i }).click();

    await expect(page.getByText('Request Volume Trend')).toBeVisible();
    await expect(page.getByText('Requests by Category & Region')).toBeVisible();

    const timeFilters = ['7D', '30D', '1Y', 'All'];
    for (const filter of timeFilters) {
      const filterButton = page.getByRole('button', { name: new RegExp(`^${filter}$`, 'i') }).first();
      await filterButton.click();
      await expect(page.getByText('Request Volume Trend')).toBeVisible();
    }

    await expect(page.getByRole('button', { name: /^custom$/i })).toBeVisible();
    await expect(page.locator('select').filter({ has: page.locator('option', { hasText: 'All Categories' }) }).first()).toBeVisible();
    await expect(page.locator('select').filter({ has: page.locator('option', { hasText: 'All Countries' }) }).first()).toBeVisible();
    await expect(page.locator('select').filter({ has: page.locator('option', { hasText: /Total/i }) }).first()).toBeVisible();
    await expect(page.getByText(/Top 5:/i)).toBeVisible();
  });

  test('Application Analytics - KPI tab loads charts and controls', async ({ page }) => {
    await page.getByRole('button', { name: /^analytics$/i }).click();
    await page.getByRole('button', { name: /^application analytics$/i }).click();
    await page.getByRole('button', { name: /^kpi$/i }).click();

    await expect(page.getByText('Request Status Distribution')).toBeVisible();
    await expect(page.getByText('Average Resolution Time by Category')).toBeVisible();

    await expect(page.getByRole('button', { name: /^table view$/i })).toBeVisible();
    await expect(page.getByText(/SLA Target:/i)).toBeVisible();
    await expect(page.getByText(/Warning:/i)).toBeVisible();
  });

  test('Infrastructure Analytics - loads and shows cloudwatch link', async ({ page }) => {
    await page.getByRole('button', { name: /^analytics$/i }).click();
    await page.getByRole('button', { name: /^infrastructure$/i }).click();

    await expect(page.getByText(/To view infrastructure related analytics from AWS CloudWatch/i)).toBeVisible();

    const cloudWatchLink = page.getByRole('link', { name: /click here/i });
    await expect(cloudWatchLink).toBeVisible();
    await expect(cloudWatchLink).toHaveAttribute('href', /cloudwatch|aws/i);
  });

  test('Google Analytics - loads and switches embedded reports', async ({ page }) => {
    await page.getByRole('button', { name: /^analytics$/i }).click();
    await page.getByRole('button', { name: /^google analytics$/i }).click();

    const reportFrame = page.locator('main iframe').first();
    const views = ['Overview', 'Detailed Reports', 'Page Views'];

    for (const view of views) {
      await page.getByRole('button', { name: new RegExp(`^${view}$`, 'i') }).click();
      await expect(reportFrame).toBeVisible();
      await expect(reportFrame).toHaveAttribute('title', new RegExp(`^${view}$`, 'i'));
      await expect(reportFrame).toHaveAttribute('src', /lookerstudio\.google\.com\/embed\/reporting\//i);
    }
  });

  test('Application Analytics - Beneficiaries tab loads charts and controls', async ({ page }) => {
    await page.getByRole('button', { name: /^analytics$/i }).click();
    await page.getByRole('button', { name: /^application analytics$/i }).click();
    await page.getByRole('button', { name: /^beneficiaries$/i }).click();

    await expect(page.getByText('Beneficiary Growth Trend')).toBeVisible();
    await expect(page.getByText('Beneficiaries by Country')).toBeVisible();
    await expect(page.getByText('Top 10 Countries Summary')).toBeVisible();

    const statusSelect = page
      .locator('select')
      .filter({ has: page.locator('option', { hasText: 'Active Only' }) })
      .first();

    await statusSelect.selectOption({ label: 'Active Only' });
    await expect(page.getByText('Beneficiary Growth Trend')).toBeVisible();
    await statusSelect.selectOption({ label: 'Inactive Only' });
    await expect(page.getByText('Beneficiary Growth Trend')).toBeVisible();
    await statusSelect.selectOption({ label: 'All Beneficiaries' });

    const countryScope = page
      .locator('div')
      .filter({ has: page.getByRole('heading', { name: 'Beneficiaries by Country' }) })
      .first();
    await expect(countryScope.getByRole('button', { name: /^bar$/i })).toBeVisible();
    await expect(countryScope.getByRole('button', { name: /^map$/i })).toBeVisible();
    await expect(countryScope.getByRole('checkbox', { name: /top 10 only/i })).toBeVisible();
  });

  test('Application Analytics - Volunteers tab loads charts and controls', async ({ page }) => {
    await page.getByRole('button', { name: /^analytics$/i }).click();
    await page.getByRole('button', { name: /^application analytics$/i }).click();
    await page.getByRole('button', { name: /^volunteers$/i }).click();

    await expect(page.getByText('Volunteer Activity Trend')).toBeVisible();
    await expect(page.getByText('Volunteers by Location')).toBeVisible();

    await expect(page.getByText(/Churn:/i)).toBeVisible();
    await expect(page.getByText(/Retention:/i)).toBeVisible();

    const chartTypeSelect = page
      .locator('select')
      .filter({ has: page.locator('option', { hasText: 'Treemap' }) })
      .first();
    const skillsSelect = page
      .locator('select')
      .filter({ has: page.locator('option', { hasText: 'All Skills' }) })
      .first();

    await chartTypeSelect.selectOption({ label: 'Treemap' });
    await chartTypeSelect.selectOption({ label: 'Table' });
    await chartTypeSelect.selectOption({ label: 'Bar Chart' });

    await expect(skillsSelect).toContainText(/All Skills/i);
  });

  test('Navigation - Create Help Request form', async ({ page }) => {
    await openDashboardLinkWithAddressPrereq(page, 'Create Help Request', 'Create Help Request');
    await expect(page).toHaveURL(/\/request/);
  });

  test('Navigation - Become a Volunteer form', async ({ page }) => {
    await openDashboardLinkWithAddressPrereq(page, 'Become a Volunteer', /Volunteer Agreement for/i);
    await expect(page).toHaveURL(/\/promote-to-volunteer/);
  });
});


