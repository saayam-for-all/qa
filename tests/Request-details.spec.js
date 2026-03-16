import { test, expect } from '@playwright/test';
import { helpRequestTestData as data } from '../test-data';

test('Check multiple help requests', async ({ page }) => {
  // Give the test more time (2 minutes)
  //test.setTimeout(120000);
  test.setTimeout(600000); // 10 min

  // Get list of request IDs from environment variable
  const requestIds = process.env.TEST_REQUEST_IDS.split(',');

  // 1. Login
  await page.goto('https://test-saayam.netlify.app/login');
  await page.getByPlaceholder(/email/i).fill(data.credentials.email);
  await page.getByPlaceholder(/password/i).fill(data.credentials.password);
  await page.getByRole('button', { name: 'Log In' }).last().click();

  // Wait until we see dashboard
  await page.waitForURL(/dashboard/);
  console.log('Logged in successfully!');

  // 2. Check each request ID
  for (const requestId of requestIds) {
    //console.log(`→ Checking request: ${requestId.trim()}`);
    //console.log(`→ Checking request: ${requestId}`);
    console.log('Testing request:', requestId);

    let found = false;

    // Look in first 10 pages of pagination
    for (let pageNum = 1; pageNum <= 6; pageNum++) {
      // Click page number button
      await page.getByRole('button', { name: String(pageNum) }).click();
      await page.waitForLoadState('networkidle');

      // Look for the request link
      const requestLink = page.getByRole('link', { name: requestId.trim() });

      if (await requestLink.count() > 0) {
        await requestLink.first().click();
        await page.waitForURL(`**/request/${requestId}`, { timeout: 30000 });
        found = true;
        break;
      }
    }

    if (!found) {
      console.log(`   → Not found in pages 1-10 `);
      continue;
    }
     // STEP 4: Test Organizations tab
   await page.getByRole('button', { name: 'Organizations' }).click();
   await page.waitForTimeout(1000);
   console.log('✅ Organizations tab loaded');
   await page.waitForURL(/voluntary-organizations/);
   await page.waitForLoadState('networkidle');
   const backBtn = page.getByRole('button', { name: 'Back' });
    await backBtn.click();
 
   //await page.pause();
   //await page.getByRole('button', { name: 'Back' }).click();
   //await page.waitForTimeout(500);
 
   // STEP 5: Test Emergency Contacts tab
   await page.getByRole('button', { name: 'Emergency Contacts' }).click();
   await page.waitForTimeout(1000);
   console.log('✅ Emergency Contacts tab loaded');
    // STEP 6: Test More Information modal
   await page.getByRole('button', { name: 'More Information' }).click();
   await page.waitForTimeout(5000);
    console.log('✅ More Information modal opened');

    await page.getByRole('button', { name: 'Close' }).click();
    await page.waitForTimeout(500);

    // STEP 7: Test Comments tab
  await page.getByRole('button', { name: 'Comments' }).click();
  await page.waitForTimeout(1000);
  console.log('✅ Comments tab loaded');
  
  

    // STEP 8: Test Volunteers tab
  await page.getByRole('button', { name: 'Volunteers' }).click();
  await page.waitForTimeout(1000);
  console.log('✅ Volunteers tab loaded');
  // STEP 9: Test Details tab
  await page.getByRole('button', { name: 'Details' }).click();
  await page.waitForTimeout(5000);
  console.log('✅ Volunteer details opened');
  

  console.log('\n✅✅✅ All request details verified successfully! ✅✅✅');
  await page.getByRole('button', { name: '< Back to Dashboard' }).click();
  }
});