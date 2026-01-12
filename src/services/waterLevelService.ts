

export interface WaterLevel {
  id: string;
  level: number;
  status: 'Normal' | 'Alert' | 'Critical';
  recorded_at: string;
}

// Replace with your actual API URL
const API_BASE_URL = import.meta.env.VITE_WATER_LEVEL_API_URL || '';

export const waterLevelService = {
  async getLatest(): Promise<WaterLevel | null> {
    if (!API_BASE_URL) {
      // Return mock data if no API configured
      return {
        id: 'mock',
        level: 15.0,
        status: 'Normal',
        recorded_at: new Date().toISOString(),
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/water-level/latest`);
      if (!response.ok) throw new Error('Failed to fetch water level');
      return response.json();
    } catch (error) {
      console.error('Error fetching water level:', error);
      return null;
    }
  },

  async getHistory(limit = 24): Promise<WaterLevel[]> {
    if (!API_BASE_URL) {
      return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/water-level/history?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch water level history');
      return response.json();
    } catch (error) {
      console.error('Error fetching water level history:', error);
      return [];
    }
  },

  // Placeholder for real-time - can be replaced with WebSocket or SSE
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscribeToUpdates(_callback: (payload: unknown) => void) {
    // Return a mock subscription object
    return {
      unsubscribe: () => {},
    };
  },
};
