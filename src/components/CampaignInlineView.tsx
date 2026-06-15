import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Users, TrendingUp, Gift, Sparkles, RotateCw, ChevronDown, X, Loader2, Award, Crown, Zap, Ticket, Clock, Calendar, DollarSign, Star, PackageOpen
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CampaignPricing from "./CampaignPricing";
import MysteryBox from "./MysteryBox";
import ScratchCard from "./ScratchCard";
import Roulette from "./Roulette";
import {
  Campaign, useMysteryBoxConfigs, useRoulettePrizes, useWinners, useCampaignRanking,
  useUserCampaignSpins, useUserCampaignScratches, useCampaignTicketStats, useLuckyHours, useMysteryBoxPrizes, useScratchCardPrizes
} from "@/hooks/useData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  campaign: Campaign;
  onBuy: (qtyOrNumbers: number | string[]) => void;
  isPurchasing?: boolean;
  isGameInProgress: boolean;
  setIsGameInProgress: (v: boolean) => void;
  luckyNumbersStatus: Record<string, boolean>;
  userId?: string;
}

const SectionCard: React.FC<{ icon: React.ReactNode; title: string; tag?: string; right?: React.ReactNode; children: React.ReactNode; tone?: string }> = ({ icon, title, tag, right, children, tone = "primary" }) => (
  <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
    <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/60">
      <div className="flex items-center gap-2 min-w-0">
        <span className={cn("flex h-6 w-6 items-center justify-center rounded-md text-[12px]", `text-${tone}`)}>{icon}</span>
        <span className="text-xs font-black uppercase tracking-tight text-foreground truncate">{title}</span>
        {tag && <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-wider">{tag}</span>}
      </div>
      {right}
    </div>
    <div className="p-2 space-y-1.5">{children}</div>
  </div>
);

const SectionCaption: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="px-1 -mt-1 text-[10px] leading-snug text-muted-foreground font-medium">{children}</p>
);

const InlineRow: React.FC<{ left: React.ReactNode; right: React.ReactNode; tone?: "muted" | "won" | "primary"; icon?: React.ReactNode; onClick?: () => void; clickable?: boolean }> = ({ left, right, tone = "muted", icon, onClick, clickable }) => {
  const toneCls =
    tone === "won" ? "bg-primary/15 border-primary/40 text-foreground"
    : tone === "primary" ? "bg-indigo-500/15 border-indigo-500/30 text-foreground"
    : "bg-secondary/40 border-border/60 text-muted-foreground";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-lg border px-3 h-9 text-[11px] font-bold transition-all",
        toneCls,
        clickable && "hover:scale-[1.01] hover:shadow-sm cursor-pointer active:scale-[0.99]",
        !clickable && "cursor-default"
      )}
    >
      <span className="flex items-center gap-2 min-w-0 truncate">{left}</span>
      <span className="flex items-center gap-2 shrink-0">{right}{icon}</span>
    </button>
  );
};

const ComboRow: React.FC<{ minTickets: number; chances: number; icon: React.ReactNode; accent: "orange" | "sky" | "rose" }> = ({ minTickets, chances, icon, accent }) => {
  const grad =
    accent === "orange" ? "from-indigo-900 via-indigo-800 to-blue-700"
    : accent === "sky" ? "from-indigo-900 via-indigo-800 to-blue-700"
    : "from-indigo-900 via-indigo-800 to-blue-700";
  const iconColor =
    accent === "orange" ? "text-orange-400"
    : accent === "sky" ? "text-sky-300"
    : "text-rose-400";
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "flex items-center justify-between gap-2 rounded-lg px-3 h-11 text-white shadow-md bg-gradient-to-r",
        grad
      )}
    >
      <span className="text-[11px] font-black uppercase tracking-tight">A partir de {minTickets} títulos</span>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">{chances} chance(s) de contemplação</span>
        <span className={cn("flex h-6 w-6 items-center justify-center", iconColor)}>{icon}</span>
      </div>
    </motion.div>
  );
};

