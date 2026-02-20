import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      return data as Campaign[];
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
      return data as Campaign | null;
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
