import { test, expect } from '@playwright/test';
import { volunteerTestData as data } from '../test-data';

test.describe('Volunteer Services Flow', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(data.urls.home);
    await page.waitForTimeout(1500); // see home load
  });

  const openVolunteerMenu = async (page) => {
    await page.getByRole('button', { name: 'Volunteer Services' }).click();
    await page.waitForTimeout(1500); // see dropdown open
  };

  test('How We Operate -> Contact', async ({ page }) => {

    await openVolunteerMenu(page);

    await page.getByRole('menuitem', { name: 'How We Operate' }).click();
    await page.waitForTimeout(1500); // see navigation

    await expect(page).toHaveURL(data.urls.howWeOperate);

    await page.getByRole('button', { name: 'Join the Community' }).click();
    await page.waitForTimeout(1500); // see contact page

    await expect(page).toHaveURL(data.urls.contact);
  });

  test('Our Collaborators page loads and goes to contact page',async({page}) => {
    await openVolunteerMenu(page);
    await page.getByRole('menuitem', { name: 'Our Collaborators' }).click();
    await page.waitForTimeout(1500);

    await expect(page).toHaveURL(/collaborators/);
    await page.waitForTimeout(1500);
    await page.getByRole('link', { name: 'Join the Community' }).click();
    //await page.getByText('Join the Community', { exact: true }).click();
    await page.waitForTimeout(1500);

    await expect(page).toHaveURL(data.urls.contact);
  });
  
  test('Collaborators -> Volunteer Match opens new tab', async ({ page }) => {

    await openVolunteerMenu(page);

    await page.getByRole('menuitem', { name: 'Our Collaborators' }).click();
    await page.waitForTimeout(1500);

    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.getByRole('link', { name: 'Volunteer Match' }).click()
    ]);

    await newPage.waitForTimeout(2000); // see new tab
    await expect(newPage).toHaveURL(data.urls.volunteerMatch);

    await newPage.close();
  });

});
