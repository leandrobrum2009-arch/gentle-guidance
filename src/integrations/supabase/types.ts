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
      banners: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          is_active: boolean | null
          link_url: string | null
          order_index: number | null
          subtitle: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          link_url?: string | null
          order_index?: number | null
          subtitle?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          link_url?: string | null
          order_index?: number | null
          subtitle?: string | null
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
          main_prizes: Json | null
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
          roulette_payout_rate: number | null
          roulette_rules: Json | null
          roulette_spin_cost: number | null
          sales_goal: number | null
          scratch_card_cost: number | null
          scratch_card_rules: Json | null
          scratch_cards_enabled: boolean | null
          sections_order: Json | null
          show_instant_prizes: boolean | null
          show_roulette_status: boolean | null
          show_timer: boolean | null
          slug: string
          sold_tickets: number
          status: string
          subtitle: string | null
          ticket_generation_type: string | null
          ticket_price: number
          timer_end_date: string | null
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
          main_prizes?: Json | null
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
          roulette_payout_rate?: number | null
          roulette_rules?: Json | null
          roulette_spin_cost?: number | null
          sales_goal?: number | null
          scratch_card_cost?: number | null
          scratch_card_rules?: Json | null
          scratch_cards_enabled?: boolean | null
          sections_order?: Json | null
          show_instant_prizes?: boolean | null
          show_roulette_status?: boolean | null
          show_timer?: boolean | null
          slug: string
          sold_tickets?: number
          status?: string
          subtitle?: string | null
          ticket_generation_type?: string | null
          ticket_price?: number
          timer_end_date?: string | null
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
          main_prizes?: Json | null
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
          roulette_payout_rate?: number | null
          roulette_rules?: Json | null
          roulette_spin_cost?: number | null
          sales_goal?: number | null
          scratch_card_cost?: number | null
          scratch_card_rules?: Json | null
          scratch_cards_enabled?: boolean | null
          sections_order?: Json | null
          show_instant_prizes?: boolean | null
          show_roulette_status?: boolean | null
          show_timer?: boolean | null
          slug?: string
          sold_tickets?: number
          status?: string
          subtitle?: string | null
          ticket_generation_type?: string | null
          ticket_price?: number
          timer_end_date?: string | null
          title?: string
          total_tickets?: number
          updated_at?: string
          urgency_tag?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          current_uses: number | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_purchase_amount: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_uses?: number | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_purchase_amount?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_uses?: number | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_purchase_amount?: number | null
        }
        Relationships: []
      }
      custom_presets: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          values: Json
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          values: Json
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          values?: Json
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
      mystery_box_configs: {
        Row: {
          campaign_id: string | null
          cost: number
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          rarity: Database["public"]["Enums"]["mystery_box_rarity"]
        }
        Insert: {
          campaign_id?: string | null
          cost?: number
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          rarity?: Database["public"]["Enums"]["mystery_box_rarity"]
        }
        Update: {
          campaign_id?: string | null
          cost?: number
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          rarity?: Database["public"]["Enums"]["mystery_box_rarity"]
        }
        Relationships: [
          {
            foreignKeyName: "mystery_box_configs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      mystery_box_prizes: {
        Row: {
          chance_percent: number
          config_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          prize_type: string
          prize_value: number | null
          rarity: Database["public"]["Enums"]["mystery_box_rarity"]
          title: string
        }
        Insert: {
          chance_percent?: number
          config_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          prize_type?: string
          prize_value?: number | null
          rarity?: Database["public"]["Enums"]["mystery_box_rarity"]
          title: string
        }
        Update: {
          chance_percent?: number
          config_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          prize_type?: string
          prize_value?: number | null
          rarity?: Database["public"]["Enums"]["mystery_box_rarity"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "mystery_box_prizes_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "mystery_box_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      mystery_box_wins: {
        Row: {
          box_id: string
          config_id: string | null
          created_at: string
          id: string
          prize_id: string | null
          prize_title: string
          prize_value: number | null
          user_id: string
        }
        Insert: {
          box_id: string
          config_id?: string | null
          created_at?: string
          id?: string
          prize_id?: string | null
          prize_title: string
          prize_value?: number | null
          user_id: string
        }
        Update: {
          box_id?: string
          config_id?: string | null
          created_at?: string
          id?: string
          prize_id?: string | null
          prize_title?: string
          prize_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mystery_box_wins_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "mystery_box_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mystery_box_wins_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "mystery_box_prizes"
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
          coupon_id: string | null
          created_at: string
          discount_amount: number | null
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
          coupon_id?: string | null
          created_at?: string
          discount_amount?: number | null
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
          coupon_id?: string | null
          created_at?: string
          discount_amount?: number | null
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
            foreignKeyName: "fk_orders_campaigns"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
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
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
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
          email: string | null
          id: string
          name: string
          phone: string | null
          points: number | null
          referred_by_code: string | null
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
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          points?: number | null
          referred_by_code?: string | null
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
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          points?: number | null
          referred_by_code?: string | null
          updated_at?: string
          user_id?: string
          vip_level?: number | null
          xp?: number | null
        }
        Relationships: []
      }
      push_notifications: {
        Row: {
          body: string
          created_at: string | null
          id: string
          link_url: string | null
          sent_at: string | null
          sent_by: string | null
          target_type: string | null
          target_user_id: string | null
          title: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          link_url?: string | null
          sent_at?: string | null
          sent_by?: string | null
          target_type?: string | null
          target_user_id?: string | null
          title: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          link_url?: string | null
          sent_at?: string | null
          sent_by?: string | null
          target_type?: string | null
          target_user_id?: string | null
          title?: string
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
          is_free: boolean | null
          prize_label: string | null
          prize_type: string | null
          prize_value: number | null
          user_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          is_free?: boolean | null
          prize_label?: string | null
          prize_type?: string | null
          prize_value?: number | null
          user_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          is_free?: boolean | null
          prize_label?: string | null
          prize_type?: string | null
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
      scratch_card_prizes: {
        Row: {
          campaign_id: string | null
          chance_percent: number
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          label: string
          prize_type: string
          updated_at: string
          value: number
        }
        Insert: {
          campaign_id?: string | null
          chance_percent?: number
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          label: string
          prize_type?: string
          updated_at?: string
          value?: number
        }
        Update: {
          campaign_id?: string | null
          chance_percent?: number
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          label?: string
          prize_type?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "scratch_card_prizes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      scratch_card_scratches: {
        Row: {
          campaign_id: string | null
          cost: number
          created_at: string
          id: string
          is_winner: boolean
          prize_id: string | null
          prize_label: string | null
          prize_type: string | null
          prize_value: number | null
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          cost?: number
          created_at?: string
          id?: string
          is_winner?: boolean
          prize_id?: string | null
          prize_label?: string | null
          prize_type?: string | null
          prize_value?: number | null
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          cost?: number
          created_at?: string
          id?: string
          is_winner?: boolean
          prize_id?: string | null
          prize_label?: string | null
          prize_type?: string | null
          prize_value?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scratch_card_scratches_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scratch_card_scratches_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "scratch_card_prizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scratch_card_scratches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
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
      user_achievements: {
        Row: {
          achievement_key: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          points_reward: number | null
          title: string
          user_id: string
        }
        Insert: {
          achievement_key: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          points_reward?: number | null
          title: string
          user_id: string
        }
        Update: {
          achievement_key?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          points_reward?: number | null
          title?: string
          user_id?: string
        }
        Relationships: []
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
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          pix_key: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          pix_key?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          pix_key?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      winners: {
        Row: {
          avatar_url: string | null
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
          winner_type: string | null
        }
        Insert: {
          avatar_url?: string | null
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
          winner_type?: string | null
        }
        Update: {
          avatar_url?: string | null
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
          winner_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_winners_campaigns"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
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
      increment_balance: {
        Args: { amount: number; user_uuid: string }
        Returns: undefined
      }
      manual_perform_draw: {
        Args: { p_campaign_id: string; p_ticket_number: string }
        Returns: string
      }
      perform_draw: { Args: { p_campaign_id: string }; Returns: string }
      process_roulette_spin: {
        Args: { p_campaign_id: string; p_multiplier: number }
        Returns: Json
      }
      process_scratch_card_play: {
        Args: { p_campaign_id?: string; p_cost?: number }
        Returns: Json
      }
      release_expired_tickets: { Args: never; Returns: undefined }
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
      mystery_box_rarity: "common" | "rare" | "epic" | "legendary"
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
      mystery_box_rarity: ["common", "rare", "epic", "legendary"],
    },
  },
} as const
