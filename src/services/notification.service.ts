import STAFF_API_CONFIG from "../config/api.config";
import staffService from "./staff.service";

export interface PortalNotification {
  _id: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationSummary {
  unread_count: number;
  recent_notifications: PortalNotification[];
  category_counts: Record<string, number>;
}

const request = async <T>(path: string): Promise<T> => {
  const token = staffService.getToken();
  const response = await fetch(`${STAFF_API_CONFIG.BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.message || "Failed to fetch notifications");
  }

  return response.json();
};

export const notificationService = {
  getSummary() {
    return request<{ data: NotificationSummary }>("/api/notifications/summary");
  },
  getRecent(limit = 8) {
    return request<{ data: { notifications: PortalNotification[] } }>(`/api/notifications?limit=${limit}`);
  },
};
