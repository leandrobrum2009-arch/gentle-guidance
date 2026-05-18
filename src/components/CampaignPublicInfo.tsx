import { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, Users, Gift, Gamepad2, Trophy, Clock, 
  Hash, User, Calendar, CheckCircle2, AlertCircle
} from "lucide-react";
import { 
  useCampaignMysteryBoxWins, 
  useCampaignRouletteSpins, 
  useCampaignLuckyWinners,
  Campaign
} from "@/hooks/useData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CampaignPublicInfoProps {
  campaign: Campaign;
}

const CampaignPublicInfo = ({ campaign }: CampaignPublicInfoProps) => {
  const { data: mysteryBoxWins } = useCampaignMysteryBoxWins(campaign.id, 10);
  const { data: rouletteSpins } = useCampaignRouletteSpins(campaign.id, 10);
  const { data: luckyWinners } = useCampaignLuckyWinners(campaign.id);

  const luckyPrizesMap = useMemo(() => {
    const map: Record<string, string> = {};
    campaign.lucky_numbers_prizes?.forEach((p: any) => {
      map[p.number] = p.prize;
    });
    return map;
  }, [campaign.lucky_numbers_prizes]);

  const stats = [
    {
      label: "Quantidade Vendida",
      value: campaign.sold_tickets.toLocaleString("pt-BR"),
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      label: "Quantidade Restante",
      value: (campaign.total_tickets - campaign.sold_tickets).toLocaleString("pt-BR"),
      icon: AlertCircle,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      label: "Caixas Disponíveis",
      value: campaign.mystery_box_enabled ? "Ativas" : "Indisponível",
      icon: Gift,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      label: "Roletas Disponíveis",
      value: campaign.roulette_enabled ? "Ativas" : "Indisponível",
      icon: Gamepad2,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      label: "Últimos Vencedores",
      value: ((mysteryBoxWins?.length || 0) + (rouletteSpins?.length || 0) + (luckyWinners?.length || 0)).toString(),
      icon: Trophy,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10"
    },
    {
      label: "Últimos Giros",
      value: (rouletteSpins?.length || 0).toString(),
      icon: Clock,
      color: "text-pink-500",
      bg: "bg-pink-500/10"
    },
    {
      label: "Últimos Prêmios",
      value: ((mysteryBoxWins?.length || 0) + (luckyWinners?.length || 0)).toString(),
      icon: Gift,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10"
    }
  ];

  return (
    <div className="space-y-12">
      {/* Real-time Stats */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Estatísticas em Tempo Real</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Acompanhe o desempenho da campanha agora</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all group"
            >
              <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-xl font-black italic">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </section>

       {/* Winners History */}
       <section className="space-y-6">
         <div className="flex items-center gap-3">
           <div className="h-10 w-10 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
             <Trophy className="h-6 w-6 text-yellow-500" />
           </div>
           <div>
             <h2 className="text-xl font-black uppercase italic tracking-tighter">Histórico de Ganhadores</h2>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Veja quem já levou prêmios nesta edição</p>
           </div>
         </div>
 
         <Tabs defaultValue="mystery" className="w-full">
           <TabsList className="grid w-full grid-cols-3 h-14 bg-white/[0.02] border border-white/5 rounded-2xl p-1 mb-6">
             <TabsTrigger value="mystery" className="rounded-xl font-black uppercase italic text-[10px] tracking-widest gap-2">
               <Gift className="h-4 w-4" /> Caixa
             </TabsTrigger>
             <TabsTrigger value="roulette" className="rounded-xl font-black uppercase italic text-[10px] tracking-widest gap-2">
               <Gamepad2 className="h-4 w-4" /> Roleta
             </TabsTrigger>
             <TabsTrigger value="lucky" className="rounded-xl font-black uppercase italic text-[10px] tracking-widest gap-2">
               <Hash className="h-4 w-4" /> Cotas
             </TabsTrigger>
           </TabsList>
 
           {/* Mystery Box Tab */}
           <TabsContent value="mystery" className="space-y-3 outline-none">
             {mysteryBoxWins && mysteryBoxWins.length > 0 ? (
               <div className="grid gap-3">
                 {mysteryBoxWins.map((win) => (
                   <motion.div 
                     key={win.id} 
                     initial={{ opacity: 0, x: -10 }} 
                     animate={{ opacity: 1, x: 0 }}
                     className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/5 transition-all"
                   >
                     <div className="flex items-center gap-4">
                       <Avatar className="h-12 w-12 border-2 border-white/5">
                         <AvatarImage src={win.profiles?.avatar_url || ""} />
                         <AvatarFallback className="text-xs font-black bg-zinc-800">{win.profiles?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                       </Avatar>
                       <div>
                         <p className="text-xs font-black uppercase tracking-tighter text-white">{win.profiles?.name || "Ganhador"}</p>
                         <div className="flex items-center gap-2 mt-1">
                           <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-none font-bold text-[8px] uppercase px-2 h-4">
                             {win.prize_title}
                           </Badge>
                           <span className="text-[10px] font-bold text-slate-500">{format(new Date(win.created_at), "HH:mm", { locale: ptBR })}</span>
                         </div>
                       </div>
                     </div>
                     <div className="text-right">
                       <Gift className="h-5 w-5 text-purple-500 opacity-20 ml-auto mb-1" />
                       <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Caixa Misteriosa</p>
                     </div>
                   </motion.div>
                 ))}
               </div>
             ) : (
               <EmptyHistory icon={Gift} message="Nenhum prêmio de caixa ainda." />
             )}
           </TabsContent>
 
           {/* Roulette Tab */}
           <TabsContent value="roulette" className="space-y-3 outline-none">
             {rouletteSpins && rouletteSpins.length > 0 ? (
               <div className="grid gap-3">
                 {rouletteSpins.map((spin) => (
                   <motion.div 
                     key={spin.id} 
                     initial={{ opacity: 0, x: -10 }} 
                     animate={{ opacity: 1, x: 0 }}
                     className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/5 transition-all"
                   >
                     <div className="flex items-center gap-4">
                       <Avatar className="h-12 w-12 border-2 border-white/5">
                         <AvatarImage src={spin.profiles?.avatar_url || ""} />
                         <AvatarFallback className="text-xs font-black bg-zinc-800">{spin.profiles?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                       </Avatar>
                       <div>
                         <p className="text-xs font-black uppercase tracking-tighter text-white">{spin.profiles?.name || "Ganhador"}</p>
                         <div className="flex items-center gap-2 mt-1">
                           <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-none font-bold text-[8px] uppercase px-2 h-4">
                             {spin.prize_label}
                           </Badge>
                           <span className="text-[10px] font-bold text-slate-500">{format(new Date(spin.created_at), "HH:mm", { locale: ptBR })}</span>
                         </div>
                       </div>
                     </div>
                     <div className="text-right">
                       <Gamepad2 className="h-5 w-5 text-blue-500 opacity-20 ml-auto mb-1" />
                       <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Giro da Roleta</p>
                     </div>
                   </motion.div>
                 ))}
               </div>
             ) : (
               <EmptyHistory icon={Gamepad2} message="Nenhum giro registrado." />
             )}
           </TabsContent>
 
           {/* Lucky Quotas Tab */}
           <TabsContent value="lucky" className="space-y-3 outline-none">
             {luckyWinners && luckyWinners.length > 0 ? (
               <div className="grid gap-3">
                 {luckyWinners.map((winner, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ opacity: 0, x: -10 }} 
                     animate={{ opacity: 1, x: 0 }}
                     className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/5 transition-all"
                   >
                     <div className="flex items-center gap-4">
                       <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
                         <span className="font-black italic text-primary text-sm">{winner.number}</span>
                       </div>
                       <div>
                         <p className="text-xs font-black uppercase tracking-tighter text-white">{winner.profiles?.name || "Ganhador"}</p>
                         <div className="flex items-center gap-2 mt-1">
                           <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-none font-bold text-[8px] uppercase px-2 h-4">
                             {luckyPrizesMap[winner.number] || "Cota Premiada"}
                           </Badge>
                           <span className="text-[10px] font-bold text-slate-500">Número Sorteado</span>
                         </div>
                       </div>
                     </div>
                     <div className="text-right">
                       <Hash className="h-5 w-5 text-emerald-500 opacity-20 ml-auto mb-1" />
                       <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Achou Ganhou</p>
                     </div>
                   </motion.div>
                 ))}
               </div>
             ) : (
               <EmptyHistory icon={Hash} message="Nenhuma cota premiada encontrada." />
             )}
           </TabsContent>
         </Tabs>
       </section>
     </div>
   );
 };
 
 const EmptyHistory = ({ icon: Icon, message }: { icon: any, message: string }) => (
   <div className="flex flex-col items-center justify-center py-12 rounded-[2.5rem] border border-dashed border-white/10 bg-white/[0.01]">
     <Icon className="h-10 w-10 mb-4 text-slate-600 opacity-20" />
     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{message}</p>
   </div>
 );
 
 export default CampaignPublicInfo;
    </div>
  );
};

export default CampaignPublicInfo;