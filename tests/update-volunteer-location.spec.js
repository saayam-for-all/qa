const { test, expect } = require('@playwright/test');

test.describe.serial(
  'Update Volunteer Location - Personal Information',
  () => {
    const updatedLocation = {
      streetAddress: '2520 Avent Ferry Road',
      streetAddress2: 'apt 207',
      city: 'Raleigh',
      state: 'North Carolina',
      zipCode: '27606',
    };

    async function openPersonalInformation(page) {
      await page.goto('/profile', {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });

      await expect(page).toHaveURL(/profile/i);

      await page
        .getByRole('button', {
          name: 'Personal Information',
          exact: true,
        })
        .last()
        .click();

      await expect(
        page.getByText('Street Address', { exact: true })
      ).toBeVisible({
        timeout: 20000,
      });
    }

    async function enterEditMode(page) {
      const editButton = page.getByRole('button', {
        name: /^edit$/i,
      });

      await expect(editButton).toBeVisible({
        timeout: 20000,
      });

      await editButton.click();

      await expect(
        page.locator('input[name="streetAddress"]')
      ).toBeVisible({
        timeout: 20000,
      });

      await expect(
        page.getByRole('button', {
          name: /^save$/i,
        })
      ).toBeVisible();
    }

    async function selectState(page, stateName) {
      const stateInput = page.locator('#react-select-3-input');

      await stateInput.click();
      await stateInput.fill(stateName);

      const stateOption = page.getByRole('option', {
        name: stateName,
        exact: true,
      });

      await expect(stateOption).toBeVisible({
        timeout: 10000,
      });

      await stateOption.click();
    }

    async function fillLocationForm(page) {
      await page
        .locator('input[name="streetAddress"]')
        .fill(updatedLocation.streetAddress);

      await page
        .locator('input[name="streetAddress2"]')
        .fill(updatedLocation.streetAddress2);

      await page
        .locator('input[name="city"]')
        .fill(updatedLocation.city);

      await selectState(page, updatedLocation.state);

      await page
        .locator('input[name="zipCode"]')
        .fill(updatedLocation.zipCode);
    }

    async function verifySavedLocation(page) {
      await expect(
        page.getByText(updatedLocation.streetAddress, {
          exact: true,
        })
      ).toBeVisible({
        timeout: 20000,
      });

      await expect(
        page.getByText(updatedLocation.streetAddress2, {
          exact: true,
        })
      ).toBeVisible();

      await expect(
        page.getByText(updatedLocation.city, {
          exact: true,
        })
      ).toBeVisible();

      await expect(
        page.getByText(updatedLocation.state, {
          exact: true,
        })
      ).toBeVisible();

      await expect(
        page.getByText(updatedLocation.zipCode, {
          exact: true,
        })
      ).toBeVisible();
    }

    test.beforeEach(async ({ page }) => {
      await openPersonalInformation(page);
    });

    test(
      'TC_LOC_001 - Personal Information displays volunteer location fields',
      async ({ page }) => {
        await expect(
          page.getByText('Street Address', { exact: true })
        ).toBeVisible();

        await expect(
          page.getByText('Street Address 2', { exact: true })
        ).toBeVisible();

        await expect(
          page.getByText('City', { exact: true })
        ).toBeVisible();

        await expect(
          page.getByText('State', { exact: true })
        ).toBeVisible();

        await expect(
          page.getByText('Country', { exact: true })
        ).toBeVisible();

        await expect(
          page.getByText('Zip Code', { exact: true })
        ).toBeVisible();

        await expect(
          page.getByRole('button', {
            name: /^edit$/i,
          })
        ).toBeVisible();
      }
    );

    test(
      'TC_LOC_002 - Edit opens editable volunteer location fields',
      async ({ page }) => {
        await enterEditMode(page);

        await expect(
          page.locator('input[name="streetAddress"]')
        ).toBeVisible();

        await expect(
          page.locator('input[name="streetAddress2"]')
        ).toBeVisible();

        await expect(
          page.locator('input[name="city"]')
        ).toBeVisible();

        await expect(
          page.locator('#react-select-3-input')
        ).toBeVisible();

        const countryInput = page.locator('#react-select-4-input');

        await expect(countryInput).toBeDisabled();

        await expect(
          page.locator('input[name="zipCode"]')
        ).toBeVisible();

        await expect(
          page.getByRole('button', {
            name: /^save$/i,
          })
        ).toBeVisible();

        await expect(
          page.getByRole('button', {
            name: /^cancel$/i,
          })
        ).toBeVisible();
      }
    );

    test(
      'TC_LOC_003 - Cancel discards unsaved location changes',
      async ({ page }) => {
        await enterEditMode(page);

        const streetAddress = page.locator(
          'input[name="streetAddress"]'
        );

        const temporaryAddress = '999 Temporary Test Address';

        await streetAddress.fill(temporaryAddress);

        await expect(streetAddress).toHaveValue(
          temporaryAddress
        );

        await page
          .getByRole('button', {
            name: /^cancel$/i,
          })
          .click();

        await expect(
          page.getByRole('button', {
            name: /^edit$/i,
          })
        ).toBeVisible({
          timeout: 20000,
        });

        await expect(
          page.getByText(temporaryAddress, {
            exact: true,
          })
        ).toHaveCount(0);
      }
    );

    test(
      'TC_LOC_004 - Volunteer can update and save location information',
      async ({ page }) => {
        await enterEditMode(page);

        await fillLocationForm(page);

        await expect(
          page.locator('input[name="streetAddress"]')
        ).toHaveValue(updatedLocation.streetAddress);

        await expect(
          page.locator('input[name="streetAddress2"]')
        ).toHaveValue(updatedLocation.streetAddress2);

        await expect(
          page.locator('input[name="city"]')
        ).toHaveValue(updatedLocation.city);

        await expect(
          page.locator('input[name="zipCode"]')
        ).toHaveValue(updatedLocation.zipCode);

        await page
          .getByRole('button', {
            name: /^save$/i,
          })
          .click();

        await expect(
          page.getByRole('button', {
            name: /^edit$/i,
          })
        ).toBeVisible({
          timeout: 20000,
        });

        await verifySavedLocation(page);
      }
    );

    test(
      'TC_LOC_005 - Saved volunteer location persists after refresh',
      async ({ page }) => {
        await enterEditMode(page);

        await fillLocationForm(page);

        await page
          .getByRole('button', {
            name: /^save$/i,
          })
          .click();

        await expect(
          page.getByRole('button', {
            name: /^edit$/i,
          })
        ).toBeVisible({
          timeout: 20000,
        });

        await page.reload({
          waitUntil: 'domcontentloaded',
          timeout: 60000,
        });

        await page
          .getByRole('button', {
            name: 'Personal Information',
            exact: true,
          })
          .last()
          .click();

        await expect(
          page.getByText('Street Address', {
            exact: true,
          })
        ).toBeVisible({
          timeout: 20000,
        });

        await verifySavedLocation(page);
      }
    );
  }
);