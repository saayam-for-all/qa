// test-data/home-data.js
export const homeTestData = {
  pageUrl: 'https://test-saayam.netlify.app/',
  
  // Page Content
  pageContent: {
    tagline: 'Real help. Real people. Right when you need it.',
    mainHeading: 'Need help? Here to help?',
    subHeading: 'At Saayam for All, your support can make a real difference today.',
  },
  
  // Navigation Items
  navigation: {
    home: 'Home',
    aboutUs: 'About Us',
    volunteerServices: 'Volunteer Services',
    contactUs: 'Contact Us',
    donate: 'Donate',
    logIn: 'Log In',
  },
  
  // Footer Navigation Items
  footerNavigation: {
    home: 'Home',
    ourMission: 'Our Mission',
    ourTeam: 'Our Team',
    howWeOperate: 'How We Operate',
    contactUs: 'Contact Us',
    donate: 'Donate',
  },
  
  // Footer Legal Links
  footerLegal: {
    siteMap: 'Site Map',
    termsAndConditions: 'Terms and Conditions',
    privacyPolicy: 'Privacy Policy',
  },
  
  // Footer Content
  footerContent: {
    copyright: 'Copyright © 2026 Saayam For All. All rights reserved.',
  },
  
  // About Us Dropdown Items (update these based on actual menu items)
  aboutUsDropdown: [
    'Our Story',
    'Our Team',
    'Our Mission',
  ],
  
  // Volunteer Services Dropdown Items (update these based on actual menu items)
  volunteerServicesDropdown: [
    'Become a Volunteer',
    'Volunteer Opportunities',
    'Volunteer Impact',
  ],
  
  // Service Cards
  serviceCards: [
    {
      title: 'Sarve jana sukhino bhavantu',
    },
    {
      title: 'iñānam vardhati sanchavāt',
    },
    {
      title: 'Manava sevaye Madhava seva',
      subtitle: 'Service to mankind is',
    },
  ],
  
  // Expected Navigation URLs
  navigationUrls: {
    home: /.*\/(home)?$/,
    aboutUs: /.*about.*/i,
    ourMission: /.*mission.*/i,
    ourTeam: /.*team.*/i,
    howWeOperate: /.*operate.*/i,
    volunteerServices: /.*volunteer.*/i,
    contactUs: /.*contact.*/i,
    donate: /.*donate.*/i,
    logIn: /.*login.*/i,
    siteMap: /.*sitemap.*/i,
    terms: /.*terms.*/i,
    privacy: /.*privacy.*/i,
  },
};
