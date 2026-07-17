import { test, expect } from '@playwright/test';

const categories = {
  'Clothing Assistance': [
    'Donate Clothes',
    'Borrow Clothes',
    'Emergency Clothing Assistance',
    'Tailoring',
  ],

  'Education & Career Support': [
    'College Application Help',
    'SOP & Essay Review',
    'Tutoring',
    'Scholarship Knowledge',
    'Study Group Formation',
    'Career Guidance',
    'Education Resource Sharing',
  ],

  'Elderly Community Assistance': [
    'Senior Relocation Support',
    'Digital Support for Seniors',
    'Medication Management',
    'Transportation for Appointments',
    'Scheduling Appointments or Tasks',
  ],

  'Food & Essentials': [
    'Food Assistance',
    'Grocery Shopping & Delivery',
    'Cooking Help',
  ],

  'Healthcare & Wellness': [
    'Medical Consultation',
    'Medicine Delivery',
    'Mental Wellbeing Support',
    'Medication Reminders',
    'Health Education Guidance',
  ],

  'Housing Assistance': [
    'Lease Support',
    'Tenant Rent Support',
    'Repair & Maintenance Support',
    'Utilities Setup Support',
    'Looking for Rental',
    'Find a Roommate',
    'Move-in Help',
  ],
};

