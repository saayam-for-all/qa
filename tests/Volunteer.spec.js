/*import { test, expect } from '@playwright/test';
import { volunteerTestData as data } from '../test-data';

test.describe('Volunteer Services Flow', () => {

  test('Volunteer Services full flow', async ({ page }) => {

  // Go to home only once
  await page.goto(data.urls.home);

  // Open Volunteer Services
  await page.getByRole(menuButton.role, { name: menuButton.name }).click();

  // Go to How We Operate
  await page.getByRole(howWeOperate.role, { name: howWeOperate.name }).click();
  await expect(page).toHaveURL(data.urls.howWeOperate);

  // Click Join Community
  await page.getByRole(joinCommunityBtn.role, { name: joinCommunityBtn.name }).click();
  await expect(page).toHaveURL(data.urls.contact);
  await page.waitForTimeout(1500);

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

});*/

import { test, expect } from '@playwright/test';
import { volunteerTestData as data } from '../test-data';

const { menuButton, howWeOperate, collaborators, joinCommunityBtn, joinCommunityLink, volunteerMatch } = data.locators;

test.describe('Volunteer Services Flow', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(data.urls.home);
    await page.waitForTimeout(1500)
  });
  
  const openVolunteerMenu = async (page) => {
    //await page.goto(data.urls.home);
    await page.getByRole(menuButton.role, { name: menuButton.name }).click();
    await page.waitForTimeout(1500);
  };
  

  test('How We Operate -> Contact', async ({ page }) => {

    await openVolunteerMenu(page);

    await page.getByRole(howWeOperate.role, { name: howWeOperate.name }).click();
    
    await expect(page).toHaveURL(data.urls.howWeOperate);
    await page.waitForTimeout(1500);
    //await page.getByRole(data.locators.joinCommunityBtn.role, { name: data.locators.joinCommunityBtn.name }).click();
    await page.getByRole(joinCommunityBtn.role, { name: joinCommunityBtn.name }).click();
    await expect(page).toHaveURL(data.urls.contact);
    await page.waitForTimeout(1500);
  });

  test('Our Collaborators -> Contact', async ({ page }) => {

    await openVolunteerMenu(page);

    await page.getByRole(collaborators.role, { name: collaborators.name }).click();
    await expect(page).toHaveURL(data.urls.collaborators);
    await page.waitForTimeout(1500);

    await page.getByRole(joinCommunityLink.role, { name: joinCommunityLink.name }).click();
    await expect(page).toHaveURL(data.urls.contact);
    await page.waitForTimeout(1500);
  });

  test('Collaborators -> Volunteer Match opens new tab', async ({ page }) => {

    await openVolunteerMenu(page);

    await page.getByRole(collaborators.role, { name: collaborators.name }).click();

    const newPagePromise = page.context().waitForEvent('page');
    await page.getByRole(volunteerMatch.role, { name: volunteerMatch.name }).click();
    const newPage = await newPagePromise;

    await newPage.waitForLoadState();
    await expect(newPage).toHaveURL(data.urls.volunteerMatch);
    await page.waitForTimeout(1500);
    await newPage.close();
  });

});

