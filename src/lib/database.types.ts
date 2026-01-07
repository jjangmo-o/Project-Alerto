export type Database = {
  public: {
    Tables: {
      barangays: {
        Row: {
          barangay_id: string;
          name: string;
          city: string;
          latitude: number;
          longitude: number;
          barangay_code: string | null;
        };
        Insert: {
          barangay_id?: string;
          name: string;
          city: string;
          latitude: number;
          longitude: number;
          barangay_code?: string | null;
        };
        Update: {
          name?: string;
          city?: string;
          latitude?: number;
          longitude?: number;
          barangay_code?: string | null;
        };
      };
      profiles: {
        Row: {
          profile_id: string;
          user_id: string | null;
          first_name: string;
          last_name: string;
          contact_number: string | null;
          address: string | null;
          birth_date: string | null;
          emergency_contact_number: string | null;
          medical_notes: string | null;
          profile_image_url: string | null;
          created_at: string;
        };
        Insert: {
          profile_id?: string;
          user_id?: string | null;
          first_name: string;
          last_name: string;
          contact_number?: string | null;
          address?: string | null;
          birth_date?: string | null;
          emergency_contact_number?: string | null;
          medical_notes?: string | null;
          profile_image_url?: string | null;
          created_at?: string;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          contact_number?: string | null;
          address?: string | null;
          birth_date?: string | null;
          emergency_contact_number?: string | null;
          medical_notes?: string | null;
          profile_image_url?: string | null;
        };
      };
      evacuation_centers: {
        Row: {
          center_id: string;
          name: string;
          barangay_id: string | null;
          address: string | null;
          capacity: number;
          current_occupancy: number;
          latitude: number;
          longitude: number;
          updated_at: string;
          center_code: string | null;
        };
        Insert: {
          center_id?: string;
          name: string;
          barangay_id?: string | null;
          address?: string | null;
          capacity: number;
          current_occupancy?: number;
          latitude: number;
          longitude: number;
          updated_at?: string;
          center_code?: string | null;
        };
        Update: {
          name?: string;
          barangay_id?: string | null;
          address?: string | null;
          capacity?: number;
          current_occupancy?: number;
          latitude?: number;
          longitude?: number;
          center_code?: string | null;
        };
      };
      emergency_hotlines: {
        Row: {
          hotline_id: string;
          agency_name: string;
          contact_number: string;
          description: string | null;
          is_national: boolean;
          hotline_code: string | null;
        };
        Insert: {
          hotline_id?: string;
          agency_name: string;
          contact_number: string;
          description?: string | null;
          is_national?: boolean;
          hotline_code?: string | null;
        };
        Update: {
          agency_name?: string;
          contact_number?: string;
          description?: string | null;
          is_national?: boolean;
          hotline_code?: string | null;
        };
      };
      disaster_reports: {
        Row: {
          report_id: string;
          user_id: string | null;
          barangay_id: string | null;
          report_text: string | null;
          status_type: string;
          created_at: string;
        };
        Insert: {
          report_id?: string;
          user_id?: string | null;
          barangay_id?: string | null;
          report_text?: string | null;
          status_type: string;
          created_at?: string;
        };
        Update: {
          user_id?: string | null;
          barangay_id?: string | null;
          report_text?: string | null;
          status_type?: string;
        };
      };
      evacuation_logs: {
        Row: {
          log_id: string;
          center_id: string | null;
          action: 'CHECK_IN' | 'CHECK_OUT';
          number_of_people: number;
          created_at: string;
        };
        Insert: {
          log_id?: string;
          center_id?: string | null;
          action: 'CHECK_IN' | 'CHECK_OUT';
          number_of_people: number;
          created_at?: string;
        };
        Update: {
          center_id?: string | null;
          action?: 'CHECK_IN' | 'CHECK_OUT';
          number_of_people?: number;
        };
      };
      families: {
        Row: {
          family_id: string;
          family_name: string | null;
          created_at: string;
        };
        Insert: {
          family_id?: string;
          family_name?: string | null;
          created_at?: string;
        };
        Update: {
          family_name?: string | null;
        };
      };
      family_members: {
        Row: {
          family_member_id: string;
          family_id: string | null;
          profile_id: string | null;
          relationship: string | null;
        };
        Insert: {
          family_member_id?: string;
          family_id?: string | null;
          profile_id?: string | null;
          relationship?: string | null;
        };
        Update: {
          family_id?: string | null;
          profile_id?: string | null;
          relationship?: string | null;
        };
      };
      report_images: {
        Row: {
          image_id: string;
          report_id: string | null;
          image_url: string;
          uploaded_at: string;
        };
        Insert: {
          image_id?: string;
          report_id?: string | null;
          image_url: string;
          uploaded_at?: string;
        };
        Update: {
          report_id?: string | null;
          image_url?: string;
        };
      };
    };
  };
};

// Export types for easy use
export type Barangay = Database['public']['Tables']['barangays']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type EvacuationCenter = Database['public']['Tables']['evacuation_centers']['Row'];
export type EmergencyHotline = Database['public']['Tables']['emergency_hotlines']['Row'];
export type DisasterReport = Database['public']['Tables']['disaster_reports']['Row'];
export type EvacuationLog = Database['public']['Tables']['evacuation_logs']['Row'];
export type Family = Database['public']['Tables']['families']['Row'];
export type FamilyMember = Database['public']['Tables']['family_members']['Row'];
export type ReportImage = Database['public']['Tables']['report_images']['Row'];
