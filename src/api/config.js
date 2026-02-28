// Centralized API configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api' : 'https://jqxgqsopz8.execute-api.eu-west-2.amazonaws.com/prod/v1'),
  UPLOAD_BASE_URL: import.meta.env.VITE_UPLOAD_BASE_URL || (import.meta.env.DEV ? '/upload-api' : 'https://m4t4jr1ic5.execute-api.eu-west-2.amazonaws.com/prod/v1'),
  PAYMENT_BASE_URL: import.meta.env.VITE_PAYMENT_BASE_URL || (import.meta.env.DEV ? '/payment-api' : 'https://nfmv69lv4j.execute-api.eu-west-2.amazonaws.com/prod/v1'),
  CDN_BASE_URL: import.meta.env.VITE_CDN_BASE_URL || 'https://d2nw8bxx6o9c62.cloudfront.net',
  STRIPE_PUBLISHABLE_KEY: 'pk_test_51HUWlUCqLVBSIMH57JZZhjPJ0p43iJi323mZw0N0qQDMlZGDDdfx1sVqLbYgWZ1KFebb0vkIiqTgGi1qfLIDbQLA007oMZJylY',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  EMAIL_VERIFY: '/email/verify',
  VALIDATE_TOKEN: '/validate/token',
  RESEND_CODE: '/code',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  
  // Password
  PASSWORD_CHANGE: '/password/change',
  PASSWORD_RESET: '/password/reset',
  
  // User
  USER_PROFILE: '/user',
  
  // Business
  BUSINESS_ADD: '/business/add',
  BUSINESS_ACCOUNT: '/business/account',

  // User accounts & access
  USER_ACCOUNTS: '/user/accounts',
  USER_ACCESS: '/user/access',
  
  // Upload (different base URL)
  UPLOAD_PRESIGNED_URL: '/upload',
  DOWNLOAD_PRESIGNED_URL: '/download',
  
  // Users (team management — /users plural)
  USERS: '/users',
  USERS_IMPORT: '/users/import',
  USERS_EXPORT: '/users/export',
  USERS_INVITE: '/users/invite',
  USERS_ACTIVATE: '/users/activate',
  USERS_RESEND_INVITE: '/users/resend-invite',
  
  // Campaigns
  CAMPAIGNS: '/campaigns',
  CAMPAIGNS_SEND: '/campaigns/send',
  CAMPAIGNS_STATS: '/campaigns/stats',
  
  // Templates
  TEMPLATES: '/templates',
  TEMPLATES_DUPLICATE: '/templates/duplicate',
  
  // Credits
  CREDITS: '/credits',
  CREDITS_HISTORY: '/credits/history',
  CREDITS_PURCHASE: '/credits/purchase',
  
  // Packages (upload server)
  PACKAGES: '/packages',
  
  // Voucher (upload server)
  VOUCHER: '/voucher',
  
  // Transactions (upload server)
  TRANSACTION_SAVE: '/transaction/save',
  TRANSACTION: '/transaction',
  TRANSACTIONS: '/transactions',
  
  // Stripe (payment server)
  STRIPE_SESSION: '/stripe/session',
  STRIPE_SESSION_RETRIEVE: '/stripe/session/retrieve',
  STRIPE_WEBHOOK: '/webhook',
};