async function openSkillsEditor(page) {
  await page.goto('/profile', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  const title = page.getByText(
    'Select Your Skills For Volunteer Assignments',
    {
      exact: true,
    }
  );

  const skillsButton = page.getByRole('button', {
    name: 'Skills',
    exact: true,
  });

  for (let attempt = 1; attempt <= 3; attempt++) {
    // If the editor is already open, we're done.
    if (await title.isVisible().catch(() => false)) {
      return;
    }

    // Wait for the Skills button and click it.
    await expect(skillsButton).toBeVisible({
      timeout: 20000,
    });

    await skillsButton.click({
      force: true,
    });

    await page.waitForTimeout(1000);

    // If clicking Skills opened the editor, we're done.
    if (await title.isVisible().catch(() => false)) {
      return;
    }

    // Otherwise try clicking Edit.
    const editButton = page.getByRole('button', {
      name: 'Edit',
      exact: true,
    });

    if (await editButton.isVisible().catch(() => false)) {
      await editButton.click({
        force: true,
      });

      await page.waitForTimeout(1000);

      if (await title.isVisible().catch(() => false)) {
        return;
      }
    }

    // Retry from a fresh page if necessary.
    if (attempt < 3) {
      await page.reload({
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });
    }
  }

  // Final assertion.
  await expect(title).toBeVisible({
    timeout: 20000,
  });
}

async function openCategory(page, category) {
  const categoryText = page
    .getByText(category, {
      exact: true,
    })
    .first();

  await expect(categoryText).toBeVisible({
    timeout: 15000,
  });

  const categoryRow = categoryText.locator('..');

  await categoryRow.scrollIntoViewIfNeeded();

  await categoryRow.hover({
    force: true,
  });

  await page.waitForTimeout(500);
}

async function selectSkill(page, category, skill) {
  await openCategory(page, category);

  const skillText = page
    .getByText(skill, {
      exact: true,
    })
    .first();

  await expect(skillText).toBeVisible({
    timeout: 15000,
  });

  const skillRow = skillText.locator('..');

  await skillRow.scrollIntoViewIfNeeded();

  await skillRow.click({
    force: true,
  });

  await page.waitForTimeout(500);
}

test.describe('Saayam Skills Page E2E Tests', () => {
  test.describe.configure({
    timeout: 60000,
  });

  test.beforeEach(async ({ page }) => {
    await openSkillsEditor(page);
  });

  test('TC_SK_001 - User can open Skills page from Profile', async ({ page }) => {
    await expect(page).toHaveURL(/\/profile/);

    await expect(
      page.getByText(
        'Select Your Skills For Volunteer Assignments',
        {
          exact: true,
        }
      )
    ).toBeVisible();
  });

  test('TC_SK_002 - Page title is displayed correctly', async ({ page }) => {
    await expect(
      page.getByText(
        'Select Your Skills For Volunteer Assignments',
        {
          exact: true,
        }
      )
    ).toBeVisible();
  });

  test('TC_SK_003 - Helper text is displayed', async ({ page }) => {
    await expect(
      page.getByText(
        'Hover to explore categories, click to select skills',
        {
          exact: true,
        }
      )
    ).toBeVisible();
  });

  test('TC_SK_004 - All main skill categories are displayed', async ({ page }) => {
    const categoryNames = [
      'Clothing Assistance',
      'Education & Career Support',
      'Elderly Community Assistance',
      'Food & Essentials',
      'Healthcare & Wellness',
      'Housing Assistance',
      'General',
    ];

    for (const category of categoryNames) {
      await expect(
        page
          .getByText(category, {
            exact: true,
          })
          .first()
      ).toBeVisible();
    }
  });

  test('TC_SK_005 - Category arrow indicators are visible', async ({ page }) => {
    const categoryNames = [
      'Clothing Assistance',
      'Education & Career Support',
      'Elderly Community Assistance',
      'Food & Essentials',
      'Healthcare & Wellness',
      'Housing Assistance',
    ];

    for (const category of categoryNames) {
      const categoryText = page
        .getByText(category, {
          exact: true,
        })
        .first();

      await expect(categoryText).toBeVisible();

      const categoryRow = categoryText.locator('..');

      const hasIndicator = await categoryRow.evaluate(
        element => {
          const text = element.textContent || '';

          const beforeContent = window
            .getComputedStyle(element, '::before')
            .getPropertyValue('content');

          const afterContent = window
            .getComputedStyle(element, '::after')
            .getPropertyValue('content');

          return (
            text.includes('>') ||
            beforeContent.includes('>') ||
            afterContent.includes('>')
          );
        }
      );

      expect(hasIndicator).toBe(true);
    }
  });

  test('TC_SK_006 - Clothing Assistance sub-skills are displayed', async ({ page }) => {
    await openCategory(
      page,
      'Clothing Assistance'
    );

    for (
      const skill of categories[
        'Clothing Assistance'
      ]
    ) {
      await expect(
        page
          .getByText(skill, {
            exact: true,
          })
          .first()
      ).toBeVisible({
        timeout: 15000,
      });
    }
  });

  test('TC_SK_007 - Education and Career Support sub-skills are displayed', async ({ page }) => {
    await openCategory(
      page,
      'Education & Career Support'
    );

    for (
      const skill of categories[
        'Education & Career Support'
      ]
    ) {
      await expect(
        page
          .getByText(skill, {
            exact: true,
          })
          .first()
      ).toBeVisible({
        timeout: 15000,
      });
    }
  });

  test('TC_SK_008 - Elderly Community Assistance sub-skills are displayed', async ({ page }) => {
    await openCategory(
      page,
      'Elderly Community Assistance'
    );

    const expectedSkills = [
      'Senior Relocation Support',
      'Digital Support for Seniors',
      'Medication Management',
      'Transportation for Appointments',
      'Scheduling Appointments or Tasks',
    ];

    for (const skill of expectedSkills) {
      await expect(
        page
          .getByText(skill, {
            exact: true,
          })
          .first()
      ).toBeVisible({
        timeout: 15000,
      });
    }

    const visibleSkillTexts = await page
      .locator('main')
      .getByText(
        /Support|Management|Appointments|Transportation|Setup/i
      )
      .allTextContents();

    expect(
      visibleSkillTexts.length
    ).toBeGreaterThanOrEqual(5);
  });

  test('TC_SK_009 - Food and Essentials sub-skills are displayed', async ({ page }) => {
    await openCategory(
      page,
      'Food & Essentials'
    );

    for (
      const skill of categories[
        'Food & Essentials'
      ]
    ) {
      await expect(
        page
          .getByText(skill, {
            exact: true,
          })
          .first()
      ).toBeVisible({
        timeout: 15000,
      });
    }
  });

  test('TC_SK_010 - Healthcare and Wellness sub-skills are displayed', async ({ page }) => {
    await openCategory(
      page,
      'Healthcare & Wellness'
    );

    for (
      const skill of categories[
        'Healthcare & Wellness'
      ]
    ) {
      await expect(
        page
          .getByText(skill, {
            exact: true,
          })
          .first()
      ).toBeVisible({
        timeout: 15000,
      });
    }
  });

  test('TC_SK_011 - Housing Assistance sub-skills are displayed', async ({ page }) => {
    await openCategory(
      page,
      'Housing Assistance'
    );

    for (
      const skill of categories[
        'Housing Assistance'
      ]
    ) {
      await expect(
        page
          .getByText(skill, {
            exact: true,
          })
          .first()
      ).toBeVisible({
        timeout: 15000,
      });
    }
  });

  test('TC_SK_012 - Hovered category is highlighted', async ({ page }) => {
    const category = page
      .getByText(
        'Clothing Assistance',
        {
          exact: true,
        }
      )
      .first();

    const categoryRow = category.locator('..');

    const backgroundBefore =
      await categoryRow.evaluate(element => {
        return window.getComputedStyle(
          element
        ).backgroundColor;
      });

    await categoryRow.hover({
      force: true,
    });

    await page.waitForTimeout(500);

    const backgroundAfter =
      await categoryRow.evaluate(element => {
        return window.getComputedStyle(
          element
        ).backgroundColor;
      });

    expect(backgroundAfter).not.toBe(
      backgroundBefore
    );
  });

  test('TC_SK_013 - Sub-skill panel changes when category changes', async ({ page }) => {
    await openCategory(
      page,
      'Clothing Assistance'
    );

    await expect(
      page
        .getByText('Donate Clothes', {
          exact: true,
        })
        .first()
    ).toBeVisible();

    await openCategory(
      page,
      'Food & Essentials'
    );

    await expect(
      page
        .getByText('Food Assistance', {
          exact: true,
        })
        .first()
    ).toBeVisible();

    await expect(
      page
        .getByText(
          'Grocery Shopping & Delivery',
          {
            exact: true,
          }
        )
        .first()
    ).toBeVisible();
  });

  test('TC_SK_014 - Category hover provides additional information', async ({ page }) => {
    await openCategory(
      page,
      'Education & Career Support'
    );

    await expect(
      page
        .getByText(
          'College Application Help',
          {
            exact: true,
          }
        )
        .first()
    ).toBeVisible();
  });

  test('TC_SK_015 - User can select a sub-skill', async ({ page }) => {
    await selectSkill(
      page,
      'Clothing Assistance',
      'Donate Clothes'
    );

    await expect(
      page
        .getByText('Donate Clothes', {
          exact: true,
        })
        .last()
    ).toBeVisible();
  });

  test('TC_SK_016 - Selected skill appears in Selected Skills section', async ({ page }) => {
    await selectSkill(
      page,
      'Food & Essentials',
      'Food Assistance'
    );

    await expect(
      page.getByText('Selected Skills', {
        exact: true,
      })
    ).toBeVisible();

    const matchingSkills = page.getByText(
      'Food Assistance',
      {
        exact: true,
      }
    );

    expect(
      await matchingSkills.count()
    ).toBeGreaterThanOrEqual(1);
  });

  test('TC_SK_017 - Multiple skills from the same category can be selected', async ({ page }) => {
    await selectSkill(
      page,
      'Clothing Assistance',
      'Donate Clothes'
    );

    await selectSkill(
      page,
      'Clothing Assistance',
      'Tailoring'
    );

    await expect(
      page
        .getByText('Donate Clothes', {
          exact: true,
        })
        .last()
    ).toBeVisible();

    await expect(
      page
        .getByText('Tailoring', {
          exact: true,
        })
        .last()
    ).toBeVisible();
  });

  test('TC_SK_018 - Skills from different categories can be selected', async ({ page }) => {
    await selectSkill(
      page,
      'Clothing Assistance',
      'Donate Clothes'
    );

    await selectSkill(
      page,
      'Food & Essentials',
      'Cooking Help'
    );

    await expect(
      page
        .getByText('Donate Clothes', {
          exact: true,
        })
        .last()
    ).toBeVisible();

    await expect(
      page
        .getByText('Cooking Help', {
          exact: true,
        })
        .last()
    ).toBeVisible();
  });

  test('TC_SK_019 - Selected skill can be deselected', async ({ page }) => {
    await selectSkill(
      page,
      'Clothing Assistance',
      'Borrow Clothes'
    );

    await openCategory(
      page,
      'Clothing Assistance'
    );

    const borrowClothes = page
      .getByText('Borrow Clothes', {
        exact: true,
      })
      .first();

    await borrowClothes
      .locator('..')
      .click({
        force: true,
      });

    const selectedSkillsSection = page
      .getByText('Selected Skills', {
        exact: true,
      })
      .locator('..');

    await expect(
      selectedSkillsSection.getByText(
        'Borrow Clothes',
        {
          exact: true,
        }
      )
    ).toHaveCount(0);
  });

  test('TC_SK_020 - General skill is selected by default', async ({ page }) => {
    await expect(
      page.getByText('Selected Skills', {
        exact: true,
      })
    ).toBeVisible();

    await expect(
      page
        .getByText('General', {
          exact: true,
        })
        .first()
    ).toBeVisible();
  });

  test('TC_SK_021 - General is selected when no other skills are chosen', async ({ page }) => {
    await expect(
      page
        .getByText('General', {
          exact: true,
        })
        .first()
    ).toBeVisible();

    await expect(
      page.getByRole('button', {
        name: 'Save',
        exact: true,
      })
    ).toBeEnabled();
  });

  test('TC_SK_022 - Save button is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', {
        name: 'Save',
        exact: true,
      })
    ).toBeVisible();
  });

  test('TC_SK_023 - Cancel button is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', {
        name: 'Cancel',
        exact: true,
      })
    ).toBeVisible();
  });

  test('TC_SK_024 - Save selected skills', async ({ page }) => {
    await selectSkill(
      page,
      'Food & Essentials',
      'Cooking Help'
    );

    const saveButton = page.getByRole(
      'button',
      {
        name: 'Save',
        exact: true,
      }
    );

    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();

    await saveButton.click({
      force: true,
    });

    await expect(
      page.getByRole('button', {
        name: 'Edit',
        exact: true,
      })
    ).toBeVisible({
      timeout: 20000,
    });
  });

  test('TC_SK_025 - Save with no selected skills uses General by default', async ({ page }) => {
    const saveButton = page.getByRole(
      'button',
      {
        name: 'Save',
        exact: true,
      }
    );

    await saveButton.click({
      force: true,
    });

    await expect(
      page
        .getByText('General', {
          exact: true,
        })
        .first()
    ).toBeVisible({
      timeout: 20000,
    });
  });

  test('TC_SK_026 - Cancel discards unsaved changes', async ({ page }) => {
    await selectSkill(
      page,
      'Healthcare & Wellness',
      'Medication Reminders'
    );

    await page
      .getByRole('button', {
        name: 'Cancel',
        exact: true,
      })
      .click({
        force: true,
      });

    await expect(
      page.getByRole('button', {
        name: 'Edit',
        exact: true,
      })
    ).toBeVisible({
      timeout: 20000,
    });

    await page
      .getByRole('button', {
        name: 'Edit',
        exact: true,
      })
      .click({
        force: true,
      });

    await openCategory(
      page,
      'Healthcare & Wellness'
    );

    const selectedSkillsSection = page
      .getByText('Selected Skills', {
        exact: true,
      })
      .locator('..');

    await expect(
      selectedSkillsSection.getByText(
        'Medication Reminders',
        {
          exact: true,
        }
      )
    ).toHaveCount(0);
  });

  test('TC_SK_027 - Saved skills remain after refresh', async ({ page }) => {
    await selectSkill(
      page,
      'Housing Assistance',
      'Move-in Help'
    );

    const saveButton = page.getByRole(
      'button',
      {
        name: 'Save',
        exact: true,
      }
    );

    await saveButton.click({
      force: true,
    });

    await expect(
      page.getByRole('button', {
        name: 'Edit',
        exact: true,
      })
    ).toBeVisible({
      timeout: 20000,
    });

    await page.reload({
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    const skillsButton = page.getByRole(
      'button',
      {
        name: 'Skills',
        exact: true,
      }
    );

    await expect(skillsButton).toBeVisible({
      timeout: 20000,
    });

    await skillsButton.click({
      force: true,
    });

    const editButton = page.getByRole(
      'button',
      {
        name: 'Edit',
        exact: true,
      }
    );

    await expect(editButton).toBeVisible({
      timeout: 20000,
    });

    await editButton.click({
      force: true,
    });

    await openCategory(
      page,
      'Housing Assistance'
    );

    await expect(
      page
        .getByText('Move-in Help', {
          exact: true,
        })
        .first()
    ).toBeVisible({
      timeout: 15000,
    });
  });

  test('TC_SK_028 - Main card UI elements are aligned and visible', async ({ page }) => {
    await expect(
      page
        .getByText(
          'Clothing Assistance',
          {
            exact: true,
          }
        )
        .first()
    ).toBeVisible();

    await expect(
      page.getByText('Selected Skills', {
        exact: true,
      })
    ).toBeVisible();

    await expect(
      page.getByRole('button', {
        name: 'Save',
        exact: true,
      })
    ).toBeVisible();

    await expect(
      page.getByRole('button', {
        name: 'Cancel',
        exact: true,
      })
    ).toBeVisible();
  });

  test('TC_SK_029 - Profile sidebar remains visible with Skills selected', async ({ page }) => {
    await expect(
      page.getByRole('button', {
        name: 'Your Profile',
        exact: true,
      })
    ).toBeVisible();

    await expect(
      page.getByRole('button', {
        name: 'Skills',
        exact: true,
      })
    ).toBeVisible();
  });

  test('TC_SK_030 - No duplicate sub-skills appear within a category', async ({ page }) => {
    const categoryNames = [
      'Clothing Assistance',
      'Education & Career Support',
      'Elderly Community Assistance',
      'Food & Essentials',
      'Healthcare & Wellness',
      'Housing Assistance',
    ];

    for (const category of categoryNames) {
      await openCategory(page, category);

      const expectedSkills =
        categories[category];

      const visibleSkills = [];

      for (const skill of expectedSkills) {
        const skillLocator = page
          .getByText(skill, {
            exact: true,
          })
          .first();

        if (await skillLocator.isVisible()) {
          visibleSkills.push(skill);
        }
      }

      const uniqueSkills = new Set(
        visibleSkills
      );

      expect(uniqueSkills.size).toBe(
        visibleSkills.length
      );
    }
  });
})