export const volunteerTestData = {
  urls: {
    home: 'https://test-saayam.netlify.app/',
    howWeOperate: /how-we-operate/,
    collaborators: /collaborators/,
    contact: /contact/i,
    volunteerMatch: 'https://www.idealist.org/volunteermatch'
  },

  locators: {
    menuButton: 'text=Volunteer Services',
    menuRole: 'ul[role="menu"]',
    howWeOperate: 'a[href="/how-we-operate"]',
    collaborators: 'a[href="/collaborators"]',
    joinCommunity: 'text=Join the Community',
    volunteerMatch: 'a[href="https://www.idealist.org/volunteermatch"]'
  }
};
