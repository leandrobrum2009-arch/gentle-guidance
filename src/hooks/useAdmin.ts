import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useIsAdmin = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (error) throw error;
      return data as boolean;
    },
    enabled: !!user,
  });
};

export const useAdminCampaigns = () =>
  useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useAdminOrders = () =>
  useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, campaigns(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useAdminWinners = () =>
  useQuery({
    queryKey: ["admin-winners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("winners")
        .select("*, campaigns(title)")
        .order("draw_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
