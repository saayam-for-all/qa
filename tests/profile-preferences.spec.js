const { test, expect } = require('@playwright/test');

test.describe('Profile Preferences Page', () => {
  async function firstVisible(locator) {
    const count = await locator.count();

    for (let index = 0; index < count; index += 1) {
      const element = locator.nth(index);

      if (await element.isVisible().catch(() => false)) {
        return element;
      }
    }

    return null;
  }

  async function openAccountMenu(page) {
    const viewport = page.viewportSize();

    if (!viewport) {
      throw new Error('Unable to determine the browser viewport size.');
    }

    const candidates = page.locator(
      [
        'button',
        '[role="button"]',
        'a',
        '[tabindex="0"]',
        'svg',
      ].join(','),
    );

    const candidateCount = await candidates.count();
    const topRightCandidates = [];

    for (let index = 0; index < candidateCount; index += 1) {
      const candidate = candidates.nth(index);

      if (!(await candidate.isVisible().catch(() => false))) {
        continue;
      }

      const box = await candidate.boundingBox();

      if (!box) {
        continue;
      }

      const isNearTop = box.y < 180;
      const isNearRight = box.x > viewport.width * 0.65;

      if (isNearTop && isNearRight) {
        topRightCandidates.push({
          locator: candidate,
          x: box.x,
          y: box.y,
        });
      }
    }

    topRightCandidates.sort((first, second) => {
      if (second.x !== first.x) {
        return second.x - first.x;
      }

      return first.y - second.y;
    });

    for (const candidate of topRightCandidates) {
      await candidate.locator
        .click({
          force: true,
        })
        .catch(() => {});

      const profileMenuItem = page.getByText('Profile', {
        exact: true,
      });

      try {
        await profileMenuItem.first().waitFor({
          state: 'visible',
          timeout: 3000,
        });

        return profileMenuItem.first();
      } catch {
        await page.keyboard.press('Escape').catch(() => {});
      }
    }

    throw new Error(
      'Unable to open the account dropdown containing Profile and Logout.',
    );
  }

  async function openPreferencesPage(page) {
    await page.goto('/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await expect(page).not.toHaveURL(/login/i, {
      timeout: 30000,
    });

    await expect(
      page.getByText('Home', {
        exact: true,
      }),
    ).toBeVisible({
      timeout: 30000,
    });

    const profileMenuItem = await openAccountMenu(page);

    await expect(profileMenuItem).toBeVisible({
      timeout: 10000,
    });

    await profileMenuItem.click();

    const personalInformation = await firstVisible(
      page.getByText('Personal Information', {
        exact: true,
      }),
    );

    if (!personalInformation) {
      throw new Error(
        'Profile page did not load: Personal Information was not visible.',
      );
    }

    await expect(personalInformation).toBeVisible({
      timeout: 30000,
    });

    const preferencesSidebarItem = await firstVisible(
      page.getByText('Preferences', {
        exact: true,
      }),
    );

    if (!preferencesSidebarItem) {
      throw new Error(
        'Preferences was not found in the Profile sidebar.',
      );
    }

    await preferencesSidebarItem.click();

    await expect(
      page.getByText('Default Dashboard View', {
        exact: true,
      }),
    ).toBeVisible({
      timeout: 30000,
    });
  }

  test.beforeEach(async ({ page }) => {
    await openPreferencesPage(page);
  });

  test(
    'TC_PP_001 - authenticated user can access Profile Preferences',
    async ({ page }) => {
      await expect(
        page.getByText('Default Dashboard View', {
          exact: true,
        }),
      ).toBeVisible();

      await expect(
        page.getByRole('button', {
          name: 'Edit',
          exact: true,
        }),
      ).toBeVisible();
    },
  );

  test(
    'TC_PP_002 - Preferences page displays all expected sections',
    async ({ page }) => {
      const expectedSections = [
        'Default Dashboard View',
        'First Language Preference',
        'Second Language Preference',
        'Third Language Preference',
        'Email Communication Preference',
        'Phone Communication Preference',
        'Timezone',
        'Receive Emergency Notifications',
      ];

      for (const section of expectedSections) {
        await expect(
          page.getByText(section, {
            exact: true,
          }),
          `${section} should be displayed`,
        ).toBeVisible();
      }
    },
  );

  test(
    'TC_PP_003 - default dashboard preference is displayed',
    async ({ page }) => {
      await expect(
        page.getByText('Default Dashboard View', {
          exact: true,
        }),
      ).toBeVisible();

      await expect(
        page.getByText(/Beneficiary Dashboard/i),
      ).toBeVisible();
    },
  );

  test(
    'TC_PP_004 - language preference sections are displayed',
    async ({ page }) => {
      const languageFields = [
        'First Language Preference',
        'Second Language Preference',
        'Third Language Preference',
      ];

      for (const field of languageFields) {
        await expect(
          page.getByText(field, {
            exact: true,
          }),
        ).toBeVisible();
      }
    },
  );

  test(
    'TC_PP_005 - email communication preference is displayed',
    async ({ page }) => {
      await expect(
        page.getByText('Email Communication Preference', {
          exact: true,
        }),
      ).toBeVisible();

      await expect(
        page.getByText(/Primary Email:/i),
      ).toBeVisible();
    },
  );

  test(
    'TC_PP_006 - phone communication preference is displayed',
    async ({ page }) => {
      await expect(
        page.getByText('Phone Communication Preference', {
          exact: true,
        }),
      ).toBeVisible();

      await expect(
        page.getByText(/Primary Phone:/i),
      ).toBeVisible();
    },
  );

  test(
    'TC_PP_007 - timezone is displayed with a friendly label',
    async ({ page }) => {
      const timezoneLabel = page.getByText('Timezone', {
        exact: true,
      });

      await expect(timezoneLabel).toBeVisible();

      const timezoneSection = timezoneLabel.locator('..');

      await expect(timezoneSection).toBeVisible();

      const timezoneText = await timezoneSection.textContent();

      expect(timezoneText).toBeTruthy();

      expect(
        timezoneText,
        'Timezone value should include a readable timezone name',
      ).toMatch(/[A-Za-z]+(?:\/[A-Za-z_]+)?/);

      expect(
        timezoneText,
        'Timezone value should include UTC or a UTC offset',
      ).toMatch(/UTC(?:[+-]\d{2}:\d{2})?/);
    },
  );

  test(
    'TC_PP_008 - emergency notification preference is displayed',
    async ({ page }) => {
      await expect(
        page.getByText('Receive Emergency Notifications', {
          exact: true,
        }),
      ).toBeVisible();
    },
  );

  test(
    'TC_PP_009 - Edit button is visible and enabled',
    async ({ page }) => {
      const editButton = page.getByRole('button', {
        name: 'Edit',
        exact: true,
      });

      await expect(editButton).toBeVisible();
      await expect(editButton).toBeEnabled();
    },
  );

  test(
    'TC_PP_010 - Profile sidebar options remain visible',
    async ({ page }) => {
      const sidebarItems = [
        'Your Profile',
        'Personal Information',
        'Identity Document',
        'Change Password',
        'Organization Details',
        'Skills',
        'Availability',
        'Preferences',
        'Sign Off',
      ];

      for (const item of sidebarItems) {
        const visibleItem = await firstVisible(
          page.getByText(item, {
            exact: true,
          }),
        );

        expect(
          visibleItem,
          `${item} should be visible in the Profile sidebar`,
        ).not.toBeNull();

        await expect(visibleItem).toBeVisible();
      }
    },
  );

  test(
    'TC_PP_011 - Preferences page regression check',
    async ({ page }) => {
      const expectedContent = [
        'Default Dashboard View',
        'Email Communication Preference',
        'Phone Communication Preference',
        'Timezone',
        'Receive Emergency Notifications',
      ];

      for (const content of expectedContent) {
        await expect(
          page.getByText(content, {
            exact: true,
          }),
        ).toBeVisible();
      }

      await expect(
        page.getByRole('button', {
          name: 'Edit',
          exact: true,
        }),
      ).toBeEnabled();
    },
  );

  test.skip(
    'TC_PP_012 - changing timezone updates Availability immediately',
    async () => {
      /*
       * Requires the editable Preferences form,
       * timezone selector and Save button.
       */
    },
  );

  test.skip(
    'TC_PP_013 - notification channel toggles are disabled when master is off',
    async () => {
      /*
       * Requires the editable notification controls.
       */
    },
  );

  test.skip(
    'TC_PP_014 - at least 10 friendly timezone labels are available',
    async () => {
      /*
       * Requires the timezone dropdown options.
       */
    },
  );

  test.skip(
    'TC_PP_015 - valid email verification code succeeds',
    async () => {
      // Requires the email verification UI and a valid test code.
    },
  );

  test.skip(
    'TC_PP_016 - expired email verification code is rejected',
    async () => {
      // Requires an expired verification code.
    },
  );

  test.skip(
    'TC_PP_017 - incorrect email verification code is rejected',
    async () => {
      // Requires access to the email verification flow.
    },
  );

  test.skip(
    'TC_PP_018 - phone OTP is delivered successfully',
    async () => {
      // Requires test SMS or OTP service access.
    },
  );

  test.skip(
    'TC_PP_019 - incorrect phone OTP is rejected',
    async () => {
      // Requires access to the phone OTP flow.
    },
  );

  test.skip(
    'TC_PP_020 - phone OTP can be resent',
    async () => {
      // Requires test OTP delivery support.
    },
  );

  test.skip(
    'TC_PP_021 - verification badge appears after successful verification',
    async () => {
      // Requires the complete verification flow.
    },
  );

  test.skip(
    'TC_PP_022 - verification badge does not appear after failed verification',
    async () => {
      // Requires the complete verification flow.
    },
  );
});