const { test, expect } = require('@playwright/test');

test.describe('Issue #51 - Profile Availability', () => {
  test('TC_51_01 - authenticated user can access Profile Availability', async ({
    page,
  }) => {
    // Authentication is handled by auth.setup.js
    await page.goto('https://test-saayam.netlify.app', {
      waitUntil: 'domcontentloaded',
    });

    // Click the account/profile icon in the top-right corner
    const accountMenuButton = page
      .locator(
        'button[aria-label*="profile" i], ' +
        'button[aria-label*="account" i], ' +
        '[title*="profile" i], ' +
        '[title*="account" i]'
      )
      .last();

    await expect(accountMenuButton).toBeVisible({ timeout: 20000 });
    await accountMenuButton.click();

    // Click Profile from the dropdown
    const profileMenuItem = page.getByText('Profile', {
      exact: true,
    });

    await expect(profileMenuItem).toBeVisible({ timeout: 10000 });
    await profileMenuItem.click();

    // Verify the Profile page loaded
    const yourProfileButton = page.getByRole('button', {
      name: 'Your Profile',
      exact: true,
    });

    await expect(yourProfileButton).toBeVisible({ timeout: 20000 });

    // Click Availability in the left sidebar
    const availabilityOption = page
      .getByText('Availability', { exact: true })
      .first();

    await expect(availabilityOption).toBeVisible({ timeout: 20000 });
    await availabilityOption.click();

    // Verify Availability content
    await expect(
      page.getByText('Timezone', { exact: true })
    ).toBeVisible({ timeout: 15000 });

    await expect(
      page.getByText('No availability slots configured', { exact: true })
    ).toBeVisible({ timeout: 15000 });

    await expect(
      page.getByRole('button', {
        name: 'Edit',
        exact: true,
      })
    ).toBeVisible({ timeout: 15000 });
  });
});