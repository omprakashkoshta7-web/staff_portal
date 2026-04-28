import STAFF_API_CONFIG from '../config/api.config';
import { auth, isFirebaseConfigured } from '../config/firebase';

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
  message?: string;
  data?: {
    success?: boolean;
    message?: string;
    sessionId?: string;
    mfaCode?: string;
    requiresMFA?: boolean;
    token?: string;
    user?: {
      id: string;
      email: string;
      role: string;
      name: string;
    };
  };
}

class StaffService {
  private baseUrl = STAFF_API_CONFIG.BASE_URL;
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('staffToken');
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private normalizeErrorMessage(message: string, status?: number) {
    const text = String(message || '').trim();

    if (status === 502 || text === 'Gateway error') {
      return 'Staff service is unavailable right now. Start the backend admin-service on port 4008 and try again.';
    }

    if (status === 500 && !text) {
      return 'Staff login failed due to a server error. Please check the backend services and try again.';
    }

    return text || 'Request failed. Please try again.';
  }

  /**
   * Make an API request using the stored backend JWT.
   * 
   * IMPORTANT: This uses the backend JWT stored in localStorage — NOT a Firebase token.
   * The JWT is obtained once during login via POST /api/auth/verify and reused for all requests.
   * Do NOT refresh the Firebase token here.
   */
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any,
    includeAuth = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Refresh token from localStorage in case it was updated elsewhere
    if (includeAuth) {
      this.token = localStorage.getItem('staffToken');
    }

    const options: RequestInit = {
      method,
      headers: this.getHeaders(includeAuth),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        // Handle 401 — JWT expired or invalid
        if (response.status === 401) {
          this.clearToken();
          // Let the context/app handle the redirect to login
        }

        const error = await response.json().catch(() => ({}));
        throw new Error(this.normalizeErrorMessage(error.message, response.status));
      }

