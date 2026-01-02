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
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      energy_generation: {
        Row: {
          asset_id: string
          consumed_kwh: number
          created_at: string
          date: string
          exported_kwh: number
          generated_kwh: number
          id: string
        }
        Insert: {
          asset_id: string
          consumed_kwh?: number
          created_at?: string
          date: string
          exported_kwh?: number
          generated_kwh?: number
          id?: string
        }
        Update: {
          asset_id?: string
          consumed_kwh?: number
          created_at?: string
          date?: string
          exported_kwh?: number
          generated_kwh?: number
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "energy_generation_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "solar_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_milestones: {
        Row: {
          completed_date: string | null
          created_at: string
          disbursement_amount: number
          funding_id: string
          id: string
          name: string
          status: Database["public"]["Enums"]["milestone_status"]
          target_date: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string
          disbursement_amount: number
          funding_id: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["milestone_status"]
          target_date: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string
          disbursement_amount?: number
          funding_id?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["milestone_status"]
          target_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "funding_milestones_funding_id_fkey"
            columns: ["funding_id"]
            isOneToOne: false
            referencedRelation: "nbfc_funding"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          actual_returns: number
          amount: number
          asset_id: string
          created_at: string
          expected_returns: number
          id: string
          investor_id: string
          maturity_date: string
          start_date: string
          status: Database["public"]["Enums"]["investment_status"]
          updated_at: string
        }
        Insert: {
          actual_returns?: number
          amount: number
          asset_id: string
          created_at?: string
          expected_returns?: number
          id?: string
          investor_id: string
          maturity_date: string
          start_date?: string
          status?: Database["public"]["Enums"]["investment_status"]
          updated_at?: string
        }
        Update: {
          actual_returns?: number
          amount?: number
          asset_id?: string
          created_at?: string
          expected_returns?: number
          id?: string
          investor_id?: string
          maturity_date?: string
          start_date?: string
          status?: Database["public"]["Enums"]["investment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "solar_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      nbfc_funding: {
        Row: {
          asset_id: string
          created_at: string
          disbursed_amount: number
          id: string
          nbfc_id: string
          sanctioned_amount: number
          status: Database["public"]["Enums"]["funding_status"]
          updated_at: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          disbursed_amount?: number
          id?: string
          nbfc_id: string
          sanctioned_amount: number
          status?: Database["public"]["Enums"]["funding_status"]
          updated_at?: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          disbursed_amount?: number
          id?: string
          nbfc_id?: string
          sanctioned_amount?: number
          status?: Database["public"]["Enums"]["funding_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nbfc_funding_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "solar_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          kyc_status: Database["public"]["Enums"]["kyc_status"]
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          wallet_balance: number
          referral_code: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          wallet_balance?: number
          referral_code?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          kyc_status?: Database["public"]["Enums"]["kyc_status"]
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          wallet_balance?: number
          referral_code?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          invoice_id: string
          month: string
          pdf_url: string | null
          project_id: string
          rate: number
          status: string | null
          units_consumed: number
        }
        Insert: {
          amount: number
          created_at?: string
          invoice_id?: string
          month: string
          pdf_url?: string | null
          project_id: string
          rate: number
          status?: string | null
          units_consumed: number
        }
        Update: {
          amount?: number
          created_at?: string
          invoice_id?: string
          month?: string
          pdf_url?: string | null
          project_id?: string
          rate?: number
          status?: string | null
          units_consumed?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      projects: {
        Row: {
          project_id: string
          corporate_id: string
          project_name: string
          location: string
          status: string
          estimated_capacity_kw: number | null
          avg_power_consumption_kwh: number | null
          peak_load_kw: number | null
          area_available_sqft: number | null
          lease_duration_years: number | null
          billing_model: string | null
          created_at: string
          approved_at: string | null
          project_type: string | null
          land_ownership_type: string | null
          desired_solar_offset_percentage: number | null
          shadow_free_area: boolean | null
          roof_type: string | null
          lease_start_date: string | null
          lease_end_date: string | null
          ppa_start_date: string | null
          ppa_end_date: string | null
          ppa_rate: number | null
          last_maintenance_date: string | null
          next_maintenance_date: string | null
          health_status: string | null
        }
        Insert: {
          project_id?: string
          corporate_id: string
          project_name: string
          location: string
          status?: string
          estimated_capacity_kw?: number | null
          avg_power_consumption_kwh?: number | null
          peak_load_kw?: number | null
          area_available_sqft?: number | null
          lease_duration_years?: number | null
          billing_model?: string | null
          created_at?: string
          approved_at?: string | null
          project_type?: string | null
          land_ownership_type?: string | null
          desired_solar_offset_percentage?: number | null
          shadow_free_area?: boolean | null
          roof_type?: string | null
          lease_start_date?: string | null
          lease_end_date?: string | null
          ppa_start_date?: string | null
          ppa_end_date?: string | null
          ppa_rate?: number | null
          last_maintenance_date?: string | null
          next_maintenance_date?: string | null
          health_status?: string | null
        }
        Update: {
          project_id?: string
          corporate_id?: string
          project_name?: string
          location?: string
          status?: string
          estimated_capacity_kw?: number | null
          avg_power_consumption_kwh?: number | null
          peak_load_kw?: number | null
          area_available_sqft?: number | null
          lease_duration_years?: number | null
          billing_model?: string | null
          created_at?: string
          approved_at?: string | null
          project_type?: string | null
          land_ownership_type?: string | null
          desired_solar_offset_percentage?: number | null
          shadow_free_area?: boolean | null
          roof_type?: string | null
          lease_start_date?: string | null
          lease_end_date?: string | null
          ppa_start_date?: string | null
          ppa_end_date?: string | null
          ppa_rate?: number | null
          last_maintenance_date?: string | null
          next_maintenance_date?: string | null
          health_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_corporate_id_fkey"
            columns: ["corporate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      solar_assets: {
        Row: {
          annual_degradation: number
          capacity_kw: number
          corporate_id: string | null
          created_at: string
          expected_irr: number
          expected_life_years: number
          funded_amount: number
          id: string
          implementer_id: string | null
          installation_date: string | null
          location: string
          name: string
          risk_score: Database["public"]["Enums"]["risk_score"]
          status: Database["public"]["Enums"]["asset_status"]
          total_investment: number
          updated_at: string
        }
        Insert: {
          annual_degradation?: number
          capacity_kw: number
          corporate_id?: string | null
          created_at?: string
          expected_irr?: number
          expected_life_years?: number
          funded_amount?: number
          id?: string
          implementer_id?: string | null
          installation_date?: string | null
          location: string
          name: string
          risk_score?: Database["public"]["Enums"]["risk_score"]
          status?: Database["public"]["Enums"]["asset_status"]
          total_investment?: number
          updated_at?: string
        }
        Update: {
          annual_degradation?: number
          capacity_kw?: number
          corporate_id?: string | null
          created_at?: string
          expected_irr?: number
          expected_life_years?: number
          funded_amount?: number
          id?: string
          implementer_id?: string | null
          installation_date?: string | null
          location?: string
          name?: string
          risk_score?: Database["public"]["Enums"]["risk_score"]
          status?: Database["public"]["Enums"]["asset_status"]
          total_investment?: number
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          from_entity: string
          id: string
          reference: string
          status: Database["public"]["Enums"]["transaction_status"]
          to_entity: string
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          from_entity: string
          id?: string
          reference: string
          status?: Database["public"]["Enums"]["transaction_status"]
          to_entity: string
          type: Database["public"]["Enums"]["transaction_type"]
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          from_entity?: string
          id?: string
          reference?: string
          status?: Database["public"]["Enums"]["transaction_status"]
          to_entity?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string | null
        }
        Relationships: []
      },
      referrals: {
        Row: {
          created_at: string
          id: string
          referee_id: string
          referrer_id: string
          reward_amount: number | null
          status: Database["public"]["Enums"]["referral_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          referee_id: string
          referrer_id: string
          reward_amount?: number | null
          status?: Database["public"]["Enums"]["referral_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          referee_id?: string
          referrer_id?: string
          reward_amount?: number | null
          status?: Database["public"]["Enums"]["referral_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      },
      referral_analytics: {
        Row: {
          email: string | null
          id: string
          pending_referrals: number | null
          referral_code: string | null
          successful_referrals: number | null
          total_earned: number | null
          total_referrals: number | null
          updated_at: string | null
        }
        Insert: {
          email?: string | null
          id: string
          pending_referrals?: number | null
          referral_code?: string | null
          successful_referrals?: number | null
          total_earned?: number | null
          total_referrals?: number | null
          updated_at?: string | null
        }
        Update: {
          email?: string | null
          id?: string
          pending_referrals?: number | null
          referral_code?: string | null
          successful_referrals?: number | null
          total_earned?: number | null
          total_referrals?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_analytics_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      },
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "investor" | "corporate" | "nbfc" | "implementer" | "admin"
      asset_status:
      | "planning"
      | "under_construction"
      | "operational"
      | "maintenance"
      funding_status:
      | "sanctioned"
      | "partially_disbursed"
      | "fully_disbursed"
      | "closed"
      investment_status: "committed" | "deployed" | "returned"
      kyc_status: "pending" | "approved" | "rejected"
      milestone_status: "pending" | "completed" | "delayed"
      risk_score: "low" | "medium" | "high"
      transaction_status: "pending" | "completed" | "failed"
      transaction_type: "investment" | "return" | "disbursement" | "billing" | "deposit" | "withdrawal" | "referral_bonus"
      referral_status: "registered" | "pending" | "successful"
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
    Enums: {
      app_role: ["investor", "corporate", "nbfc", "implementer", "admin"],
      asset_status: [
        "planning",
        "under_construction",
        "operational",
        "maintenance",
      ],
      funding_status: [
        "sanctioned",
        "partially_disbursed",
        "fully_disbursed",
        "closed",
      ],
      investment_status: ["committed", "deployed", "returned"],
      kyc_status: ["pending", "approved", "rejected"],
      milestone_status: ["pending", "completed", "delayed"],
      risk_score: ["low", "medium", "high"],
      transaction_status: ["pending", "completed", "failed"],
      transaction_type: ["investment", "return", "disbursement", "billing", "deposit", "withdrawal", "referral_bonus"],
      referral_status: ["registered", "pending", "successful"],
    },
  },
} as const
