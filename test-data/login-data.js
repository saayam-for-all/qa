// test-data/login-data.js
import dotenv from 'dotenv';
import { loginTestData as localLoginTestData } from '../testLoginData/login-data.js';

dotenv.config();

const resolvedEmail = process.env.TEST_EMAIL || localLoginTestData?.validCredentials?.email;
const resolvedPassword = process.env.TEST_PASSWORD || localLoginTestData?.validCredentials?.password;

export const loginTestData = {
  validCredentials: {
    email: resolvedEmail,
    password: resolvedPassword
  },
  invalidCredentials: {
    email: 'invalid@example.com',
    password: 'wrongpassword'
  }
};
