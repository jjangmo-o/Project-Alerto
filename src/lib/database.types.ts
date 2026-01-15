export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      barangays: {
        Row: {
          barangay_code: string | null
          barangay_id: string
          city: string
          latitude: number
          longitude: number
          name: string
        }
        Insert: {
          barangay_code?: string | null
          barangay_id?: string
          city: string
          latitude: number
          longitude: number
          name: string
        }
        Update: {
          barangay_code?: string | null
          barangay_id?: string
          city?: string
          latitude?: number
          longitude?: number
          name?: string
        }
        Relationships: []
      }
      disaster_reports: {
        Row: {
          barangay_id: string | null
          created_at: string | null
          report_id: string
          report_text: string | null
          status_type: string
          user_id: string | null
        }
        Insert: {
          barangay_id?: string | null
          created_at?: string | null
          report_id?: string
          report_text?: string | null
          status_type: string
          user_id?: string | null
        }
        Update: {
          barangay_id?: string | null
          created_at?: string | null
          report_id?: string
          report_text?: string | null
          status_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disaster_reports_barangay_id_fkey"
            columns: ["barangay_id"]
            isOneToOne: false
            referencedRelation: "barangays"
            referencedColumns: ["barangay_id"]
          },
        ]
      }
      evacuation_centers: {
        Row: {
          address: string | null
          barangay_id: string | null
          capacity: number
          center_code: string | null
          center_id: string
          current_occupancy: number | null
          latitude: number
          longitude: number
          name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          barangay_id?: string | null
          capacity: number
          center_code?: string | null
          center_id?: string
          current_occupancy?: number | null
          latitude: number
          longitude: number
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          barangay_id?: string | null
          capacity?: number
          center_code?: string | null
          center_id?: string
          current_occupancy?: number | null
          latitude?: number
          longitude?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evacuation_centers_barangay_id_fkey"
            columns: ["barangay_id"]
            isOneToOne: false
            referencedRelation: "barangays"
            referencedColumns: ["barangay_id"]
          },
        ]
      }
      evacuation_logs: {
        Row: {
          action: string
          center_id: string | null
          created_at: string | null
          log_id: string
          number_of_people: number
        }
        Insert: {
          action: string
          center_id?: string | null
          created_at?: string | null
          log_id?: string
          number_of_people: number
        }
        Update: {
          action?: string
          center_id?: string | null
          created_at?: string | null
          log_id?: string
          number_of_people?: number
        }
        Relationships: [
          {
            foreignKeyName: "evacuation_logs_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "evacuation_centers"
            referencedColumns: ["center_id"]
          },
        ]
      }
      notifications: {
        Row: {
          notification_id: string
          title: string
          message: string
          barangay_id: string | null
          target_role: string
          disaster_type: 'typhoon' | 'earthquake' | 'fire'
          severity: 'normal' | 'alert' | 'urgent' | 'critical'
          created_at: string
          created_by: string | null
        }
        Insert: {
          notification_id?: string
          title: string
          message: string
          barangay_id?: string | null
          target_role: string
          disaster_type: 'typhoon' | 'earthquake' | 'fire'
          severity: 'normal' | 'alert' | 'urgent' | 'critical'
          created_at?: string
          created_by?: string | null
        }
        Update: {
          notification_id?: string
          title?: string
          message?: string
          barangay_id?: string | null
          target_role?: string
          disaster_type?: 'typhoon' | 'earthquake' | 'fire'
          severity?: 'normal' | 'alert' | 'urgent' | 'critical'
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_barangay_id_fkey"
            columns: ["barangay_id"]
            isOneToOne: false
            referencedRelation: "barangays"
            referencedColumns: ["barangay_id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string
          birth_date: string
          contact_number: string
          created_at: string | null
          email: string
          first_name: string
          gender: string
          last_name: string
          middle_name: string | null
          profile_id: string
          profile_image_url: string | null
          profile_picture_path: string | null
          role: string
          user_id: string
        }
        Insert: {
          address: string
          birth_date: string
          contact_number: string
          created_at?: string | null
          email: string
          first_name: string
          gender: string
          last_name: string
          middle_name?: string | null
          profile_id?: string
          profile_image_url?: string | null
          profile_picture_path?: string | null
          role?: string
          user_id: string
        }
        Update: {
          address?: string
          birth_date?: string
          contact_number?: string
          created_at?: string | null
          email?: string
          first_name?: string
          gender?: string
          last_name?: string
          middle_name?: string | null
          profile_id?: string
          profile_image_url?: string | null
          profile_picture_path?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      report_images: {
        Row: {
          image_id: string
          image_url: string
          report_id: string | null
          uploaded_at: string | null
        }
        Insert: {
          image_id?: string
          image_url: string
          report_id?: string | null
          uploaded_at?: string | null
        }
        Update: {
          image_id?: string
          image_url?: string
          report_id?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_images_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "disaster_reports"
            referencedColumns: ["report_id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          archived_at: string | null
          is_archived: boolean
          is_read: boolean
          notification_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          is_archived?: boolean
          is_read?: boolean
          notification_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          archived_at?: string | null
          is_archived?: boolean
          is_read?: boolean
          notification_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["notification_id"]
          },
        ]
      }
    }
    Views: {
      profiles_view: {
        Row: {
          address: string | null
          age: number | null
          birth_date: string | null
          contact_number: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          gender: string | null
          last_name: string | null
          middle_name: string | null
          profile_id: string | null
          profile_picture_path: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          age?: never
          birth_date?: string | null
          contact_number?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          last_name?: string | null
          middle_name?: string | null
          profile_id?: string | null
          profile_picture_path?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          age?: never
          birth_date?: string | null
          contact_number?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          last_name?: string | null
          middle_name?: string | null
          profile_id?: string | null
          profile_picture_path?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const