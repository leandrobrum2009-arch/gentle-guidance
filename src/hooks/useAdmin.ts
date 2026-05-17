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
       toast.success("Status do pedido atualizado!");
     },
     onError: (error: any) => {
       toast.error("Erro ao atualizar pedido: " + error.message);
     },
   });
 };

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
