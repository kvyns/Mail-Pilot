import { create } from 'zustand';
import { creditsAPI } from '../api/credits.api';

export const useCreditStore = create((set, get) => ({
  balance: 0,
  used: 0,
  total: 0,
  history: [],
  isLoading: false,
  error: null,

  // Fetch credit balance
  fetchBalance: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await creditsAPI.getBalance();
      set({
        balance: response.data.balance,
        used: response.data.used,
        total: response.data.total,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.message || 'Failed to fetch credit balance',
        isLoading: false,
      });
    }
  },

  // Fetch credit history
  fetchHistory: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await creditsAPI.getHistory(params);
      set({
        history: response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.message || 'Failed to fetch credit history',
        isLoading: false,
      });
    }
  },

  // Purchase credits
  purchaseCredits: async (amount) => {
    set({ isLoading: true, error: null });
    try {
      const response = await creditsAPI.purchase(amount);
      
      set(state => ({
        balance: response.data.newBalance,
        total: state.total + amount,
        history: [response.data.transaction, ...state.history],
        isLoading: false,
      }));
      
      return { success: true };
    } catch (error) {
      set({
        error: error.message || 'Failed to purchase credits',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Deduct credits (when sending campaigns)
  deductCredits: async (amount, description) => {
    const currentBalance = get().balance;
    
    if (currentBalance < amount) {
      set({ error: 'Insufficient credits' });
      return { success: false, error: 'Insufficient credits' };
    }

    set({ isLoading: true, error: null });
    try {
      const response = await creditsAPI.deduct(amount, description);
      
      set(state => ({
        balance: response.data.newBalance,
        used: state.used + amount,
        history: [response.data.transaction, ...state.history],
        isLoading: false,
      }));
      
      return { success: true };
    } catch (error) {
      set({
        error: error.message || 'Failed to deduct credits',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Check if sufficient credits
  hasEnoughCredits: (amount) => {
    return get().balance >= amount;
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