const CampaignInlineView: React.FC<Props> = ({
  campaign, onBuy, isPurchasing, isGameInProgress, setIsGameInProgress, luckyNumbersStatus, userId
}) => {
  const campaignId = campaign.id;
  const { data: mysteryBoxes } = useMysteryBoxConfigs(campaignId);
  const { data: roulettePrizes } = useRoulettePrizes(campaignId);
  const { data: scratchPrizes } = useScratchCardPrizes(campaignId);
  const { data: luckyHours } = useLuckyHours(campaignId);
  const { data: allWinners } = useWinners();
  const { data: ranking } = useCampaignRanking(campaignId, 10);
  const { data: userSpins } = useUserCampaignSpins(userId || "", campaignId);
  const { data: userScratches } = useUserCampaignScratches(userId || "", campaignId);
  const { data: ticketStats } = useCampaignTicketStats(campaignId);

  const [showBoxes, setShowBoxes] = useState(false);
  const [showRaspas, setShowRaspas] = useState(false);
  const [showRoletas, setShowRoletas] = useState(false);

  const userSpinsAvailable = useMemo(() => (userSpins || []).filter((s: any) => !s.prize_label).length, [userSpins]);
  const userScratchesAvailable = useMemo(() => (userScratches || []).filter((s: any) => !s.prize_label).length, [userScratches]);

  const luckyNumbers: any[] = campaign.lucky_numbers_prizes || [];

  // Win lookups for caixas/raspadinhas/roletas
  const winnersBy = (type: string) => (allWinners || []).filter(w => w.campaign_id === campaignId && w.winner_type === type);
  const boxWinners = winnersBy('lucky_number');
  const scratchWinners = winnersBy('scratchcard');
  const rouletteWinners = winnersBy('roulette');

  const progress = useMemo(() => {
    if (!campaign) return 0;
    if (campaign.fake_progress_enabled && campaign.fake_progress_percentage !== undefined) return campaign.fake_progress_percentage;
    return (campaign.sold_tickets / Math.max(1, campaign.total_tickets)) * 100;
  }, [campaign]);

  return (
    <div className="mx-auto w-full max-w-[480px] space-y-3">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
        {campaign.image_url && (
          <img src={campaign.image_url} alt={campaign.title} className="aspect-[4/5] w-full object-cover" />
        )}
        <div className="absolute top-2 right-2">
          <Badge className="bg-purple-500 text-white border-none text-[9px] font-black uppercase tracking-widest px-2 h-5">
            {Math.round(progress)}%
          </Badge>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 space-y-2">
          {progress > 50 && (
            <Badge className="bg-purple-500 text-white border-none text-[9px] font-black uppercase tracking-widest px-2 h-5">
              Últimos {Math.max(1, 100 - Math.round(progress))}%
            </Badge>
          )}
          <p className="text-base font-black uppercase italic tracking-tight text-white leading-tight">{campaign.title}</p>
          {campaign.subtitle && <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">{campaign.subtitle}</p>}
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="h-3 w-full bg-secondary/50 relative">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-emerald-400 transition-all" style={{ width: `${progress}%` }} />
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-foreground/80">{progress.toFixed(1).replace('.', ',')}%</span>
        </div>
      </div>

      {Number(campaign.ticket_price) === 0 && (
        <div className="flex justify-center">
          <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[9px] font-black uppercase tracking-widest px-3 h-5">GRÁTIS</Badge>
        </div>
      )}

      {/* QUICK ACTION BUTTONS */}
      <div className="space-y-2">
        <QuickActionPrizes
          mainPrizes={(campaign as any).main_prizes || []}
          mysteryBoxes={mysteryBoxes || []}
          scratchPrizes={scratchPrizes || []}
          roulettePrizes={roulettePrizes || []}
        />
        <QuickActionRanking ranking={ranking} />
        <QuickActionExtremes campaignId={campaignId} />
      </div>

      {/* PRICING */}
      <div className="rounded-2xl border border-border bg-card p-3">
        <CampaignPricing campaign={campaign} onBuy={onBuy} isPurchasing={isPurchasing} />
      </div>

      {/* MEU ACESSO - Entitlements do usuário após compra */}
      {userId && (userSpinsAvailable > 0 || userScratchesAvailable > 0) && (
        <SectionCard
          icon={<Ticket className="h-3.5 w-3.5 text-emerald-400" />}
          title="Meu acesso"
          tag="Disponível"
        >
          <SectionCaption>
            Você comprou cotas e ganhou estas chances extras. Toque em cada item abaixo para usar.
          </SectionCaption>
          {userScratchesAvailable > 0 && (
            <InlineRow
              tone="won"
              left={<span className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-sky-300" /><span>Raspadinhas para usar</span></span>}
              right={<span className="text-emerald-400 font-black">{userScratchesAvailable}</span>}
            />
          )}
          {userSpinsAvailable > 0 && (
            <InlineRow
              tone="won"
              left={<span className="flex items-center gap-2"><RotateCw className="h-3.5 w-3.5 text-rose-300" /><span>Giros de roleta</span></span>}
              right={<span className="text-emerald-400 font-black">{userSpinsAvailable}</span>}
            />
          )}
        </SectionCard>
      )}

      {/* TÍTULOS PREMIADOS */}
      {luckyNumbers.length > 0 && (
        <SectionCard
          icon={<Trophy className="h-3.5 w-3.5 text-amber-500" />}
          title="Títulos premiados"
          right={<Badge variant="outline" className="text-[9px] h-5 px-2 font-black bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
            {luckyNumbers.filter(p => luckyNumbersStatus[p.number]).length}/{luckyNumbers.length}
          </Badge>}
        >
          {luckyNumbers.slice(0, 9).map((p: any, i: number) => {
            const won = !!luckyNumbersStatus[p.number];
            const winner = (allWinners || []).find(w => w.campaign_id === campaignId && w.ticket_number === p.number);
            return (
              <InlineRow
                key={i}
                tone={won ? "won" : "muted"}
                left={<span className="font-mono font-black text-foreground">{p.number}</span>}
                right={
                  won && winner ? (
                    <span className="flex items-center gap-1.5 text-emerald-500 font-black">
                      {winner.winner_name?.split(' ')[0]} <Crown className="h-3 w-3" />
                    </span>
                  ) : (
                    <span className="text-[11px]">{p.prize ? `R$${p.prize}` : "Disponível"}</span>
                  )
                }
              />
            );
          })}
          {luckyNumbers.length > 9 && (
            <button className="w-full text-[10px] font-black uppercase text-primary py-1.5">▼ Mostrar Mais</button>
          )}
        </SectionCard>
      )}

      {/* CAIXAS - PRÊMIOS POR CAIXA */}
      {campaign.mystery_box_enabled && (mysteryBoxes?.length || 0) > 0 && (
        <SectionCard icon={<Gift className="h-3.5 w-3.5 text-orange-500" />} title="Caixas Surpresas" tag="Prêmios">
          {mysteryBoxes?.map((box) => (
            <MysteryBoxPrizesList key={box.id} boxId={box.id} boxName={box.name} />
          ))}
        </SectionCard>
      )}

      {/* CAIXAS - COMBOS */}
      {campaign.mystery_box_enabled && Array.isArray(campaign.prize_rules) && (campaign.prize_rules as any[]).filter((r: any) => r.type === 'mystery_box').length > 0 && (
        <SectionCard icon={<Gift className="h-3.5 w-3.5 text-orange-500" />} title="Caixas Surpresas" tag="Combos">
          <SectionCaption>
            Comprando a quantidade mínima de cotas abaixo, você ganha aberturas grátis de Caixa Surpresa para concorrer aos prêmios listados acima.
          </SectionCaption>
          {(campaign.prize_rules as any[]).filter((r: any) => r.type === 'mystery_box').map((rule: any, i: number) => (
            <ComboRow key={i} minTickets={rule.min_tickets} chances={rule.reward_quantity || rule.quantity || 1} icon={<Gift className="h-4 w-4" />} accent="orange" />
          ))}
        </SectionCard>
      )}

      {/* CAIXAS GANHADORES (clicáveis abrem MysteryBox) */}
      {campaign.mystery_box_enabled && (mysteryBoxes?.length || 0) > 0 && (
        <SectionCard
          icon={<Gift className="h-3.5 w-3.5 text-orange-500" />}
          title="Caixas Surpresas"
          tag="Ganhadores"
          right={<Badge variant="outline" className="text-[9px] h-5 px-2 font-black bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
            {boxWinners.length}/{(mysteryBoxes?.length || 0) * 3}
          </Badge>}
        >
          {(showBoxes ? mysteryBoxes : mysteryBoxes?.slice(0, 10))?.map((box, i) => {
            const win = boxWinners.find(w => w.prize_description?.includes(box.name));
            return (
              <Dialog key={box.id} onOpenChange={(o) => { if (!o && isGameInProgress) return; }}>
                <DialogTrigger asChild>
                  <div>
                    <InlineRow
                      clickable
                      tone="muted"
                      left={<span className="text-foreground">{box.name}</span>}
                      right={win ? (
                        <span className="flex items-center gap-1.5 text-emerald-500 font-black">{win.winner_name?.split(' ')[0]} <Crown className="h-3 w-3" /></span>
                      ) : (
                        <span>Disponível</span>
                      )}
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-lg p-0 w-[95vw] md:w-full max-h-[90vh] overflow-y-auto bg-zinc-950 border border-white/10 rounded-2xl"
                  onInteractOutside={(e) => { if (isGameInProgress) e.preventDefault(); }}
                  onEscapeKeyDown={(e) => { if (isGameInProgress) e.preventDefault(); }}>
                  <DialogHeader className="px-4 pt-4 pb-2 border-b border-white/10">
                    <DialogTitle className="text-base font-black uppercase italic tracking-tighter flex items-center gap-2">
                      <Gift className="h-4 w-4 text-orange-500" /> {box.name}
                    </DialogTitle>
                    <DialogDescription className="text-[11px] text-muted-foreground">
                      Abra a caixa e descubra seu prêmio. Custo: R$ {Number(box.cost).toFixed(2)}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="p-3">
                    <MysteryBox boxes={[box]} campaignId={campaignId} />
                  </div>
                </DialogContent>
              </Dialog>
            );
          })}
          {(mysteryBoxes?.length || 0) > 10 && (
            <button onClick={() => setShowBoxes(s => !s)} className="w-full text-[10px] font-black uppercase text-primary py-1.5 flex items-center justify-center gap-1">
              <ChevronDown className={cn("h-3 w-3 transition", showBoxes && "rotate-180")} /> {showBoxes ? "Mostrar Menos" : "Mostrar Mais"}
            </button>
          )}
        </SectionCard>
      )}

      {/* RASPADINHAS - LISTA DE PRÊMIOS */}
      {campaign.scratch_cards_enabled && (scratchPrizes?.length || 0) > 0 && (
        <SectionCard icon={<Sparkles className="h-3.5 w-3.5 text-sky-400" />} title="Raspadinhas" tag="Prêmios">
          {scratchPrizes?.map((prize) => (
            <InlineRow
              key={prize.id}
              tone="primary"
              left={<span className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-sky-300" /><span className="text-foreground">{prize.label}</span></span>}
              right={<span className="text-white/90">{prize.value ? `R$ ${prize.value}` : prize.prize_type}</span>}
              icon={<Star className="h-3 w-3 text-amber-400" />}
            />
          ))}
        </SectionCard>
      )}

      {/* RASPADINHAS - COMBOS */}
      {campaign.scratch_cards_enabled && Array.isArray(campaign.scratch_card_rules) && (campaign.scratch_card_rules as any[]).length > 0 && (
        <SectionCard icon={<Sparkles className="h-3.5 w-3.5 text-sky-400" />} title="Raspadinhas" tag="Combos">
          <SectionCaption>
            A cada faixa de cotas compradas você libera raspadinhas grátis com chance de ganhar saldo, pontos ou cotas extras.
          </SectionCaption>
          {(campaign.scratch_card_rules as any[]).map((rule: any, i: number) => (
            <ComboRow key={i} minTickets={rule.min_tickets} chances={rule.quantity || rule.spins || 1} icon={<Sparkles className="h-4 w-4" />} accent="sky" />
          ))}
        </SectionCard>
      )}

      {/* RASPADINHAS GANHADORES */}
      {campaign.scratch_cards_enabled && (
        <SectionCard
          icon={<Sparkles className="h-3.5 w-3.5 text-sky-400" />}
          title="Raspadinhas"
          tag="Ganhadores"
          right={<Badge variant="outline" className="text-[9px] h-5 px-2 font-black bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
            {scratchWinners.length}/10
          </Badge>}
        >
          {Array.from({ length: showRaspas ? 10 : 10 }).map((_, i) => {
            const win = scratchWinners[i];
            const label = i === 0 || i === 1 ? "R$500 no Pix" : "R$100 no Pix";
            return (
              <Dialog key={i} onOpenChange={(o) => { if (!o && isGameInProgress) return; }}>
                <DialogTrigger asChild>
                  <div>
                    <InlineRow
                      clickable
                      tone="muted"
                      left={<span className="text-foreground">{label}</span>}
                      right={win ? (
                        <span className="flex items-center gap-1.5 text-emerald-500 font-black">{win.winner_name?.split(' ')[0]} <Crown className="h-3 w-3" /></span>
                      ) : (
                        <span>Disponível</span>
                      )}
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-md p-0 bg-transparent border-none w-[95vw] md:w-full max-h-[90vh] overflow-y-auto"
                  onInteractOutside={(e) => { if (isGameInProgress) e.preventDefault(); }}
                  onEscapeKeyDown={(e) => { if (isGameInProgress) e.preventDefault(); }}>
                  <DialogHeader className="sr-only">
                    <DialogTitle>Raspadinha</DialogTitle>
                    <DialogDescription>Raspe e descubra seu prêmio</DialogDescription>
                  </DialogHeader>
                  <ScratchCard
                    potentialPrizes={[...(roulettePrizes?.map(p => p.label) || []), "R$ 100 no PIX", "R$ 50 no PIX"]}
                    isSimulation={false}
                    cost={campaign?.scratch_card_cost || 0}
                    campaignId={campaignId}
                    availableScratches={userScratchesAvailable}
                    onStart={() => setIsGameInProgress(true)}
                    onComplete={() => setIsGameInProgress(false)}
                  />
                </DialogContent>
              </Dialog>
            );
          })}
        </SectionCard>
      )}

      {/* ROLETAS - LISTA DE PRÊMIOS */}
      {campaign.roulette_enabled && (roulettePrizes?.length || 0) > 0 && (
        <SectionCard icon={<RotateCw className="h-3.5 w-3.5 text-rose-500" />} title="Roletas Instantâneas" tag="Prêmios">
          {roulettePrizes?.map((prize) => (
            <InlineRow
              key={prize.id}
              tone="primary"
              left={
                <span className="flex items-center gap-2">
                  <RotateCw className="h-3.5 w-3.5 text-rose-300" />
                  <span className="text-foreground">{prize.label}</span>
                </span>
              }
              right={
                <span className="text-white/90 flex items-center gap-1">
                  {prize.prize_type === 'balance' && <DollarSign className="h-3 w-3 text-emerald-400" />}
                  {prize.prize_type === 'ticket' && <Ticket className="h-3 w-3 text-primary" />}
                  {prize.prize_type === 'points' && <Zap className="h-3 w-3 text-amber-400" />}
                  {prize.prize_type === 'physical' && <Gift className="h-3 w-3 text-orange-400" />}
                  {prize.value ? (prize.prize_type === 'balance' ? `R$ ${prize.value}` : `${prize.value}`) : prize.prize_type}
                </span>
              }
              icon={<Star className="h-3 w-3 text-amber-400" />}
            />
          ))}
        </SectionCard>
      )}

      {/* ROLETAS - COMBOS */}
      {campaign.roulette_enabled && Array.isArray(campaign.roulette_rules) && (campaign.roulette_rules as any[]).length > 0 && (
        <SectionCard icon={<RotateCw className="h-3.5 w-3.5 text-rose-500" />} title="Roletas Instantâneas" tag="Combos">
          <SectionCaption>
            Compre a partir da quantidade indicada e ganhe giros grátis na roleta para concorrer aos prêmios instantâneos.
          </SectionCaption>
          {(campaign.roulette_rules as any[]).map((rule: any, i: number) => (
            <ComboRow key={i} minTickets={rule.min_tickets} chances={rule.spins || 1} icon={<RotateCw className="h-4 w-4" />} accent="rose" />
          ))}
        </SectionCard>
      )}

      {/* EVENTOS E PREMIAÇÕES */}
      {(luckyHours?.length || 0) > 0 && (
        <SectionCard
          icon={<Calendar className="h-3.5 w-3.5 text-amber-500" />}
          title="Eventos e Premiações"
          tag={`${luckyHours?.length || 0}`}
        >
          {luckyHours?.map((draw) => {
            const time = new Date(draw.draw_time).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
            const isDone = draw.status === 'completed';
            return (
              <InlineRow
                key={draw.id}
                tone={isDone ? "won" : "muted"}
                left={
                  <span className="flex items-center gap-2 min-w-0">
                    {draw.draw_type === 'greater_smaller'
                      ? <TrendingUp className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      : <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                    <span className="text-foreground truncate">{draw.title}</span>
                  </span>
                }
                right={
                  isDone && draw.winner_name ? (
                    <span className="flex items-center gap-1.5 text-emerald-500 font-black">
                      {draw.winner_name.split(' ')[0]} <Crown className="h-3 w-3" />
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">{time}</span>
                  )
                }
              />
            );
          })}
        </SectionCard>
      )}

      {/* ROLETAS GANHADORES (clicáveis) */}
      {campaign.roulette_enabled && (roulettePrizes?.length || 0) > 0 && (
        <SectionCard
          icon={<RotateCw className="h-3.5 w-3.5 text-rose-500" />}
          title="Roletas Instantâneas"
          tag="Ganhadores"
          right={<Badge variant="outline" className="text-[9px] h-5 px-2 font-black bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
            {rouletteWinners.length}/{roulettePrizes?.length || 0}
          </Badge>}
        >
          {(showRoletas ? roulettePrizes : roulettePrizes?.slice(0, 10))?.map((prize, i) => {
            const win = rouletteWinners.find(w => w.prize_description === prize.label);
            return (
              <Dialog key={prize.id || i} onOpenChange={(o) => { if (!o && isGameInProgress) return; }}>
                <DialogTrigger asChild>
                  <div>
                    <InlineRow
                      clickable
                      tone="muted"
                      left={<span className="text-foreground">{prize.label}</span>}
                      right={win ? (
                        <span className="flex items-center gap-1.5 text-emerald-500 font-black">{win.winner_name?.split(' ')[0]} <Crown className="h-3 w-3" /></span>
                      ) : (
                        <span>Disponível</span>
                      )}
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-2xl p-0 bg-transparent border-none w-[95vw] md:w-full max-h-[90vh] overflow-y-auto"
                  onInteractOutside={(e) => { if (isGameInProgress) e.preventDefault(); }}
                  onEscapeKeyDown={(e) => { if (isGameInProgress) e.preventDefault(); }}>
                  <DialogHeader className="sr-only">
                    <DialogTitle>Roleta da Sorte</DialogTitle>
                    <DialogDescription>Gire a roleta e ganhe prêmios</DialogDescription>
                  </DialogHeader>
                  <Roulette
                    prizes={roulettePrizes || []}
                    campaign={campaign}
                    availableSpins={userSpinsAvailable}
                    onSpinStart={() => setIsGameInProgress(true)}
                    onSpinComplete={() => setIsGameInProgress(false)}
                  />
                </DialogContent>
              </Dialog>
            );
          })}
          {(roulettePrizes?.length || 0) > 10 && (
            <button onClick={() => setShowRoletas(s => !s)} className="w-full text-[10px] font-black uppercase text-primary py-1.5 flex items-center justify-center gap-1">
              <ChevronDown className={cn("h-3 w-3 transition", showRoletas && "rotate-180")} /> {showRoletas ? "Mostrar Menos" : "Mostrar Mais"}
            </button>
          )}
        </SectionCard>
      )}
    </div>
  );
};

/* ============ Quick action buttons (open modals) ============ */

const QuickActionPrizes: React.FC<{
  mainPrizes: { position: number; prize: string }[];
  mysteryBoxes: any[];
  scratchPrizes: any[];
  roulettePrizes: any[];
}> = ({ mainPrizes, mysteryBoxes, scratchPrizes, roulettePrizes }) => {
  const Section = ({ title, icon, items }: { title: string; icon: React.ReactNode; items: { label: string; value?: string }[] }) =>
    items.length === 0 ? null : (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 px-1">
          {icon}
          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</h4>
        </div>
        <div className="space-y-1">
          {items.map((it, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 h-9 text-[11px]">
              <span className="font-bold text-foreground truncate">{it.label}</span>
              {it.value && <span className="font-black text-emerald-400 shrink-0">{it.value}</span>}
            </div>
          ))}
        </div>
      </div>
    );
  const mainItems = (mainPrizes || []).sort((a, b) => a.position - b.position).map((p) => ({ label: `${p.position}º Lugar`, value: p.prize }));
  const boxItems = (mysteryBoxes || []).map((b: any) => ({ label: b.name, value: `R$ ${Number(b.cost || 0).toFixed(2)}` }));
  const scratchItems = (scratchPrizes || []).map((p: any) => ({ label: p.label, value: p.value ? `R$ ${p.value}` : p.prize_type }));
  const rouletteItems = (roulettePrizes || []).map((p: any) => ({ label: p.label, value: p.value ? (p.prize_type === 'balance' ? `R$ ${p.value}` : `${p.value}`) : p.prize_type }));
  const total = mainItems.length + boxItems.length + scratchItems.length + rouletteItems.length;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-full h-10 rounded-xl border border-border bg-card hover:bg-secondary/50 text-foreground text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all">
          <Trophy className="h-4 w-4 text-amber-500" /> Prêmios
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-500" /> Prêmios desta Rifa</DialogTitle>
          <DialogDescription>Tudo o que você pode ganhar nesta campanha</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {total === 0 && <p className="text-sm text-muted-foreground text-center py-6">Nenhum prêmio cadastrado.</p>}
          <Section title="Premiação Principal" icon={<Crown className="h-3.5 w-3.5 text-amber-500" />} items={mainItems} />
          <Section title="Caixas Surpresas" icon={<Gift className="h-3.5 w-3.5 text-orange-500" />} items={boxItems} />
          <Section title="Raspadinhas" icon={<Sparkles className="h-3.5 w-3.5 text-sky-400" />} items={scratchItems} />
          <Section title="Roleta Instantânea" icon={<RotateCw className="h-3.5 w-3.5 text-rose-500" />} items={rouletteItems} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const QuickActionRanking: React.FC<{ ranking?: any[] }> = ({ ranking }) => (
  <Dialog>
    <DialogTrigger asChild>
      <button className="w-full h-10 rounded-xl border border-border bg-card hover:bg-secondary/50 text-foreground text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all">
        <Users className="h-4 w-4 text-primary" /> Top Compradores
      </button>
    </DialogTrigger>
    <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Top Compradores</DialogTitle>
        <DialogDescription>Maiores compradores da campanha</DialogDescription>
      </DialogHeader>
      <div className="space-y-2">
        {(ranking || []).map((r: any, i: number) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/40 border border-border">
            <span className={cn("h-7 w-7 rounded-full flex items-center justify-center text-xs font-black", i === 0 ? "bg-amber-500/20 text-amber-500" : i === 1 ? "bg-slate-400/20 text-slate-300" : i === 2 ? "bg-orange-700/20 text-orange-400" : "bg-secondary text-muted-foreground")}>
              {i + 1}º
            </span>
            <Avatar className="h-7 w-7"><AvatarImage src={r.avatar_url} /><AvatarFallback>{(r.user_name || "?")[0]}</AvatarFallback></Avatar>
            <span className="flex-1 text-xs font-black truncate">{r.user_name}</span>
            <span className="text-xs font-black text-primary">{r.total_tickets} cotas</span>
          </div>
        ))}
        {(!ranking || ranking.length === 0) && <p className="text-sm text-muted-foreground text-center py-6">Sem compradores ainda.</p>}
      </div>
    </DialogContent>
  </Dialog>
);

const QuickActionExtremes: React.FC<{ campaignId: string }> = ({ campaignId }) => (
const QuickActionExtremes: React.FC<{ campaignId: string }> = ({ campaignId }) => {
  const { data: stats } = useCampaignTicketStats(campaignId);
  const { data: recent } = useQuery({
    queryKey: ["campaign-recent-buyers", campaignId],
    enabled: !!campaignId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("quantity, created_at, profiles!user_id(name, avatar_url)")
        .eq("campaign_id", campaignId)
        .eq("payment_status", "paid")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
  });
  const highest = (stats as any)?.highestTickets?.[0];
  const lowest = (stats as any)?.lowestTickets?.[0];
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-full h-10 rounded-xl border border-border bg-card hover:bg-secondary/50 text-foreground text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all">
          <TrendingUp className="h-4 w-4 text-emerald-500" /> Maior e Menor Cota
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-500" /> Maior e Menor Cota</DialogTitle>
          <DialogDescription>Posições atuais — ainda podem mudar até o sorteio</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center">
            <Crown className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-[10px] font-black uppercase text-muted-foreground">Maior Cota</p>
            <p className="text-lg font-black text-emerald-500">{highest?.number ?? "—"}</p>
            <p className="text-[10px] font-bold text-foreground truncate">{(highest as any)?.profiles?.name || ""}</p>
          </div>
          <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-center">
            <Award className="h-5 w-5 text-sky-500 mx-auto mb-1" />
            <p className="text-[10px] font-black uppercase text-muted-foreground">Menor Cota</p>
            <p className="text-lg font-black text-sky-500">{lowest?.number ?? "—"}</p>
            <p className="text-[10px] font-bold text-foreground truncate">{(lowest as any)?.profiles?.name || ""}</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Users className="h-3.5 w-3.5 text-primary" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Últimos 5 compradores</h4>
          </div>
          {(recent || []).length === 0 && (
            <p className="text-[11px] text-muted-foreground text-center py-3">Sem compradores recentes.</p>
          )}
          {(recent || []).map((r: any, i: number) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 h-9 text-[11px]">
              <Avatar className="h-6 w-6"><AvatarImage src={r.profiles?.avatar_url} /><AvatarFallback>{(r.profiles?.name || "?")[0]}</AvatarFallback></Avatar>
              <span className="flex-1 font-bold text-foreground truncate">{r.profiles?.name || "Anônimo"}</span>
              <span className="font-black text-primary">{r.quantity} cotas</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignInlineView;

const MysteryBoxPrizesList: React.FC<{ boxId: string; boxName: string }> = ({ boxId, boxName }) => {
  const { data: prizes } = useMysteryBoxPrizes(boxId);
  return (
    <>
      <div className="px-2 pt-1 pb-0.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
        <PackageOpen className="h-3 w-3 text-orange-400" /> {boxName}
      </div>
      {(prizes || []).map((p) => (
        <InlineRow
          key={p.id}
          tone="primary"
          left={
            <span className="flex items-center gap-2">
              <Gift className="h-3.5 w-3.5 text-orange-300" />
              <span className="text-foreground">{p.title}</span>
            </span>
          }
          right={
            <span className="text-white/90 flex items-center gap-1">
              {p.prize_value ? `R$ ${p.prize_value}` : p.prize_type}
            </span>
          }
          icon={<Star className="h-3 w-3 text-amber-400" />}
        />
      ))}
      {(!prizes || prizes.length === 0) && (
        <div className="px-3 py-1.5 text-[10px] text-muted-foreground italic">Sem prêmios cadastrados</div>
      )}
    </>
  );
};