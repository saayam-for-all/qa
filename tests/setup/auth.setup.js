const { test: setup, expect } = require('@playwright/test');

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  setup.setTimeout(60000);

  const email = process.env.SAAYAM_EMAIL;
  const password = process.env.SAAYAM_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'SAAYAM_EMAIL and SAAYAM_PASSWORD environment variables are required.'
    );
  }

  await page.goto('/login', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await page
    .getByPlaceholder(/email/i)
    .fill(email);

  await page
    .getByPlaceholder(/password/i)
    .fill(password);

  await page
    .getByRole('main')
    .getByRole('button', {
      name: 'Log In',
      exact: true,
    })
    .click();

  await expect(page).toHaveURL(/\/dashboard\/?$/, {
    timeout: 15000,
  });

  console.log('POST-LOGIN URL:', page.url());

  await expect(
    page
      .getByText('Create Help Request', {
        exact: true,
      })
      .first()
  ).toBeVisible({
    timeout: 15000,
  });

  await expect(
    page
      .getByText('My Requests', {
        exact: true,
      })
      .first()
  ).toBeVisible({
    timeout: 15000,
  });

  await page.context().storageState({
    path: authFile,
  });

  console.log('AUTH STATE SAVED:', authFile);
});