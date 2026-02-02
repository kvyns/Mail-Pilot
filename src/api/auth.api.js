import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';

// Mock mode - set to false when backend is ready
const MOCK_MODE = true;

// Mock delay to simulate network request
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data
const mockUser = {
  id: 1,
  email: 'demo@mailpilot.com',
  name: 'Demo User',
  role: 'admin',
};

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
      name: userData.name,
      email: userData.email,
      mobile: userData.mobile,
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
      code: verificationData.verificationCode,
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
    
    return apiClient.post(API_ENDPOINTS.BUSINESS_ADD, {
      email: businessData.email,
      businessName: businessData.businessName,
      businessType: businessData.businessType,
      companySize: businessData.companySize,
      industry: businessData.industry,
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

  // Validate Token
  validateToken: async (token) => {
    if (MOCK_MODE) {
      await mockDelay(200);
      return {
        success: true,
        data: {
          valid: true,
          user: mockUser,
        },
      };
    }
    
    return apiClient.get(API_ENDPOINTS.VALIDATE_TOKEN, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Get User Profile
  getUserProfile: async () => {
    if (MOCK_MODE) {
      await mockDelay(300);
      return {
        success: true,
        data: mockUser,
      };
    }
    
    return apiClient.get(API_ENDPOINTS.USER_PROFILE);
  },

  // Resend Verification Code
  resendCode: async (email) => {
    if (MOCK_MODE) {
      await mockDelay(500);
      return {
        success: true,
        data: {
          message: 'Verification code sent to email',
        },
      };
    }
    
    return apiClient.post(API_ENDPOINTS.RESEND_CODE, { email });
  },

  // Change Password
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
      currentPassword: passwordData.currentPassword,
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
};
