import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
    Calendar, ArrowLeft, Trophy, Share2, Loader2, CheckCircle2,
    Gift, Zap, MousePointer2, Sparkles, BookOpen, Star, Crown, Ticket, RotateCw, Gamepad2, Activity,
    ChevronDown, ChevronUp, Clock, Info, RefreshCw, Medal, TrendingUp
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
  useUserCampaignSpins, useCampaignLuckyWinners, useCampaignTicketStats,
  useUserTickets, useUserCampaignScratches, useLuckyHours
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
import { SEO } from "@/components/SEO";
import CampaignLiveDraw from "@/components/CampaignLiveDraw";



const CampaignDetail = () => {
  const queryClient = useQueryClient();
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isPurchaseVisible, setIsPurchaseVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPurchaseVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const purchaseSection = document.getElementById('purchase-tabs');
    if (purchaseSection) observer.observe(purchaseSection);

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (purchaseSection) observer.unobserve(purchaseSection);
    };
  }, []);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { data: campaign, isLoading } = useCampaign(id || "");
  const campaignId = campaign?.id || "";
  const { data: userSpins } = useUserCampaignSpins(user?.id || "", campaignId);
  const { data: userScratches } = useUserCampaignScratches(user?.id || "", campaignId);
  
  const { data: mysteryBoxes } = useMysteryBoxConfigs(campaignId);
  const { data: roulettePrizes } = useRoulettePrizes(campaignId);
  const { data: allWinners } = useWinners();
  const raffleWinners = allWinners?.filter(w => w.campaign_id === campaignId && w.winner_type === 'raffle') || [];
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
    return campaign?.manual_numbers === true || campaign?.ticket_generation_type === 'manual';
  }, [campaign]);

  const { data: tickets } = useTickets(campaignId, canManualSelect && !!campaignId);
  const [luckyNumbersStatus, setLuckyNumbersStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!campaignId || !luckyNumbersList.length) return;
    
    const fetchLuckyStatus = async () => {
      const { data } = await supabase
        .from('tickets')
        .select('number, status')
        .eq('campaign_id', campaignId)
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
  }, [campaignId, luckyNumbersList]);

  const { data: campaignRanking } = useCampaignRanking(campaignId, 10);
  const { data: luckyWinners } = useCampaignLuckyWinners(campaignId);
  const { data: ticketStats } = useCampaignTicketStats(campaignId);
  const { data: userTickets } = useUserTickets(user?.id || "", campaignId);
  const { data: luckyHours } = useLuckyHours(campaignId);

  const nextLuckyHour = useMemo(() => {
    if (!luckyHours) return null;
    const now = new Date();
    return luckyHours.find(h => {
      const drawDate = new Date(h.draw_time);
      return h.status === 'scheduled' && h.draw_type === 'hourly' && drawDate > now;
    });
  }, [luckyHours]);

  const hourlyDraws = useMemo(() => {
    if (!luckyHours) return [];
    return luckyHours.filter(h => h.draw_type === 'hourly')
      .sort((a, b) => new Date(b.draw_time).getTime() - new Date(a.draw_time).getTime());
  }, [luckyHours]);

  const greaterSmallerDraws = useMemo(() => {
    if (!luckyHours) return [];
    return luckyHours.filter(h => h.draw_type === 'greater_smaller')
      .sort((a, b) => new Date(b.draw_time).getTime() - new Date(a.draw_time).getTime());
  }, [luckyHours]);

  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isQuickRegisterOpen, setIsQuickRegisterOpen] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState<number | string[] | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isGameInProgress, setIsGameInProgress] = useState(false);

  // Sync modal state with URL parameter for "Manter modal ao voltar"
  useEffect(() => {
    const orderId = searchParams.get('order');
    const upsell = searchParams.get('upsell');
    
    if (orderId && orderId !== currentOrderId) {
      setCurrentOrderId(orderId);
      setIsPaymentModalOpen(true);
    } else if (!orderId && isPaymentModalOpen) {
      setIsPaymentModalOpen(false);
    }

    if (upsell === 'true') {
      const element = document.getElementById('purchase-tabs');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [searchParams, isPaymentModalOpen, currentOrderId]);

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

  const userScratchesAvailable = useMemo(() => {
    if (!userScratches) return 0;
    return userScratches.filter((s: any) => !s.prize_label).length;
  }, [userScratches]);

  const progressData = useMemo(() => {
    if (!campaign) return { bar: 0, text: "0" };
    
    let val = 0;
    
    // If fake progress is enabled, use the fake percentage
    if (campaign.fake_progress_enabled && campaign.fake_progress_percentage !== undefined) {
      val = campaign.fake_progress_percentage;
    } else {
      if (campaign.sales_goal && campaign.sales_goal > 0) {
        const currentSales = campaign.sold_tickets * Number(campaign.ticket_price);
        val = (currentSales / campaign.sales_goal) * 100;
      } else {
        val = (campaign.sold_tickets / campaign.total_tickets) * 100;
      }
    }

    const rounded = Math.round(val);
    const defaultText = val > 0 && val < 1 ? val.toFixed(2) : String(rounded);
    const text = campaign.progress_text || defaultText;
    const bar = Math.min(100, Math.max(val, val > 0 ? 0.5 : 0));
    
    return { bar, text };
  }, [campaign]);

  const progress = progressData.text;

  const handleToggleTicket = (number: string) => {
    setSelectedTickets(prev => 
      prev.includes(number) ? prev.filter(n => n !== number) : [...prev, number]
    );
  };

  const handlePaymentSuccess = useCallback(() => {
    // Just invalidate queries, don't navigate yet so user can see SuccessFlow
    queryClient.invalidateQueries({ queryKey: ["user-tickets"] });
    queryClient.invalidateQueries({ queryKey: ["campaign"] });
  }, [queryClient]);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsPaymentModalOpen(open);
    if (!open) {
      setSearchParams({}, { replace: true });
      setCurrentOrderId(null);
    }
  }, [setSearchParams]);

  const handleBuy = async (quantityOrNumbers: number | string[], isUpsell = false) => {
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
      
      // Get affiliate ID if present
      const refCode = localStorage.getItem("referred_by");
      let affiliateId = null;
      if (refCode) {
        const { data: affData } = await supabase
          .from("affiliates")
          .select("id")
          .eq("referral_code", refCode)
          .eq("is_active", true)
          .maybeSingle();
        if (affData) affiliateId = affData.id;
      }

      const { data: orderId, error } = await supabase.rpc('reserve_tickets', {
        p_campaign_id: campaignId,
        p_user_id: user.id,
        p_quantity: quantity,
        p_numbers: numbers,
        p_affiliate_id: affiliateId
      });

      if (error) throw error;

      setIsPurchasing(false);
      setCurrentOrderId(orderId);
      
      // Update URL to maintain modal state on navigation
      setSearchParams({ order: orderId }, { replace: true });
      
      // Open payment modal immediately as requested
      setIsPaymentModalOpen(true);
      // We only show the success animation for new purchases, not for upsells within the modal
      if (!isUpsell) {
        setShowSuccess(true);
      }

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
  const drawDate = campaign.draw_date ? new Date(campaign.draw_date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) : "";

  const renderSection = (section: string) => {
    switch (section) {
      case 'gallery':
        return (
          <div key={section} className="w-full bg-black relative overflow-hidden mt-20 md:mt-24 rounded-3xl shadow-xl">
            <RaffleGallery 
              images={Array.from(new Set([
                campaign.image_url || "",
                ...(campaign.gallery_urls && Array.isArray(campaign.gallery_urls) ? campaign.gallery_urls : [])
              ])).filter(url => url !== "")} 
              videoUrl={campaign.video_url} 
            />
            
            {campaign.featured && (
              <div className="absolute top-4 right-4 z-10 animate-blink">
                <Badge className="bg-primary text-white font-black italic uppercase tracking-wider px-4 py-1.5 shadow-lg shadow-primary/40 border-none rounded-full flex items-center gap-2">
                  <Star className="h-4 w-4 fill-white" /> Destaque
                </Badge>
              </div>
            )}

            <Link to="/conta#tickets" className="absolute bottom-20 right-4 z-10">
              <Button size="sm" variant="secondary" className="bg-black/60 text-white backdrop-blur-md border-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider px-4 hover:bg-black/80 shadow-lg">
                <Ticket className="mr-2 h-3 w-3" /> Ver meus títulos
              </Button>
            </Link>
            
            <CampaignLiveDraw campaign={campaign} />
          </div>

        );
      
      case 'header':
        const drawDateFull = campaign.draw_date ? new Date(campaign.draw_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : null;
        return (
          <div key={section} className="flex flex-col gap-6 -mt-4">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {campaign.status === "active" && (campaign.draw_date && new Date(campaign.draw_date) < new Date() ? (
                    <div className="flex flex-col gap-1">
                      <Badge className="rounded-full px-4 h-6 text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white w-fit shadow-sm">
                        Aguardando Sorteio
                      </Badge>
                    </div>
                  ) : (
                    <Badge className="bg-primary text-black border-none text-[10px] font-black uppercase px-3 h-6 rounded-full shadow-sm">Sorteio Ativo</Badge>
                  ))}
                  {campaign.status === "paused" && (
                    <Badge className="rounded-full px-4 h-6 text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white w-fit shadow-sm">Vendas Pausadas</Badge>
                  )}
                  {campaign.status === "audit" && (
                    <Badge className="rounded-full px-4 h-6 text-[10px] font-black uppercase tracking-wider bg-purple-500 text-white animate-pulse shadow-sm">Em Auditoria</Badge>
                  )}
                  {campaign.status === "completed" && (
                    <Badge className="rounded-full px-4 h-6 text-[10px] font-black uppercase tracking-wider bg-blue-500 text-white shadow-sm">Concluído</Badge>
                  )}
                  {drawDateFull && (
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-primary/20 bg-primary/5 text-primary rounded-full px-3 h-6">
                      Sorteio: {drawDateFull}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter text-animate-gradient leading-[0.9]">
                  {campaign.title}
                </h1>
                {campaign.subtitle && (
                  <p className="text-sm md:text-lg text-muted-foreground font-medium max-w-3xl leading-relaxed">
                    {campaign.subtitle}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button 
                  className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary text-black hover:scale-105 transition-all shadow-xl shadow-primary/20 animate-button-flash"
                  onClick={() => document.getElementById('purchase-tabs')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  PARTICIPE AGORA <Zap className="ml-2 h-4 w-4 fill-current" />
                </Button>
                <Button 
                  variant="outline"
                  className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-xs border-primary/20 text-primary hover:bg-primary/5"
                  onClick={() => {
                    const element = document.getElementById('prizes');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  VER COTAS PREMIADAS <Trophy className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {campaign.show_timer && (campaign.timer_end_date || campaign.draw_date) && (
              <div className="flex flex-col items-center justify-center p-8 bg-card border-2 border-primary/20 rounded-[2.5rem] shadow-xl shadow-primary/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 relative z-10">Tempo restante para o sorteio</p>
                <CountdownTimer targetDate={campaign.timer_end_date || campaign.draw_date!} className="scale-125 md:scale-150 relative z-10" />
              </div>
            )}
          </div>
        );

      case 'progress':
        return (
          <div key={section} className="bg-card rounded-3xl p-6 md:p-8 shadow-sm border border-border space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-foreground italic">{progress}% <span className="text-muted-foreground not-italic font-bold">concluído</span></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{campaign.sold_tickets.toLocaleString("pt-BR")} vendidos</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${progressData.bar}%` }} 
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

              <div className="bg-card rounded-[2rem] shadow-sm border border-border overflow-hidden" id="purchase-tabs">
                <Tabs defaultValue={campaign?.ticket_generation_type === 'manual' ? "manual" : "auto"} className="w-full">
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
                          {campaign.main_prizes.sort((a, b) => a.position - b.position).map((p, idx) => {
                            const prizeWinner = raffleWinners.find(w => w.prize_index === p.position);
                            return (
                              <div key={idx} className="flex flex-col gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                      {idx === 0 ? <Crown className="h-4 w-4 text-primary" /> : <Trophy className="h-4 w-4 text-primary" />}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-black uppercase text-foreground">{p.position}º Prêmio</span>
                                      <span className="text-xs font-bold text-primary italic">{p.prize}</span>
                                    </div>
                                  </div>
                                  <Badge className={cn("border-none text-[8px] font-black uppercase", prizeWinner ? "bg-emerald-500 text-white" : "bg-primary text-white")}>
                                    {prizeWinner ? "SORTEADO" : "SORTEIO"}
                                  </Badge>
                                </div>
                                
                                {prizeWinner && (
                                  <div className="flex items-center justify-between mt-1 pt-2 border-t border-primary/10">
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6 border border-primary/20">
                                        <AvatarImage src={prizeWinner.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${prizeWinner.winner_name}`} />
                                        <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-black">{prizeWinner.winner_name.substring(0, 1)}</AvatarFallback>
                                      </Avatar>
                                      <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-foreground uppercase truncate max-w-[120px]">{prizeWinner.winner_name}</span>
                                        <span className="text-[7px] font-bold text-muted-foreground uppercase leading-none">Vencedor do prêmio</span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[10px] font-black text-primary font-mono tracking-tighter">#{prizeWinner.ticket_number}</p>
                                      <p className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest">Bilhete</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

 
                     {campaign.roulette_enabled && roulettePrizes && roulettePrizes.length > 0 && (
                       <div className="space-y-2">
                         <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Vantagens da Roleta</p>
                         <div className="grid grid-cols-2 gap-2">
                           {roulettePrizes.map((p, idx) => (
                             <div key={idx} className="flex flex-col items-center justify-center p-2 rounded-xl bg-primary/5 border border-primary/10 text-center gap-1">
                               <span className="text-[9px] font-black text-foreground uppercase tracking-tighter leading-tight">{p.label}</span>
                               <span className="text-[7px] font-bold text-primary uppercase opacity-70">No Giro</span>
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
                      <Dialog onOpenChange={(open) => {
                        if (!open && isGameInProgress) return;
                      }}>
                        <DialogTrigger asChild>
                          <button className="w-full mt-2 flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/20 hover:border-primary/50 hover:bg-primary/10 transition-all group">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:rotate-180 transition-transform duration-500">
                                <RotateCw className="h-5 w-5" />
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-black uppercase tracking-tight text-foreground">Gire a roleta e ganhe prêmios</p>
                                <p className="text-[10px] font-medium text-muted-foreground">Tente sua sorte agora</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-primary text-white border-none text-[9px] font-black">{userSpinsAvailable}</Badge>
                              <ArrowLeft className="h-4 w-4 text-primary rotate-180" />
                            </div>
                          </button>
                        </DialogTrigger>
                        <DialogContent 
                          className="max-w-2xl p-0 bg-transparent border-none w-[95vw] md:w-full max-h-[90vh] overflow-y-auto no-scrollbar"
                          onInteractOutside={(e) => { if (isGameInProgress) e.preventDefault(); }}
                          onEscapeKeyDown={(e) => { if (isGameInProgress) e.preventDefault(); }}
                        >
                          <Roulette 
                            prizes={roulettePrizes} 
                            campaign={campaign} 
                            availableSpins={userSpinsAvailable}
                            onSpinStart={() => setIsGameInProgress(true)}
                            onSpinComplete={() => setIsGameInProgress(false)}
                          />
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
          <div key={section} className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm space-y-4 md:space-y-6">
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
                  
                  {(campaign.concurso || campaign.draw_number) && (
                    <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 flex flex-wrap gap-x-8 gap-y-2">
                      {campaign.concurso && (
                        <div>
                          <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Sorteio Base</p>
                          <p className="text-xs font-bold text-primary italic uppercase tracking-tighter">Loteria Federal</p>
                        </div>
                      )}
                      {campaign.draw_number && (
                        <div>
                          <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Concurso Nº</p>
                          <p className="text-xs font-bold text-primary italic font-mono">#{campaign.draw_number}</p>
                        </div>
                      )}
                    </div>
                  )}
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
        const availablePrizes = luckyNumbers.filter(p => !luckyNumbersStatus[p.number]);
        const wonPrizes = luckyNumbers.filter(p => luckyNumbersStatus[p.number]);

        return luckyNumbers.length > 0 && (
          <div key={section} id="prizes" className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                    <Trophy className="h-6 w-6 text-amber-500" />
                  </div>
                  Cotas Premiadas
                </h3>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest ml-1">Encontre estes números e ganhe na hora</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full bg-secondary/50 text-[10px] font-black h-8 px-4 border-primary/10">
                  {availablePrizes.length} DISPONÍVEIS
                </Badge>
                <Badge variant="outline" className="rounded-full bg-amber-500/5 text-amber-500 text-[10px] font-black h-8 px-4 border-amber-500/20">
                  {wonPrizes.length} PREMIADAS
                </Badge>
              </div>
            </div>
            
            <div className="space-y-10">
              {/* Disponíveis */}
              {availablePrizes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Cotas Disponíveis</h4>
                    <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availablePrizes.map((p: any, i: number) => (
                      <div 
                        key={i} 
                        className="group flex items-center justify-between p-4 rounded-3xl border border-green-500/10 bg-green-500/5 hover:border-green-500/30 hover:bg-green-500/[0.08] transition-all duration-300 shadow-sm"
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="px-5 h-10 shrink-0 rounded-full bg-green-500 text-white shadow-[0_5px_15px_rgba(34,197,94,0.3)] flex items-center justify-center font-black italic text-sm group-hover:scale-105 transition-transform duration-500">
                            #{p.number}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-xs font-black uppercase tracking-tight text-foreground truncate max-w-[150px]">
                              {p.prize}
                            </span>
                            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                              LIVRE / DISPONÍVEL
                            </span>
                          </div>
                        </div>
                        <Badge className="bg-green-500 text-white border-none text-[9px] font-black px-3 h-6 rounded-full shadow-sm">PARTICIPAR</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Premiadas (Ganhadores) */}
              {wonPrizes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Cotas Já Premiadas</h4>
                    <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {wonPrizes.map((p: any, i: number) => {
                      const winner = luckyWinners?.find(w => w.number === p.number);
                      return (
                        <div 
                          key={i} 
                          className="group flex items-center justify-between p-4 rounded-3xl border border-amber-500/10 bg-amber-500/5 transition-all duration-300 shadow-sm overflow-hidden relative"
                        >
                          <div className="flex items-center gap-4 overflow-hidden relative z-10">
                            <div className="px-5 h-10 shrink-0 rounded-full bg-amber-500 text-white shadow-inner flex items-center justify-center font-black italic text-sm">
                              #{p.number}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-xs font-black uppercase tracking-tight text-muted-foreground truncate max-w-[150px]">
                                {p.prize}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-5 w-5 border-2 border-amber-500/20 shadow-sm">
                                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.number}`} />
                                  <AvatarFallback className="text-[8px] bg-amber-500/10 text-amber-600 font-black">W</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-tighter truncate max-w-[100px]">
                                    {(Array.isArray(winner?.profiles) ? winner?.profiles[0]?.name : winner?.profiles?.name) || "Ganhador"}
                                  </span>
                                  <span className="text-[8px] font-bold text-muted-foreground uppercase leading-none">LEVOU O PRÊMIO</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 relative z-10">
                            <Badge className="bg-amber-500/20 text-amber-600 border-none text-[8px] font-black px-2.5 h-6 rounded-full uppercase">Sorteada</Badge>
                            <Trophy className="h-4 w-4 text-amber-500/30 -rotate-12" />
                          </div>
                          
                          {/* Decorative background element */}
                          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full -mr-8 -mt-8" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'top_buyers':
        return (
          <div key={section} className="bg-card rounded-3xl p-8 border border-border shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-amber-500" />
                </div>
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-animate-gradient">Top Compradores</h2>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-secondary">Últimos 5</Badge>
            </div>
            
            <div className="space-y-3">
              {campaignRanking?.slice(0, 5).map((user: any, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">

                  <div className="flex items-center gap-4">
                    <div className="w-8 text-sm font-black italic text-muted-foreground group-hover:text-primary transition-colors">#{i + 1}</div>
                    <Avatar className="h-10 w-10 border-2 border-border group-hover:border-primary/30 transition-all">
                      <AvatarImage src={user.avatar_url || ""} />
                      <AvatarFallback className="bg-secondary text-foreground font-black uppercase text-xs">
                        {user.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-black uppercase tracking-tighter text-foreground">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{user.total_tickets} cotas adquiridas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {i === 0 && <Crown className="h-5 w-5 text-amber-500" />}
                    {i === 1 && <Medal className="h-5 w-5 text-zinc-400" />}
                    {i === 2 && <Medal className="h-5 w-5 text-amber-700" />}
                  </div>
                </div>
              ))}
              {(!campaignRanking || campaignRanking.length === 0) && (
                <p className="text-center text-muted-foreground text-xs italic py-4">Aguardando as primeiras compras...</p>
              )}
            </div>
            
            <p className="text-[10px] text-muted-foreground text-center font-bold uppercase tracking-widest mt-4">
              Quem comprar mais cotas também receberá prêmios exclusivos!
            </p>
          </div>
        );

      case 'ranking':
        return campaign.ranking_enabled && (
          <div key={section} className="bg-transparent border-none shadow-none">
            <UserRanking 
              title="Premiação por Números" 
              stats={ticketStats ? { 
                ...ticketStats, 
                userTickets,
                activePrize: {
                  title: "Maior e Menor Bilhete",
                  prize_maior: "14,01",
                  prize_menor: "14,01",
                  end_date: campaign.draw_date || new Date().toISOString()
                }
              } : null} 
              users={[]}
            />
          </div>
        );

      case 'roulette_footer':
        return campaign.roulette_enabled && roulettePrizes && roulettePrizes.length > 0 && (
          <div key={section} className="mt-12 mb-12 bg-card rounded-3xl p-8 border border-border shadow-sm space-y-8">
            <div className="flex flex-col items-center text-center">
              <Badge className="bg-primary/20 text-primary border-none text-[10px] font-black uppercase tracking-widest mb-2">Simulador de Sorte</Badge>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Prêmios da <span className="text-animate-gradient">Roleta</span></h2>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-2 max-w-xs">Benefícios exclusivos para quem adquire cotas desta ação!</p>
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
                  <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase">BENEFÍCIO</Badge>
                </div>
              ))}
            </div>

          </div>
        );

      case 'scratch_footer':
        return campaign?.scratch_cards_enabled && (
          <div key={section} className="mt-12 mb-20">
             <div className="flex flex-col items-center text-center mb-8">
              <Badge className="bg-amber-500/20 text-amber-500 border-none text-[10px] font-black uppercase tracking-widest mb-2">Diversão Instantânea</Badge>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Raspadinha <span className="text-animate-gradient">Premiada</span></h2>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-2 max-w-xs">
                Tente ganhar prêmios reais raspando agora!
              </p>
            </div>
            <ScratchCard 
              potentialPrizes={[
                ...(roulettePrizes?.map(p => p.label) || []),
                ...(luckyNumbers?.map((p: any) => p.prize) || []),
                "R$ 50,00 no PIX",
                "Giro Grátis na Roleta"
              ]}
              isSimulation={false}
              cost={campaign?.scratch_card_cost || 0}
              campaignId={campaign?.id}
              availableScratches={userScratchesAvailable}
              onStart={() => setIsGameInProgress(true)}
              onComplete={() => setIsGameInProgress(false)}
            />
          </div>
        );

      case 'events':
        return luckyHours && luckyHours.length > 0 && (
          <div key={section} className="bg-card rounded-[2rem] p-6 md:p-8 border-2 border-primary/20 shadow-lg shadow-primary/5 space-y-6 md:space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <h2 className="text-sm font-black uppercase italic tracking-tighter text-animate-gradient">Eventos e Premiações</h2>
              </div>
              {nextLuckyHour && (
                <Badge className="bg-primary text-white text-[10px] font-black uppercase px-3 py-1 animate-pulse">
                  Próximo: {new Date(nextLuckyHour.draw_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Badge>
              )}
            </div>
            
            <Tabs defaultValue="hourly" className="w-full">
              <TabsList className="bg-secondary/50 rounded-xl mb-4 grid grid-cols-2">
                <TabsTrigger value="hourly" className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-tighter py-2">
                  <Clock className="h-3 w-3" /> Hora Premiada
                </TabsTrigger>
                <TabsTrigger value="greater_smaller" className="rounded-lg gap-2 text-[10px] font-black uppercase tracking-tighter py-2">
                  <TrendingUp className="h-3 w-3" /> Maior/Menor Cota
                </TabsTrigger>
              </TabsList>

              <TabsContent value="hourly">
                <div className="grid grid-cols-1 gap-3">
                  {hourlyDraws.length > 0 ? hourlyDraws.map((draw) => (
                    <div key={draw.id} className="p-4 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between gap-4 transition-all hover:bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${draw.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black uppercase tracking-tight text-foreground truncate">{draw.title}</p>
                          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                            {new Date(draw.draw_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {draw.prize_description}
                          </p>
                          {draw.status === 'completed' && draw.winner_name && (
                            <div className="mt-1 flex flex-col gap-0.5">
                              <p className="text-[9px] font-black text-emerald-500 uppercase truncate flex items-center gap-1">
                                <Trophy className="h-2 w-2" /> Ganhador: {draw.winner_name}
                              </p>
                              {draw.winning_number && (
                                <p className="text-[8px] font-bold text-muted-foreground uppercase italic">Cota Premiada: {draw.winning_number}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant={draw.status === 'completed' ? 'default' : 'secondary'} className="text-[7px] font-black uppercase px-2 h-5 shrink-0">
                        {draw.status === 'completed' ? 'Sorteado' : 'Em breve'}
                      </Badge>
                    </div>
                  )) : (
                    <p className="text-[10px] text-muted-foreground italic text-center py-4 uppercase font-bold tracking-widest">Aguardando eventos...</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="greater_smaller">
                <div className="grid grid-cols-1 gap-3">
                  {greaterSmallerDraws.length > 0 ? greaterSmallerDraws.map((draw) => {
                    const drawTime = new Date(draw.draw_time);
                    const now = new Date();
                    const isComingSoon = draw.status === 'scheduled' && (drawTime.getTime() - now.getTime()) < 3600000 && drawTime > now;

                    return (
                      <div key={draw.id} className={cn(
                        "p-4 rounded-2xl bg-secondary/30 border flex items-center justify-between gap-4 transition-all hover:bg-secondary/50",
                        isComingSoon ? "border-primary animate-blink shadow-[0_0_15px_rgba(var(--primary),0.4)] bg-primary/5" : 
                        draw.status === 'completed' ? "border-emerald-500/30 bg-emerald-500/5 animate-pulse" : "border-border"
                      )}>
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${draw.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                            <TrendingUp className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black uppercase tracking-tight text-foreground truncate">{draw.title}</p>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                              {drawTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {draw.prize_description}
                            </p>
                            {draw.status === 'completed' && draw.winner_name && (
                              <p className="text-[9px] font-black text-emerald-500 uppercase mt-0.5 truncate">Vencedor: {draw.winner_name} (Nº {draw.winning_number})</p>
                            )}
                            {isComingSoon && (
                              <p className="text-[9px] font-black text-primary uppercase mt-0.5 animate-pulse">DEFINIÇÃO EM INSTANTES!</p>
                            )}
                          </div>
                        </div>
                        <Badge variant={draw.status === 'completed' ? 'default' : 'secondary'} className={cn(
                          "text-[7px] font-black uppercase px-2 h-5 shrink-0",
                          isComingSoon && "bg-primary text-white"
                        )}>
                          {draw.status === 'completed' ? 'Definido' : (isComingSoon ? 'Definindo...' : 'Agendado')}
                        </Badge>
                      </div>
                    );
                  }) : (
                    <p className="text-[10px] text-muted-foreground italic text-center py-4 uppercase font-bold tracking-widest">Aguardando definição...</p>
                  )}

                </div>
              </TabsContent>
            </Tabs>
          </div>
        );

      default:
        return null;
    }
  };

  const sectionsOrder = campaign.sections_order || ["gallery", "progress", "header", "description", "purchase", "events", "ranking", "prizes", "roulette_footer", "scratch_footer"];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={campaign.title} 
        description={campaign.subtitle || campaign.description?.slice(0, 160) || ""} 
        image={campaign.image_url || ""}
        type="article"
      />
      <Header />
      <div className="h-16 md:h-20" />
      <LiveNotifications />

      
      <div className="container px-4 md:px-6 pb-20">
        <div className="flex flex-col gap-8 md:gap-12">
          {sectionsOrder.map((section) => renderSection(section))}
        </div>
      </div>

      <PurchaseAnimation 
        isVisible={showSuccess} 
        onComplete={() => {
          setShowSuccess(false);
          setIsPaymentModalOpen(true);
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
        onOpenChange={handleOpenChange} 
        orderId={currentOrderId} 
        onPaymentSuccess={handlePaymentSuccess} 
        onBuyMore={(qty) => handleBuy(qty, true)}
      />

      <Footer />
      
    </div>
  );
};

export default CampaignDetail;
