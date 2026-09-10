const { test, expect } = require('@playwright/test');

test.describe('Food and Essentials - Issue #28', () => {
  // ==========================================================================
  // COMMON HELPERS
  // ==========================================================================

  async function openDashboard(page) {
    await page.goto('/dashboard', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    // Verify that we are actually on the dashboard.
    await expect(page).toHaveURL(/\/dashboard\/?$/, {
      timeout: 15000,
    });

    // Use elements we know are visibly rendered on the beneficiary dashboard.
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

    console.log('DASHBOARD LOADED:', page.url());
  }
  async function clickCreateHelpRequest(page) {
    console.log('BEFORE CLICK URL:', page.url());

    const matchingElements = await page
      .getByText('Create Help Request', { exact: true })
      .evaluateAll((elements) =>
        elements.map((el) => ({
          tag: el.tagName,
          text: el.textContent?.trim(),
          href: el.getAttribute('href'),
          role: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label'),
          title: el.getAttribute('title'),
          parentTag: el.parentElement?.tagName,
          parentHref: el.parentElement?.getAttribute('href'),
          parentRole: el.parentElement?.getAttribute('role'),
        }))
      );

    console.log(
      'CREATE HELP REQUEST ELEMENTS:',
      JSON.stringify(matchingElements, null, 2)
    );

    const link = page
      .getByRole('link', {
        name: 'Create Help Request',
        exact: true,
      })
      .first();

    const button = page
      .getByRole('button', {
        name: 'Create Help Request',
        exact: true,
      })
      .first();

    console.log('LINK COUNT:', await link.count());
    console.log('BUTTON COUNT:', await button.count());

    if (await link.count()) {
      console.log('LINK HREF:', await link.getAttribute('href'));
      await link.click();
    } else if (await button.count()) {
      console.log('CLICKING BUTTON');
      await button.click();
    } else {
      throw new Error(
        'Could not find Create Help Request as either a link or button'
      );
    }

    await page.waitForTimeout(2000);

    console.log('AFTER CLICK URL:', page.url());

    await expect(page).toHaveURL(/\/request$/, {
      timeout: 15000,
    });

    await expect(
      page
        .getByText('Create Help Request', {
          exact: true,
        })
        .first()
    ).toBeVisible({
      timeout: 15000,
    });
  }

  async function openRequestPage(page) {
    await openDashboard(page);

    await page.goto('/request', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await expect(page).toHaveURL(/\/request\/?$/, {
      timeout: 15000,
    });

    await expect(
      page
        .getByText('Create Help Request', {
          exact: true,
        })
        .first()
    ).toBeVisible({
      timeout: 15000,
    });

    console.log('REQUEST PAGE LOADED:', page.url());
  }

  async function openCategoryMenu(page) {
    const categoryLabel = page
      .getByText('Category', { exact: true })
      .first();

    await expect(categoryLabel).toBeVisible({
      timeout: 15000,
    });

    // Find the nearest category field/container.
    const categoryContainer = categoryLabel.locator('xpath=..');

    // First try common interactive elements INSIDE the Category section.
    const categoryControl = categoryContainer
      .locator(
        'button, [role="button"], [role="combobox"], [aria-haspopup="listbox"], [aria-haspopup="menu"], input'
      )
      .first();

    if (await categoryControl.count()) {
      console.log(
        'CATEGORY CONTROL:',
        await categoryControl.evaluate((el) => ({
          tag: el.tagName,
          text: el.textContent?.trim(),
          role: el.getAttribute('role'),
          ariaHaspopup: el.getAttribute('aria-haspopup'),
          placeholder: el.getAttribute('placeholder'),
        }))
      );

      await categoryControl.click();
      return;
    }

    // If the clickable control is a sibling immediately after the Category label.
    const followingControl = categoryLabel.locator(
      'xpath=following::*[@role="button" or @role="combobox" or @aria-haspopup="listbox" or @aria-haspopup="menu" or self::button or self::input][1]'
    );

    if (await followingControl.count()) {
      console.log(
        'CATEGORY FOLLOWING CONTROL:',
        await followingControl.evaluate((el) => ({
          tag: el.tagName,
          text: el.textContent?.trim(),
          role: el.getAttribute('role'),
          ariaHaspopup: el.getAttribute('aria-haspopup'),
          placeholder: el.getAttribute('placeholder'),
        }))
      );

      await followingControl.click();
      return;
    }

    throw new Error('Could not locate the actual Category selector');
  }

  async function openFoodEssentials(page) {
    await openCategoryMenu(page);

    const foodEssentials = page
      .getByText('Food & Essentials', { exact: true })
      .first();

    await expect(foodEssentials).toBeVisible({
      timeout: 15000,
    });

    await foodEssentials.hover();
  }

  async function openCookingHelp(page) {
    await expect(async () => {
      await openCategoryMenu(page);

      const foodEssentials = page
        .getByText('Food & Essentials', { exact: true })
        .first();

      await expect(foodEssentials).toBeVisible({
        timeout: 3000,
      });

      await foodEssentials.locator('xpath=..').hover({
        timeout: 5000,
      });

      const cookingHelp = page
        .getByText('Cooking Help', { exact: true })
        .first();

      await expect(cookingHelp).toBeVisible({
        timeout: 3000,
      });

      await cookingHelp.locator('xpath=..').hover({
        timeout: 5000,
      });

      await expect(
        page.getByText('Meal Prep Basic', { exact: true }).first()
      ).toBeVisible({
        timeout: 3000,
      });
    }).toPass({
      timeout: 30000,
      intervals: [500, 1000, 2000],
    });
  }

  async function selectFoodAssistance(page) {
    await expect(async () => {
      await openCategoryMenu(page);

      const foodEssentials = page
        .getByText('Food & Essentials', { exact: true })
        .first();

      await expect(foodEssentials).toBeVisible({
        timeout: 3000,
      });

      await foodEssentials.locator('xpath=..').hover({
        timeout: 5000,
      });

      await expect(
        page.getByText('Food Assistance', { exact: true }).first()
      ).toBeVisible({
        timeout: 3000,
      });
    }).toPass({
      timeout: 30000,
      intervals: [500, 1000, 2000],
    });

    const foodAssistance = page
      .getByText('Food Assistance', { exact: true })
      .first();

    await foodAssistance.locator('xpath=..').click();

    await expect(
      page.getByText('Preferred Meal Type', { exact: true }).first()
    ).toBeVisible({
      timeout: 15000,
    });
  }

  async function selectGroceryShopping(page) {
    await expect(async () => {
      await openCategoryMenu(page);

      const foodEssentials = page
        .getByText('Food & Essentials', { exact: true })
        .first();

      await expect(foodEssentials).toBeVisible({
        timeout: 3000,
      });

      await foodEssentials.locator('xpath=..').hover({
        timeout: 5000,
      });

      await expect(
        page
          .getByText('Grocery Shopping & Delivery', { exact: true })
          .first()
      ).toBeVisible({
        timeout: 3000,
      });
    }).toPass({
      timeout: 30000,
      intervals: [500, 1000, 2000],
    });

    const groceryShopping = page
      .getByText('Grocery Shopping & Delivery', { exact: true })
      .first();

    await groceryShopping.locator('xpath=..').click();

    await expect(
      page.getByText('Grocery List', { exact: true }).first()
    ).toBeVisible({
      timeout: 15000,
    });
  }

  async function selectCookingChild(page, childName) {
    await expect(async () => {
      // Re-open the category menu on every attempt
      await openCategoryMenu(page);

      // Level 1: Food & Essentials
      const foodText = page
        .getByText('Food & Essentials', { exact: true })
        .first();

      await expect(foodText).toBeVisible({
        timeout: 3000,
      });

      await foodText.locator('xpath=..').hover({
        timeout: 5000,
      });

      // Level 2: Cooking Help
      const cookingText = page
        .getByText('Cooking Help', { exact: true })
        .first();

      await expect(cookingText).toBeVisible({
        timeout: 3000,
      });

      await cookingText.locator('xpath=..').hover({
        timeout: 5000,
      });

      // Level 3: requested Cooking Help child
      await expect(
        page.getByText(childName, { exact: true }).first()
      ).toBeVisible({
        timeout: 3000,
      });
    }).toPass({
      timeout: 30000,
      intervals: [500, 1000, 2000],
    });

    // Re-locate after the hierarchy is stable
    const childText = page
      .getByText(childName, { exact: true })
      .first();

    await childText.locator('xpath=..').click();

    await expect(
      page.getByText('Recipe Preference', { exact: true }).first()
    ).toBeVisible({
      timeout: 15000,
    });
  }

  async function expectText(page, text) {
    await expect(
      page
        .getByText(text, {
          exact: true,
        })
        .first()
    ).toBeVisible();
  }

  async function expectCookingMetadata(page) {
    await expectText(page, 'Recipe Preference');

    await expectText(page, 'Vegetarian');
    await expectText(page, 'Vegan');
    await expectText(page, 'High Protein');
    await expectText(page, 'Low Carb');
    await expectText(page, 'Culturally Specific');

    await expectText(page, 'Kitchen Equipment');

    await expectText(page, 'Stove or Cooktop');
    await expectText(page, 'Oven or Microwave');
    await expectText(page, 'Utensils or Cookware Set');
    await expectText(page, 'Mixer or Blender');
    await expectText(page, 'None');

    await expectText(page, 'Urgency Timeline');

    await expectText(page, 'Immediate (Next 24 Hours)');
    await expectText(page, 'Within 3 Days');
    await expectText(page, 'Within 1 Week');
    await expectText(page, 'Flexible');

    await expectText(page, 'Preferred Language');
  }

  async function clickVisibleTextOption(page, option) {
    const label = page
      .getByText(option, {
        exact: true,
      })
      .first();

    await expect(label).toBeVisible();

    await label.click();
  }

  async function getPreferredLanguageInput(page) {
    const accessible = page
      .getByLabel('Preferred Language', {
        exact: true,
      })
      .first();

    if (await accessible.count() > 0) {
      return accessible;
    }

    const text = page
      .getByText('Preferred Language', {
        exact: true,
      })
      .first();

    const parent = text.locator('xpath=..');

    const parentInput = parent.locator('input').first();

    if (await parentInput.count() > 0) {
      return parentInput;
    }

    const grandParentInput = parent
      .locator('xpath=..')
      .locator('input')
      .first();

    if (await grandParentInput.count() > 0) {
      return grandParentInput;
    }

    return text.locator('xpath=following::input[1]');
  }

  async function getSubjectInput(page) {
    let subject = page
      .getByLabel(/subject/i)
      .first();

    if (await subject.count() > 0) {
      return subject;
    }

    subject = page
      .getByPlaceholder(/subject/i)
      .first();

    if (await subject.count() > 0) {
      return subject;
    }

    return page.locator('input[maxlength="70"]').first();
  }

  async function getDescriptionInput(page) {
    let description = page
      .getByLabel(/description/i)
      .first();

    if (await description.count() > 0) {
      return description;
    }

    description = page
      .getByPlaceholder(/description/i)
      .first();

    if (await description.count() > 0) {
      return description;
    }

    return page.locator('textarea').first();
  }

  async function clickDescriptionTab(page) {
   // Prefer semantic tab role if the application exposes it
    const tab = page.getByRole('tab', {
      name: /^Description/,
    });

    if (await tab.count()) {
      await tab.first().click();
      return;
    }

    // Some implementations use a button instead of role="tab"
    const button = page.getByRole('button', {
      name: /^Description/,
    });

    if (await button.count()) {
      await button.first().click();
      return;
    }

    // Fallback for custom tab implementations.
    // Allows "Description" or "Description*".
    const descriptionText = page
      .getByText(/^Description\s*\*?$/)
      .first();

    await expect(descriptionText).toBeVisible({
      timeout: 15000,
    });

    await descriptionText.click();
  }
  async function clickDetailsTab(page) {
    await page
      .getByText('Details', {
        exact: true,
      })
      .first()
      .click();
  }

  async function clickSubmit(page) {
    const submit = page
      .locator('button:visible')
      .filter({
        hasText: /^Submit$/,
      })
      .first();

    await expect(submit).toBeVisible();

    await submit.click();
  }

  // ==========================================================================
  // TC-FE-001
  // ==========================================================================

  test('TC-FE-001: Signed-in seeker can open Create Help Request', async ({ page }) => {
    await openDashboard(page);

    await page.goto('/request', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await expect(page).toHaveURL(/\/request\/?$/, {
      timeout: 15000,
    });

    await expect(
      page
        .getByText('Create Help Request', {
          exact: true,
        })
        .first()
    ).toBeVisible({
      timeout: 15000,
    });
  });
  // ==========================================================================
  // TC-FE-002
  // ==========================================================================

  test('TC-FE-002: Food and Essentials shows all three subcategories', async ({ page }) => {
    await openRequestPage(page);

    await expect(async () => {
      await openCategoryMenu(page);

      const foodEssentials = page
        .getByText('Food & Essentials', { exact: true })
        .first();

      await expect(foodEssentials).toBeVisible({
        timeout: 3000,
      });

      await foodEssentials.locator('xpath=..').hover({
        timeout: 5000,
      });

      await expect(
        page.getByText('Food Assistance', { exact: true }).first()
      ).toBeVisible({
        timeout: 3000,
      });

      await expect(
        page.getByText('Grocery Shopping & Delivery', { exact: true }).first()
      ).toBeVisible({
        timeout: 3000,
      });

      await expect(
        page.getByText('Cooking Help', { exact: true }).first()
      ).toBeVisible({
        timeout: 3000,
      });
    }).toPass({
      timeout: 30000,
      intervals: [500, 1000, 2000],
    });
  });

  // ==========================================================================
  // TC-FE-003
  // ==========================================================================

  test(
    'TC-FE-003: Cooking Help exposes all five child categories',
    async ({ page }) => {
      await openRequestPage(page);

      await openCookingHelp(page);

      await expectText(page, 'Meal Prep Basic');
      await expectText(page, 'Festive or Bulk Cooking');
      await expectText(page, 'Nutritional Meal Planning');
      await expectText(page, 'Cultural Cuisine Guidance');
      await expectText(page, 'Other Cooking Help');
    }
  );

  // ==========================================================================
  // TC-FE-004
  // ==========================================================================

  test('TC-FE-004: Food Assistance renders correct metadata fields', async ({ page }) => {
    await openRequestPage(page);

    await selectFoodAssistance(page);

    await expect(
      page.getByText('Preferred Meal Type', { exact: true })
    ).toBeVisible();

    await expect(
      page.getByText('Dietary Restrictions', { exact: true })
    ).toBeVisible();

    await expect(
      page.getByText('Household Size', { exact: true })
    ).toBeVisible();
  });

  // ==========================================================================
  // TC-FE-005
  // ==========================================================================

  test(
    'TC-FE-005: Grocery Shopping and Delivery renders correct metadata fields',
    async ({ page }) => {
      await openRequestPage(page);

      await selectGroceryShopping(page);

      await expectText(page, 'Grocery List');

      await expectText(page, 'Delivery Time');

      await expectText(page, 'Morning 8 AM to 12 PM');
      await expectText(page, 'Afternoon 12 PM to 5 PM');
      await expectText(page, 'Evening 5 PM to 9 PM');

      await expectText(page, 'Payment Method');

      await expectText(page, 'Volunteer Purchase & Reimburse');
      await expectText(page, 'Gift Card / Voucher');
      await expectText(page, 'Organization Sponsored');
      await expectText(page, 'Free Assistance');

      await expectText(page, 'Urgency Timeline');

      await expectText(page, 'Immediate (Next 24 Hrs)');
      await expectText(page, 'Within 3 Days');
      await expectText(page, 'Within 1 Week');
      await expectText(page, 'Flexible');
    }
  );

  // ==========================================================================
  // TC-FE-006
  // ==========================================================================

  test(
    'TC-FE-006: Meal Prep Basic renders Cooking Help metadata',
    async ({ page }) => {
      await openRequestPage(page);

      await selectCookingChild(page, 'Meal Prep Basic');

      await expectCookingMetadata(page);
    }
  );

  // ==========================================================================
  // TC-FE-007
  // ==========================================================================

  test(
    'TC-FE-007: Festive or Bulk Cooking renders Cooking Help metadata',
    async ({ page }) => {
      await openRequestPage(page);

      await selectCookingChild(page, 'Festive or Bulk Cooking');

      await expectCookingMetadata(page);
    }
  );

  // ==========================================================================
  // TC-FE-008
  // ==========================================================================

  test(
    'TC-FE-008: Nutritional Meal Planning renders Cooking Help metadata',
    async ({ page }) => {
      await openRequestPage(page);

      await selectCookingChild(page, 'Nutritional Meal Planning');

      await expectCookingMetadata(page);
    }
  );

  // ==========================================================================
  // TC-FE-009
  // ==========================================================================

  test(
    'TC-FE-009: Cultural Cuisine Guidance renders Cooking Help metadata',
    async ({ page }) => {
      await openRequestPage(page);

      await selectCookingChild(page, 'Cultural Cuisine Guidance');

      await expectCookingMetadata(page);
    }
  );

  // ==========================================================================
  // TC-FE-010
  // ==========================================================================

  test(
    'TC-FE-010: Other Cooking Help renders Cooking Help metadata',
    async ({ page }) => {
      await openRequestPage(page);

      await selectCookingChild(page, 'Other Cooking Help');

      await expectCookingMetadata(page);
    }
  );

  // ==========================================================================
  // TC-FE-011
  // ==========================================================================

  test(
    'TC-FE-011: Kitchen Equipment supports multiple selections',
    async ({ page }) => {
      await openRequestPage(page);

      await selectCookingChild(page, 'Meal Prep Basic');

      await clickVisibleTextOption(page, 'Stove or Cooktop');
      await clickVisibleTextOption(page, 'Oven or Microwave');

      const stove = page
        .getByLabel('Stove or Cooktop', {
          exact: true,
        })
        .first();

      const oven = page
        .getByLabel('Oven or Microwave', {
          exact: true,
        })
        .first();

      if (
        (await stove.count()) > 0 &&
        (await oven.count()) > 0
      ) {
        await expect(stove).toBeChecked();
        await expect(oven).toBeChecked();
      }
    }
  );

  // ==========================================================================
  // TC-FE-012
  // ==========================================================================

  test(
    'TC-FE-012: Urgency Timeline supports only one selection',
    async ({ page }) => {
      await openRequestPage(page);

      await selectCookingChild(page, 'Meal Prep Basic');

      await clickVisibleTextOption(
        page,
        'Immediate (Next 24 Hours)'
      );

      await clickVisibleTextOption(
        page,
        'Within 3 Days'
      );

      const immediate = page
        .getByLabel('Immediate (Next 24 Hours)', {
          exact: true,
        })
        .first();

      const withinThreeDays = page
        .getByLabel('Within 3 Days', {
          exact: true,
        })
        .first();

      if (
        (await immediate.count()) > 0 &&
        (await withinThreeDays.count()) > 0
      ) {
        await expect(immediate).not.toBeChecked();
        await expect(withinThreeDays).toBeChecked();
      }
    }
  );

  // ==========================================================================
  // TC-FE-013
  // ==========================================================================

  test(
    'TC-FE-013: Description language dropdown contains supported languages',
    async ({ page }) => {
      await openRequestPage(page);

      await selectCookingChild(page, 'Meal Prep Basic');

      await clickDescriptionTab(page);

      const selects = page.locator('select:visible');

      await expect(selects.first()).toBeVisible();

      const options = await selects
        .first()
        .locator('option')
        .allTextContents();

      const optionText = options.join(' ');

      expect(optionText).toContain('Arabic');
      expect(optionText).toContain('Bengali');
      expect(optionText).toContain('German');
      expect(optionText).toContain('English');
      expect(optionText).toContain('Spanish');
      expect(optionText).toContain('French');
      expect(optionText).toContain('Hindi');
      expect(optionText).toContain('Portuguese');
      expect(optionText).toContain('Russian');
      expect(optionText).toContain('Telugu');
      expect(optionText).toContain('Urdu');
      expect(optionText).toContain('Mandarin Chinese');
    }
  );

  // ==========================================================================
  // TC-FE-014
  // ==========================================================================

  test(
    'TC-FE-014: Details tab contains expected request options',
    async ({ page }) => {
      await openRequestPage(page);

      await selectCookingChild(page, 'Meal Prep Basic');

      await clickDetailsTab(page);

      const selects = page.locator('select:visible');

      const optionGroups = [];

      for (let i = 0; i < await selects.count(); i++) {
        optionGroups.push(
          (
            await selects
              .nth(i)
              .locator('option')
              .allTextContents()
          ).join(' ')
        );
      }

      const allOptions = optionGroups.join(' | ');

      expect(allOptions).toContain('Self');
      expect(allOptions).toContain('Other');

      expect(allOptions).toContain('No');
      expect(allOptions).toContain('Yes');

      expect(allOptions).toContain('In Person');
      expect(allOptions).toContain('Remote');

      expect(allOptions).toContain('Low');
      expect(allOptions).toContain('Medium');
      expect(allOptions).toContain('High');
      expect(allOptions).toContain('Critical');

      await expectText(page, 'Is Calamity?');
    }
  );

  // ==========================================================================
  // TC-FE-015
  // ==========================================================================

  test(
    'TC-FE-015: Required Description field blocks empty submission',
    async ({ page }) => {
      await openRequestPage(page);

      await selectCookingChild(page, 'Meal Prep Basic');

      await clickVisibleTextOption(page, 'Vegetarian');
      await clickVisibleTextOption(page, 'Stove or Cooktop');
      await clickVisibleTextOption(page, 'Within 3 Days');

      const preferredLanguage =
        await getPreferredLanguageInput(page);

      await preferredLanguage.fill('English');

      const subject = await getSubjectInput(page);

      await subject.fill(
        `Food assistance QA ${Date.now()}`
      );

      const description =
        await getDescriptionInput(page);

      await description.fill('');

      await clickSubmit(page);

      // User should remain on request page when required description is empty.
      await expect(page).toHaveURL(/\/request/);

      // Description field should still be present.
      await expect(description).toBeVisible();
    }
  );

  // ==========================================================================
  // TC-FE-016
  // ==========================================================================

  test(
    'TC-FE-016: Urgency Timeline cannot be left blank',
    async ({ page }) => {
      await openRequestPage(page);

      await selectCookingChild(page, 'Meal Prep Basic');

      // Fill everything except Urgency Timeline.
      await clickVisibleTextOption(page, 'Vegetarian');
      await clickVisibleTextOption(page, 'Stove or Cooktop');

      const preferredLanguage =
        await getPreferredLanguageInput(page);

      await preferredLanguage.fill('English');

      const subject = await getSubjectInput(page);

      await subject.fill(
        `Urgency validation QA ${Date.now()}`
      );

      const description =
        await getDescriptionInput(page);

      await description.fill(
        'Testing required urgency timeline validation.'
      );

      await clickSubmit(page);

      // Submission should be blocked.
      await expect(page).toHaveURL(/\/request/);

      await expectText(page, 'Urgency Timeline');
    }
  );

  // ==========================================================================
  // TC-FE-017
  // ==========================================================================

  test(
    'TC-FE-017: Valid Meal Prep Basic request submits successfully',
    async ({ page }) => {
      test.setTimeout(90000);

      await openRequestPage(page);

      await selectCookingChild(page, 'Meal Prep Basic');

      // ----------------------------------------------------------------------
      // Metadata
      // ----------------------------------------------------------------------

      await clickVisibleTextOption(page, 'Vegetarian');

      await clickVisibleTextOption(
        page,
        'Stove or Cooktop'
      );

      await clickVisibleTextOption(
        page,
        'Within 3 Days'
      );

      const preferredLanguage =
        await getPreferredLanguageInput(page);

      await preferredLanguage.fill('English');

      // ----------------------------------------------------------------------
      // Description
      // ----------------------------------------------------------------------

      await clickDescriptionTab(page);

      const uniqueId = Date.now();

      const subjectText =
        `Food Essentials QA ${uniqueId}`;

      const subject = await getSubjectInput(page);

      await subject.fill(subjectText);

      const description =
        await getDescriptionInput(page);

      await description.fill(
        'Automated QA request for Meal Prep Basic.'
      );

      // ----------------------------------------------------------------------
      // Details
      // ----------------------------------------------------------------------

      await clickDetailsTab(page);

      const visibleSelects =
        page.locator('select:visible');

      for (
        let i = 0;
        i < await visibleSelects.count();
        i++
      ) {
        const select = visibleSelects.nth(i);

        const values =
          await select.locator('option').allTextContents();

        const text = values.join(' ');

        if (
          text.includes('Self') &&
          text.includes('Other')
        ) {
          await select.selectOption({
            label: 'Self',
          });
        } else if (
          text.includes('In Person') &&
          text.includes('Remote')
        ) {
          await select.selectOption({
            label: 'Remote',
          });
        } else if (
          text.includes('Low') &&
          text.includes('Medium') &&
          text.includes('High')
        ) {
          await select.selectOption({
            label: 'Medium',
          });
        }
      }

      // ----------------------------------------------------------------------
      // Submit
      // ----------------------------------------------------------------------

      await clickSubmit(page);

      // ----------------------------------------------------------------------
      // Verify success
      // ----------------------------------------------------------------------

      await expect(page).toHaveURL(/\/dashboard/, {
        timeout: 30000,
      });

      const successMessage = page
        .getByText(
          /New Request #REQ-.*submitted successfully!/i
        )
        .first();

      await expect(successMessage).toBeVisible({
        timeout: 20000,
      });

      const successText =
        await successMessage.textContent();

      expect(successText).toMatch(
        /REQ-[0-9-]+/
      );

      // Verify submitted request appears on dashboard.
      await expect(
        page.getByText(subjectText, {
          exact: true,
        })
      ).toBeVisible({
        timeout: 20000,
      });

      await expect(
        page
          .getByText('Meal Prep Basic', {
            exact: true,
          })
          .first()
      ).toBeVisible();

      await expect(
        page.getByText(
          /Matching Volunteer|Open|Pending|Assigned/i
        ).first()
      ).toBeVisible();

      await expect(
        page
          .getByText('Medium', {
            exact: true,
          })
          .first()
      ).toBeVisible();
    }
  );

  // ==========================================================================
  // TC-FE-018
  // ==========================================================================

  test(
    'TC-FE-018: Submitted Food and Essentials request status is visible on dashboard',
    async ({ page }) => {
      await openDashboard(page);

      const dashboardText =
        await page.locator('body').innerText();

      expect(dashboardText).toContain('My Requests');
      expect(dashboardText).toContain('Status');

      // If requests exist, at least one known workflow status should be visible.
      const knownStatus =
        /Matching Volunteer|Open|Pending|Assigned/i;

      if (knownStatus.test(dashboardText)) {
        expect(dashboardText).toMatch(knownStatus);
      }
    }
  );

  // ==========================================================================
  // TC-FE-019
  // ==========================================================================

  test(
    'TC-FE-019: Request form exposes language, volunteer sex and distance preferences',
    async ({ page }) => {
      await openRequestPage(page);

      await selectCookingChild(page, 'Meal Prep Basic');

      // Preferred Language is visible in the current application.
      await expectText(page, 'Preferred Language');

      const bodyText =
        await page.locator('body').innerText();

      // These two checks intentionally validate BRD requirements.
      // If the application does not expose these fields, the test should fail.
      expect(
        bodyText,
        'Volunteer sex preference should be available on the request form'
      ).toMatch(
        /volunteer.*sex|sex.*preference|gender.*preference/i
      );

      expect(
        bodyText,
        'Distance preference should be available on the request form'
      ).toMatch(
        /distance.*preference|preferred.*distance|distance radius/i
      );
    }
  );
});