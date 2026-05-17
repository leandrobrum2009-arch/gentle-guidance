import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PriceBundle {
  quantity: number;
  price: number;
  label?: string;
  is_popular?: boolean;
}

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  ticket_price: number;
  total_tickets: number;
  sold_tickets: number;
  status: string;
  ltp_code: string | null;
  urgency_tag: string | null;
  draw_date: string | null;
  price_bundles: PriceBundle[] | null;
  min_tickets: number;
  max_tickets: number;
  mystery_box_enabled: boolean;
  roulette_enabled: boolean;
  ranking_enabled: boolean;
  roulette_spin_cost: number;
  roulette_free_tickets: number;
  roulette_multiplier_max: number;
  featured: boolean;
  gallery_urls?: string[];
  video_url?: string;
  regulations?: string;
  auto_numbers?: boolean;
  manual_numbers?: boolean;
  lucky_numbers_prizes?: any[];
  federal_lottery_draw?: boolean;
  draw_number?: string;
  payment_methods?: string[];
  sales_goal?: number;
  created_at: string;
}

export interface MysteryBox {
  id: string;
  campaign_id: string;
  title: string;
  description: string | null;
  prize_value: number | null;
  chance_percent: number;
  is_active: boolean;
  cost_to_open?: number;
}

export interface RoulettePrize {
  id: string;
  campaign_id: string;
  label: string;
  prize_type: 'points' | 'balance' | 'ticket' | 'physical';
  value: number | null;
  chance_percent: number;
  color: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface Winner {
  id: string;
  campaign_id: string;
  winner_name: string;
  ticket_number: string;
  prize_description: string;
  phone_masked: string | null;
  video_url: string | null;
  draw_date: string;
  campaigns?: { title: string } | null;
}

export interface RouletteSpin {
  id: string;
  user_id: string;
  campaign_id: string;
  prize_label: string;
  prize_type: string;
  prize_value: number | null;
  created_at: string;
  profiles?: { name: string; avatar_url: string | null } | null;
  campaigns?: { title: string } | null;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  published_at: string;
}

export const useCampaigns = () =>
  useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any) as Campaign[];
    },
  });

export const useCampaign = (id: string) =>
  useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as any) as Campaign | null;
    },
    enabled: !!id,
  });

export const useWinners = () =>
  useQuery({
    queryKey: ["winners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("winners")
        .select("*, campaigns(title)")
        .order("draw_date", { ascending: false });
      if (error) throw error;
      return data as Winner[];
    },
  });

export const useAnnouncements = () =>
  useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data as Announcement[];
    },
  });

export const useMysteryBoxes = (campaignId: string) =>
  useQuery({
    queryKey: ["mystery_boxes", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mystery_boxes")
        .select("*")
        .eq("campaign_id", campaignId)
        .eq("is_active", true);
      if (error) throw error;
      return data as MysteryBox[];
    },
    enabled: !!campaignId,
  });

export const useRoulettePrizes = (campaignId: string) =>
  useQuery({
    queryKey: ["roulette_prizes", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roulette_prizes")
        .select("*")
        .eq("campaign_id", campaignId);
      if (error) throw error;
      return data as RoulettePrize[];
    },
    enabled: !!campaignId,
  });

export interface MysteryBoxWin {
  id: string;
  user_id: string;
  box_id: string;
  prize_title: string;
  prize_value: number | null;
  created_at: string;
  profiles?: { name: string; avatar_url: string | null } | null;
}

export const useMysteryBoxWins = (limit = 5) =>
  useQuery({
    queryKey: ["mystery_box_wins", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mystery_box_wins")
        .select(`
          *,
          profiles!user_id (
            name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data as any) as MysteryBoxWin[];
    },
  });

export const useUserNotifications = (userId: string) =>
  useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!userId,
  });

export interface Ticket {
  id: string;
  order_id: string;
  campaign_id: string;
  user_id: string;
  number: string;
  status: string;
  is_lucky: boolean;
  reservation_expires_at: string | null;
  created_at: string;
}

export const useTickets = (campaignId: string) =>
  useQuery({
    queryKey: ["tickets", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("campaign_id", campaignId);
      if (error) throw error;
      return data as Ticket[];
    },
    enabled: !!campaignId,
  });

export const useRouletteSpins = (limit = 10) =>
  useQuery({
    queryKey: ["roulette_spins", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("roulette_spins")
        .select(`
          *,
          profiles!user_id (
            name,
            avatar_url
          ),
          campaigns (
            title
          )
        `)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data as any) as RouletteSpin[];
    },
  });

export const useRanking = (limit = 10) =>
  useQuery({
    queryKey: ["ranking"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, avatar_url, points, xp")
        .order("points", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
  });
