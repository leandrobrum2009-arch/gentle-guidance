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
import MysteryBox, { PrizeIcon } from "@/components/MysteryBox";
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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isGameInProgress, setIsGameInProgress] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const allLuckyNumbers = useMemo(() => campaign?.lucky_numbers_prizes || [], [campaign]);
  const luckyNumbers = useMemo(() => allLuckyNumbers, [allLuckyNumbers]);
  const luckyNumbersList = useMemo(() => allLuckyNumbers.map((p: any) => p.number) || [], [allLuckyNumbers]);
  const protectedNumbers = useMemo(() => allLuckyNumbers.filter((p: any) => p.protected).map((p: any) => p.number), [allLuckyNumbers]);

  const canManualSelect = useMemo(() => campaign?.manual_numbers === true || campaign?.ticket_generation_type === 'manual', [campaign]);
  const { data: tickets } = useTickets(campaignId, canManualSelect && !!campaignId);
  const [luckyNumbersStatus, setLuckyNumbersStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!campaignId || !luckyNumbersList.length) return;
    const fetchLuckyStatus = async () => {
      const { data } = await supabase.from('tickets').select('number, status').eq('campaign_id', campaignId).in('number', luckyNumbersList);
      if (data) {
        const statusMap: Record<string, boolean> = {};
        data.forEach(t => { if (['confirmed', 'paid', 'reserved'].includes(t.status)) statusMap[t.number] = true; });
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

  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isQuickRegisterOpen, setIsQuickRegisterOpen] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState<number | string[] | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  useEffect(() => {
    const orderId = searchParams.get('order');
    if (orderId && orderId !== currentOrderId) {
      setCurrentOrderId(orderId);
      setIsPaymentModalOpen(true);
    }
  }, [searchParams, currentOrderId]);

  const soldTickets = useMemo(() => tickets?.filter(t => ['confirmed', 'paid', 'reserved'].includes(t.status)).map(t => t.number) || [], [tickets]);
  const userSpinsAvailable = useMemo(() => userSpins?.filter((s: any) => !s.prize_label).length || 0, [userSpins]);
  const userScratchesAvailable = useMemo(() => userScratches?.filter((s: any) => !s.prize_label).length || 0, [userScratches]);

  const progressData = useMemo(() => {
    if (!campaign) return { bar: 0, text: "0" };
    let val = campaign.fake_progress_enabled ? (campaign.fake_progress_percentage || 0) : (campaign.sales_goal ? ((campaign.sold_tickets * Number(campaign.ticket_price)) / campaign.sales_goal) * 100 : (campaign.sold_tickets / campaign.total_tickets) * 100);
    return { bar: Math.min(100, Math.max(val, val > 0 ? 0.5 : 0)), text: campaign.progress_text || String(Math.round(val)) };
  }, [campaign]);

  const handleToggleTicket = (number: string) => setSelectedTickets(prev => prev.includes(number) ? prev.filter(n => n !== number) : [...prev, number]);

  const handleBuy = async (quantityOrNumbers: number | string[], isUpsell = false) => {
    if (!user) { setPendingPurchase(quantityOrNumbers); setIsQuickRegisterOpen(true); return; }
    setIsPurchasing(true);
    await supabase.rpc('release_expired_tickets');
    try {
      const { data: orderId, error } = await supabase.rpc('reserve_tickets', {
        p_campaign_id: campaignId, p_user_id: user.id, p_quantity: typeof quantityOrNumbers === 'number' ? quantityOrNumbers : quantityOrNumbers.length,
        p_numbers: typeof quantityOrNumbers === 'number' ? null : quantityOrNumbers, p_affiliate_id: null
      });
      if (error) throw error;
      setIsPurchasing(false); setCurrentOrderId(orderId); setSearchParams({ order: orderId }, { replace: true });
      setIsPaymentModalOpen(true); if (!isUpsell) setShowSuccess(true);
    } catch (error: any) { setIsPurchasing(false); toast.error(error.message || "Erro ao reservar números."); }
  };

  if (isLoading) return <div className="min-h-screen bg-background"><Header /><div className="container flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div><Footer /></div>;
  if (!campaign) return <div className="min-h-screen bg-background"><Header /><div className="container flex flex-col items-center justify-center py-20"><h1 className="text-2xl font-bold">Campanha não encontrada</h1><Link to="/"><Button variant="outline" className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button></Link></div><Footer /></div>;

  const renderSection = (section: string) => {
    switch (section) {
      case 'gallery':
        return (
          <div key={section} className="w-full bg-black relative overflow-x-hidden shadow-2xl border border-border/10">
            <RaffleGallery images={Array.from(new Set([campaign.image_url || "", ...(campaign.gallery_urls || [])])).filter(url => url !== "")} videoUrl={campaign.video_url} />
            <CampaignLiveDraw campaign={campaign} />
          </div>
        );
      case 'header':
        return (
          <div key={section} className="flex flex-col gap-6 mt-6">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-animate-gradient">{campaign.title}</h1>
              {campaign.subtitle && <p className="text-muted-foreground">{campaign.subtitle}</p>}
              <Button className="h-12 px-8 rounded-2xl font-black uppercase bg-primary text-black" onClick={() => document.getElementById('purchase-tabs')?.scrollIntoView({ behavior: 'smooth' })}>PARTICIPE AGORA <Zap className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
        );
      case 'purchase':
        return (
          <div key={section} className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-[2rem] shadow-sm border border-border overflow-hidden" id="purchase-tabs">
                <Tabs defaultValue="auto" className="w-full">
                  <TabsContent value="auto" className="p-6"><CampaignPricing campaign={campaign} onBuy={handleBuy} isPurchasing={isPurchasing} /></TabsContent>
                </Tabs>
              </div>
              {(campaign.roulette_enabled || campaign.mystery_box_enabled || campaign.scratch_cards_enabled) && (
                <div className="space-y-4">
                  {campaign.roulette_enabled && (
                    <div className="bg-card rounded-3xl p-6 border border-border shadow-sm">
                      <h3 className="text-sm font-black uppercase flex items-center gap-2 mb-4"><RotateCw className="h-4 w-4 text-primary" /> Roletas Instantâneas</h3>
                      <div className="flex flex-col gap-2">
                        {((campaign.roulette_rules as any[]) || []).map((rule, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-primary/10 border border-primary/20">
                            <span className="text-xs font-black">A partir de {rule.min_tickets} títulos</span>
                            <span className="text-[10px] font-bold">{rule.spins} chance(s)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {campaign.scratch_cards_enabled && (
                    <div className="bg-card rounded-3xl p-6 border border-border shadow-sm">
                      <h3 className="text-sm font-black uppercase flex items-center gap-2 mb-4"><Sparkles className="h-4 w-4 text-amber-500" /> Raspadinhas</h3>
                      <div className="flex flex-col gap-2">
                        {((campaign.scratch_card_rules as any[]) || []).map((rule, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                            <span className="text-xs font-black">A partir de {rule.min_tickets} títulos</span>
                            <span className="text-[10px] font-bold">{rule.quantity} chance(s)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div className="bg-card rounded-3xl p-6 border border-border shadow-sm">
                <h3 className="text-sm font-black uppercase flex items-center gap-2 mb-4"><Gamepad2 className="h-4 w-4 text-primary" /> Jogos Disponíveis</h3>
                <div className="flex flex-col gap-4">
                  {campaign.roulette_enabled && (
                    <Dialog onOpenChange={(open) => { if (!open && isGameInProgress) return; }}>
                      <DialogTrigger asChild><Button variant="outline" className="w-full justify-between h-14 rounded-2xl border-primary/20 bg-primary/5 hover:bg-primary/10">
                        <div className="flex items-center gap-3 text-left"><RotateCw className="h-5 w-5 text-primary" /><div><p className="text-xs font-black uppercase">Roleta da Sorte</p><p className="text-[9px] text-muted-foreground">Tente sua sorte agora</p></div></div>
                        <Badge className="bg-primary text-white text-[9px]">{userSpinsAvailable}</Badge>
                      </Button></DialogTrigger>
                      <DialogContent className="max-w-2xl p-0 bg-transparent border-none"><Roulette prizes={roulettePrizes} campaign={campaign} availableSpins={userSpinsAvailable} onSpinStart={() => setIsGameInProgress(true)} onSpinComplete={() => setIsGameInProgress(false)} /></DialogContent>
                    </Dialog>
                  )}
                  {campaign.scratch_cards_enabled && (
                    <Dialog onOpenChange={(open) => { if (!open && isGameInProgress) return; }}>
                      <DialogTrigger asChild><Button variant="outline" className="w-full justify-between h-14 rounded-2xl border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10">
                        <div className="flex items-center gap-3 text-left"><Sparkles className="h-5 w-5 text-amber-500" /><div><p className="text-xs font-black uppercase">Raspadinha Premiada</p><p className="text-[9px] text-muted-foreground">Raspe e ganhe instantâneo</p></div></div>
                        <Badge className="bg-amber-500 text-white text-[9px]">{userScratchesAvailable}</Badge>
                      </Button></DialogTrigger>
                      <DialogContent className="max-w-md p-6 bg-zinc-950 border border-white/10 rounded-3xl"><ScratchCard potentialPrizes={[]} campaignId={campaignId} availableScratches={userScratchesAvailable} onStart={() => setIsGameInProgress(true)} onComplete={() => setIsGameInProgress(false)} /></DialogContent>
                    </Dialog>
                  )}
                  {campaign.mystery_box_enabled && (
                    <Dialog onOpenChange={(open) => { if (!open && isGameInProgress) return; }}>
                      <DialogTrigger asChild><Button variant="outline" className="w-full justify-between h-14 rounded-2xl border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10">
                        <div className="flex items-center gap-3 text-left"><Gift className="h-5 w-5 text-purple-500" /><div><p className="text-xs font-black uppercase">Caixas Misteriosas</p><p className="text-[9px] text-muted-foreground">Desbloqueie itens raros</p></div></div>
                        <Badge className="bg-purple-500 text-white text-[9px]">NOVO</Badge>
                      </Button></DialogTrigger>
                      <DialogContent className="max-w-4xl p-6 bg-zinc-950 border border-white/10 rounded-3xl"><MysteryBox boxes={mysteryBoxes || []} campaignId={campaignId} /></DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={campaign.title} description={campaign.subtitle || ""} image={campaign.image_url || ""} type="article" />
      <Header />
      <div className="container px-4 md:px-6 pb-20 pt-[100px]">
        <div className="flex flex-col gap-8 md:gap-12">{["gallery", "header", "purchase"].map((section) => renderSection(section))}</div>
      </div>
      <PurchaseAnimation isVisible={showSuccess} onComplete={() => setShowSuccess(false)} />
      <QuickRegisterDialog isOpen={isQuickRegisterOpen} onOpenChange={setIsQuickRegisterOpen} onSuccess={() => { if (pendingPurchase) handleBuy(pendingPurchase); }} />
      <PaymentModal isOpen={isPaymentModalOpen} onOpenChange={handleOpenChange} orderId={currentOrderId} />
      <Footer />
    </div>
  );
};

export default CampaignDetail;