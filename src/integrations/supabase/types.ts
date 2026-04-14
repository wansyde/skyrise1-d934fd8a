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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      aaa_assignments: {
        Row: {
          car_commissions: number[]
          car_names: string[]
          car_prices: number[]
          commission_multiplier: number
          created_at: string
          id: string
          number_of_cars: number
          profit_percentage: number
          set_number: number
          status: string
          task_position: number
          total_assignment_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          car_commissions?: number[]
          car_names?: string[]
          car_prices?: number[]
          commission_multiplier?: number
          created_at?: string
          id?: string
          number_of_cars?: number
          profit_percentage?: number
          set_number?: number
          status?: string
          task_position: number
          total_assignment_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          car_commissions?: number[]
          car_names?: string[]
          car_prices?: number[]
          commission_multiplier?: number
          created_at?: string
          id?: string
          number_of_cars?: number
          profit_percentage?: number
          set_number?: number
          status?: string
          task_position?: number
          total_assignment_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          action_type: string
          admin_user_id: string
          admin_username: string
          created_at: string
          description: string
          id: string
          target_user_id: string | null
          target_username: string | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          admin_username?: string
          created_at?: string
          description?: string
          id?: string
          target_user_id?: string | null
          target_username?: string | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          admin_username?: string
          created_at?: string
          description?: string
          id?: string
          target_user_id?: string | null
          target_username?: string | null
        }
        Relationships: []
      }
      deposits: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          id: string
          method: string
          proof_url: string | null
          status: string
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string
          id?: string
          method: string
          proof_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          id?: string
          method?: string
          proof_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      investment_plans: {
        Row: {
          created_at: string
          duration_days: number
          features: string[] | null
          id: string
          is_active: boolean
          max_amount: number | null
          min_amount: number
          name: string
          period: string
          rate: number
        }
        Insert: {
          created_at?: string
          duration_days: number
          features?: string[] | null
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount: number
          name: string
          period?: string
          rate: number
        }
        Update: {
          created_at?: string
          duration_days?: number
          features?: string[] | null
          id?: string
          is_active?: boolean
          max_amount?: number | null
          min_amount?: number
          name?: string
          period?: string
          rate?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          advertising_salary: number
          avatar_url: string | null
          balance: number
          city: string | null
          connection_type: string | null
          country: string | null
          created_at: string
          credit_score: number
          current_unlocked_set: number
          email: string
          escrow_balance: number
          full_name: string
          gender: string | null
          id: string
          initial_deposit: number
          ip_address: string | null
          is_vpn: boolean | null
          isp: string | null
          kyc_back_url: string | null
          kyc_front_url: string | null
          kyc_id_number: string | null
          kyc_id_type: string | null
          kyc_name: string | null
          kyc_selfie_url: string | null
          kyc_status: string
          kyc_submitted_at: string | null
          last_login_at: string | null
          last_login_ip: string | null
          last_task_reset: string
          pending_popup_message: string | null
          pending_popup_type: string | null
          phone: string | null
          referral_code: string | null
          referred_by: string | null
          region: string | null
          saved_wallet_address: string | null
          saved_wallet_email: string | null
          saved_wallet_name: string | null
          saved_wallet_network: string | null
          saved_wallet_username: string | null
          status: string
          task_cycle_completed: boolean
          tasks_completed_today: number
          updated_at: string
          user_id: string
          username: string | null
          vip_level: string
          withdraw_password: string | null
        }
        Insert: {
          advertising_salary?: number
          avatar_url?: string | null
          balance?: number
          city?: string | null
          connection_type?: string | null
          country?: string | null
          created_at?: string
          credit_score?: number
          current_unlocked_set?: number
          email?: string
          escrow_balance?: number
          full_name?: string
          gender?: string | null
          id?: string
          initial_deposit?: number
          ip_address?: string | null
          is_vpn?: boolean | null
          isp?: string | null
          kyc_back_url?: string | null
          kyc_front_url?: string | null
          kyc_id_number?: string | null
          kyc_id_type?: string | null
          kyc_name?: string | null
          kyc_selfie_url?: string | null
          kyc_status?: string
          kyc_submitted_at?: string | null
          last_login_at?: string | null
          last_login_ip?: string | null
          last_task_reset?: string
          pending_popup_message?: string | null
          pending_popup_type?: string | null
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          region?: string | null
          saved_wallet_address?: string | null
          saved_wallet_email?: string | null
          saved_wallet_name?: string | null
          saved_wallet_network?: string | null
          saved_wallet_username?: string | null
          status?: string
          task_cycle_completed?: boolean
          tasks_completed_today?: number
          updated_at?: string
          user_id: string
          username?: string | null
          vip_level?: string
          withdraw_password?: string | null
        }
        Update: {
          advertising_salary?: number
          avatar_url?: string | null
          balance?: number
          city?: string | null
          connection_type?: string | null
          country?: string | null
          created_at?: string
          credit_score?: number
          current_unlocked_set?: number
          email?: string
          escrow_balance?: number
          full_name?: string
          gender?: string | null
          id?: string
          initial_deposit?: number
          ip_address?: string | null
          is_vpn?: boolean | null
          isp?: string | null
          kyc_back_url?: string | null
          kyc_front_url?: string | null
          kyc_id_number?: string | null
          kyc_id_type?: string | null
          kyc_name?: string | null
          kyc_selfie_url?: string | null
          kyc_status?: string
          kyc_submitted_at?: string | null
          last_login_at?: string | null
          last_login_ip?: string | null
          last_task_reset?: string
          pending_popup_message?: string | null
          pending_popup_type?: string | null
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          region?: string | null
          saved_wallet_address?: string | null
          saved_wallet_email?: string | null
          saved_wallet_name?: string | null
          saved_wallet_network?: string | null
          saved_wallet_username?: string | null
          status?: string
          task_cycle_completed?: boolean
          tasks_completed_today?: number
          updated_at?: string
          user_id?: string
          username?: string | null
          vip_level?: string
          withdraw_password?: string | null
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_type?: string
          user_id?: string
        }
        Relationships: []
      }
      support_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          status: string
          subject: string
          ticket_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          subject?: string
          ticket_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_records: {
        Row: {
          advertising_salary: number
          assignment_code: string
          car_brand: string
          car_commissions: number[]
          car_image_url: string | null
          car_name: string
          car_prices: number[]
          car_statuses: string[]
          created_at: string
          id: string
          status: string
          task_type: string
          total_amount: number
          user_id: string
        }
        Insert: {
          advertising_salary?: number
          assignment_code: string
          car_brand: string
          car_commissions?: number[]
          car_image_url?: string | null
          car_name: string
          car_prices?: number[]
          car_statuses?: string[]
          created_at?: string
          id?: string
          status?: string
          task_type?: string
          total_amount?: number
          user_id: string
        }
        Update: {
          advertising_salary?: number
          assignment_code?: string
          car_brand?: string
          car_commissions?: number[]
          car_image_url?: string | null
          car_name?: string
          car_prices?: number[]
          car_statuses?: string[]
          created_at?: string
          id?: string
          status?: string
          task_type?: string
          total_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          message: string
          sender_type: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          message: string
          sender_type?: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          message?: string
          sender_type?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          method: string | null
          reference_id: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          method?: string | null
          reference_id?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          method?: string | null
          reference_id?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_investments: {
        Row: {
          accrued_return: number
          amount: number
          created_at: string
          ends_at: string
          id: string
          plan_id: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accrued_return?: number
          amount: number
          created_at?: string
          ends_at: string
          id?: string
          plan_id: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accrued_return?: number
          amount?: number
          created_at?: string
          ends_at?: string
          id?: string
          plan_id?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_investments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "investment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          id: string
          method: string
          status: string
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string
          id?: string
          method: string
          status?: string
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          id?: string
          method?: string
          status?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_deposit: {
        Args: { _amount: number; _note?: string; _user_id: string }
        Returns: Json
      }
      admin_withdraw: {
        Args: { _amount: number; _note?: string; _user_id: string }
        Returns: Json
      }
      complete_aaa_task: {
        Args: {
          _assignment_id: string
          _car_names: string[]
          _total_amount: number
        }
        Returns: Json
      }
      complete_task: {
        Args: {
          _assignment_code: string
          _car_brand: string
          _car_image_url: string
          _car_name: string
          _total_amount: number
        }
        Returns: Json
      }
      get_email_by_username: { Args: { _username: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      invest_in_plan: {
        Args: { _amount: number; _plan_id: string }
        Returns: Json
      }
      log_admin_action: {
        Args: {
          _action_type: string
          _description?: string
          _target_user_id?: string
        }
        Returns: undefined
      }
      preview_task: { Args: { _total_amount: number }; Returns: Json }
      submit_kyc: {
        Args: {
          _kyc_back_url: string
          _kyc_front_url: string
          _kyc_id_number: string
          _kyc_id_type: string
          _kyc_name: string
          _kyc_selfie_url: string
        }
        Returns: Json
      }
      submit_pending_task: { Args: { _record_id: string }; Returns: Json }
      submit_withdrawal:
        | { Args: { _amount: number; _wallet_address: string }; Returns: Json }
        | {
            Args: {
              _amount: number
              _wallet_address: string
              _wallet_name?: string
            }
            Returns: Json
          }
      update_withdraw_password: {
        Args: { _new_password: string; _old_password: string }
        Returns: Json
      }
      validate_referral_code: { Args: { _code: string }; Returns: boolean }
      verify_withdraw_password: {
        Args: { _password: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
