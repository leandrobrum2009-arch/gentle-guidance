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
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Acompanhe o desempenho da campanha agora</p>
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
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
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
             <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Veja quem já levou prêmios nesta edição</p>
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
               <div className="bg-white rounded-3xl border border-border overflow-hidden">
                  <div className="grid grid-cols-3 bg-secondary/50 p-4 border-b border-border hidden sm:grid">
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ganhador</span>
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Prêmio</span>
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Horário</span>
                 </div>
                 <div className="divide-y divide-slate-50">
                    {mysteryBoxWins.map((win, idx) => (
                      <div key={idx} className="flex flex-col sm:grid sm:grid-cols-3 p-4 gap-3 sm:gap-0 sm:items-center hover:bg-secondary/50/50 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="h-8 w-8 border shadow-sm">
                            <AvatarImage src={win.profiles?.avatar_url || ""} />
                           <AvatarFallback className="text-[10px] font-bold bg-secondary">{win.profiles?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                         </Avatar>
                         <span className="text-xs font-bold text-foreground truncate">{win.profiles?.name || "Participante"}</span>
                       </div>
                        <div className="flex items-center justify-between sm:contents">
                          <span className="text-xs font-black text-purple-600 uppercase italic bg-purple-50 px-2 py-0.5 rounded-full w-fit">{win.prize_title}</span>
                          <span className="text-[10px] font-bold text-muted-foreground sm:text-right uppercase tracking-wider">{format(new Date(win.created_at), "HH:mm")}</span>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
             ) : (
               <EmptyHistory icon={Gift} message="Nenhum prêmio de caixa ainda." />
             )}
           </TabsContent>
 
           {/* Roulette Tab */}
           <TabsContent value="roulette" className="space-y-3 outline-none">
             {rouletteSpins && rouletteSpins.length > 0 ? (
               <div className="bg-white rounded-3xl border border-border overflow-hidden">
                  <div className="grid grid-cols-3 bg-secondary/50 p-4 border-b border-border hidden sm:grid">
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Participante</span>
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Prêmio</span>
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Horário</span>
                 </div>
                 <div className="divide-y divide-slate-50">
                    {rouletteSpins.map((spin, idx) => (
                      <div key={idx} className="flex flex-col sm:grid sm:grid-cols-3 p-4 gap-3 sm:gap-0 sm:items-center hover:bg-secondary/50/50 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <Avatar className="h-8 w-8 border shadow-sm">
                            <AvatarImage src={spin.profiles?.avatar_url || ""} />
                           <AvatarFallback className="text-[10px] font-bold bg-secondary">{spin.profiles?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                         </Avatar>
                         <span className="text-xs font-bold text-foreground truncate">{spin.profiles?.name || "Participante"}</span>
                       </div>
                        <div className="flex items-center justify-between sm:contents">
                          <span className="text-xs font-black text-blue-600 uppercase italic bg-blue-50 px-2 py-0.5 rounded-full w-fit">{spin.prize_label}</span>
                          <span className="text-[10px] font-bold text-muted-foreground sm:text-right uppercase tracking-wider">{format(new Date(spin.created_at), "HH:mm")}</span>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
             ) : (
               <EmptyHistory icon={Gamepad2} message="Nenhum giro registrado." />
             )}
           </TabsContent>
 
           {/* Lucky Quotas Tab */}
           <TabsContent value="lucky" className="space-y-3 outline-none">
             {luckyWinners && luckyWinners.length > 0 ? (
               <div className="bg-white rounded-3xl border border-border overflow-hidden">
                  <div className="grid grid-cols-3 bg-secondary/50 p-4 border-b border-border hidden sm:grid">
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ganhador</span>
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Número</span>
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Prêmio</span>
                 </div>
                 <div className="divide-y divide-slate-50">
                   {luckyWinners.map((winner, i) => (
                     <div key={i} className="grid grid-cols-3 p-4 items-center hover:bg-secondary/50/50 transition-colors">
                       <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border shadow-sm">
                           <AvatarImage src={winner.profiles?.avatar_url || ""} />
                           <AvatarFallback className="text-[10px] font-bold bg-secondary">{winner.profiles?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                         </Avatar>
                         <span className="text-xs font-bold text-foreground truncate">{winner.profiles?.name || "Ganhador"}</span>
                       </div>
                       <Badge variant="outline" className="w-fit font-black text-primary border-primary/20">{winner.number}</Badge>
                       <span className="text-xs font-black text-emerald-600 uppercase text-right">{luckyPrizesMap[winner.number] || "Cota Premiada"}</span>
                     </div>
                   ))}
                 </div>
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
     <Icon className="h-10 w-10 mb-4 text-muted-foreground opacity-20" />
     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{message}</p>
   </div>
 );
 
 export default CampaignPublicInfo;