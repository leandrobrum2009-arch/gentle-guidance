import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar, ArrowLeft, Trophy, Share2, Loader2, CheckCircle2,
    Gift, Zap, MousePointer2, Sparkles, BookOpen, Star, Crown, Ticket, RotateCw, Gamepad2, Activity,
    ChevronDown, ChevronUp, Clock, Info, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  useCampaign, useMysteryBoxConfigs, useRoulettePrizes, useWinners, useTickets,
  useCampaignRanking, useCampaignMysteryBoxWins, useCampaignRouletteSpins,
  useUserCampaignSpins, useCampaignLuckyWinners, useCampaignTicketStats
} from "@/hooks/useData";

import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import RaffleGallery from "@/components/RaffleGallery";
import TicketGrid from "@/components/TicketGrid";
import PurchaseAnimation from "@/components/PurchaseAnimation";
import CampaignPricing from "@/components/CampaignPricing";
import Roulette from "@/components/Roulette";
import MysteryBox from "@/components/MysteryBox";
import CampaignPublicInfo from "@/components/CampaignPublicInfo";
import CountdownTimer from "@/components/CountdownTimer";
import LiveNotifications from "@/components/LiveNotifications";
import UserRanking from "@/components/UserRanking";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import ScratchCard from "@/components/ScratchCard";
import { QuickRegisterDialog } from "@/components/QuickRegisterDialog";
import { PaymentModal } from "@/components/PaymentModal";

