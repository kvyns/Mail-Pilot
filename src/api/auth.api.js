import apiClient from './apiClient';
import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from './config';

// Public client — no Authorization header (used for No Auth Header endpoints)
const publicApiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});
publicApiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An error occurred';
    return Promise.reject(new Error(msg));
  }
);

// Mock mode - set to false when backend is ready
const MOCK_MODE = false;

// Mock delay to simulate network request
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data
const mockUser = {
  id: 1,
  email: 'demo@mailpilot.com',
  name: 'Demo User',
  role: 'admin',
};

// Mock accounts for multi-account testing
const mockAccounts = [
  {
    id: 1,
    businessName: 'TechCorp Solutions',
    businessType: 'Technology',
    industry: 'Software Development',
    companySize: '50-200 employees',
    role: 'admin',
  },
  {
    id: 2,
    businessName: 'Marketing Agency Pro',
    businessType: 'Marketing',
    industry: 'Digital Marketing',
    companySize: '10-50 employees',
    role: 'manager',
  },
];

export const authAPI = {
  // Login
  login: async (credentials) => {
    if (MOCK_MODE) {
      await mockDelay();
      if (credentials.email === 'demo@mailpilot.com' && credentials.password === 'demo123') {
        const token = 'mock-jwt-token-' + Date.now();
        return {
          success: true,
          data: {
            user: mockUser,
            token,
            accounts: mockAccounts, // Multiple accounts for this user
          },
        };
      }
      throw { message: 'Invalid credentials' };
    }
    
    return apiClient.post(API_ENDPOINTS.LOGIN, credentials);
  },

  // Register (Step 1)
  register: async (userData) => {
    if (MOCK_MODE) {
      await mockDelay();
      return {
        success: true,
        data: {
          userId: Date.now(),
          email: userData.email,
          message: 'Verification code sent to email',
        },
      };
    }
    
    return apiClient.post(API_ENDPOINTS.REGISTER, {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      mobileNumber: userData.mobileNumber,
      password: userData.password,
    });
  },

  // Verify Email (Step 2)
  verifyEmail: async (verificationData) => {
    if (MOCK_MODE) {
      await mockDelay();
      return {
        success: true,
        data: {
          verified: true,
          message: 'Email verified successfully',
        },
      };
    }
    
    return apiClient.post(API_ENDPOINTS.EMAIL_VERIFY, {
      email: verificationData.email,
      code: verificationData.code,
    });
  },

  // Add Business Details (Step 3)
  addBusinessDetails: async (businessData) => {
    if (MOCK_MODE) {
      await mockDelay();
      const token = 'mock-jwt-token-' + Date.now();
      return {
        success: true,
        data: {
          user: { ...mockUser, ...businessData, id: Date.now() },
          token,
        },
      };
    }
    
    return publicApiClient.post(API_ENDPOINTS.BUSINESS_ADD, {
      email: businessData.email,
      account: {
        email:       businessData.businessEmail || '',
        name:        businessData.businessName  || '',
        phone:       businessData.businessPhone || '',
        website:     businessData.website       || '',
        x:           businessData.x             || '',
        facebook:    businessData.facebook      || '',
        instagram:   businessData.instagram     || '',
        tiktok:      businessData.tiktok        || '',
        tripadviser: businessData.tripadviser   || '',
      },
    });
  },

  // Logout
  logout: async () => {
    if (MOCK_MODE) {
      await mockDelay(200);
      return { success: true };
    }
    
    return apiClient.post(API_ENDPOINTS.LOGOUT);
  },

  // Refresh token
  refreshToken: async () => {
    if (MOCK_MODE) {
      await mockDelay(200);
      const token = 'mock-jwt-token-' + Date.now();
      return {
        success: true,
        data: { token },
      };
    }
    
    return apiClient.post(API_ENDPOINTS.REFRESH_TOKEN);
  },

  // Validate Token — GET /validate/token Bearer Token
  // Response: { tokenExpired: false }
  validateToken: async () => {
    return apiClient.get(API_ENDPOINTS.VALIDATE_TOKEN);
  },

  // Get User Profile — GET /user Bearer Token
  // Response: { user: { email, firstName, lastName, ... } }
  getUserProfile: async () => {
    return apiClient.get(API_ENDPOINTS.USER_PROFILE);
  },

  // Resend Verification Code / Generate Code
  resendCode: async (email, reason = 'Email Verification') => {
    if (MOCK_MODE) {
      await mockDelay(500);
      return {
        success: true,
        data: {
          message: 'Verification code sent to email',
        },
      };
    }
    
    return apiClient.post(API_ENDPOINTS.RESEND_CODE, { 
      email,
      reason // 'Email Verification' or 'Reset Password'
    });
  },

  // Change Password (requires authentication)
  changePassword: async (passwordData) => {
    if (MOCK_MODE) {
      await mockDelay(500);
      return {
        success: true,
        data: {
          message: 'Password changed successfully',
        },
      };
    }
    
    return apiClient.post(API_ENDPOINTS.PASSWORD_CHANGE, {
      email: passwordData.email,
      password: passwordData.password,
      newPassword: passwordData.newPassword,
    });
  },

  // Reset Password
  resetPassword: async (resetData) => {
    if (MOCK_MODE) {
      await mockDelay(500);
      return {
        success: true,
        data: {
          message: 'Password reset link sent to email',
        },
      };
    }
    
    return apiClient.post(API_ENDPOINTS.PASSWORD_RESET, {
      email: resetData.email,
      code: resetData.code,
      newPassword: resetData.newPassword,
    });
  },

  // Get Business Account details
  // GET /business/account  No Auth  Query: accountID
  getBusinessAccount: async (accountID) => {
    if (MOCK_MODE) {
      await mockDelay();
      return { success: true, data: {} };
    }
    return publicApiClient.get(API_ENDPOINTS.BUSINESS_ACCOUNT, { params: { accountID } });
  },

  // Get all accounts linked to an email address
  // GET /user/accounts  No Auth  Query: email
  getUserAccounts: async (email) => {
    if (MOCK_MODE) {
      await mockDelay();
      return { success: true, data: [] };
    }
    return publicApiClient.get(API_ENDPOINTS.USER_ACCOUNTS, { params: { email } });
  },

  // Get a user's access/role for a specific account
  // GET /user/access  No Auth  Query: email, accountID
  getUserAccess: async (email, accountID) => {
    if (MOCK_MODE) {
      await mockDelay();
      return { success: true, data: {} };
    }
    return publicApiClient.get(API_ENDPOINTS.USER_ACCESS, { params: { email, accountID } });
  },
};
