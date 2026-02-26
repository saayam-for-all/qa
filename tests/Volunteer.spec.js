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