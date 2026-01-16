import { supabase } from '../lib/supabase';
import type { DisasterReport, Barangay } from '../lib/database.types';

export type DisasterReportWithBarangay = DisasterReport & {
  barangays?: Barangay;
};

export const disasterReportService = {
  async getAll() {
    const { data, error } = await supabase
      .from('disaster_reports')
      .select(`
        *,
        barangays (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as DisasterReportWithBarangay[];
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('disaster_reports')
      .select(`
        *,
        barangays (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as DisasterReportWithBarangay[];
  },

  async getByBarangay(barangayId: string) {
    const { data, error } = await supabase
      .from('disaster_reports')
      .select(`
        *,
        barangays (*)
      `)
      .eq('barangay_id', barangayId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as DisasterReportWithBarangay[];
  },

  async create(report: {
    userId: string;
    barangayId: string;
    reportText: string;
    statusType: string;
  }) {
    const { data, error } = await supabase
      .from('disaster_reports')
      .insert({
        user_id: report.userId,
        barangay_id: report.barangayId,
        report_text: report.reportText,
        status_type: report.statusType,
      } as never)
      .select()
      .single();

    if (error) throw error;
    return data as DisasterReport;
  },

  async addImage(reportId: string, imageUrl: string) {
    const { data, error } = await supabase
      .from('report_images')
      .insert({
        report_id: reportId,
        image_url: imageUrl,
      } as never)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Real-time subscription
  subscribeToReports(callback: (payload: unknown) => void) {
    return supabase
      .channel('disaster_reports_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'disaster_reports' }, callback)
      .subscribe();
  },
};
