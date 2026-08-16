const { test, expect } = require('@playwright/test');

test.describe(
  'Issue #72 - Communication with Users through WhatsApp',
  () => {

    async function openProfile(page) {
      await page.goto('/profile', {
        waitUntil: 'domcontentloaded',
      });

      await expect(page).toHaveURL(/\/profile/);

      await expect(
        page.getByText('Phone Number', { exact: true })
      ).toBeVisible();
    }


    function getWhatsAppIcon(page) {
      return page.getByRole('img', {
        name: 'WhatsApp',
      });
    }


    test(
      'TC-001 - WhatsApp text icon is visible on the user profile page',
      async ({ page }) => {

        await openProfile(page);

        const whatsappIcon = getWhatsAppIcon(page);

        await expect(whatsappIcon).toBeVisible();
      }
    );


    test(
      'TC-002 - Clicking WhatsApp icon opens WhatsApp chat with user number',
      async ({ page }) => {

        await openProfile(page);

        const whatsappIcon = getWhatsAppIcon(page);

        await expect(whatsappIcon).toBeVisible();

        /*
         * Clicking the WhatsApp image opens a new tab.
         */
        const [whatsappPage] = await Promise.all([
          page.waitForEvent('popup'),
          whatsappIcon.click(),
        ]);

        await whatsappPage.waitForLoadState(
          'domcontentloaded'
        );

        /*
         * Verify that WhatsApp was opened.
         */
        await expect(whatsappPage).toHaveURL(
          /api\.whatsapp\.com|web\.whatsapp\.com|wa\.me/i
        );

        /*
         * Verify that WhatsApp opened a chat target.
         *
         * The user does not need to already be logged
         * into WhatsApp Web for this validation.
         */
        await expect(
          whatsappPage.getByText(
            /Chat on WhatsApp with/i
          )
        ).toBeVisible();

        await whatsappPage.close();
      }
    );


    test.skip(
      'TC-003 - WhatsApp call button is visible on the user profile page',
      async () => {
        /*
         * ON HOLD
         *
         * Separate WhatsApp voice-call control is not
         * currently available on the Saayam profile page.
         */
      }
    );


    test.skip(
      'TC-004 - Clicking WhatsApp call button initiates a WhatsApp voice call',
      async () => {
        /*
         * ON HOLD
         *
         * WhatsApp voice-call functionality cannot
         * currently be validated through the Saayam UI.
         */
      }
    );


    test.skip(
      'TC-005 - WhatsApp video button is visible on the user profile page',
      async () => {
        /*
         * ON HOLD
         *
         * Separate WhatsApp video-call control is not
         * currently available on the Saayam profile page.
         */
      }
    );


    test.skip(
      'TC-006 - Clicking WhatsApp video button initiates a WhatsApp video call',
      async () => {
        /*
         * ON HOLD
         *
         * WhatsApp video-call functionality cannot
         * currently be validated through the Saayam UI.
         */
      }
    );


    test.skip(
      'TC-007 - WhatsApp options unavailable when user has no phone number',
      async () => {
        /*
         * ON HOLD
         *
         * Requires a known test profile without
         * a registered phone number.
         */
      }
    );


    test.skip(
      'TC-008 - Unassigned volunteer cannot see WhatsApp communication controls',
      async () => {
        /*
         * ON HOLD
         *
         * Requires:
         * - a request assigned to another volunteer
         * - credentials for an unassigned volunteer
         */
      }
    );


    test(
      'TC-009 - Unauthenticated user cannot access WhatsApp communication options',
      async ({ browser }) => {

        const context = await browser.newContext();

        const page = await context.newPage();

        await page.goto(
          'https://test-saayam.netlify.app/profile',
          {
            waitUntil: 'domcontentloaded',
          }
        );

        /*
         * Expected behavior according to TC-009:
         * unauthenticated users should be redirected
         * to the login page.
         *
         * Current observed application behavior stays
         * on /profile, so this test may legitimately fail.
         */
        await expect(page).toHaveURL(/login/i);

        const whatsappIcon = page.getByRole('img', {
          name: 'WhatsApp',
        });

        await expect(whatsappIcon).toHaveCount(0);

        await context.close();
      }
    );


    test(
      'TC-010 - WhatsApp text option works across supported browsers',
      async ({ page }) => {

        await openProfile(page);

        const whatsappIcon = getWhatsAppIcon(page);

        await expect(whatsappIcon).toBeVisible();
      }
    );

  }
);