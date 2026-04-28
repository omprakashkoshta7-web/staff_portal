// Staff Portal API Configuration
export const STAFF_API_CONFIG = {
  BASE_URL: `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api`,
  TIMEOUT: 30000,
  ENDPOINTS: {
    // Auth
    AUTH: {
      LOGIN: '/staff/auth/login',
      VERIFY: '/auth/verify',
      ME: '/auth/me',
      MFA_VERIFY: '/staff/auth/mfa/verify',
      LOGOUT: '/staff/auth/logout',
      SESSION: '/staff/auth/session',
      SESSIONS: '/staff/auth/sessions',
      KILL_SESSION: (id: string) => `/staff/auth/session/${id}`,
    },
    // RBAC
    RBAC: {
      USER_ROLE: (userId: string) => `/staff/roles/${userId}`,
      PERMISSIONS: (role: string) => `/staff/permissions/${role}`,
      ASSIGN_ROLE: '/staff/roles/assign',
    },
    // Tasks
    TASKS: {
      LIST: '/staff/tasks',
      DETAIL: (id: string) => `/staff/tasks/${id}`,
      COMPLETE: (id: string) => `/staff/tasks/${id}/complete`,
      ASSIGN: (id: string) => `/staff/tasks/${id}/assign`,
    },
    // Orders
    ORDERS: {
      VENDORS: '/staff/vendors',
      QUEUE: '/staff/orders',
      DETAIL: (id: string) => `/staff/orders/${id}`,
      REASSIGN_VENDOR: (id: string) => `/staff/orders/${id}/reassign-vendor`,
      CLARIFICATION: (id: string) => `/staff/orders/${id}/clarification`,
    },
    // Support
    SUPPORT: {
      TICKETS: '/staff/tickets',
      TICKET_DETAIL: (id: string) => `/staff/tickets/${id}`,
      REPLY: (id: string) => `/staff/tickets/${id}/reply`,
      CLOSE: (id: string) => `/staff/tickets/${id}/close`,
      ESCALATE: (id: string) => `/staff/tickets/${id}/escalate`,
      VENDOR_TICKETS: '/staff/vendor-tickets',
      VENDOR_REPLY: (id: string) => `/staff/vendor-tickets/${id}/reply`,
      UPLOAD_ATTACHMENTS: '/staff/uploads/attachments',
    },
    // Finance
    FINANCE: {
      REFUNDS: '/staff/refunds',
      APPROVE_REFUND: (id: string) => `/staff/refunds/${id}/approve`,
      ESCALATE_REFUND: (id: string) => `/staff/refunds/${id}/escalate`,
      CREDIT_WALLET: '/staff/wallet/credit',
      DEBIT_WALLET: '/staff/wallet/debit',
      WALLET_LEDGER: '/staff/wallet/ledger',
      PAYOUTS: '/staff/payouts',
      ISSUE_PAYOUT_TICKET: '/staff/payouts/issue-ticket',
    },
    // Marketing - Using Admin Coupon APIs
    MARKETING: {
      CAMPAIGNS: '/staff/campaigns', // Placeholder
      CREATE_COUPON: '/staff/coupons', // Placeholder
      CREATE_TARGETING: '/staff/targeting', // Placeholder
      ANALYTICS_REPORTS: '/staff/analytics/reports', // Placeholder
      // Real Admin Coupon APIs
      COUPONS: '/admin/coupons',
      COUPON_DETAIL: (id: string) => `/admin/coupons/${id}`,
      UPDATE_COUPON: (id: string) => `/admin/coupons/${id}`,
      DELETE_COUPON: (id: string) => `/admin/coupons/${id}`,
      COUPON_USAGE: (id: string) => `/admin/coupons/${id}/usage`,
    },
    // Escalation
    ESCALATION: {
      TRIGGER: '/staff/escalation',
      LIST: '/staff/escalations',
    },
    // Audit
    AUDIT: {
      LOGS: '/staff/audit/logs',
      ACTIVITY: '/staff/activity',
      PERFORMANCE: '/staff/performance',
    },
    // System
    SYSTEM: {
      STATUS: '/staff/system/status',
      PERMISSIONS_CHECK: '/staff/permissions/check',
      CONFLICT_LOCK: '/staff/conflict/lock',
    },
  },
};

export default STAFF_API_CONFIG;
