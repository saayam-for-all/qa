// test-data/contact-data.js
export const contactTestData = {
  pageUrl: 'https://test-saayam.netlify.app/contact',
  homeUrl: 'https://test-saayam.netlify.app/',
  
  // Page Content
  pageContent: {
    heading: 'Contact Us',
    description: 'Email, call, or complete the form to learn how Saayam for All can help you with your challenges',
    email: 'hr@saayamforall.org',
    formHeading: 'Get In Touch',
    formSubheading: 'You can reach us anytime',
    faqHeading: "FAQ's",
  },
  
  // FAQ Questions
  faqQuestions: [
    'What services does Saayam for All offer?',
    'How can I become a volunteer?',
    'Is Saayam for All a non-profit?',
  ],
  
  // Form Fields
  formFields: {
    firstName: {
      label: '*First Name',
      placeholder: 'Enter your first name',
    },
    lastName: {
      label: '*Last Name',
      placeholder: 'Enter your last name',
    },
    email: {
      label: '*Email',
      placeholder: 'Enter your email',
    },
    phone: {
      label: '*Phone (preferably WhatsApp)',
      placeholder: 'Your Phone Number',
    },
    message: {
      label: '*Message',
      placeholder: 'Enter your message',
    },
  },
  
  // Valid Form Data for testing
  validFormData: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'saayamqa@yahoo.com',
    phone: '5005550006',
    message: 'This is a test message from QA automation.',
  },
  
  // Invalid Form Data for validation testing
  invalidFormData: {
    invalidEmail: 'invalid-email',
  },
  
  // Navigation URLs (regex patterns)
  navigationUrls: {
    contact: /.*contact.*/,
    terms: /.*terms.*/,
  },
  
  // Terms and Conditions
  termsText: 'terms and conditions',
};
