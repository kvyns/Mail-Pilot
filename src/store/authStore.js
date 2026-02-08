import { create } from 'zustand';
import { authAPI } from '../api/auth.api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  accounts: [], // Available accounts for the user
  selectedAccount: null, // Currently selected account

  // Initialize auth from localStorage
  initAuth: () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    const selectedAccount = localStorage.getItem('selectedAccount');
    
    if (token && user) {
      set({
        token,
        user: JSON.parse(user),
        isAuthenticated: true,
        selectedAccount: selectedAccount ? JSON.parse(selectedAccount) : null,
      });
    }
  },

  // Login
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(credentials);
      console.log('Login response:', response);
      
      // Handle different response structures
      const data = response.data || response;
      let { user, token, accounts } = data;
      
      // Backend returns token but no user object - construct user from credentials
      if (!user && token) {
        user = {
          email: credentials.email,
          name: credentials.email.split('@')[0], // Use email username as name
          role: 'user'
        };
        console.log('Constructed user object:', user);
      }
      
      if (!token) {
        throw new Error('Invalid response from server: missing token');
      }
      
      // Check if user has multiple accounts
      if (accounts && accounts.length > 1) {
        // Multiple accounts - need account selection
        set({
          accounts,
          user: { ...user, email: credentials.email },
          isLoading: false,
        });
        return { success: true, multipleAccounts: true, accounts };
      }
      
      // Single account or no accounts array - proceed with login
      const selectedAccount = accounts && accounts.length === 1 ? accounts[0] : null;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (selectedAccount) {
        localStorage.setItem('selectedAccount', JSON.stringify(selectedAccount));
      }
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        accounts: accounts || [],
        selectedAccount,
      });
      
      return { success: true, multipleAccounts: false };
    } catch (error) {
      console.error('Login error in store:', error);
      set({
        error: error.message || 'Login failed',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Select Account (for multi-account users)
  selectAccount: async (account) => {
    const { user, accounts } = get();
    
    // Generate token for selected account (in real scenario, call API)
    const token = 'mock-jwt-token-' + Date.now();
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify({ ...user, ...account }));
    localStorage.setItem('selectedAccount', JSON.stringify(account));
    
    set({
      token,
      selectedAccount: account,
      user: { ...user, ...account },
      isAuthenticated: true,
    });
    
    return { success: true };
  },

  // Register
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(userData);
      const { user, token } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return { success: true };
    } catch (error) {
      set({
        error: error.message || 'Registration failed',
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Logout
  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedAccount');
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
        accounts: [],
        selectedAccount: null,
      });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
