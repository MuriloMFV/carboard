export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      component_catalog: {
        Row: {
          default_interval_km: number | null
          default_interval_months: number | null
          id: string
          name: string
          slug: string
          system_id: string
        }
        Insert: {
          default_interval_km?: number | null
          default_interval_months?: number | null
          id?: string
          name: string
          slug: string
          system_id: string
        }
        Update: {
          default_interval_km?: number | null
          default_interval_months?: number | null
          id?: string
          name?: string
          slug?: string
          system_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "component_catalog_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "system_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_records: {
        Row: {
          created_at: string
          fuel_type: string
          fueled_at: string
          full_tank: boolean
          id: string
          liters: number | null
          mileage: number
          notes: string | null
          price_per_liter: number | null
          station: string | null
          total_cost: number | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          fuel_type: string
          fueled_at: string
          full_tank?: boolean
          id?: string
          liters?: number | null
          mileage: number
          notes?: string | null
          price_per_liter?: number | null
          station?: string | null
          total_cost?: number | null
          vehicle_id: string
        }
        Update: {
          created_at?: string
          fuel_type?: string
          fueled_at?: string
          full_tank?: boolean
          id?: string
          liters?: number | null
          mileage?: number
          notes?: string | null
          price_per_liter?: number | null
          station?: string | null
          total_cost?: number | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fuel_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      improvements: {
        Row: {
          actual_cost: number | null
          category: string | null
          created_at: string
          estimated_budget: number | null
          id: string
          installed_at: string | null
          notes: string | null
          priority: string
          product_name: string | null
          product_url: string | null
          purchased_at: string | null
          status: string
          title: string
          vehicle_id: string
        }
        Insert: {
          actual_cost?: number | null
          category?: string | null
          created_at?: string
          estimated_budget?: number | null
          id?: string
          installed_at?: string | null
          notes?: string | null
          priority?: string
          product_name?: string | null
          product_url?: string | null
          purchased_at?: string | null
          status?: string
          title: string
          vehicle_id: string
        }
        Update: {
          actual_cost?: number | null
          category?: string | null
          created_at?: string
          estimated_budget?: number | null
          id?: string
          installed_at?: string | null
          notes?: string | null
          priority?: string
          product_name?: string | null
          product_url?: string | null
          purchased_at?: string | null
          status?: string
          title?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "improvements_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_items: {
        Row: {
          brand: string | null
          description: string | null
          id: string
          item_cost: number | null
          maintenance_id: string
          product_name: string | null
          quantity: number | null
          specification: Json | null
          vehicle_component_id: string | null
        }
        Insert: {
          brand?: string | null
          description?: string | null
          id?: string
          item_cost?: number | null
          maintenance_id: string
          product_name?: string | null
          quantity?: number | null
          specification?: Json | null
          vehicle_component_id?: string | null
        }
        Update: {
          brand?: string | null
          description?: string | null
          id?: string
          item_cost?: number | null
          maintenance_id?: string
          product_name?: string | null
          quantity?: number | null
          specification?: Json | null
          vehicle_component_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_items_maintenance_id_fkey"
            columns: ["maintenance_id"]
            isOneToOne: false
            referencedRelation: "maintenance_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_items_vehicle_component_id_fkey"
            columns: ["vehicle_component_id"]
            isOneToOne: false
            referencedRelation: "vehicle_components"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_records: {
        Row: {
          created_at: string
          id: string
          mileage: number
          notes: string | null
          service_date: string
          title: string
          total_cost: number | null
          vehicle_id: string
          workshop: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          mileage: number
          notes?: string | null
          service_date: string
          title: string
          total_cost?: number | null
          vehicle_id: string
          workshop?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          mileage?: number
          notes?: string | null
          service_date?: string
          title?: string
          total_cost?: number | null
          vehicle_id?: string
          workshop?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      mileage_records: {
        Row: {
          created_at: string
          id: string
          mileage: number
          recorded_at: string
          source_id: string | null
          source_type: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mileage: number
          recorded_at: string
          source_id?: string | null
          source_type: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mileage?: number
          recorded_at?: string
          source_id?: string | null
          source_type?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mileage_records_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      problems: {
        Row: {
          created_at: string
          description: string | null
          detected_at: string
          estimated_cost: number | null
          id: string
          mileage: number
          priority: string
          resolution_maintenance_id: string | null
          resolved_at: string | null
          status: string
          system_id: string | null
          title: string
          vehicle_component_id: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          detected_at: string
          estimated_cost?: number | null
          id?: string
          mileage: number
          priority?: string
          resolution_maintenance_id?: string | null
          resolved_at?: string | null
          status?: string
          system_id?: string | null
          title: string
          vehicle_component_id?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          detected_at?: string
          estimated_cost?: number | null
          id?: string
          mileage?: number
          priority?: string
          resolution_maintenance_id?: string | null
          resolved_at?: string | null
          status?: string
          system_id?: string | null
          title?: string
          vehicle_component_id?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "problems_resolution_maintenance_id_fkey"
            columns: ["resolution_maintenance_id"]
            isOneToOne: false
            referencedRelation: "maintenance_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "problems_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "system_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "problems_vehicle_component_id_fkey"
            columns: ["vehicle_component_id"]
            isOneToOne: false
            referencedRelation: "vehicle_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "problems_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      system_catalog: {
        Row: {
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      vehicle_components: {
        Row: {
          catalog_component_id: string | null
          created_at: string
          custom_name: string | null
          id: string
          interval_km: number | null
          interval_months: number | null
          last_service_date: string | null
          last_service_mileage: number | null
          notes: string | null
          status: string
          system_id: string
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          catalog_component_id?: string | null
          created_at?: string
          custom_name?: string | null
          id?: string
          interval_km?: number | null
          interval_months?: number | null
          last_service_date?: string | null
          last_service_mileage?: number | null
          notes?: string | null
          status?: string
          system_id: string
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          catalog_component_id?: string | null
          created_at?: string
          custom_name?: string | null
          id?: string
          interval_km?: number | null
          interval_months?: number | null
          last_service_date?: string | null
          last_service_mileage?: number | null
          notes?: string | null
          status?: string
          system_id?: string
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_components_catalog_component_id_fkey"
            columns: ["catalog_component_id"]
            isOneToOne: false
            referencedRelation: "component_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_components_system_id_fkey"
            columns: ["system_id"]
            isOneToOne: false
            referencedRelation: "system_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_components_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          brand: string
          created_at: string
          current_mileage: number
          engine: string | null
          fuel_type: string | null
          id: string
          model: string
          nickname: string | null
          plate: string | null
          updated_at: string
          user_id: string
          version: string | null
          year: number
        }
        Insert: {
          brand: string
          created_at?: string
          current_mileage?: number
          engine?: string | null
          fuel_type?: string | null
          id?: string
          model: string
          nickname?: string | null
          plate?: string | null
          updated_at?: string
          user_id: string
          version?: string | null
          year: number
        }
        Update: {
          brand?: string
          created_at?: string
          current_mileage?: number
          engine?: string | null
          fuel_type?: string | null
          id?: string
          model?: string
          nickname?: string | null
          plate?: string | null
          updated_at?: string
          user_id?: string
          version?: string | null
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_fuel_record: {
        Args: {
          p_fuel_type: string
          p_fueled_at: string
          p_full_tank: boolean
          p_liters?: number
          p_mileage: number
          p_notes?: string
          p_price_per_liter?: number
          p_station?: string
          p_total_cost?: number
          p_vehicle_id: string
        }
        Returns: string
      }
      create_improvement_record: {
        Args: {
          p_category?: string
          p_estimated_budget?: number
          p_notes?: string
          p_priority: string
          p_product_name?: string
          p_product_url?: string
          p_title: string
          p_vehicle_id: string
        }
        Returns: string
      }
      create_maintenance_with_items: {
        Args: {
          p_interval_km?: number
          p_interval_months?: number
          p_items: Json
          p_mileage: number
          p_notes?: string
          p_service_date: string
          p_title: string
          p_total_cost?: number
          p_vehicle_id: string
          p_workshop?: string
        }
        Returns: string
      }
      create_problem_record: {
        Args: {
          p_description?: string
          p_detected_at: string
          p_estimated_cost?: number
          p_mileage: number
          p_priority: string
          p_system_id?: string
          p_title: string
          p_vehicle_component_id?: string
          p_vehicle_id: string
        }
        Returns: string
      }
      create_vehicle_with_components: {
        Args: {
          p_brand: string
          p_current_mileage: number
          p_engine?: string
          p_model: string
          p_nickname?: string
          p_oil_status?: string
          p_tire_status?: string
          p_version?: string
          p_year: number
        }
        Returns: {
          brand: string
          created_at: string
          current_mileage: number
          engine: string | null
          fuel_type: string | null
          id: string
          model: string
          nickname: string | null
          plate: string | null
          updated_at: string
          user_id: string
          version: string | null
          year: number
        }
        SetofOptions: {
          from: "*"
          to: "vehicles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_vehicle_mileage: {
        Args: {
          p_mileage: number
          p_recorded_at?: string
          p_vehicle_id: string
        }
        Returns: boolean
      }
      update_vehicle_mileage_if_greater: {
        Args: {
          p_candidate_mileage: number
          p_recorded_at?: string
          p_source_id?: string
          p_source_type: string
          p_vehicle_id: string
        }
        Returns: boolean
      }
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
  public: {
    Enums: {},
  },
} as const

