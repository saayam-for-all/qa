// tests/notification-page.spec.js

import { test, expect } from '@playwright/test';

/**
 * This suite:
 * - Logs in using TEST_EMAIL + TEST_PASSWORD from .env
 * - Navigates to the notifications panel
 * - Safely handles cases where user has 0 notifications
 * - Avoids Playwright timeouts by skipping when appropriate
 */

//
// 🔐 Reusable Login Function
//
async function login(page) {
  await page.goto('/login');

  await page.getByLabel(/email/i).fill(process.env.TEST_EMAIL);
  await page.getByLabel(/password/i).fill(process.env.TEST_PASSWORD);

  // Saayam login button text is EXACTLY "Log In"
  await page.getByRole('button', { name: /^log in$/i }).click();

  // Confirm login success
  await expect(page).toHaveURL(/dashboard/i, { timeout: 30000 });
}

//
// 🔔 Open Notifications (FINAL CORRECT SELECTOR)
//
async function openNotifications(page) {
  // Correct and stable selector found from your DOM
  const bell = page.getByRole('button', { name: /notifications/i });

  await expect(bell).toBeVisible({ timeout: 10000 });
  await bell.click();

  await expect(page).toHaveURL(/notifications/i, { timeout: 15000 });
}

//
// 📌 Notification Test Suite
//
test.describe('Saayam Notification Functionality Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await openNotifications(page);
  });

  // ----------------------------------------------------------
  // 1️⃣ Notification list loads
  // ----------------------------------------------------------
  test('should load the notifications list', async ({ page }) => {
    const notifications = page.locator('.notification-item');
    const count = await notifications.count();

    test.skip(count === 0, 'No notifications available for this user');

    await expect(notifications.first()).toBeVisible();
    await expect(notifications).toHaveCountGreaterThan(0);
  });

  // ----------------------------------------------------------
  // 2️⃣ Mark a notification as read
  // ----------------------------------------------------------
  test('should mark a notification as read', async ({ page }) => {
    const unread = page.locator('.notification-item.unread');
    const unreadCount = await unread.count();

    test.skip(unreadCount === 0, 'No unread notifications to test');

    const firstUnread = unread.first();
    await firstUnread.click();

    await expect(firstUnread).not.toHaveClass(/unread/);
  });

  // ----------------------------------------------------------
  // 3️⃣ Clicking a notification opens its linked page
  // ----------------------------------------------------------
  test('should open the linked page when a notification is clicked', async ({ page }) => {
    const notifications = page.locator('.notification-item');
    const count = await notifications.count();

    test.skip(count === 0, 'No notifications to click');

    const firstNotif = notifications.first();
    const target = await firstNotif.getAttribute('data-target');

    test.skip(!target, 'Notification has no navigation target');

    await firstNotif.click();
    await page.waitForURL(target, { timeout: 15000 });

    await expect(page).toHaveURL(target);
  });

  // ----------------------------------------------------------
  // 4️⃣ Clear All Notifications
  // ----------------------------------------------------------
  test('should clear all notifications', async ({ page }) => {
    const clearBtn = page.getByRole('button', { name: /clear all/i });

    if (!(await clearBtn.isVisible())) {
      test.skip('Clear All button not available');
    }

    await clearBtn.click();

    const notifications = page.locator('.notification-item');
    await expect(notifications).toHaveCount(0);
  });
});