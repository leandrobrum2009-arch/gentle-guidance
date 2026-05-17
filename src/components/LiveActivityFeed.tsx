 import { useEffect, useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { Trophy, Zap, Clock, Users, Gift, Gamepad2 } from "lucide-react";
 import { useRouletteSpins, useMysteryBoxWins, RouletteSpin, MysteryBoxWin } from "@/hooks/useData";
 import { supabase } from "@/integrations/supabase/client";
 import { useQueryClient } from "@tanstack/react-query";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Badge } from "@/components/ui/badge";
 import { formatDistanceToNow } from "date-fns";
 import { ptBR } from "date-fns/locale";
 
 type Activity = (RouletteSpin | MysteryBoxWin) & { type: 'roulette' | 'box' };
 
 const LiveActivityFeed = () => {
   const { data: rouletteSpins } = useRouletteSpins(5);
   const { data: boxWins } = useMysteryBoxWins(5);
   const [activities, setActivities] = useState<Activity[]>([]);
   const queryClient = useQueryClient();
 
   useEffect(() => {
     const combined: Activity[] = [
       ...(rouletteSpins?.map(s => ({ ...s, type: 'roulette' as const })) || []),
       ...(boxWins?.map(w => ({ ...w, type: 'box' as const })) || [])
     ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
     .slice(0, 6);
     
     setActivities(combined);
   }, [rouletteSpins, boxWins]);
 
   useEffect(() => {
     const channel = supabase
       .channel("live-activity")
       .on(
         "postgres_changes",
         { event: "INSERT", schema: "public", table: "roulette_spins" },
         () => queryClient.invalidateQueries({ queryKey: ["roulette_spins"] })
       )
       .on(
         "postgres_changes",
         { event: "INSERT", schema: "public", table: "mystery_box_wins" },
         () => queryClient.invalidateQueries({ queryKey: ["mystery_box_wins"] })
       )
       .subscribe();
 
     return () => {
       supabase.removeChannel(channel);
     };
   }, [queryClient]);
 
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
           {activities.map((activity) => (
             <motion.div
               key={activity.id}
               layout
               initial={{ opacity: 0, x: -20, scale: 0.95 }}
               animate={{ opacity: 1, x: 0, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               transition={{ duration: 0.3 }}
               className="relative overflow-hidden flex items-center gap-3 p-3 rounded-2xl bg-secondary/30 border border-white/5 group hover:border-primary/30 transition-all"
             >
               <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               
               <Avatar className="h-10 w-10 border-2 border-primary/20">
                 <AvatarImage src={activity.profiles?.avatar_url || ""} />
                 <AvatarFallback className="bg-primary/10 text-primary font-bold">
                   {activity.profiles?.name?.[0] || "?"}
                 </AvatarFallback>
               </Avatar>
 
               <div className="flex-1 min-w-0">
                 <div className="flex items-center justify-between">
                   <p className="text-[11px] font-black uppercase tracking-tight truncate text-foreground">
                     {activity.profiles?.name || "Usuário"}
                   </p>
                   <span className="text-[8px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                     <Clock className="h-2 w-2" /> {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR })}
                   </span>
                 </div>
                 <p className="text-[10px] text-muted-foreground truncate italic">
                   {activity.type === 'roulette' ? 'Ganhou ' : 'Abriu a caixa e ganhou '}
                   <span className={activity.type === 'roulette' ? "text-primary font-bold not-italic" : "text-amber-500 font-bold not-italic"}>
                     {activity.type === 'roulette' ? (activity as RouletteSpin).prize_label : (activity as MysteryBoxWin).prize_title}
                   </span>
                 </p>
               </div>
 
               <div className={`flex items-center justify-center h-8 w-8 rounded-full ${activity.type === 'roulette' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-500'}`}>
                 {activity.type === 'roulette' ? <Gamepad2 className="h-4 w-4" /> : <Gift className="h-4 w-4" />}
               </div>
             </motion.div>
           ))}
         </AnimatePresence>
       </div>
     </div>
   );
 };
 
 export default LiveActivityFeed;