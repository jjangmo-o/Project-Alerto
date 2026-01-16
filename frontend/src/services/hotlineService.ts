import { supabase } from '../lib/supabase';
import type { EmergencyHotline } from '../lib/database.types';

export const hotlineService = {
  async getAll() {
    const { data, error } = await (supabase as any)
      .from('emergency_hotlines')
      .select('*')
      .order('is_national', { ascending: false })
      .order('agency_name');

    if (error) throw error;
    return data as EmergencyHotline[];
  },

  async getNational() {
    const { data, error } = await (supabase as any)
      .from('emergency_hotlines')
      .select('*')
      .eq('is_national', true)
      .order('agency_name');

    if (error) throw error;
    return data as EmergencyHotline[];
  },

  async getLocal() {
    const { data, error } = await (supabase as any)
      .from('emergency_hotlines')
      .select('*')
      .eq('is_national', false)
      .order('agency_name');

    if (error) throw error;
    return data as EmergencyHotline[];
  },

  async search(query: string) {
    const { data, error } = await (supabase as any)
      .from('emergency_hotlines')
      .select('*')
      .or(`agency_name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('agency_name');

    if (error) throw error;
    return data as EmergencyHotline[];
  },
};
