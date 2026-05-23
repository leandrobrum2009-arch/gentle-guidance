 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
 import { toast } from "sonner";

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
 
 export const useAdminUsers = () =>
   useQuery({
     queryKey: ["admin-users"],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("profiles")
         .select("*")
         .order("created_at", { ascending: false });
       if (error) throw error;
       return data;
     },
   });
 
 export const useAdminAffiliates = () =>
   useQuery({
     queryKey: ["admin-affiliates"],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("affiliates")
         .select("*, profiles(full_name, email)")
         .order("created_at", { ascending: false });
       if (error) throw error;
       return data;
     },
   });
 
 export const useAdminRoulette = () =>
   useQuery({
     queryKey: ["admin-roulette-prizes"],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("roulette_prizes")
         .select("*")
         .order("created_at", { ascending: false });
       if (error) throw error;
       return data;
     },
   });
 
 export const useAdminMysteryBoxes = () =>
   useQuery({
     queryKey: ["admin-mystery-boxes"],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("mystery_boxes")
         .select("*")
         .order("created_at", { ascending: false });
       if (error) throw error;
       return data;
     },
  });
 
 export const useAdminScratchCards = () =>
   useQuery({
     queryKey: ["admin-scratch-card-prizes"],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("scratch_card_prizes")
         .select("*")
         .order("created_at", { ascending: false });
       if (error) throw error;
       return data;
     },
   });
 
 export const useAdminScratchCardStats = () =>
   useQuery({
     queryKey: ["admin-scratch-card-stats"],
     queryFn: async () => {
       const { data: scratches, error } = await supabase
         .from("scratch_card_scratches")
         .select("*");
 
       if (error) throw error;
 
       const totalScratches = scratches.length;
       const totalPrizesValue = scratches.reduce((acc, scratch) => acc + (Number(scratch.prize_value) || 0), 0);
       const winnersCount = scratches.filter(scratch => scratch.is_winner).length;
       const losersCount = totalScratches - winnersCount;
 
       return {
         totalScratches,
         totalPrizesValue,
         winnersCount,
         losersCount
       };
     },
   });
 
 export const useAdminCoupons = () =>
   useQuery({
     queryKey: ["admin-coupons"],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("coupons")
         .select("*")
         .order("created_at", { ascending: false });
       if (error) throw error;
       return data;
     },
   });
 
 export const useAdminBanners = () =>
   useQuery({
     queryKey: ["admin-banners"],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("banners")
         .select("*")
         .order("order_index", { ascending: true });
       if (error) throw error;
       return data;
     },
   });
 
 export const useAdminNotifications = () =>
   useQuery({
     queryKey: ["admin-notifications"],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("push_notifications")
         .select("*")
         .order("sent_at", { ascending: false });
       if (error) throw error;
       return data;
     },
   });
 
 export const useUpdateOrderStatus = () => {
   const queryClient = useQueryClient();
   return useMutation({
     mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
       const { error } = await supabase
         .from("orders")
         .update({ payment_status: status })
         .eq("id", orderId);
       if (error) throw error;
     },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
        toast.success("Status do pedido atualizado!");
      },
     onError: (error: any) => {
       toast.error("Erro ao atualizar pedido: " + error.message);
     },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      toast.success("Pedido excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir pedido: " + error.message);
    },
  });
};

export const useAdminOrders = () =>
  useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, campaigns(title), profiles!user_id(name, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useAdminRouletteStats = () =>
  useQuery({
    queryKey: ["admin-roulette-stats"],
    queryFn: async () => {
      const { data: spins, error } = await supabase
        .from("roulette_spins")
        .select("*");

      if (error) throw error;

      const totalSpins = spins.length;
      const totalPrizesValue = spins.reduce((acc, spin) => acc + (Number(spin.prize_value) || 0), 0);
      const freeSpinsCount = spins.filter(spin => (spin as any).is_free).length;
      const paidSpinsCount = totalSpins - freeSpinsCount;

      // Get campaigns to calculate spin cost revenue
      const { data: campaigns } = await supabase.from("campaigns").select("id, roulette_spin_cost");
      
      let estimatedRevenue = 0;
      spins.forEach(spin => {
        if (!(spin as any).is_free) {
          const campaign = campaigns?.find(c => c.id === spin.campaign_id);
          if (campaign && campaign.roulette_spin_cost) {
            // This is an estimate as we don't store the multiplier at spin time yet in the DB 
            // but we can infer it or we should add multiplier to roulette_spins table
            // For now, let's just sum the prize_value if it's not free as a proxy or just use the spin_cost
            // Actually, we should probably add 'multiplier' and 'cost_paid' to roulette_spins table for accuracy.
            estimatedRevenue += Number(campaign.roulette_spin_cost);
          }
        }
      });

      return {
        totalSpins,
        totalPrizesValue,
        freeSpinsCount,
        paidSpinsCount,
        estimatedRevenue
      };
    },
  });

export const useAdminWinners = () =>
  useQuery({
    queryKey: ["admin-winners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("winners")
        .select("*, campaigns(title, image_url)")
        .order("draw_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
