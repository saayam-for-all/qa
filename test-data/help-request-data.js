export const helpRequestTestData = {
    // Website URLs we'll visit
    urls: {
      home: 'https://test-saayam.netlify.app/',
      login: /login/,
      dashboard: /dashboard/,
      profile: /profile/,
      createRequest: /request|create/
    },
  
    // Login information - comes from .env file
    credentials: {
      email: process.env.TEST_USER_EMAIL||'',
      password: process.env.TEST_USER_PASSWORD||''
    },
  
    // Profile information
    profileData: {
      dob: {
        year: '1997',
        month: 'April',
        day: '16'
      },
      gender: 'Female',
      streetAddress: '123 Newyork',
      city: 'Newyork',
      state: 'New York',
      zipCode: '10001'
    },
  
    // Help request information
    requestData: {
      category: 'Donate Clothes',
      subject: 'Have Clothes for donation',
      description: 'Looking to donate clothes'
    }
  };