      return await response.json();
    } catch (error) {
      console.error(`Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async login(email: string, password: string, role: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      STAFF_API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      'POST',
      { email, password, role },
      false
    );

    if (response.token) {
      this.token = response.token;
      localStorage.setItem('staffToken', response.token);
    }

    return response;
  }

  async verifyMFA(code: string, sessionId: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      STAFF_API_CONFIG.ENDPOINTS.AUTH.MFA_VERIFY,
      'POST',
      { code, sessionId }
    );

    if (response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('staffToken', response.data.token);
    }

    return response;
  }

  async logout(): Promise<{ success: boolean }> {
    await this.request(STAFF_API_CONFIG.ENDPOINTS.AUTH.LOGOUT, 'POST');
    this.token = null;
    localStorage.removeItem('staffToken');
    return { success: true };
  }

  async getSession(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.AUTH.SESSION, 'GET');
  }

  async getSessions(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.AUTH.SESSIONS, 'GET');
  }

  async killSession(sessionId: string): Promise<{ success: boolean }> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.AUTH.KILL_SESSION(sessionId),
      'DELETE'
    );
  }

  // ==================== RBAC APIs ====================

  async getUserRole(userId: string): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.RBAC.USER_ROLE(userId), 'GET');
  }

  async getPermissions(role: string): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.RBAC.PERMISSIONS(role), 'GET');
  }

  async assignRole(userId: string, role: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.RBAC.ASSIGN_ROLE,
      'POST',
      { userId, role }
    );
  }

  // ==================== TASK APIs ====================

  async getTasks(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.TASKS.LIST, 'GET');
  }

  async getTaskDetail(taskId: string): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.TASKS.DETAIL(taskId), 'GET');
  }

  async completeTask(taskId: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.TASKS.COMPLETE(taskId),
      'POST'
    );
  }

  async assignTask(taskId: string, assigneeId: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.TASKS.ASSIGN(taskId),
      'POST',
      { assigneeId }
    );
  }

  // ==================== ORDER APIs ====================

  async getOrderQueue(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.ORDERS.QUEUE, 'GET');
  }

  async getAssignableVendors(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.ORDERS.VENDORS, 'GET');
  }

  async getOrderDetail(orderId: string): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.ORDERS.DETAIL(orderId), 'GET');
  }

  async reassignVendor(orderId: string, newVendorId: string, reason: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.ORDERS.REASSIGN_VENDOR(orderId),
      'POST',
      { newVendorId, reason }
    );
  }

  async raiseClarification(orderId: string, message: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.ORDERS.CLARIFICATION(orderId),
      'POST',
      { message }
    );
  }

  // ==================== SUPPORT APIs ====================

  async getTickets(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.SUPPORT.TICKETS, 'GET');
  }

  async getTicketDetail(ticketId: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.SUPPORT.TICKET_DETAIL(ticketId),
      'GET'
    );
  }

  async replyTicket(ticketId: string, message: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.SUPPORT.REPLY(ticketId),
      'POST',
      { message }
    );
  }

  async closeTicket(ticketId: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.SUPPORT.CLOSE(ticketId),
      'POST'
    );
  }

  async escalateTicket(ticketId: string, reason: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.SUPPORT.ESCALATE(ticketId),
      'POST',
      { reason }
    );
  }

  async getVendorTickets(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.SUPPORT.VENDOR_TICKETS, 'GET');
  }

  async replyVendorTicket(ticketId: string, message: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.SUPPORT.VENDOR_REPLY(ticketId),
      'POST',
      { message }
    );
  }

  // ==================== FINANCE APIs ====================

  async getRefunds(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.FINANCE.REFUNDS, 'GET');
  }

  async approveRefund(refundId: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.FINANCE.APPROVE_REFUND(refundId),
      'POST'
    );
  }

  async escalateRefund(refundId: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.FINANCE.ESCALATE_REFUND(refundId),
      'POST'
    );
  }

  async creditWallet(userId: string, amount: number, reason?: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.FINANCE.CREDIT_WALLET,
      'POST',
      { userId, amount, reason }
    );
  }

  async debitWallet(userId: string, amount: number, reason?: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.FINANCE.DEBIT_WALLET,
      'POST',
      { userId, amount, reason }
    );
  }

  async getWalletLedger(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.FINANCE.WALLET_LEDGER, 'GET');
  }

  async getPayouts(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.FINANCE.PAYOUTS, 'GET');
  }

  async issuePayoutTicket(payoutId: string, issueDetails: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.FINANCE.ISSUE_PAYOUT_TICKET,
      'POST',
      { payoutId, issueDetails }
    );
  }

  // ==================== MARKETING APIs ====================
  // Using real admin coupon APIs for staff marketing

  async getCoupons(params?: { isActive?: boolean; search?: string; page?: number; limit?: number }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    
    const query = queryParams.toString();
    const endpoint = query ? `${STAFF_API_CONFIG.ENDPOINTS.MARKETING.COUPONS}?${query}` : STAFF_API_CONFIG.ENDPOINTS.MARKETING.COUPONS;
    return this.request(endpoint, 'GET');
  }

  async createCoupon(couponData: {
    code: string;
    description?: string;
    discountType: 'percentage' | 'flat';
    discountValue: number;
    maxDiscount?: number;
    minOrderValue?: number;
    applicableFlows?: string[];
    usageLimit?: number;
    perUserLimit?: number;
    isActive?: boolean;
    expiresAt?: string;
  }): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.MARKETING.COUPONS,
      'POST',
      couponData
    );
  }

  async updateCoupon(id: string, couponData: {
    description?: string;
    discountType?: 'percentage' | 'flat';
    discountValue?: number;
    maxDiscount?: number;
    minOrderValue?: number;
    applicableFlows?: string[];
    usageLimit?: number;
    perUserLimit?: number;
    isActive?: boolean;
    expiresAt?: string;
  }): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.MARKETING.UPDATE_COUPON(id),
      'PUT',
      couponData
    );
  }

  async deleteCoupon(id: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.MARKETING.DELETE_COUPON(id),
      'DELETE'
    );
  }

  async getCouponUsage(id: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.MARKETING.COUPON_USAGE(id),
      'GET'
    );
  }

  // ==================== ESCALATION APIs ====================

  async triggerEscalation(entityId: string, type: string, reason: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.ESCALATION.TRIGGER,
      'POST',
      { entityId, type, reason }
    );
  }

  async getEscalations(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.ESCALATION.LIST, 'GET');
  }

  // ==================== AUDIT APIs ====================

  async getAuditLogs(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.AUDIT.LOGS, 'GET');
  }

  async getActivityLogs(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.AUDIT.ACTIVITY, 'GET');
  }

  async getPerformanceMetrics(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.AUDIT.PERFORMANCE, 'GET');
  }

  // ==================== SYSTEM APIs ====================

  async getSystemStatus(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.SYSTEM.STATUS, 'GET');
  }

  async checkPermissions(): Promise<any> {
    return this.request(STAFF_API_CONFIG.ENDPOINTS.SYSTEM.PERMISSIONS_CHECK, 'GET');
  }

  async conflictLock(resourceId: string, lockType: string): Promise<any> {
    return this.request(
      STAFF_API_CONFIG.ENDPOINTS.SYSTEM.CONFLICT_LOCK,
      'POST',
      { resourceId, lockType }
    );
  }

  // ==================== UTILITY ====================

  async getDashboard(role: string): Promise<any> {
    return this.request(`/api/staff/dashboard?role=${role}`, 'GET');
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('staffToken', token);
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('staffToken');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export default new StaffService();
