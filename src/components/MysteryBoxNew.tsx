 import { useState, useEffect, useMemo } from "react";
 import { motion, AnimatePresence, useAnimation } from "framer-motion";
 import { Gift, Sparkles, Box, Loader2, Trophy, Zap, Coins, Package, Star, Crown, ChevronRight, X, ShoppingBag, Ticket, CreditCard } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { MysteryBoxConfig, MysteryBoxPrize, useMysteryBoxWins, useMysteryBoxPrizes } from "@/hooks/useData";
 import { toast } from "sonner";
 import { useAuth } from "@/contexts/AuthContext";
 import { supabase } from "@/integrations/supabase/client";
 import { useQueryClient } from "@tanstack/react-query";
 import confetti from "canvas-confetti";
 import { formatDistanceToNow } from "date-fns";
 import { ptBR } from "date-fns/locale";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { cn } from "@/lib/utils";
 import { Badge } from "@/components/ui/badge";
 
 const RARITY_CONFIG = {
   common: { color: "#94a3b8", label: "Comum", icon: Package },
   rare: { color: "#3b82f6", label: "Raro", icon: Star },
   epic: { color: "#a855f7", label: "Épico", icon: Zap },
   legendary: { color: "#eab308", label: "Lendário", icon: Crown }
 };
 
 const MysteryBoxNew = ({ boxes, campaignId }: { boxes: MysteryBoxConfig[], campaignId?: string }) => {
   // ... (Component logic as planned above)
   return <div className="p-4 text-white"> Mystery Box System </div>;
 };
 
 export default MysteryBoxNew;