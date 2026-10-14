
const { test, expect } = require('@playwright/test');

const URL = '/notifications';

const FILTERS = [
  'All',
  'Volunteer Match',
  'Help Request',
];

const EMPTY_MESSAGE = 'No Notifications Found';

const KNOWN_TITLES = [
  'Educational Help',
  'Logistic Help',
  'New Match Request',
];

// ------------------------------------------------------------
// COMMON HELPERS
// ------------------------------------------------------------

function filter(page, name) {
  return page
    .getByRole('button', { name, exact: true })
    .or(page.getByRole('tab', { name, exact: true }))
    .or(page.getByText(name, { exact: true }))
    .first();
}

function emptyState(page) {
  return page.getByText(EMPTY_MESSAGE, {
    exact: true,
  }).first();
}

function notificationTitle(page, title) {
  return page.getByText(title, {
    exact: true,
  });
}

async function openNotifications(page) {
  await page.goto(URL, {
    waitUntil: 'domcontentloaded',
  });

  await expect(page).toHaveURL(/\/notifications/);

  await expect(
    page.getByRole('heading', {
      name: 'Notifications',
      exact: true,
    })
  ).toBeVisible();

  for (const name of FILTERS) {
    await expect(filter(page, name)).toBeVisible();
  }
}

async function selectFilter(page, name) {
  const control = filter(page, name);

  await expect(control).toBeVisible();

  await control.click();

  await expect(control).toBeVisible();

  // Temporary diagnostic wait.
  // This resolved the asynchronous data-loading issue
  // observed in TC_007 through TC_012.
  //
  // Replace with a condition-based wait once the
  // notification API/loading behavior is confirmed.
  await page.waitForTimeout(2000);
}

async function getActiveStyle(page, name) {
  return filter(page, name).evaluate(element => {
    const style = window.getComputedStyle(element);

    return {
      background: style.backgroundColor,
      color: style.color,
      className: element.className,
      ariaSelected: element.getAttribute('aria-selected'),
    };
  });
}

async function requireRecords(page, testInfo) {
  const empty = await emptyState(page)
    .isVisible()
    .catch(() => false);

  if (empty) {
    testInfo.skip(
      true,
      'No notification records are available.'
    );
  }

  const knownCount = await page
    .getByText(
      /New Match Request|Educational Help|Logistic Help/
    )
    .count();

  if (knownCount === 0) {
    testInfo.skip(
      true,
      'Notification test records are not available.'
    );
  }
}

async function requireEmptyState(page, testInfo) {
  const message = emptyState(page);

  if (!(await message.isVisible().catch(() => false))) {
    testInfo.skip(
      true,
      'Empty-state test data is unavailable. Current account has notifications.'
    );
  }

  return message;
}

function settingsCandidates(page) {
  return page
    .getByRole('button', { name: /settings/i })
    .or(page.getByRole('link', { name: /settings/i }))
    .or(page.locator('[aria-label*="setting" i]'))
    .or(page.locator('[title*="setting" i]'));
}

async function getSettingsControl(page) {
  const named = settingsCandidates(page).first();

  if (await named.count()) {
    return named;
  }

  // Fallback for the gear at the right side
  // of the notification filter bar.
  const helpFilter = filter(page, 'Help Request');

  const parent = helpFilter.locator('xpath=..');

  return parent.locator(
    'button:has(svg), [role="button"]:has(svg)'
  ).last();
}

function rowsPerView(page) {
  return page.getByRole('combobox').first();
}

async function capture(page, testInfo, name) {
  await page.screenshot({
    path: testInfo.outputPath(`${name}.png`),
    fullPage: true,
  });
}

// ------------------------------------------------------------
// TEST SUITE
// ------------------------------------------------------------

