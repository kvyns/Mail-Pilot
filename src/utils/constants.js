// Application constants

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  VIEWER: 'viewer',
};

// Campaign statuses
export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  SENDING: 'sending',
  SENT: 'sent',
  FAILED: 'failed',
};

// User statuses
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BOUNCED: 'bounced',
};

// Email block types
export const BLOCK_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  BUTTON: 'button',
  SPACER: 'spacer',
};

// Credit packages
export const CREDIT_PACKAGES = [
  { amount: 1000, price: 10, label: '1,000 credits' },
  { amount: 5000, price: 45, label: '5,000 credits', popular: true },
  { amount: 10000, price: 80, label: '10,000 credits' },
  { amount: 50000, price: 350, label: '50,000 credits' },
];

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    CSV: ['text/csv', 'application/vnd.ms-excel'],
    EXCEL: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ],
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },
};

// Date format
export const DATE_FORMAT = {
  SHORT: 'MMM DD, YYYY',
  LONG: 'MMMM DD, YYYY HH:mm',
  TIME: 'HH:mm:ss',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// Animation durations (ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};
