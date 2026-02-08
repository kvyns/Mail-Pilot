import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';

const MOCK_MODE = false;
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock users data
let mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', createdAt: '2026-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active', createdAt: '2026-01-18' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive', createdAt: '2026-01-20' },
];

export const usersAPI = {
  // Get all users
  getAll: async (params = {}) => {
    if (MOCK_MODE) {
      await mockDelay();
      let filtered = [...mockUsers];
      
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(u => 
          u.name.toLowerCase().includes(search) || 
          u.email.toLowerCase().includes(search)
        );
      }
      
      if (params.status) {
        filtered = filtered.filter(u => u.status === params.status);
      }
      
      return {
        success: true,
        data: filtered,
        total: filtered.length,
      };
    }
    
    return apiClient.get(API_ENDPOINTS.USERS, { params });
  },

  // Get user by ID
  getById: async (id) => {
    if (MOCK_MODE) {
      await mockDelay();
      const user = mockUsers.find(u => u.id === parseInt(id));
      if (!user) throw { message: 'User not found' };
      return { success: true, data: user };
    }
    
    return apiClient.get(`${API_ENDPOINTS.USERS}/${id}`);
  },

  // Create user
  create: async (userData) => {
    if (MOCK_MODE) {
      await mockDelay();
      const newUser = {
        id: Date.now(),
        ...userData,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      mockUsers.push(newUser);
      return { success: true, data: newUser };
    }
    
    return apiClient.post(API_ENDPOINTS.USERS, userData);
  },

  // Update user
  update: async (id, userData) => {
    if (MOCK_MODE) {
      await mockDelay();
      const index = mockUsers.findIndex(u => u.id === parseInt(id));
      if (index === -1) throw { message: 'User not found' };
      mockUsers[index] = { ...mockUsers[index], ...userData };
      return { success: true, data: mockUsers[index] };
    }
    
    return apiClient.put(`${API_ENDPOINTS.USERS}/${id}`, userData);
  },

  // Delete user
  delete: async (id) => {
    if (MOCK_MODE) {
      await mockDelay();
      mockUsers = mockUsers.filter(u => u.id !== parseInt(id));
      return { success: true };
    }
    
    return apiClient.delete(`${API_ENDPOINTS.USERS}/${id}`);
  },

  // Import users (CSV/Excel)
  import: async (file) => {
    if (MOCK_MODE) {
      await mockDelay(1000);
      // Simulate imported users
      const importedCount = Math.floor(Math.random() * 50) + 10;
      return {
        success: true,
        data: {
          imported: importedCount,
          failed: 0,
          message: `Successfully imported ${importedCount} users`,
        },
      };
    }
    
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(API_ENDPOINTS.USERS_IMPORT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Invite user
  invite: async (inviteData) => {
    if (MOCK_MODE) {
      await mockDelay();
      return {
        success: true,
        data: {
          email: inviteData.email,
          role: inviteData.role,
          invitationSent: true,
          invitationId: 'INV-' + Date.now(),
          message: 'Invitation sent successfully',
        },
      };
    }
    
    return apiClient.post(API_ENDPOINTS.USERS_INVITE, inviteData);
  },

  // Activate invited user
  activate: async (activationData) => {
    if (MOCK_MODE) {
      await mockDelay();
      const newUser = {
        id: Date.now(),
        email: activationData.email,
        name: activationData.name,
        role: activationData.role || 'user',
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      mockUsers.push(newUser);
      const token = 'mock-jwt-token-' + Date.now();
      return {
        success: true,
        data: {
          user: newUser,
          token,
        },
      };
    }
    
    return apiClient.post(API_ENDPOINTS.USERS_ACTIVATE, activationData);
  },

  // Resend invitation
  resendInvite: async (email) => {
    if (MOCK_MODE) {
      await mockDelay();
      return {
        success: true,
        data: {
          email,
          message: 'Invitation resent successfully',
        },
      };
    }
    
    return apiClient.post(API_ENDPOINTS.USERS_RESEND_INVITE, { email });
  },

  // Export users
  export: async (format = 'csv') => {
    if (MOCK_MODE) {
      await mockDelay();
      return {
        success: true,
        data: mockUsers,
      };
    }
    
    return apiClient.get(API_ENDPOINTS.USERS_EXPORT, {
      params: { format },
      responseType: 'blob',
    });
  },
};
