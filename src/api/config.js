// Centralized API configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '/api' : 'https://jqxgqsopz8.execute-api.eu-west-2.amazonaws.com/prod/v1'),
  UPLOAD_BASE_URL: import.meta.env.VITE_UPLOAD_BASE_URL || (import.meta.env.DEV ? '/upload-api' : 'https://m4t4jr1ic5.execute-api.eu-west-2.amazonaws.com/prod/v1'),
  CDN_BASE_URL: import.meta.env.VITE_CDN_BASE_URL || 'https://d2nw8bxx6o9c62.cloudfront.net',
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
  
  // Upload (different base URL)
  UPLOAD_PRESIGNED_URL: '/upload',
  DOWNLOAD_PRESIGNED_URL: '/download',
  
  // Users
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
};
