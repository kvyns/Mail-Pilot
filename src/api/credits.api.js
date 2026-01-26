import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';

const MOCK_MODE = true;
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock credits data
let mockCredits = {
  balance: 5000,
  used: 1500,
  total: 6500,
};

let mockHistory = [
  { id: 1, type: 'purchase', amount: 5000, description: 'Initial credits', date: '2026-01-10T10:00:00' },
  { id: 2, type: 'usage', amount: -150, description: 'Welcome Campaign', date: '2026-01-20T10:30:00' },
  { id: 3, type: 'usage', amount: -200, description: 'Product Update Campaign', date: '2026-01-22T14:15:00' },
  { id: 4, type: 'purchase', amount: 1500, description: 'Credit top-up', date: '2026-01-23T09:00:00' },
  { id: 5, type: 'usage', amount: -175, description: 'Newsletter Campaign', date: '2026-01-24T11:45:00' },
];

export const creditsAPI = {
  // Get credit balance
  getBalance: async () => {
    if (MOCK_MODE) {
      await mockDelay();
      return {
        success: true,
        data: mockCredits,
      };
    }
    
    return apiClient.get(API_ENDPOINTS.CREDITS);
  },

  // Get credit history
  getHistory: async (params = {}) => {
    if (MOCK_MODE) {
      await mockDelay();
      let filtered = [...mockHistory];
      
      if (params.type) {
        filtered = filtered.filter(h => h.type === params.type);
      }
      
      return {
        success: true,
        data: filtered,
        total: filtered.length,
      };
    }
    
    return apiClient.get(API_ENDPOINTS.CREDITS_HISTORY, { params });
  },

  // Purchase credits
  purchase: async (amount) => {
    if (MOCK_MODE) {
      await mockDelay(1000);
      const newTransaction = {
        id: Date.now(),
        type: 'purchase',
        amount,
        description: `Purchased ${amount} credits`,
        date: new Date().toISOString(),
      };
      mockHistory.unshift(newTransaction);
      mockCredits.balance += amount;
      mockCredits.total += amount;
      
      return {
        success: true,
        data: {
          transaction: newTransaction,
          newBalance: mockCredits.balance,
        },
      };
    }
    
    return apiClient.post(API_ENDPOINTS.CREDITS_PURCHASE, { amount });
  },

  // Deduct credits (internal use - when sending campaigns)
  deduct: async (amount, description) => {
    if (MOCK_MODE) {
      await mockDelay(300);
      if (mockCredits.balance < amount) {
        throw { message: 'Insufficient credits' };
      }
      
      const newTransaction = {
        id: Date.now(),
        type: 'usage',
        amount: -amount,
        description,
        date: new Date().toISOString(),
      };
      mockHistory.unshift(newTransaction);
      mockCredits.balance -= amount;
      mockCredits.used += amount;
      
      return {
        success: true,
        data: {
          transaction: newTransaction,
          newBalance: mockCredits.balance,
        },
      };
    }
    
    return apiClient.post(`${API_ENDPOINTS.CREDITS}/deduct`, { amount, description });
  },
};
