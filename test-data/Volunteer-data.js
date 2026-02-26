export const volunteerTestData = {
  urls: {
    home: 'https://test-saayam.netlify.app/',
    howWeOperate: /how-we-operate/,
    collaborators: /collaborators/,
    contact: /contact/i,
    volunteerMatch: 'https://www.idealist.org/volunteermatch'
  },

  locators: {
    // Matches: await page.getByRole('button', { name: 'Volunteer Services' })
    menuButton: { role: 'button', name: 'Volunteer Services' },
    // Matches: await page.getByRole('menuitem', { name: 'How We Operate' })
    howWeOperate: { role: 'menuitem', name: 'How We Operate' },
    // Matches: await page.getByRole('menuitem', { name: 'Our Collaborators' })
    collaborators: { role: 'menuitem', name: 'Our Collaborators' },
    //For how we operate
    joinCommunityBtn: { role: 'button', name: 'Join the community' }, 
    //For our collaborators
    joinCommunityLink: { role: 'link', name: 'Join the community' },
    // Matches: await page.getByRole('link', { name: 'Volunteer Match Volunteer' })
    volunteerMatch: { role: 'link', name: 'Volunteer Match Volunteer' }
  }
};
