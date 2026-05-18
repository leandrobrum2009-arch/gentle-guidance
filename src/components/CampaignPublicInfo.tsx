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
              <Gift className="h-4 w-4" /> Caixa Misteriosa
            </TabsTrigger>
            <TabsTrigger value="roulette" className="rounded-xl font-black uppercase italic text-[10px] tracking-widest gap-2">
              <Gamepad2 className="h-4 w-4" /> Roleta
            </TabsTrigger>
            <TabsTrigger value="lucky" className="rounded-xl font-black uppercase italic text-[10px] tracking-widest gap-2">
              <Hash className="h-4 w-4" /> Cotas Premiadas
            </TabsTrigger>
          </TabsList>

          {/* Mystery Box Tab */}
          <TabsContent value="mystery" className="space-y-4 outline-none">
            {mysteryBoxWins && mysteryBoxWins.length > 0 ? (
              <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02]">
                <table className="w-full text-left">
                  <thead className="bg-white/5">
                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                      <th className="px-6 py-4">Usuário</th>
                      <th className="px-6 py-4">Prêmio</th>
                      <th className="px-6 py-4">Horário</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {mysteryBoxWins.map((win, i) => (
                      <tr key={win.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-white/10">
                              <AvatarImage src={win.profiles?.avatar_url || ""} />
                              <AvatarFallback className="text-[10px] font-black">{win.profiles?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-black uppercase tracking-tighter">{win.profiles?.name || "Usuário"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-none font-bold italic">
                            {win.prize_title}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-500">
                          {format(new Date(win.created_at), "HH:mm 'de' dd/MM", { locale: ptBR })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 rounded-3xl border border-dashed border-white/10 opacity-50">
                <Gift className="h-10 w-10 mb-2 text-slate-500" />
                <p className="text-sm font-bold text-slate-500">Nenhum prêmio de caixa ainda.</p>
              </div>
            )}
          </TabsContent>

          {/* Roulette Tab */}
          <TabsContent value="roulette" className="space-y-4 outline-none">
            {rouletteSpins && rouletteSpins.length > 0 ? (
              <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02]">
                <table className="w-full text-left">
                  <thead className="bg-white/5">
                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                      <th className="px-6 py-4">Usuário</th>
                      <th className="px-6 py-4">Prêmio</th>
                      <th className="px-6 py-4">Horário</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rouletteSpins.map((spin, i) => (
                      <tr key={spin.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-white/10">
                              <AvatarImage src={spin.profiles?.avatar_url || ""} />
                              <AvatarFallback className="text-[10px] font-black">{spin.profiles?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-black uppercase tracking-tighter">{spin.profiles?.name || "Usuário"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-none font-bold italic">
                            {spin.prize_label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-500">
                          {format(new Date(spin.created_at), "HH:mm 'de' dd/MM", { locale: ptBR })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 rounded-3xl border border-dashed border-white/10 opacity-50">
                <Gamepad2 className="h-10 w-10 mb-2 text-slate-500" />
                <p className="text-sm font-bold text-slate-500">Nenhum giro registrado.</p>
              </div>
            )}
          </TabsContent>

          {/* Lucky Quotas Tab */}
          <TabsContent value="lucky" className="space-y-4 outline-none">
            {luckyWinners && luckyWinners.length > 0 ? (
              <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02]">
                <table className="w-full text-left">
                  <thead className="bg-white/5">
                    <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                      <th className="px-6 py-4">Número</th>
                      <th className="px-6 py-4">Ganhador</th>
                      <th className="px-6 py-4">Prêmio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {luckyWinners.map((winner, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="h-7 w-7 rounded bg-primary text-primary-foreground flex items-center justify-center font-black italic text-xs shadow-lg shadow-primary/20">
                            {winner.number}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black uppercase tracking-tighter">{winner.profiles?.name || "Usuário"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-none font-bold italic">
                            {luckyPrizesMap[winner.number] || "Prêmio Instantâneo"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 rounded-3xl border border-dashed border-white/10 opacity-50">
                <Hash className="h-10 w-10 mb-2 text-slate-500" />
                <p className="text-sm font-bold text-slate-500">Nenhuma cota premiada encontrada ainda.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default CampaignPublicInfo;