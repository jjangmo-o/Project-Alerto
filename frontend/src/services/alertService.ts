// Alert Service - Fetches alerts from external API
// TODO: Replace with your actual API endpoint

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info' | 'resolved';
  barangay?: string;
  created_at: string;
}

// Replace with your actual API URL
const API_BASE_URL = import.meta.env.VITE_ALERT_API_URL || '';

export const alertService = {
  async getActive(): Promise<Alert[]> {
    if (!API_BASE_URL) {
      // Return empty array if no API configured
      return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/alerts?active=true`);
      if (!response.ok) throw new Error('Failed to fetch alerts');
      return response.json();
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  },

  async getRecent(limit = 10): Promise<Alert[]> {
    if (!API_BASE_URL) {
      return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/alerts?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch alerts');
      return response.json();
    } catch (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }
  },

  // Placeholder for real-time - can be replaced with WebSocket or SSE
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscribeToAlerts(_callback: (payload: unknown) => void) {
    // Return a mock subscription object
    return {
      unsubscribe: () => {},
    };
  },
};
