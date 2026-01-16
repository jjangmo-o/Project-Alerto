import { supabase } from '../lib/supabase';

export type NotificationType = 'typhoon' | 'earthquake' | 'fire' | 'flood' | 'general';
export type SeverityLevel = 'critical' | 'urgent' | 'normal';

export interface Notification {
  id: string;
  type: NotificationType;
  severity: SeverityLevel;
  title: string;
  message: string;
  barangay?: string;
  created_at: string;
  is_read?: boolean;
}

const ALERT_API_URL = import.meta.env.VITE_ALERT_API_URL || '';

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    if (!ALERT_API_URL) {
      console.warn('VITE_ALERT_API_URL not configured, using mock data');
      return this.getMockNotifications();
    }

    try {
      const response = await fetch(`${ALERT_API_URL}/notifications`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      return this.mapApiResponse(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return this.getMockNotifications();
    }
  },

  async getByType(type: NotificationType): Promise<Notification[]> {
    if (!ALERT_API_URL) {
      const mock = await this.getMockNotifications();
      return mock.filter(n => n.type === type);
    }

    try {
      const response = await fetch(`${ALERT_API_URL}/notifications?type=${type}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      return this.mapApiResponse(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  async dismiss(notificationId: string): Promise<boolean> {
    if (!ALERT_API_URL) {
      return true;
    }

    try {
      const response = await fetch(`${ALERT_API_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error dismissing notification:', error);
      return false;
    }
  },

  subscribeToRealtime(callback: (notification: Notification) => void) {
    const channel = supabase
      .channel('notifications')
      .on('broadcast', { event: 'new_notification' }, (payload) => {
        const notification = this.mapSingleNotification(payload.payload);
        if (notification) {
          callback(notification);
        }
      })
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  },

  mapApiResponse(data: unknown[]): Notification[] {
    if (!Array.isArray(data)) return [];
    return data.map(item => this.mapSingleNotification(item)).filter(Boolean) as Notification[];
  },

  mapSingleNotification(item: unknown): Notification | null {
    if (!item || typeof item !== 'object') return null;
    
    const record = item as Record<string, unknown>;
    
    return {
      id: String(record.id || record.notification_id || ''),
      type: this.normalizeType(record.type as string),
      severity: this.normalizeSeverity(record.severity as string),
      title: String(record.title || ''),
      message: String(record.message || record.content || ''),
      barangay: record.barangay as string | undefined,
      created_at: String(record.created_at || record.createdAt || new Date().toISOString()),
      is_read: Boolean(record.is_read || record.isRead || false),
    };
  },

  normalizeType(type: string): NotificationType {
    const normalized = type?.toLowerCase();
    const validTypes: NotificationType[] = ['typhoon', 'earthquake', 'fire', 'flood', 'general'];
    return validTypes.includes(normalized as NotificationType) 
      ? (normalized as NotificationType) 
      : 'general';
  },

  normalizeSeverity(severity: string): SeverityLevel {
    const normalized = severity?.toLowerCase();
    if (normalized === 'critical' || normalized === 'high' || normalized === 'red') {
      return 'critical';
    }
    if (normalized === 'urgent' || normalized === 'medium' || normalized === 'orange') {
      return 'urgent';
    }
    return 'normal';
  },

  getMockNotifications(): Notification[] {
    return [
      {
        id: '1',
        type: 'typhoon',
        severity: 'critical',
        title: 'Typhoon Update',
        message: 'Attention Residents of Brgy. San Roque: Due to continuous heavy rainfall and rising water levels at the Marikina River, flooding is now occurring in low-lying areas of Brgy. San Roque.',
        barangay: 'San Roque',
        created_at: new Date().toISOString(),
        is_read: false,
      },
      {
        id: '2',
        type: 'typhoon',
        severity: 'urgent',
        title: 'Typhoon Update',
        message: 'Attention Residents of Brgy. San Roque: Due to continuous heavy rainfall and rising water levels at the Marikina River, flooding is now occurring in low-lying areas of Brgy. San Roque.',
        barangay: 'San Roque',
        created_at: new Date(Date.now() - 60000).toISOString(),
        is_read: false,
      },
      {
        id: '3',
        type: 'earthquake',
        severity: 'normal',
        title: 'Earthquake Update',
        message: 'DROP, COVER, and HOLD. If you feel shaking, stay under a sturdy table. STAY AWAY from glass windows, heavy shelves, and the facades of buildings. EVACUATE only once the shaking stops. Use stairs, NEVER use elevators. CHECK your app for "Structural Integrity" reports of the nearest buildings.',
        created_at: new Date(Date.now() - 120000).toISOString(),
        is_read: true,
      },
      {
        id: '4',
        type: 'typhoon',
        severity: 'urgent',
        title: 'Typhoon Update',
        message: 'Attention Residents of Brgy. San Roque: Due to continuous heavy rainfall and rising water levels at the Marikina River, flooding is now occurring in low-lying areas of Brgy. San Roque.',
        barangay: 'San Roque',
        created_at: new Date(Date.now() - 300000).toISOString(),
        is_read: false,
      },
    ];
  },
};