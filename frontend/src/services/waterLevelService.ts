import { supabase } from '../lib/supabase';

export type WaterStatus = 'NORMAL' | 'ALERT' | 'WARNING' | 'CRITICAL';

export interface WaterLevelData {
  levelMeters: number;
  status: WaterStatus;
  station: string;
  thresholds: {
    alert: number | null;
    alarm: number | null;
    critical: number | null;
  };
  source: string;
  timestamp: string;
}

export const waterLevelService = {
  /* ===============================
     EDGE FUNCTION CALL
     =============================== */
  async getLatest(): Promise<WaterLevelData | null> {
    const { data, error } = await supabase.functions.invoke<WaterLevelData>(
      'waterLevelservice'
    );

    // Edge function/network error
    if (error) {
      console.error('[WaterLevelService] invoke error:', error);
      return null;
    }

    // Defensive: unexpected empty payload
    if (!data) {
      console.warn('[WaterLevelService] No data returned');
      return null;
    }

    // Defensive: validate critical fields
    if (
      typeof data.levelMeters !== 'number' ||
      !data.status ||
      !data.timestamp
    ) {
      console.warn('[WaterLevelService] Invalid payload:', data);
      return null;
    }

    return data;
  },

  /* ===============================
     UI HELPERS (IMPORTANT)
     =============================== */
  getStatusText(status: WaterStatus): string {
    switch (status) {
      case 'NORMAL':
        return 'Normal Level';
      case 'ALERT':
        return 'Alert Level';
      case 'WARNING':
        return 'Warning Level';
      case 'CRITICAL':
        return 'Critical Level';
      default:
        return 'Unknown';
    }
  },

  getStatusClass(status: WaterStatus): string {
    switch (status) {
      case 'NORMAL':
        return 'normal';
      case 'ALERT':
        return 'alert';
      case 'WARNING':
        return 'warning';
      case 'CRITICAL':
        return 'critical';
      default:
        return 'normal';
    }
  }
};