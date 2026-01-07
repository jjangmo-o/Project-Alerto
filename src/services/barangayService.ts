import { supabase } from '../lib/supabase';
import type { Barangay } from '../lib/database.types';

export const barangayService = {
  async getAll() {
    const { data, error } = await supabase
      .from('barangays')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as Barangay[];
  },

  async getById(barangayId: string) {
    const { data, error } = await supabase
      .from('barangays')
      .select('*')
      .eq('barangay_id', barangayId)
      .single();

    if (error) throw error;
    return data as Barangay;
  },

  async getByName(name: string) {
    const { data, error } = await supabase
      .from('barangays')
      .select('*')
      .ilike('name', `%${name}%`);

    if (error) throw error;
    return data as Barangay[];
  },
};
