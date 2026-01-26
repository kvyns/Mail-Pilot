// Centralized API configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  
  // Users
  USERS: '/users',
  USERS_IMPORT: '/users/import',
  USERS_EXPORT: '/users/export',
  
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
