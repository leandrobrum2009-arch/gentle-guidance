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
      affiliate_commissions: {
        Row: {
          affiliate_id: string | null
          amount: number
          created_at: string | null
          id: string
          order_id: string | null
          status: string | null
        }
        Insert: {
          affiliate_id?: string | null
          amount: number
          created_at?: string | null
          id?: string
          order_id?: string | null
          status?: string | null
        }
        Update: {
          affiliate_id?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          order_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          commission_rate: number
          created_at: string
          id: string
          referral_code: string
          total_earned: number
          user_id: string
        }
        Insert: {
          commission_rate?: number
          created_at?: string
          id?: string
          referral_code: string
          total_earned?: number
          user_id: string
        }
        Update: {
          commission_rate?: number
          created_at?: string
          id?: string
          referral_code?: string
          total_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          id: string
          published_at: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          published_at?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          published_at?: string
          title?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          auto_numbers: boolean | null
          created_at: string
          description: string | null
          draw_date: string | null
          draw_number: string | null
          featured: boolean | null
          federal_lottery_draw: boolean | null
          gallery_urls: Json | null
          id: string
          image_url: string | null
          ltp_code: string | null
          lucky_numbers_prizes: Json | null
          manual_numbers: boolean | null
          max_tickets: number | null
          min_tickets: number | null
          mystery_box_enabled: boolean | null
          payment_methods: Json | null
          price_bundles: Json | null
          ranking_enabled: boolean | null
          regulations: string | null
          roulette_enabled: boolean | null
          roulette_free_tickets: number | null
          roulette_multiplier_max: number | null
          roulette_spin_cost: number | null
          sales_goal: number | null
          slug: string
          sold_tickets: number
          status: string
          subtitle: string | null
          ticket_price: number
          title: string
          total_tickets: number
          updated_at: string
          urgency_tag: string | null
          video_url: string | null
        }
        Insert: {
          auto_numbers?: boolean | null
          created_at?: string
          description?: string | null
          draw_date?: string | null
          draw_number?: string | null
          featured?: boolean | null
          federal_lottery_draw?: boolean | null
          gallery_urls?: Json | null
          id?: string
          image_url?: string | null
          ltp_code?: string | null
          lucky_numbers_prizes?: Json | null
          manual_numbers?: boolean | null
          max_tickets?: number | null
          min_tickets?: number | null
          mystery_box_enabled?: boolean | null
          payment_methods?: Json | null
          price_bundles?: Json | null
          ranking_enabled?: boolean | null
          regulations?: string | null
          roulette_enabled?: boolean | null
          roulette_free_tickets?: number | null
          roulette_multiplier_max?: number | null
          roulette_spin_cost?: number | null
          sales_goal?: number | null
          slug: string
          sold_tickets?: number
          status?: string
          subtitle?: string | null
          ticket_price?: number
          title: string
          total_tickets?: number
          updated_at?: string
          urgency_tag?: string | null
          video_url?: string | null
        }
        Update: {
          auto_numbers?: boolean | null
          created_at?: string
          description?: string | null
          draw_date?: string | null
          draw_number?: string | null
          featured?: boolean | null
          federal_lottery_draw?: boolean | null
          gallery_urls?: Json | null
          id?: string
          image_url?: string | null
          ltp_code?: string | null
          lucky_numbers_prizes?: Json | null
          manual_numbers?: boolean | null
          max_tickets?: number | null
          min_tickets?: number | null
          mystery_box_enabled?: boolean | null
          payment_methods?: Json | null
          price_bundles?: Json | null
          ranking_enabled?: boolean | null
          regulations?: string | null
          roulette_enabled?: boolean | null
          roulette_free_tickets?: number | null
          roulette_multiplier_max?: number | null
          roulette_spin_cost?: number | null
          sales_goal?: number | null
          slug?: string
          sold_tickets?: number
          status?: string
          subtitle?: string | null
          ticket_price?: number
          title?: string
          total_tickets?: number
          updated_at?: string
          urgency_tag?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      federal_lottery_results: {
        Row: {
          concurso: string
          created_at: string | null
          data_sorteio: string
          id: string
          premios: Json
        }
        Insert: {
          concurso: string
          created_at?: string | null
          data_sorteio: string
          id?: string
          premios: Json
        }
        Update: {
          concurso?: string
          created_at?: string | null
          data_sorteio?: string
          id?: string
          premios?: Json
        }
        Relationships: []
      }
      mystery_box_wins: {
        Row: {
          box_id: string
          created_at: string
          id: string
          prize_title: string
          prize_value: number | null
          user_id: string
        }
        Insert: {
          box_id: string
          created_at?: string
          id?: string
          prize_title: string
          prize_value?: number | null
          user_id: string
        }
        Update: {
          box_id?: string
          created_at?: string
          id?: string
          prize_title?: string
          prize_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mystery_box_wins_box_id_fkey"
            columns: ["box_id"]
            isOneToOne: false
            referencedRelation: "mystery_boxes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mystery_box_wins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      mystery_boxes: {
        Row: {
          campaign_id: string | null
          chance_percent: number | null
          cost_to_open: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          prize_value: number | null
          title: string
        }
        Insert: {
          campaign_id?: string | null
          chance_percent?: number | null
          cost_to_open?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          prize_value?: number | null
          title: string
        }
        Update: {
          campaign_id?: string | null
          chance_percent?: number | null
          cost_to_open?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          prize_value?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "mystery_boxes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          affiliate_id: string | null
          campaign_id: string
          created_at: string
          expires_at: string | null
          id: string
          paid_at: string | null
          payment_status: string
          pix_code: string | null
          pix_qr_code_base64: string | null
          quantity: number
          stripe_session_id: string | null
          total_amount: number
          user_id: string
        }
        Insert: {
          affiliate_id?: string | null
          campaign_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          payment_status?: string
          pix_code?: string | null
          pix_qr_code_base64?: string | null
          quantity?: number
          stripe_session_id?: string | null
          total_amount?: number
          user_id: string
        }
        Update: {
          affiliate_id?: string | null
          campaign_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          paid_at?: string | null
          payment_status?: string
          pix_code?: string | null
          pix_qr_code_base64?: string | null
          quantity?: number
          stripe_session_id?: string | null
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          balance: number | null
          cashback_balance: number | null
          cpf: string | null
          created_at: string
          id: string
          name: string
          phone: string | null
          points: number | null
          updated_at: string
          user_id: string
          vip_level: number | null
          xp: number | null
        }
        Insert: {
          avatar_url?: string | null
          balance?: number | null
          cashback_balance?: number | null
          cpf?: string | null
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          points?: number | null
          updated_at?: string
          user_id: string
          vip_level?: number | null
          xp?: number | null
        }
        Update: {
          avatar_url?: string | null
          balance?: number | null
          cashback_balance?: number | null
          cpf?: string | null
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          points?: number | null
          updated_at?: string
          user_id?: string
          vip_level?: number | null
          xp?: number | null
        }
        Relationships: []
      }
      roulette_prizes: {
        Row: {
          campaign_id: string | null
          chance_percent: number | null
          color: string | null
          created_at: string | null
          id: string
          label: string
          prize_type: string
          value: number | null
        }
        Insert: {
          campaign_id?: string | null
          chance_percent?: number | null
          color?: string | null
          created_at?: string | null
          id?: string
          label: string
          prize_type?: string
          value?: number | null
        }
        Update: {
          campaign_id?: string | null
          chance_percent?: number | null
          color?: string | null
          created_at?: string | null
          id?: string
          label?: string
          prize_type?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "roulette_prizes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      roulette_spins: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          prize_label: string
          prize_type: string
          prize_value: number | null
          user_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          prize_label: string
          prize_type: string
          prize_value?: number | null
          user_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          prize_label?: string
          prize_type?: string
          prize_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roulette_spins_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roulette_spins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tickets: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          is_lucky: boolean | null
          number: string
          order_id: string
          reservation_expires_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          is_lucky?: boolean | null
          number: string
          order_id: string
          reservation_expires_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          is_lucky?: boolean | null
          number?: string
          order_id?: string
          reservation_expires_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rewards: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          points_cost: number
          status: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          points_cost: number
          status?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          points_cost?: number
          status?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      winners: {
        Row: {
          campaign_id: string
          created_at: string
          draw_date: string
          id: string
          phone_masked: string | null
          prize_description: string
          ticket_number: string
          user_id: string | null
          video_url: string | null
          winner_name: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          draw_date: string
          id?: string
          phone_masked?: string | null
          prize_description: string
          ticket_number: string
          user_id?: string | null
          video_url?: string | null
          winner_name: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          draw_date?: string
          id?: string
          phone_masked?: string | null
          prize_description?: string
          ticket_number?: string
          user_id?: string | null
          video_url?: string | null
          winner_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "winners_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_reservations: { Args: never; Returns: undefined }
      handle_order_payment: { Args: { p_order_id: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      perform_draw: { Args: { p_campaign_id: string }; Returns: string }
      reserve_tickets: {
        Args: {
          p_campaign_id: string
          p_numbers?: string[]
          p_quantity: number
          p_user_id: string
        }
        Returns: string
      }
      sync_federal_lottery: { Args: never; Returns: undefined }
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
