import { create } from 'zustand';
import { authAPI } from '../api/auth.api';

/** Fetch /user/accounts and return the enriched accounts array, or fall back to `fallback`. */
async function fetchAccountsForEmail(email, fallback = []) {
  try {
    const res = await authAPI.getUserAccounts(email);
    const list = res?.accounts || res?.data?.accounts || res?.data || [];
    return Array.isArray(list) ? list : fallback;
  } catch {
    return fallback;
  }
}

/** Fetch /user/access and return the access object, or null on failure. */
async function fetchAccessForAccount(email, accountID) {
  if (!email || !accountID) return null;
  try {
    const res = await authAPI.getUserAccess(email, accountID);
    return res?.access || res?.data?.access || null;
  } catch {
    return null;
  }
}

/** Fetch /business/account and return the account object (has `name` field), or null on failure. */
async function fetchBusinessAccount(accountID) {
  if (!accountID) return null;
  try {
    const res = await authAPI.getBusinessAccount(accountID);
    return res?.account || res?.data?.account || null;
  } catch {
    return null;
  }
}

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  accounts: [], // Available accounts for the user
  selectedAccount: null, // Currently selected account
  userAccess: null, // Role/access info from /user/access
  isInitialized: false, // Track if auth has been initialized

  // Initialize auth from localStorage
  initAuth: () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    const selectedAccount = localStorage.getItem('selectedAccount');
    const accounts = localStorage.getItem('accounts');
    
    console.log('initAuth called');
    console.log('Token from localStorage:', token);
    console.log('User from localStorage:', user);
    
    if (token && user) {
      // Validate token format
      const isValidJWT = token.split('.').length === 3;
      
      if (!isValidJWT) {
        console.warn('Invalid JWT format in localStorage, clearing...');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('selectedAccount');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          selectedAccount: null,
          isInitialized: true,
        });
        return;
      }

      const parsedUser = JSON.parse(user);
      const cachedSelected = selectedAccount ? JSON.parse(selectedAccount) : null;
      const cachedAccounts = accounts ? JSON.parse(accounts) : [];

      // Set state immediately from cache so the UI isn't blocked
      set({
        token,
        user: parsedUser,
        isAuthenticated: true,
        selectedAccount: cachedSelected,
        accounts: cachedAccounts,
        isInitialized: true,
      });
      console.log('Auth restored, isAuthenticated:', true);

      // Background: validate token against API, then refresh accounts + access
      Promise.resolve().then(async () => {
        // 1. Check token expiry
        try {
          const vRes = await authAPI.validateToken(token);
          const expired = vRes?.tokenExpired ?? vRes?.data?.tokenExpired ?? false;
          if (expired) {
            console.warn('[initAuth] token expired — clearing session');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('selectedAccount');
            localStorage.removeItem('accounts');
            set({ token: null, user: null, isAuthenticated: false, selectedAccount: null, accounts: [], userAccess: null });
            if (!window.location.pathname.includes('/login')) window.location.href = '/login';
            return;
          }
        } catch { /* network error — keep existing session */ }

        // 2. Refresh accounts + access with authoritative accountIDs
        const liveAccounts = await fetchAccountsForEmail(parsedUser.email, cachedAccounts);
        if (!liveAccounts.length) return;
        localStorage.setItem('accounts', JSON.stringify(liveAccounts));
        const currentSel = get().selectedAccount;
        const matchFn = (a) =>
          a.accountID === currentSel?.accountID ||
          a.accountID === currentSel?.id ||
          a.accountID === currentSel?._id;
        const refreshed = currentSel ? (liveAccounts.find(matchFn) || liveAccounts[0]) : liveAccounts[0];
        const accountID = refreshed?.accountID || refreshed?.id || refreshed?._id;
        const [access, bizAccount] = await Promise.all([
          fetchAccessForAccount(parsedUser.email, accountID),
          fetchBusinessAccount(accountID),
        ]);
        const enriched = bizAccount ? { ...refreshed, name: bizAccount.name, businessName: bizAccount.name } : refreshed;
        if (enriched && accountID) localStorage.setItem('selectedAccount', JSON.stringify(enriched));
        set({ accounts: liveAccounts, selectedAccount: enriched || currentSel, userAccess: access });
      });
    } else {
      console.log('No auth data in localStorage');
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isInitialized: true,
      });
    }
  },

  // Login
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(credentials);
      console.log('Login response:', response);
      
      // API response is already unwrapped by axios interceptor
      // Response structure: { token, user, responseCode }
      const { user, token, accounts, responseCode } = response;
      
      if (!token) {
        throw new Error('Invalid response from server: missing token');
      }
      
      if (!user) {
        throw new Error('Invalid response from server: missing user data');
      }
      
      console.log('Token:', token);
      console.log('User:', user);
      console.log('Accounts from login:', JSON.stringify(accounts, null, 2));
      
      // Check if user has multiple accounts
      // Always fetch authoritative accounts from /user/accounts
      const liveAccounts = await fetchAccountsForEmail(
        credentials.email,
        accounts || []
      );
      const resolvedAccounts = liveAccounts.length ? liveAccounts : (accounts || []);

      if (resolvedAccounts.length > 1) {
        // Multiple accounts - need account selection
        localStorage.setItem('authToken', token);
        localStorage.setItem('accounts', JSON.stringify(resolvedAccounts));
        set({
          accounts: resolvedAccounts,
          token,
          user: { ...user, email: credentials.email },
          isLoading: false,
        });
        return { success: true, multipleAccounts: true, accounts: resolvedAccounts };
      }

      // Single account or no accounts — proceed with login
      const selectedAccount = resolvedAccounts.length === 1
        ? resolvedAccounts[0]
        : (user?.accountID || user?.accountId)
          ? {
              id:           user.accountID || user.accountId,
              accountID:    user.accountID || user.accountId,
              businessName: user.businessName || user.name || '',
            }
          : null;

      // Store in localStorage first
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accounts', JSON.stringify(resolvedAccounts));
      if (selectedAccount) {
        localStorage.setItem('selectedAccount', JSON.stringify(selectedAccount));
      }
      
      console.log('Stored token in localStorage:', localStorage.getItem('authToken'));
      
      // Then update state
      set({
        user,
        token,
        isAuthenticated: true,
        isInitialized: true,  // Mark as initialized after login
        isLoading: false,
        accounts: accounts || [],
        selectedAccount,
      });
      
      console.log('Auth state updated, isAuthenticated:', true);
      
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
    const { user, token: existingToken } = get();
    
    const token = existingToken;
    if (!token) {
      return { success: false, error: 'No active session token. Please log in again.' };
    }
    
    const mergedUser = { ...user, ...account };
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(mergedUser));
    
    // Fetch role/access and business name for the chosen account
    const accountID = account?.accountID || account?.id || account?._id;
    const [access, bizAccount] = await Promise.all([
      fetchAccessForAccount(user?.email, accountID),
      fetchBusinessAccount(accountID),
    ]);
    const enrichedAccount = bizAccount
      ? { ...account, name: bizAccount.name, businessName: bizAccount.name }
      : account;
    localStorage.setItem('selectedAccount', JSON.stringify(enrichedAccount));

    set({
      token,
      selectedAccount: enrichedAccount,
      user: mergedUser,
      isAuthenticated: true,
      userAccess: access,
    });
    
    return { success: true };
  },

  // Add / link a new organisation for this user
  addLinkedAccount: (newAccount) => {
    const { accounts } = get();
    // Deduplicate by id / _id / accountID
    const getId = (a) => a?.id || a?._id || a?.accountID;
    const exists = accounts.some((a) => getId(a) === getId(newAccount));
    const updated = exists
      ? accounts.map((a) => (getId(a) === getId(newAccount) ? { ...a, ...newAccount } : a))
      : [...accounts, newAccount];
    localStorage.setItem('accounts', JSON.stringify(updated));
    set({ accounts: updated });
  },

  // Register
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(userData);
      // /register just creates the user and sends a verification code
      // It does NOT return a token — next step is /email/verify
      set({ isLoading: false });
      return { success: true, email: userData.email };
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
      localStorage.removeItem('accounts');
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
        accounts: [],
        selectedAccount: null,
        userAccess: null,
      });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