const CampaignDetail = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: campaign, isLoading } = useCampaign(id || "");
  const { data: mysteryBoxes } = useMysteryBoxConfigs(id || "");
  const { data: roulettePrizes } = useRoulettePrizes(id || "");
  const { data: allWinners } = useWinners();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const allLuckyNumbers = useMemo(() => {
    return campaign?.lucky_numbers_prizes || [];
  }, [campaign]);

  // We show all lucky numbers in the list as requested by the user
  const luckyNumbers = useMemo(() => {
    return allLuckyNumbers;
  }, [allLuckyNumbers]);

  const protectedNumbers = useMemo(() => {
    return allLuckyNumbers.filter((p: any) => p.protected).map((p: any) => p.number);
  }, [allLuckyNumbers]);

  const luckyNumbersList = useMemo(() => {
    return allLuckyNumbers.map((p: any) => p.number) || [];
  }, [allLuckyNumbers]);

  const canManualSelect = useMemo(() => {
    return campaign?.manual_numbers && campaign?.total_tickets <= 5000;
  }, [campaign]);

  const { data: tickets } = useTickets(id || "", canManualSelect);
  const [luckyNumbersStatus, setLuckyNumbersStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id || !luckyNumbersList.length) return;
    
    const fetchLuckyStatus = async () => {
      const { data } = await supabase
        .from('tickets')
        .select('number, status')
        .eq('campaign_id', id)
        .in('number', luckyNumbersList);
        
      if (data) {
        const statusMap: Record<string, boolean> = {};
        data.forEach(t => {
          if (t.status === 'confirmed' || t.status === 'paid' || t.status === 'reserved') {
            statusMap[t.number] = true;
          }
        });
        setLuckyNumbersStatus(statusMap);
      }
    };
    
    fetchLuckyStatus();
    const interval = setInterval(fetchLuckyStatus, 30000);
    return () => clearInterval(interval);
  }, [id, luckyNumbersList]);

  const { data: campaignRanking } = useCampaignRanking(id || "", 10);
  const { data: userSpins } = useUserCampaignSpins(user?.id || "", id || "");
  const { data: luckyWinners } = useCampaignLuckyWinners(id || "");
  const { data: ticketStats } = useCampaignTicketStats(id || "");

  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isQuickRegisterOpen, setIsQuickRegisterOpen] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState<number | string[] | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  const soldTickets = useMemo(() => {
    return tickets?.filter(t => t.status === "confirmed" || t.status === "paid" || t.status === "reserved").map(t => t.number) || [];
  }, [tickets]);

  const availableInstantPrizes = useMemo(() => {
    return luckyNumbers.filter(p => !luckyNumbersStatus[p.number]).length;
  }, [luckyNumbers, luckyNumbersStatus]);

  const userSpinsAvailable = useMemo(() => {
    if (!userSpins) return 0;
    return userSpins.filter((s: any) => !s.prize_label).length;
  }, [userSpins]);

  const progress = useMemo(() => {
    if (!campaign) return 0;
    if (campaign.sales_goal && campaign.sales_goal > 0) {
      const currentSales = campaign.sold_tickets * Number(campaign.ticket_price);
      return Math.min(100, Math.round((currentSales / campaign.sales_goal) * 100));
    }
    return Math.round((campaign.sold_tickets / campaign.total_tickets) * 100);
  }, [campaign]);

  const handleToggleTicket = (number: string) => {
    setSelectedTickets(prev => 
      prev.includes(number) ? prev.filter(n => n !== number) : [...prev, number]
    );
  };

  const handleBuy = async (quantityOrNumbers: number | string[]) => {
    if (!user) {
      setPendingPurchase(quantityOrNumbers);
      setIsQuickRegisterOpen(true);
      return;
    }
    
    setIsPurchasing(true);
    
    // Release any expired tickets before trying to reserve new ones
    await supabase.rpc('release_expired_tickets');
    
    try {
      const quantity = typeof quantityOrNumbers === 'number' ? quantityOrNumbers : quantityOrNumbers.length;
      const numbers = typeof quantityOrNumbers === 'number' ? null : quantityOrNumbers;
      
      const { data: orderId, error } = await supabase.rpc('reserve_tickets', {
        p_campaign_id: id,
        p_user_id: user.id,
        p_quantity: quantity,
        p_numbers: numbers
      });

      if (error) throw error;

      setIsPurchasing(false);
      setShowSuccess(true);
      setCurrentOrderId(orderId);
      setIsPaymentModalOpen(true);
      setShowSuccess(true);

    } catch (error: any) {
      setIsPurchasing(false);
      toast.error(error.message || "Erro ao reservar números. Tente novamente.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container flex flex-col items-center justify-center py-20">
          <h1 className="font-display text-2xl font-bold">Campanha não encontrada</h1>
          <Link to="/"><Button variant="outline" className="mt-4 gap-2"><ArrowLeft className="h-4 w-4" /> Voltar</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isActive = campaign.status === "active";
  const drawDate = campaign.draw_date ? new Date(campaign.draw_date).toLocaleDateString("pt-BR") : "";

  const renderSection = (section: string) => {
    switch (section) {
      case 'gallery':
        return (
          <div key={section} className="w-full bg-black relative min-h-[300px] md:min-h-[450px] overflow-hidden mt-20 md:mt-24 rounded-b-3xl shadow-xl flex items-center justify-center">
            <RaffleGallery 
              images={campaign.gallery_urls && campaign.gallery_urls.length > 0 ? campaign.gallery_urls : [campaign.image_url || ""]} 
              videoUrl={campaign.video_url} 
            />
            
            {campaign.featured && (
              <div className="absolute top-4 right-4 z-10 animate-blink">
                <Badge className="bg-primary text-white font-black italic uppercase tracking-wider px-4 py-1.5 shadow-lg shadow-primary/40 border-none rounded-full flex items-center gap-2">
                  <Star className="h-4 w-4 fill-white" /> Destaque
                </Badge>
              </div>
            )}

            <Link to="/conta#tickets" className="absolute bottom-4 right-4 z-10">
              <Button size="sm" variant="secondary" className="bg-black/60 text-white backdrop-blur-md border-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider px-4 hover:bg-black/80 shadow-lg">
                <Ticket className="mr-2 h-3 w-3" /> Ver meus títulos
              </Button>
            </Link>
          </div>
        );
      
      case 'header':
        return (
          <div key={section} className="flex flex-col gap-6 mt-6">
            {campaign.show_timer && (campaign.timer_end_date || campaign.draw_date) && (
              <div className="flex flex-col items-center justify-center p-6 bg-primary/5 border border-primary/20 rounded-3xl animate-pulse shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">Tempo restante para o sorteio</p>
                <CountdownTimer targetDate={campaign.timer_end_date || campaign.draw_date!} className="scale-125" />
              </div>
            )}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-xl md:text-2xl font-black text-foreground leading-tight text-animate-gradient">{campaign.title}</h1>
                <p className="text-sm text-muted-foreground font-medium">{campaign.subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                {campaign.status === "active" && (
                  <Badge className="rounded-full px-4 h-6 text-[10px] font-black uppercase tracking-wider bg-green-500 text-white">
                    Sorteio Ativo
                  </Badge>
                )}
                {campaign.status === "paused" && (
                  <Badge className="rounded-full px-4 h-6 text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white">
                    Vendas Pausadas
                  </Badge>
                )}
                {campaign.status === "audit" && (
                  <Badge className="rounded-full px-4 h-6 text-[10px] font-black uppercase tracking-wider bg-purple-500 text-white animate-pulse">
                    Em Auditoria
                  </Badge>
                )}
                {campaign.status === "completed" && (
                  <Badge className="rounded-full px-4 h-6 text-[10px] font-black uppercase tracking-wider bg-blue-500 text-white">
                    Concluído
                  </Badge>
                )}
                {drawDate && (
                  <Badge variant="outline" className="rounded-full px-4 h-6 text-[10px] font-bold uppercase tracking-wider bg-card">
                    <Calendar className="mr-1.5 h-3 w-3" /> {drawDate}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );

      case 'progress':
        return (
          <div key={section} className="bg-card rounded-3xl p-6 shadow-sm border border-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-foreground italic">{progress}% <span className="text-muted-foreground not-italic font-bold">concluído</span></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{campaign.sold_tickets.toLocaleString("pt-BR")} vendidos</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${progress}%` }} 
                transition={{ duration: 1.5 }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>
        );

      case 'purchase':
        return (
          <div key={section} className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {luckyNumbers.length > 0 && (
                <div className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase italic tracking-tighter text-foreground flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-amber-500" /> Cotas Premiadas
                    </h3>
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-primary/20 bg-primary/5 text-primary">
                      PRÊMIOS INSTANTÂNEOS
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {luckyNumbers.map((p: any, i: number) => {
                      const isWon = luckyNumbersStatus[p.number];
                      const winner = luckyWinners?.find(w => w.number === p.number);
                      return (
                        <div 
                          key={i} 
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl border transition-all duration-300",
                            isWon 
                              ? "bg-amber-400/10 border-amber-400/20" 
                              : "bg-green-500/5 border-green-500/10"
                          )}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className={cn(
                              "h-7 w-7 shrink-0 rounded-lg flex items-center justify-center font-black italic text-[10px]",
                              isWon ? "bg-amber-400 text-white" : "bg-green-500 text-white shadow-sm"
                            )}>
                              #{p.number}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-[10px] font-black uppercase tracking-tight truncate">
                                {p.prize}
                              </span>
                              {isWon && (
                                <span className="text-[8px] font-bold text-amber-600 uppercase tracking-tighter truncate">
                                   {(Array.isArray(winner?.profiles) ? winner?.profiles[0]?.name : winner?.profiles?.name) || "Ganhador"}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge className={cn(
                            "text-[7px] font-black uppercase tracking-widest px-1.5 h-4",
                            isWon ? "bg-amber-400 text-white" : "bg-green-500 text-white"
                          )}>
                            {isWon ? "SORTEADA" : "ATIVA"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden" id="purchase-tabs">
                <Tabs defaultValue="auto" className="w-full">
                  {canManualSelect && (
                    <div className="px-6 pt-6">
                      <TabsList className="grid w-full grid-cols-2 h-12 bg-secondary rounded-2xl p-1">
                        <TabsTrigger value="auto" className="rounded-xl gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                          <Zap className="h-4 w-4" /> Automático
                        </TabsTrigger>
                        <TabsTrigger value="manual" className="rounded-xl gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                          <MousePointer2 className="h-4 w-4" /> Manual
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  )}

                  <TabsContent value="auto" className="p-6">
                    <CampaignPricing campaign={campaign} onBuy={handleBuy} isPurchasing={isPurchasing} />
                  </TabsContent>

                  <TabsContent value="manual" className="p-6">
                    <div className="space-y-6">
                      <p className="text-xs text-muted-foreground text-center font-bold uppercase tracking-widest">Escolha seus números da sorte abaixo</p>
                      <TicketGrid 
                        totalTickets={campaign.total_tickets}
                        soldTickets={[...soldTickets, ...protectedNumbers]}
                        selectedTickets={selectedTickets}
                        onSelect={handleToggleTicket}
                        luckyNumbers={luckyNumbersList}
                      />
                      <Button 
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-wide border-light-path border-[#22c55e]/30"
                        disabled={selectedTickets.length === 0 || isPurchasing || campaign.status !== "active"}
                        onClick={() => handleBuy(selectedTickets)}
                      >
                        {isPurchasing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Reservar Números
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>


              {campaign.roulette_enabled && campaign.roulette_rules && (campaign.roulette_rules as any[]).length > 0 && (
                <div className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-4">
                  <h3 className="text-sm font-black uppercase italic tracking-tighter text-foreground flex items-center gap-2">
                    <RotateCw className="h-4 w-4 text-primary" /> Compre cotas e ganhe giros na roleta
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(campaign.roulette_rules as any[]).map((rule, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Compre +{rule.min_tickets}</span>
                        <Badge className="bg-primary text-white border-none text-[9px] font-black uppercase tracking-wider">
                          +{rule.spins} {rule.spins > 1 ? 'Giros' : 'Giro'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {(campaign.roulette_enabled || campaign.mystery_box_enabled || campaign.scratch_cards_enabled || (campaign.main_prizes && campaign.main_prizes.length > 0)) && (
                <div className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-4">
                  <h3 className="text-sm font-black uppercase italic tracking-tighter text-foreground flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4 text-primary" /> Premiações dessa rifa
                  </h3>
                  <div className="flex flex-col gap-4">
                    {campaign.main_prizes && campaign.main_prizes.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Prêmios Principais</p>
                        <div className="grid grid-cols-1 gap-2">
                          {campaign.main_prizes.sort((a, b) => a.position - b.position).map((p, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                  {idx === 0 ? <Crown className="h-4 w-4 text-primary" /> : <Trophy className="h-4 w-4 text-primary" />}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black uppercase text-foreground">{p.position}º Prêmio</span>
                                  <span className="text-xs font-bold text-primary italic">{p.prize}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {campaign.roulette_enabled && roulettePrizes && roulettePrizes.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Roletas disponíveis</p>
                        <div className="grid grid-cols-2 gap-2">
                          {roulettePrizes.map((p, idx) => (
                            <div key={idx} className="flex items-center justify-center p-2 rounded-xl bg-secondary/50 border border-border/50">
                              <span className="text-[9px] font-bold text-foreground text-center truncate">{p.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-2">
                      {campaign.scratch_cards_enabled && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Raspadinhas</span>
                          <Badge className="bg-amber-500 text-white border-none text-[9px] font-black uppercase tracking-wider">
                            Ativada
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cotas Premiadas</span>
                        <Badge className="bg-amber-500/10 text-amber-500 border-none text-[9px] font-black uppercase tracking-wider">
                          {availableInstantPrizes} / {luckyNumbers.length}
                        </Badge>
                      </div>

                      {luckyWinners && luckyWinners.length > 0 && (
                        <div className="space-y-2 mt-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ganhadores Instantâneos</p>
                          <div className="grid grid-cols-1 gap-2">
                            {luckyWinners.slice(0, 3).map((w, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-primary/5 border border-primary/10">
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <Trophy className="h-3 w-3 text-primary shrink-0" />
                                  <span className="text-[10px] font-black uppercase tracking-tighter truncate">#{w.number}</span>
                                </div>
                                <span className="text-[10px] font-medium text-muted-foreground truncate">{w.profiles?.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {campaign.roulette_enabled && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="w-full mt-2 flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/20 hover:border-primary/50 hover:bg-primary/10 transition-all group">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:rotate-180 transition-transform duration-500">
                                <RotateCw className="h-5 w-5" />
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-black uppercase tracking-tight text-foreground">Girar Roleta</p>
                                <p className="text-[10px] font-medium text-muted-foreground">Tente sua sorte</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-primary text-white border-none text-[9px] font-black">{userSpinsAvailable}</Badge>
                              <ArrowLeft className="h-4 w-4 text-primary rotate-180" />
                            </div>
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl p-0 bg-transparent border-none w-[95vw] md:w-full max-h-[90vh] overflow-y-auto no-scrollbar">
                          <Roulette prizes={roulettePrizes} campaign={campaign} availableSpins={userSpinsAvailable} />
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'description':
        return (
          <div key={section} className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase italic tracking-tighter flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" /> Descrição e Regras
              </h3>
            </div>
            
            <div className={cn(
              "text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap transition-all duration-500",
              !isDescriptionExpanded && "line-clamp-2 overflow-hidden"
            )}>
              {campaign.description}
              
              {isDescriptionExpanded && campaign.regulations && (
                <div className="mt-6 pt-6 border-t border-dashed border-border">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground mb-3 flex items-center gap-2">
                    <BookOpen className="h-3 w-3 text-primary" /> Regulamento e Regras
                  </h4>
                  <div className="text-xs whitespace-pre-wrap bg-secondary/30 p-4 rounded-xl border border-border">
                    {campaign.regulations}
                  </div>
                </div>
              )}
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full font-black uppercase tracking-widest text-[9px] gap-2 h-10 rounded-xl bg-secondary/50 hover:bg-secondary border-border transition-all"
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
              {isDescriptionExpanded ? (
                <>RECOLHER DESCRIÇÃO <ChevronUp className="h-3 w-3" /></>
              ) : (
                <>LER DESCRIÇÃO COMPLETA E REGRAS <ChevronDown className="h-3 w-3" /></>
              )}
            </Button>
          </div>
        );

      case 'prizes':
        return luckyNumbers.length > 0 && (
          <div key={section} className="bg-card rounded-3xl p-8 border border-border shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" /> Cotas Premiadas
                </h3>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Números da sorte que valem prêmios instantâneos</p>
              </div>
              <Badge variant="outline" className="rounded-full bg-secondary text-[10px] font-black h-8 px-4 border-primary/20">
                {availableInstantPrizes} DISPONÍVEIS
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {luckyNumbers.map((p: any, i: number) => {
                const isWon = luckyNumbersStatus[p.number];
                const winner = luckyWinners?.find(w => w.number === p.number);
                
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all duration-300",
                      isWon 
                        ? "bg-amber-400/10 border-amber-400/20 opacity-75" 
                        : "bg-green-500/5 border-green-500/10 hover:border-green-500/30"
                    )}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={cn(
                        "h-10 w-10 shrink-0 rounded-lg flex items-center justify-center font-black italic text-xs",
                        isWon ? "bg-amber-400 text-white" : "bg-green-500 text-white shadow-sm"
                      )}>
                        #{p.number}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className={cn(
                          "text-[11px] font-black uppercase tracking-tight truncate",
                          isWon ? "text-muted-foreground" : "text-foreground"
                        )}>
                          {p.prize}
                        </span>
                        {isWon && (
                          <span className="text-[9px] font-bold text-primary uppercase tracking-tighter truncate">
                             {(Array.isArray(winner?.profiles) ? winner?.profiles[0]?.name : winner?.profiles?.name) || "Ganhador"}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge className={cn(
                      "text-[8px] font-black uppercase tracking-widest px-2",
                      isWon ? "bg-amber-400 text-white" : "bg-green-500 text-white"
                    )}>
                      {isWon ? "SORTEADA" : "ATIVA"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'ranking':
        return campaign.ranking_enabled && (
          <div key={section} className="bg-card rounded-3xl p-8 border border-border shadow-sm">
            <UserRanking title="Maiores e menores cotas" stats={ticketStats} />
          </div>
        );

      case 'roulette_footer':
        return campaign.roulette_enabled && roulettePrizes && roulettePrizes.length > 0 && (
          <div key={section} className="mt-12 mb-12 bg-card rounded-3xl p-8 border border-border shadow-sm space-y-8">
            <div className="flex flex-col items-center text-center">
              <Badge className="bg-primary/20 text-primary border-none text-[10px] font-black uppercase tracking-widest mb-2">Simulador de Sorte</Badge>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Prêmios da <span className="text-animate-gradient">Roleta</span></h2>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-2 max-w-xs">Veja os prêmios que você pode ganhar girando a roleta!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roulettePrizes.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <RotateCw className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tight text-foreground">{p.label}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Disponível na Roleta</p>
                    </div>
                  </div>
                  <Badge className="bg-primary text-white border-none text-[8px] font-black uppercase">SORTEÁVEL</Badge>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-border pt-8">
              <Roulette prizes={roulettePrizes} campaign={campaign} availableSpins={0} isSimulation={true} />
            </div>
          </div>
        );

      case 'scratch_footer':
        return (campaign.scratch_cards_enabled || sectionsOrder.includes('scratch_footer')) && (
          <div key={section} className="mt-12 mb-20">
             <div className="flex flex-col items-center text-center mb-8">
              <Badge className="bg-amber-500/20 text-amber-500 border-none text-[10px] font-black uppercase tracking-widest mb-2">Diversão Instantânea</Badge>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Raspadinha <span className="text-animate-gradient">Premiada</span></h2>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-2 max-w-xs">
                {campaign.scratch_cards_enabled ? "Tente ganhar prêmios reais raspando agora!" : "Experimente nossa nova raspadinha digital e sinta a emoção!"}
              </p>
            </div>
            <ScratchCard 
              potentialPrizes={[
                ...(roulettePrizes?.map(p => p.label) || []),
                ...(luckyNumbers?.map((p: any) => p.prize) || []),
                "R$ 50,00 no PIX",
                "Giro Grátis na Roleta"
              ]}
              isSimulation={!campaign.scratch_cards_enabled}
              cost={campaign.scratch_card_cost || 0}
              campaignId={campaign.id}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const sectionsOrder = campaign.sections_order || ["gallery", "header", "progress", "description", "purchase", "roulette_footer", "scratch_footer", "ranking"];

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <Header />
      <LiveNotifications />
      
      <div className="container px-4 md:px-6">
        <div className="flex flex-col gap-6">
          {sectionsOrder.map((section) => renderSection(section))}
        </div>
      </div>

      <PurchaseAnimation 
        isVisible={showSuccess} 
        onComplete={() => {
          setShowSuccess(false);
          toast.success("Redirecionando para o pagamento...");
        }} 
      />

      <QuickRegisterDialog 
        isOpen={isQuickRegisterOpen} 
        onOpenChange={setIsQuickRegisterOpen} 
        onSuccess={() => {
          if (pendingPurchase !== null) {
            // Give a bit of time for auth state to propagate
            setTimeout(() => {
              handleBuy(pendingPurchase);
              setPendingPurchase(null);
            }, 500);
          }
        }} 
      />
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onOpenChange={setIsPaymentModalOpen} 
        orderId={currentOrderId} 
        onPaymentSuccess={() => {
          navigate("/conta#tickets");
        }} 
      />
      <Footer />
      
      {/* Sticky Mobile Purchase Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-lg border-t lg:hidden">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Valor cota</p>
            <p className="text-lg font-black text-primary">R$ {Number(campaign.ticket_price).toFixed(2).replace(".", ",")}</p>
          </div>
          <Button 
            className="flex-[2] h-12 rounded-2xl font-black uppercase shadow-lg shadow-primary/20 border-light-path border-[#22c55e]/30"
            disabled={campaign.status !== "active"}
            onClick={() => {
              const element = document.getElementById('purchase-tabs');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {campaign.status === "active" ? "QUERO MEUS BILHETES" : "VENDAS SUSPENSAS"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
