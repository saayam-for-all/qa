import { test as setup } from '@playwright/test';

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
    .getByRole('button', {
      name: 'Log In',
      exact: true,
    })
    .last()
    .click();

  await page.waitForURL(
    url => !url.pathname.includes('/login'),
    {
      timeout: 60000,
    }
  );

  await page.context().storageState({
    path: authFile,
  });
});