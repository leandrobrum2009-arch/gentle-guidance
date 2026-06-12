import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
    Calendar, ArrowLeft, Trophy, Share2, Loader2, CheckCircle2,
    Gift, Zap, MousePointer2, Sparkles, BookOpen, Star, Crown, Ticket, RotateCw, Gamepad2, Activity,
    ChevronDown, ChevronUp, Clock, Info, RefreshCw, Medal, TrendingUp, ShieldCheck, Smartphone, Bell, Video
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
import LiveStreamPlayer from "@/components/LiveStreamPlayer";

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
  const [isGameInProgress, setIsGameInProgress] = useState(false);

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
    if (campaign.fake_progress_enabled && campaign.fake_progress_percentage !== undefined) {
      val = campaign.fake_progress_percentage;
    } else {
      if (campaign.sales_goal && campaign.sales_goal > 0) {
        val = ((campaign.sold_tickets * Number(campaign.ticket_price)) / campaign.sales_goal) * 100;
      } else {
        val = (campaign.sold_tickets / campaign.total_tickets) * 100;
      }
    }
    const rounded = Math.round(val);
    const text = campaign.progress_text || String(rounded);
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
    await supabase.rpc('release_expired_tickets');
    
    try {
      const quantity = typeof quantityOrNumbers === 'number' ? quantityOrNumbers : quantityOrNumbers.length;
      const numbers = typeof quantityOrNumbers === 'number' ? null : quantityOrNumbers;
      
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
      setSearchParams({ order: orderId }, { replace: true });
      setIsPaymentModalOpen(true);
      if (!isUpsell) {
        setShowSuccess(true);
      }
    } catch (error: any) {
      setIsPurchasing(false);
      toast.error(error.message || "Erro ao reservar números. Tente novamente.");
    }
  };

  if (isLoading) return <div className="min-h-screen bg-background"><Header /><div className="container flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div><Footer /></div>;
  if (!campaign) return <div className="min-h-screen bg-background"><Header /><div className="container flex flex-col items-center justify-center py-20"><h1 className="font-display text-2xl font-bold">Campanha não encontrada</h1><Link to="/"><Button variant="outline" className="mt-4 gap-2"><ArrowLeft className="h-4 w-4" /> Voltar</Button></Link></div><Footer /></div>;

  const renderSection = (section: string) => {
    switch (section) {
      case 'gallery':
        return (
          <div key={section} className="w-full bg-black relative overflow-x-hidden shadow-2xl border border-border/10">
            <RaffleGallery images={Array.from(new Set([campaign.image_url || "", ...(campaign.gallery_urls && Array.isArray(campaign.gallery_urls) ? campaign.gallery_urls : [])])).filter(url => url !== "")} videoUrl={campaign.video_url} />
            {campaign.featured && (
              <div className="absolute top-4 right-4 z-10 animate-blink"><Badge className="bg-primary text-white font-black italic uppercase tracking-wider px-4 py-1.5 shadow-lg shadow-primary/40 border-none rounded-full flex items-center gap-2"><Star className="h-4 w-4 fill-white" /> Destaque</Badge></div>
            )}
            <Link to="/conta#tickets" className="absolute bottom-20 right-4 z-10">
              <Button size="sm" variant="secondary" className="bg-black/60 text-white backdrop-blur-md border-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider px-4 hover:bg-black/80 shadow-lg"><Ticket className="mr-2 h-3 w-3" /> Ver meus títulos</Button>
            </Link>
            <CampaignLiveDraw campaign={campaign} />
          </div>
        );
      
      case 'header':
        const drawDateFull = campaign.draw_date ? new Date(campaign.draw_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : null;
        return (
          <div key={section} className="flex flex-col gap-6 mt-6 md:mt-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {campaign.status === "active" && (campaign.draw_date && new Date(campaign.draw_date) < new Date() ? <Badge className="rounded-full px-4 h-6 text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white w-fit shadow-sm">Aguardando Sorteio</Badge> : <Badge className="bg-primary text-black border-none text-[10px] font-black uppercase px-3 h-6 rounded-full shadow-sm">Sorteio Ativo</Badge>)}
                {drawDateFull && <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-primary/20 bg-primary/5 text-primary rounded-full px-3 h-6">Sorteio: {drawDateFull}</Badge>}
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter text-animate-gradient leading-[0.9] break-words">{campaign.title}</h1>
                {campaign.subtitle && <p className="text-sm md:text-lg text-muted-foreground font-medium max-w-3xl leading-relaxed">{campaign.subtitle}</p>}
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary text-black hover:scale-105 transition-all shadow-xl shadow-primary/20 animate-button-flash" onClick={() => document.getElementById('purchase-tabs')?.scrollIntoView({ behavior: 'smooth' })}>PARTICIPE AGORA <Zap className="ml-2 h-4 w-4 fill-current" /></Button>
              </div>
            </div>
            {campaign.show_timer && (campaign.timer_end_date || campaign.draw_date) && (
              <div className="flex flex-col items-center justify-center p-8 bg-card border-2 border-primary/20 rounded-[2.5rem] shadow-xl shadow-primary/5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                <CountdownTimer targetDate={campaign.timer_end_date || campaign.draw_date!} className="scale-125 md:scale-150 relative z-10" />
              </div>
            )}
          </div>
        );
        
      case 'purchase':
        return (
          <div key={section} className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-[2rem] shadow-sm border border-border overflow-hidden" id="purchase-tabs">
                <Tabs defaultValue={campaign?.ticket_generation_type === 'manual' ? "manual" : "auto"} className="w-full">
                  <TabsContent value="auto" className="p-6"><CampaignPricing campaign={campaign} onBuy={handleBuy} isPurchasing={isPurchasing} /></TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={campaign.title} description={campaign.subtitle || campaign.description?.slice(0, 160) || ""} image={campaign.image_url || ""} type="article" />
      <Header />
      <div className="container px-4 md:px-6 pb-20 pt-[var(--header-height,100px)]">
        <div className="flex flex-col gap-8 md:gap-12 mt-0">
          {["gallery", "header", "purchase"].map((section) => renderSection(section))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CampaignDetail;