import { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, Gift, Gamepad2, Hash, Clock, User
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

  const allWinners = useMemo(() => {
    const combined = [
      ...(mysteryBoxWins?.map(w => ({ ...w, type: 'mystery' })) || []),
      ...(rouletteSpins?.map(s => ({ ...s, type: 'roulette' })) || []),
      ...(luckyWinners?.map(l => ({ ...l, type: 'lucky' })) || [])
    ];
    return combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [mysteryBoxWins, rouletteSpins, luckyWinners]);

  return (
    <div className="flex flex-col gap-8">
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
 
         <div className="space-y-3">
           {allWinners.length > 0 ? (
             <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
                <div className="grid grid-cols-12 bg-secondary/50 p-4 border-b border-border hidden sm:grid">
                 <span className="col-span-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ganhador</span>
                 <span className="col-span-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Prêmio</span>
                 <span className="col-span-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Data/Hora</span>
               </div>
               <div className="divide-y divide-border">
                  {allWinners.map((win, idx) => (
                    <div key={idx} className="flex flex-col sm:grid sm:grid-cols-12 p-4 gap-3 sm:gap-0 sm:items-center hover:bg-secondary/50 transition-colors">
                      <div className="col-span-5 flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                          <AvatarImage src={win.profiles?.avatar_url || ""} />
                          <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                            {win.profiles?.name?.substring(0, 2).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground leading-tight">{win.profiles?.name || "Participante"}</span>
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Vencedor Verificado</span>
                        </div>
                      </div>
                      <div className="col-span-4 flex items-center gap-2">
                        {win.type === 'mystery' && (
                          <div className="flex items-center gap-2 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                            <Gift className="h-3 w-3 text-purple-500" />
                            <span className="text-[10px] font-black text-purple-600 uppercase italic">{win.prize_title}</span>
                          </div>
                        )}
                        {win.type === 'roulette' && (
                          <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                            <Gamepad2 className="h-3 w-3 text-blue-500" />
                            <span className="text-[10px] font-black text-blue-600 uppercase italic">{win.prize_label}</span>
                          </div>
                        )}
                        {win.type === 'lucky' && (
                          <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                            <Hash className="h-3 w-3 text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase italic">
                              Cota #{win.number}: {luckyPrizesMap[win.number] || "Prêmio"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="col-span-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
                            {format(new Date(win.created_at), "dd MMM", { locale: ptBR })}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                            às {format(new Date(win.created_at), "HH:mm")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center py-12 rounded-3xl border border-dashed border-border bg-card/30">
               <Trophy className="h-10 w-10 mb-4 text-muted-foreground opacity-20" />
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nenhum ganhador registrado ainda.</p>
             </div>
           )}
         </div>
       </section>
    </div>
  );
};

export default CampaignPublicInfo;