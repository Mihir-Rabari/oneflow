export const API_ROUTES = {
  AUTH: {
    BASE: '/auth',
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    UPDATE_PROFILE: '/users/profile',
  },
  PROJECTS: {
    BASE: '/projects',
    BY_ID: (id: string) => `/projects/${id}`,
    STATS: '/projects/stats',
    TEAM_MEMBERS: (id: string) => `/projects/${id}/team`,
  },
  TASKS: {
    BASE: '/tasks',
    BY_ID: (id: string) => `/tasks/${id}`,
    BY_PROJECT: (projectId: string) => `/tasks/project/${projectId}`,
    MY_TASKS: '/tasks/my',
    COMMENTS: (id: string) => `/tasks/${id}/comments`,
    ATTACHMENTS: (id: string) => `/tasks/${id}/attachments`,
  },
  TIMESHEETS: {
    BASE: '/timesheets',
    BY_ID: (id: string) => `/timesheets/${id}`,
    BY_PROJECT: (projectId: string) => `/timesheets/project/${projectId}`,
    BY_TASK: (taskId: string) => `/timesheets/task/${taskId}`,
    MY_TIMESHEETS: '/timesheets/my',
    STATS: '/timesheets/stats',
  },
  SALES_ORDERS: {
    BASE: '/sales-orders',
    BY_ID: (id: string) => `/sales-orders/${id}`,
    BY_PROJECT: (projectId: string) => `/sales-orders/project/${projectId}`,
  },
  PURCHASE_ORDERS: {
    BASE: '/purchase-orders',
    BY_ID: (id: string) => `/purchase-orders/${id}`,
    BY_PROJECT: (projectId: string) => `/purchase-orders/project/${projectId}`,
  },
  INVOICES: {
    BASE: '/invoices',
    BY_ID: (id: string) => `/invoices/${id}`,
    BY_PROJECT: (projectId: string) => `/invoices/project/${projectId}`,
  },
  VENDOR_BILLS: {
    BASE: '/vendor-bills',
    BY_ID: (id: string) => `/vendor-bills/${id}`,
    BY_PROJECT: (projectId: string) => `/vendor-bills/project/${projectId}`,
  },
  EXPENSES: {
    BASE: '/expenses',
    BY_ID: (id: string) => `/expenses/${id}`,
    BY_PROJECT: (projectId: string) => `/expenses/project/${projectId}`,
    MY_EXPENSES: '/expenses/my',
    APPROVE: (id: string) => `/expenses/${id}/approve`,
    REJECT: (id: string) => `/expenses/${id}/reject`,
  },
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    PROJECT_ANALYTICS: (id: string) => `/analytics/project/${id}`,
  },
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    RECEIPTS: ['image/jpeg', 'image/png', 'application/pdf'],
  },
};

export const OTP = {
  LENGTH: 6,
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 5,
};

export const PASSWORD = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
};
