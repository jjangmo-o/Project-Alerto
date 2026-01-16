import { supabase } from '../lib/supabase';
import type { EvacuationCenter, Barangay } from '../lib/database.types';

export type EvacuationCenterWithBarangay = EvacuationCenter & {
  barangays?: Barangay;
};

export const evacuationService = {
  async getAll() {
    const { data, error } = await supabase
      .from('evacuation_centers')
      .select(`
        *,
        barangays (*)
      `)
      .order('name');

    if (error) throw error;
    return data as EvacuationCenterWithBarangay[];
  },

  async getAvailable() {
    // Get centers where current_occupancy < capacity
    const { data, error } = await supabase
      .from('evacuation_centers')
      .select(`
        *,
        barangays (*)
      `)
      .order('name');

    if (error) throw error;
    
    // Filter available (not at capacity)
    return (data as EvacuationCenterWithBarangay[]).filter(
      center => (center.current_occupancy ?? 0) < center.capacity
    );
  },

  async getByBarangay(barangayId: string) {
    const { data, error } = await supabase
      .from('evacuation_centers')
      .select(`
        *,
        barangays (*)
      `)
      .eq('barangay_id', barangayId);

    if (error) throw error;
    return data as EvacuationCenterWithBarangay[];
  },

  async getById(centerId: string) {
    const { data, error } = await supabase
      .from('evacuation_centers')
      .select(`
        *,
        barangays (*)
      `)
      .eq('center_id', centerId)
      .single();

    if (error) throw error;
    return data as EvacuationCenterWithBarangay;
  },

  async getStats() {
    const { data, error } = await supabase
      .from('evacuation_centers')
      .select('capacity, current_occupancy');

    if (error) throw error;

    const centers = data as { capacity: number; current_occupancy: number }[];
    const atCapacity = centers.filter(c => c.current_occupancy >= c.capacity).length;
    const available = centers.filter(c => c.current_occupancy < c.capacity).length;
    const totalCapacity = centers.reduce((sum, c) => sum + c.capacity, 0);
    const totalOccupancy = centers.reduce((sum, c) => sum + c.current_occupancy, 0);

    return { 
      atCapacity, 
      available, 
      total: centers.length,
      totalCapacity,
      totalOccupancy
    };
  },

  async getNearby(latitude: number, longitude: number, radiusKm: number = 5) {
    const { data, error } = await supabase
      .from('evacuation_centers')
      .select(`
        *,
        barangays (*)
      `);

    if (error) throw error;

    const centers = data as EvacuationCenterWithBarangay[];
    
    // Calculate distance using Haversine formula
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    return centers
      .map(center => ({
        ...center,
        distance: getDistance(latitude, longitude, Number(center.latitude), Number(center.longitude))
      }))
      .filter(center => center.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  },

  // Real-time subscription
  subscribeToChanges(callback: (payload: unknown) => void) {
    return supabase
      .channel('evacuation_centers_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'evacuation_centers' }, callback)
      .subscribe();
  },
};
