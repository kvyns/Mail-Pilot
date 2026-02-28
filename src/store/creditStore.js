import { create } from 'zustand';
import { creditsAPI } from '../api/credits.api';
import { uploadAPI } from '../api/upload.api';
import { paymentAPI } from '../api/payment.api';

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
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const selectedAccount = JSON.parse(localStorage.getItem('selectedAccount') || '{}');
      const accountID =
        selectedAccount?.accountID || selectedAccount?.accountId ||
        selectedAccount?.id        || selectedAccount?._id       ||
        user?.accountID            || user?.accountId            ||
        user?.email;
      const response = await creditsAPI.getBalance(accountID);
      const data = response?.data ?? response ?? {};
      set({
        balance: data.balance ?? 0,
        used: data.used ?? 0,
        total: data.total ?? 0,
        isLoading: false,
      });
    } catch (error) {
      // Balance endpoint may not exist yet — fail silently so dashboard still loads
      console.warn('[fetchBalance] failed:', error?.message || error);
      set({ isLoading: false });
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

  // Purchase credits (old mock - kept for reference)
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

  // Fetch available credit packages from backend
  packages: [],
  fetchPackages: async () => {
    try {
      const response = await uploadAPI.getPackages();
      // Interceptor unwraps response.data, so response is already the body
      const packages = response?.packages || response?.data || (Array.isArray(response) ? response : []);
      set({ packages });
      return packages;
    } catch (error) {
      return [];
    }
  },

  // Apply voucher code
  applyVoucher: async (code) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const selectedAccount = JSON.parse(localStorage.getItem('selectedAccount') || '{}');
      const accountID =
        selectedAccount?.accountID || selectedAccount?.accountId ||
        selectedAccount?.id        || selectedAccount?._id       ||
        user?.accountID            || user?.accountId            ||
        user?.email;
      const token = localStorage.getItem('authToken');
      let jwtPayload = {};
      try { jwtPayload = JSON.parse(atob((token || '').split('.')[1])); } catch (_) {}
      const countryCode = user?.countryCode || jwtPayload?.countryCode || undefined;
      const response = await uploadAPI.applyVoucher({ voucherCode: code, accountID, countryCode });
      return { success: true, data: response?.data || response };
    } catch (error) {
      return { success: false, error: error?.message || 'Invalid voucher code' };
    }
  },

  // Initiate Stripe checkout: save unpaid transaction → create session → redirect
  initiateCheckout: async ({ packageId, price, title, credits, currency, currencySymbol, voucherID, discount = 0 }) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const selectedAccount = JSON.parse(localStorage.getItem('selectedAccount') || 'null') || {};
      console.log('[initiateCheckout] user object:', JSON.stringify(user, null, 2));
      console.log('[initiateCheckout] selectedAccount object:', JSON.stringify(selectedAccount, null, 2));

      // Decode JWT to find any accountID there
      let jwtPayload = {};
      try { jwtPayload = JSON.parse(atob(token.split('.')[1])); } catch (_) {}

      const accountID =
        selectedAccount?.accountID || selectedAccount?.accountId ||
        selectedAccount?.id || selectedAccount?._id ||
        user?.accountID || user?.accountId ||
        jwtPayload?.accountID || jwtPayload?.accountId ||
        user?.email; // last resort — use email as account identifier

      // package [7] for /transaction/save: { title, price, credits } only
      const txPackageObj = {
        title:   title || packageId,
        price:   price ?? 0,
        credits: credits ?? 0,
      };

      // package [9] for /stripe/session: { title, price, credits, currency, currencySymbol }
      const sessionPackageObj = {
        title:          title || packageId,
        price:          price ?? 0,
        credits:        credits ?? 0,
        currency:       (currency || 'usd').toLowerCase(),
        currencySymbol: currencySymbol || '$',
      };

      // payer [8]: { email, firstName, lastName }
      const payerObj = {
        email:     user?.email      || user?.emailAddress || jwtPayload?.email     || '',
        firstName: user?.firstName  || user?.first_name   || jwtPayload?.firstName || '',
        lastName:  user?.lastName   || user?.last_name    || jwtPayload?.lastName  || '',
      };

      // Step 1: Save unpaid transaction — Bearer via header, package={title,price,credits}, payer=object
      const txPayload = {
        accountID,
        package:  txPackageObj,
        discount,
        vat:      0,
        total:    price ?? 0,
        voucherID: voucherID || undefined,
        payer:    payerObj,
      };
      console.log('[initiateCheckout] saveTransaction payload:', JSON.stringify(txPayload, null, 2));
      const txResponse = await uploadAPI.saveTransaction(txPayload);
      console.log('[initiateCheckout] saveTransaction response:', txResponse);
      const txData = txResponse?.data ?? txResponse ?? {};
      const transactionID =
        txData?.transactionID || txData?.transactionId || txData?.id || txData?._id;

      // Step 2: Create Stripe checkout session — No auth, package={title,price,credits,currency,currencySymbol}
      const sessionPayload = {
        transactionID,
        accountID,
        total:   price ?? 0,
        package: sessionPackageObj,
      };
      console.log('[initiateCheckout] createSession payload:', JSON.stringify(sessionPayload, null, 2));
      const sessionResponse = await paymentAPI.createSession(sessionPayload);
      console.log('[initiateCheckout] createSession response:', sessionResponse);
      const sessionData = sessionResponse?.data ?? sessionResponse ?? {};
      const sessionUrl = sessionData?.url || sessionData?.checkoutUrl || sessionData?.redirectUrl;

      if (!sessionUrl) {
        throw new Error('No checkout URL returned from payment service');
      }

      set({ isLoading: false });

      // Step 3: Redirect to Stripe hosted checkout page
      window.location.href = sessionUrl;
      return { success: true };
    } catch (error) {
      set({
        error: error?.message || 'Failed to initiate checkout',
        isLoading: false,
      });
      return { success: false, error: error?.message };
    }
  },

  // Fetch all transactions
  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const selectedAccount = JSON.parse(localStorage.getItem('selectedAccount') || '{}');

      // Decode JWT for any accountID embedded there
      let jwtPayload = {};
      try { jwtPayload = JSON.parse(atob((token || '').split('.')[1])); } catch (_) {}

      const accountID =
        selectedAccount?.accountID || selectedAccount?.accountId ||
        selectedAccount?.id        || selectedAccount?._id       ||
        user?.accountID            || user?.accountId            ||
        jwtPayload?.accountID      || jwtPayload?.accountId      ||
        user?.email; // last resort

      const response = await uploadAPI.getTransactions(accountID);
      // Backend may return array directly or wrapped in .data / .transactions / .items
      const raw = response?.transactions || response?.data || response?.items || response || [];
      const transactions = Array.isArray(raw) ? raw : Object.values(raw);
      set({ history: transactions, isLoading: false });
    } catch (error) {
      set({ error: error?.message || 'Failed to fetch transactions', isLoading: false });
    }
  },

  // Check if sufficient credits
  hasEnoughCredits: (amount) => {
    return get().balance >= amount;
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
