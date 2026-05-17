 import { useEffect, useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { Trophy, Zap, Clock, Users } from "lucide-react";
 import { useRouletteSpins, RouletteSpin } from "@/hooks/useData";
 import { supabase } from "@/integrations/supabase/client";
 import { useQueryClient } from "@tanstack/react-query";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Badge } from "@/components/ui/badge";
 import { formatDistanceToNow } from "date-fns";
 import { ptBR } from "date-fns/locale";
 
 const LiveRouletteFeed = () => {
   const { data: initialSpins, isLoading } = useRouletteSpins(6);
   const [spins, setSpins] = useState<RouletteSpin[]>([]);
   const queryClient = useQueryClient();
 
   useEffect(() => {
     if (initialSpins) setSpins(initialSpins);
   }, [initialSpins]);
 
   useEffect(() => {
     const channel = supabase
       .channel("live-roulette")
       .on(
         "postgres_changes",
         { event: "INSERT", schema: "public", table: "roulette_spins" },
         (payload) => {
           // Refresh the full query to get profiles/campaigns info
           queryClient.invalidateQueries({ queryKey: ["roulette_spins"] });
         }
       )
       .subscribe();
 
     return () => {
       supabase.removeChannel(channel);
     };
   }, [queryClient]);
 
   if (isLoading && spins.length === 0) {
     return <div className="h-40 flex items-center justify-center text-muted-foreground">Carregando feed...</div>;
   }
 
   return (
     <div className="space-y-4">
       <div className="flex items-center justify-between mb-2">
         <div className="flex items-center gap-2">
           <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
           <h3 className="text-sm font-black uppercase tracking-widest italic">Atividade em <span className="text-primary">Tempo Real</span></h3>
         </div>
         <Badge variant="outline" className="text-[8px] border-primary/30 text-primary uppercase gap-1">
           <Users className="h-2 w-2" /> 2.4k Online
         </Badge>
       </div>
 
       <div className="grid gap-3">
         <AnimatePresence mode="popLayout">
           {spins.map((spin, i) => (
             <motion.div
               key={spin.id}
               layout
               initial={{ opacity: 0, x: -20, scale: 0.95 }}
               animate={{ opacity: 1, x: 0, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               transition={{ duration: 0.3 }}
               className="relative overflow-hidden flex items-center gap-3 p-3 rounded-2xl bg-secondary/30 border border-white/5 group hover:border-primary/30 transition-all"
             >
               <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               
               <Avatar className="h-10 w-10 border-2 border-primary/20">
                 <AvatarImage src={spin.profiles?.avatar_url || ""} />
                 <AvatarFallback className="bg-primary/10 text-primary font-bold">
                   {spin.profiles?.name?.[0] || "?"}
                 </AvatarFallback>
               </Avatar>
 
               <div className="flex-1 min-w-0">
                 <div className="flex items-center justify-between">
                   <p className="text-[11px] font-black uppercase tracking-tight truncate text-foreground">
                     {spin.profiles?.name || "Usuário"}
                   </p>
                   <span className="text-[8px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                     <Clock className="h-2 w-2" /> {formatDistanceToNow(new Date(spin.created_at), { addSuffix: true, locale: ptBR })}
                   </span>
                 </div>
                 <p className="text-[10px] text-muted-foreground truncate italic">
                   Ganhou <span className="text-primary font-bold not-italic">{spin.prize_label}</span> na roleta
                 </p>
               </div>
 
               <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
                 <Trophy className="h-4 w-4" />
               </div>
             </motion.div>
           ))}
         </AnimatePresence>
       </div>
     </div>
   );
 };
 
 export default LiveRouletteFeed;