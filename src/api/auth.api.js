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

  // Register
  register: async (userData) => {
    if (MOCK_MODE) {
      await mockDelay();
      const token = 'mock-jwt-token-' + Date.now();
      return {
        success: true,
        data: {
          user: { ...mockUser, ...userData, id: Date.now() },
          token,
        },
      };
    }
    
    return apiClient.post(API_ENDPOINTS.REGISTER, userData);
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
};