test.describe('Issue #39 - Notifications Page UI/UX', () => {

  test.beforeEach(async ({ page }) => {
    await openNotifications(page);
  });

  // ----------------------------------------------------------
  // TC_001 - NOTIFICATIONS PAGE LOAD
  // ----------------------------------------------------------

  test('TC_001 - Notifications page loads successfully', async ({ page }) => {

    await expect(page).toHaveURL(/\/notifications/);

    await expect(
      page.getByRole('heading', {
        name: 'Notifications',
        exact: true,
      })
    ).toBeVisible();

    for (const name of FILTERS) {
      await expect(filter(page, name)).toBeVisible();
    }

    await expect(
      page.getByText(/Rows per view/i)
    ).toBeVisible();

  });

  
  test('TC_002 - Notification bell icon styling', async ({ page }, testInfo) => {
    await page.goto('/dashboard', {
      waitUntil: 'domcontentloaded',
    });

    const notificationControl = page
      .getByRole('link', { name: /notifications/i })
      .or(page.getByRole('button', { name: /notifications/i }))
      .filter({ visible: true })
      .first();

    const isMobileProject = [
      'pixel-5',
      'iphone-16-pro',
      'mobile-firefox',
    ].includes(testInfo.project.name);

    if (isMobileProject && await notificationControl.count() === 0) {
      // Mobile snapshot shows an unnamed button in the header.
      const unnamedHeaderButton = page
        .locator('header nav button, [role="banner"] nav button')
        .filter({ visible: true })
        .filter({ hasNot: page.locator('img[alt="Profile"]') })
        .filter({ hasNotText: /donate/i })
        .last();

      await expect(
        unnamedHeaderButton,
        'Expected a visible mobile header navigation control.'
      ).toBeVisible();

      await unnamedHeaderButton.click();
    }

    await expect(
      notificationControl,
      'Notification control should become visible.'
    ).toBeVisible({ timeout: 10000 });

    const bellIcon = notificationControl.locator('svg').first();

    await expect(
      bellIcon,
      'Notification control should contain a visible SVG.'
    ).toBeVisible();

    const dimensions = await bellIcon.boundingBox();

    expect(dimensions).not.toBeNull();
    expect(dimensions.width).toBeGreaterThan(0);
    expect(dimensions.height).toBeGreaterThan(0);

    const iconStyles = await bellIcon.evaluate(element => {
      const style = getComputedStyle(element);

      return {
        strokeWidth: style.strokeWidth,
        stroke: style.stroke,
        fill: style.fill,
      };
    });

    console.log(
      `[${testInfo.project.name}] Notification bell styling:`,
      iconStyles
    );

    expect(iconStyles.strokeWidth).toBeTruthy();
  });

  // ----------------------------------------------------------
  // TC_003 - ALL TAB
  // ----------------------------------------------------------

  test('TC_003 - All tab navigation', async ({ page }) => {

    await selectFilter(page, 'All');

    await expect(
      notificationTitle(page, 'Educational Help').first()
    ).toBeVisible();

    await expect(
      notificationTitle(page, 'Logistic Help').first()
    ).toBeVisible();

    await expect(
      notificationTitle(page, 'New Match Request').first()
    ).toBeVisible();

  });

  // ----------------------------------------------------------
  // TC_004 - VOLUNTEER MATCH TAB
  // ----------------------------------------------------------

  test('TC_004 - Volunteer Match tab navigation', async ({ page }) => {

    await selectFilter(page, 'Volunteer Match');

    await expect(
      notificationTitle(page, 'Logistic Help').first()
    ).toBeVisible();

    await expect(
      notificationTitle(page, 'New Match Request').first()
    ).toBeVisible();

    await expect(
      notificationTitle(page, 'Educational Help')
    ).toHaveCount(0);

  });

  // ----------------------------------------------------------
  // TC_005 - HELP REQUEST TAB
  // ----------------------------------------------------------

  test('TC_005 - Help Request tab navigation', async ({ page }) => {

    await selectFilter(page, 'Help Request');

    await expect(
      notificationTitle(page, 'Educational Help').first()
    ).toBeVisible();

    await expect(
      notificationTitle(page, 'New Match Request')
    ).toHaveCount(0);

    await expect(
      notificationTitle(page, 'Logistic Help')
    ).toHaveCount(0);

  });

  // ----------------------------------------------------------
  // TC_006 - ACTIVE TAB HIGHLIGHT
  // ----------------------------------------------------------

  test('TC_006 - Active tab highlighting', async ({ page }) => {

    for (const name of FILTERS) {

      await selectFilter(page, name);

      const active = await getActiveStyle(page, name);

      for (const other of FILTERS) {

        if (other === name) {
          continue;
        }

        const inactive = await getActiveStyle(page, other);

        expect(active.background).not.toBe(
          inactive.background
        );

      }
    }

  });

  // ----------------------------------------------------------
  // TC_007 - NOTIFICATION TITLE
  // ----------------------------------------------------------

  test('TC_007 - Notification title display', async ({ page }, testInfo) => {

    await selectFilter(page, 'All');

    await requireRecords(page, testInfo);

    for (const title of KNOWN_TITLES) {

      await expect(
        notificationTitle(page, title).first()
      ).toBeVisible();

    }

  });

  // ----------------------------------------------------------
  // TC_008 - NOTIFICATION DESCRIPTION
  // ----------------------------------------------------------

  test('TC_008 - Notification description display', async ({ page }, testInfo) => {

    await selectFilter(page, 'All');

    await requireRecords(page, testInfo);

    await expect(
      page.getByText('Need help with Logistics', {
        exact: true,
      }).first()
    ).toBeVisible();

    await expect(
      page.getByText('Hospital', {
        exact: true,
      }).first()
    ).toBeVisible();

    await expect(
      page.getByText(
        'You have new Volunteer match request in Logistics',
        { exact: true }
      ).first()
    ).toBeVisible();

  });

  // ----------------------------------------------------------
  // TC_009 - NOTIFICATION TIMESTAMP
  // ----------------------------------------------------------

  test('TC_009 - Notification timestamp display', async ({ page }, testInfo) => {

    await selectFilter(page, 'All');

    await requireRecords(page, testInfo);

    const timestamps = page.getByText(
      /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}/
    );

    expect(await timestamps.count()).toBeGreaterThan(0);

    await expect(
      timestamps.first()
    ).toBeVisible();

  });

  // ----------------------------------------------------------
  // TC_010 - NOTIFICATION CARD ALIGNMENT
  // ----------------------------------------------------------

  test('TC_010 - Notification card alignment', async ({ page }, testInfo) => {

    await selectFilter(page, 'Volunteer Match');

    await requireRecords(page, testInfo);

    const titles = notificationTitle(
      page,
      'New Match Request'
    );

    const count = await titles.count();

    expect(count).toBeGreaterThanOrEqual(2);

    const boxes = [];

    for (let i = 0; i < Math.min(count, 3); i++) {
      boxes.push(
        await titles.nth(i).boundingBox()
      );
    }

    for (const box of boxes) {
      expect(box).not.toBeNull();
    }

    const firstX = boxes[0].x;

    for (const box of boxes) {
      expect(
        Math.abs(box.x - firstX)
      ).toBeLessThanOrEqual(10);
    }

  });

  // ----------------------------------------------------------
  // TC_011 - ACCEPT BUTTON
  // ----------------------------------------------------------

  test('TC_011 - Accept button visibility and feedback', async ({ page }, testInfo) => {

    await selectFilter(page, 'Volunteer Match');

    const accept = page.getByRole('button', {
      name: /^Accept$/i,
    });

    if (!(await accept.count())) {
      testInfo.skip(
        true,
        'No pending match request is available.'
      );
    }

    await expect(
      accept.first()
    ).toBeVisible();

    await expect(
      accept.first()
    ).toBeEnabled();

    // Clicking Accept modifies application data.
    // Only perform this on an approved test account.
    if (process.env.SAAYAM_TEST_ACTIONS !== 'true') {

      testInfo.annotations.push({
        type: 'action-not-executed',
        description:
          'Set SAAYAM_TEST_ACTIONS=true to verify Accept confirmation.',
      });

      return;
    }

    await accept.first().click();

    await expect(
      page.getByText(
        /accepted|accept successful|✓|✔/i
      ).first()
    ).toBeVisible();

  });

  // ----------------------------------------------------------
  // TC_012 - DENY BUTTON
  // ----------------------------------------------------------

  test('TC_012 - Deny button visibility and feedback', async ({ page }, testInfo) => {

    await selectFilter(page, 'Volunteer Match');

    const deny = page.getByRole('button', {
      name: /^Deny$/i,
    });

    if (!(await deny.count())) {
      testInfo.skip(
        true,
        'No pending match request is available.'
      );
    }

    await expect(
      deny.first()
    ).toBeVisible();

    await expect(
      deny.first()
    ).toBeEnabled();

    if (process.env.SAAYAM_TEST_ACTIONS !== 'true') {

      testInfo.annotations.push({
        type: 'action-not-executed',
        description:
          'Set SAAYAM_TEST_ACTIONS=true to verify Deny confirmation.',
      });

      return;
    }

    await deny.first().click();

    await expect(
      page.getByText(
        'You denied this request.',
        { exact: false }
      )
    ).toBeVisible();

  });

  // ----------------------------------------------------------
  // TC_013 - SETTINGS ICON VISIBILITY
  // ----------------------------------------------------------

  test('TC_013 - Settings icon visibility', async ({ page }, testInfo) => {

    const settings = await getSettingsControl(page);

    if (!(await settings.count())) {
      testInfo.skip(
        true,
        'Settings gear requires an exact DOM selector.'
      );
    }

    await expect(settings).toBeVisible();

  });

  // ----------------------------------------------------------
  // TC_014 - SETTINGS FUNCTIONALITY
  // ----------------------------------------------------------

  test('TC_014 - Settings icon opens settings options', async ({ page }, testInfo) => {

    const settings = await getSettingsControl(page);

    if (!(await settings.count())) {
      testInfo.skip(
        true,
        'Settings control could not be identified.'
      );
    }

    await expect(settings).toBeVisible();

    const beforeURL = page.url();

    await settings.click();

    const dialog = page.getByRole('dialog');

    const menu = page.getByRole('menu');

    const settingsHeading = page.getByRole('heading', {
      name: /settings/i,
    });

    const opened =
      page.url() !== beforeURL ||
      await dialog.isVisible().catch(() => false) ||
      await menu.isVisible().catch(() => false) ||
      await settingsHeading.isVisible().catch(() => false);

    // Manual testing confirmed that clicking the
    // settings gear currently produces no visible response.
    //
    // Preserve this failure as defect evidence.
    expect(
      opened,
      'Settings icon did not open a settings menu, dialog, or page.'
    ).toBe(true);

  });

  // ----------------------------------------------------------
  // TC_015 - PAGINATION DISPLAY
  // ----------------------------------------------------------

  test('TC_015 - Pagination display', async ({ page }) => {

    await selectFilter(page, 'Volunteer Match');

    const pageOne = page.getByText('1', {
      exact: true,
    }).last();

    await expect(pageOne).toBeVisible();

  });

  // ----------------------------------------------------------
  // TC_016 - ROWS PER VIEW VISIBILITY
  // ----------------------------------------------------------

  test('TC_016 - Rows Per View dropdown visibility', async ({ page }) => {

    await expect(
      page.getByText(/Rows per view/i)
    ).toBeVisible();

    const dropdown = rowsPerView(page);

    await expect(dropdown).toBeVisible();

    const options = await dropdown
      .locator('option')
      .allTextContents();

    expect(
      options.some(option => option.includes('5'))
    ).toBe(true);

    expect(
      options.some(option => option.includes('10'))
    ).toBe(true);

    expect(
      options.some(option => option.includes('20'))
    ).toBe(true);

  });

  // ----------------------------------------------------------
  // TC_017 - ROWS PER VIEW FUNCTIONALITY
  // ----------------------------------------------------------

  test('TC_017 - Rows Per View functionality', async ({ page }) => {

    await selectFilter(page, 'Volunteer Match');

    const dropdown = rowsPerView(page);

    await expect(dropdown).toBeVisible();

    const options = await dropdown
      .locator('option')
      .evaluateAll(elements =>
        elements.map(option => ({
          label: option.textContent.trim(),
          value: option.value,
        }))
      );

    const option5 = options.find(
      option => /5 rows/i.test(option.label)
    );

    const option10 = options.find(
      option => /10 rows/i.test(option.label)
    );

    const option20 = options.find(
      option => /20 rows/i.test(option.label)
    );

    expect(option5).toBeTruthy();
    expect(option10).toBeTruthy();
    expect(option20).toBeTruthy();

    for (const option of [
      option10,
      option20,
      option5,
    ]) {

      await dropdown.selectOption(option.value);

      await expect(
        dropdown
      ).toHaveValue(option.value);

      await expect(
        notificationTitle(page, 'Logistic Help').first()
      ).toBeVisible();

      await expect(
        notificationTitle(page, 'New Match Request').first()
      ).toBeVisible();

    }

    // Only four Volunteer Match records were observed.
    // Multi-page pagination requires additional test data.

  });

  // ----------------------------------------------------------
  // TC_018 - NO LOADING MESSAGE
  // ----------------------------------------------------------

  test('TC_018 - No Loading message during tab switching', async ({ page }) => {

    await page.evaluate(() => {

      window.__notificationLoadingSeen = false;

      const inspect = () => {

        const elements = Array.from(
          document.querySelectorAll('body *')
        );

        for (const element of elements) {

          if (element.children.length > 0) {
            continue;
          }

          const text = element.textContent.trim();

          if (!/^Loading\.\.\.$/i.test(text)) {
            continue;
          }

          const style = getComputedStyle(element);

          if (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            element.getClientRects().length > 0
          ) {
            window.__notificationLoadingSeen = true;
            break;
          }

        }
      };

      window.__notificationLoadingObserver =
        new MutationObserver(inspect);

      window.__notificationLoadingObserver.observe(
        document.body,
        {
          childList: true,
          subtree: true,
          characterData: true,
          attributes: true,
          attributeFilter: ['style', 'class'],
        }
      );

      inspect();

    });

    const transitions = [
      ['All', 'Help Request'],
      ['Help Request', 'All'],
      ['All', 'Volunteer Match'],
      ['Volunteer Match', 'Help Request'],
      ['Help Request', 'Volunteer Match'],
      ['Volunteer Match', 'All'],
    ];

    for (const [source, destination] of transitions) {

      await selectFilter(page, source);

      await page.evaluate(() => {
        window.__notificationLoadingSeen = false;
      });

      await selectFilter(page, destination);

      await expect(
        filter(page, destination)
      ).toBeVisible();

      const loadingSeen = await page.evaluate(
        () => window.__notificationLoadingSeen
      );

      expect(
        loadingSeen,
        `Unexpected Loading... message during ${source} -> ${destination}`
      ).toBe(false);

    }

    await page.evaluate(() => {
      window.__notificationLoadingObserver.disconnect();
    });

  });

  // ----------------------------------------------------------
  // TC_019 - EMPTY STATE ON ALL
  // ----------------------------------------------------------

  test('TC_019 - Empty message alignment on All', async ({ page }, testInfo) => {

    await selectFilter(page, 'All');

    const message = await requireEmptyState(
      page,
      testInfo
    );

    await expect(message).toBeVisible();

    const box = await message.boundingBox();

    expect(box).not.toBeNull();

    const viewport = page.viewportSize();

    expect(viewport).not.toBeNull();

    const centerY = box.y + box.height / 2;

    // Provisional alignment check.
    // Content-container bounds still require confirmation.
    expect(centerY).toBeGreaterThan(
      viewport.height * 0.25
    );

    expect(centerY).toBeLessThan(
      viewport.height * 0.75
    );

    await capture(
      page,
      testInfo,
      'TC_019-empty-all'
    );

  });

  // ----------------------------------------------------------
  // TC_020 - EMPTY STATE ON HELP REQUEST
  // ----------------------------------------------------------

  test('TC_020 - Empty message alignment on Help Request', async ({ page }, testInfo) => {

    await selectFilter(page, 'Help Request');

    const message = await requireEmptyState(
      page,
      testInfo
    );

    await expect(message).toBeVisible();

    const box = await message.boundingBox();

    expect(box).not.toBeNull();

    const viewport = page.viewportSize();

    expect(viewport).not.toBeNull();

    const centerY = box.y + box.height / 2;

    expect(centerY).toBeGreaterThan(
      viewport.height * 0.25
    );

    expect(centerY).toBeLessThan(
      viewport.height * 0.75
    );

    await capture(
      page,
      testInfo,
      'TC_020-empty-help-request'
    );

  });

  // ----------------------------------------------------------
  // TC_021 - UI CONSISTENCY
  // ----------------------------------------------------------

  test('TC_021 - UI consistency across notification tabs', async ({ page }) => {

    for (const name of FILTERS) {

      await selectFilter(page, name);

      await expect(
        page.getByRole('heading', {
          name: 'Notifications',
          exact: true,
        })
      ).toBeVisible();

      for (const tab of FILTERS) {
        await expect(filter(page, tab)).toBeVisible();
      }

      await expect(
        page.getByText(/Rows per view/i)
      ).toBeVisible();

      await expect(page).toHaveURL(/\/notifications/);
    }

  });

  // ----------------------------------------------------------
  // TC_022 - RESPONSIVE LAYOUT
  // ----------------------------------------------------------

  test('TC_022 - Responsive layout', async ({ page }, testInfo) => {

    const sizes = [
      { width: 1440, height: 900 },
      { width: 768, height: 900 },
      { width: 390, height: 844 },
    ];

    for (const size of sizes) {

      await page.setViewportSize(size);

      await selectFilter(page, 'Volunteer Match');

      await expect(
        page.getByRole('heading', {
          name: 'Notifications',
          exact: true,
        })
      ).toBeVisible();

      for (const name of FILTERS) {
        await expect(filter(page, name)).toBeVisible();
      }

      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(
        dimensions.scrollWidth,
        `Horizontal overflow at ${size.width}px`
      ).toBeLessThanOrEqual(
        dimensions.clientWidth + 2
      );

      await capture(
        page,
        testInfo,
        `TC_022-responsive-${size.width}`
      );

    }

  });

  // ----------------------------------------------------------
  // TC_023 - NOTIFICATION ICONS
  // FIXED USING ACTUAL HTML STRUCTURE
  // ----------------------------------------------------------

  test('TC_023 - Notification icons display correctly', async ({ page }, testInfo) => {

    await selectFilter(page, 'Volunteer Match');

    await requireRecords(page, testInfo);

    const title = notificationTitle(
      page,
      'New Match Request'
    ).first();

    await expect(title).toBeVisible();

    // Actual DOM observed during debugging:
    //
    // <div class="flex gap-2 md:gap-10 items-center">
    //   <div class="text-2xl sm:text-3xl">
    //     <svg>...</svg>
    //   </div>
    //   <div class="flex-1">
    //     <h3>New Match Request</h3>
    //   </div>
    // </div>
    //
    // The previous selector looked for tr/article/li.
    // Notifications actually use div containers.

    const card = title.locator(
      'xpath=ancestor::div[contains(@class, "flex gap-2 md:gap-10 items-center")][1]'
    );

    await expect(
      card,
      'Notification card container should be visible.'
    ).toBeVisible();

    const icons = card.locator('svg, img');

    expect(
      await icons.count(),
      'Notification card should contain at least one icon.'
    ).toBeGreaterThan(0);

    const icon = icons.first();

    await expect(icon).toBeVisible();

    const box = await icon.boundingBox();

    expect(box).not.toBeNull();

    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);

    // Verify the icon is not visually collapsed.
    expect(box.width).toBeGreaterThanOrEqual(12);
    expect(box.height).toBeGreaterThanOrEqual(12);

    await capture(
      page,
      testInfo,
      'TC_023-notification-icons'
    );

  });

  // ----------------------------------------------------------
  // TC_024 - REGRESSION
  // ----------------------------------------------------------

  test('TC_024 - Existing notification functionality remains unaffected', async ({ page }, testInfo) => {

    for (const name of FILTERS) {

      await selectFilter(page, name);

      await expect(
        filter(page, name)
      ).toBeVisible();

      await expect(page).toHaveURL(/\/notifications/);

    }

    await selectFilter(page, 'Volunteer Match');

    const accept = page.getByRole('button', {
      name: /^Accept$/i,
    });

    const deny = page.getByRole('button', {
      name: /^Deny$/i,
    });

    if (await accept.count()) {
      await expect(
        accept.first()
      ).toBeVisible();
    }

    if (await deny.count()) {
      await expect(
        deny.first()
      ).toBeVisible();
    }

    const dropdown = rowsPerView(page);

    await expect(dropdown).toBeVisible();

    const settings = await getSettingsControl(page);

    if (!(await settings.count())) {

      testInfo.annotations.push({
        type: 'regression-warning',
        description:
          'Settings control not identified.',
      });

    } else {

      await expect(settings).toBeVisible();

    }

    // TC_014 independently verifies settings functionality.
    // This regression test checks non-destructive behavior.

    await selectFilter(page, 'All');

    await expect(
      filter(page, 'All')
    ).toBeVisible();

  });

});