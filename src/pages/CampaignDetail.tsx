 import { useState, useMemo, useEffect } from "react";
  import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
 import {
    Calendar, ArrowLeft, Shield, Trophy, Users, Share2, Loader2, 
     Gift, Award, TrendingUp, Info, Zap, MousePointer2, Sparkles, BookOpen, Star, Crown
 } from "lucide-react";
 import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
  import { 
    useCampaign, useMysteryBoxConfigs, useRoulettePrizes, useWinners, useTickets,
    useCampaignRanking, useCampaignMysteryBoxWins, useCampaignRouletteSpins,
    useUserCampaignSpins
  } from "@/hooks/useData";
 import { supabase } from "@/integrations/supabase/client";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import RaffleGallery from "@/components/RaffleGallery";
 import TicketGrid from "@/components/TicketGrid";
 import PaymentSelector from "@/components/PaymentSelector";
 import PurchaseAnimation from "@/components/PurchaseAnimation";
import CampaignPricing from "@/components/CampaignPricing";
import Roulette from "@/components/Roulette";
import MysteryBox from "@/components/MysteryBox";
import CampaignPrizes from "@/components/CampaignPrizes";
import UserRanking from "@/components/UserRanking";
import CampaignPublicInfo from "@/components/CampaignPublicInfo";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

   const CampaignDetail = () => {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();
   const { user } = useAuth();
   const { data: campaign, isLoading } = useCampaign(id || "");
    const { data: mysteryBoxes } = useMysteryBoxConfigs(id || "");
   const { data: roulettePrizes } = useRoulettePrizes(id || "");
   const { data: allWinners } = useWinners();
    const allLuckyNumbers = useMemo(() => {
      return campaign?.lucky_numbers_prizes || [];
    }, [campaign]);

    const luckyNumbers = useMemo(() => {
      return allLuckyNumbers.filter((p: any) => !p.protected);
    }, [allLuckyNumbers]);

    const protectedNumbers = useMemo(() => {
      return allLuckyNumbers.filter((p: any) => p.protected).map((p: any) => p.number);
    }, [allLuckyNumbers]);

    const luckyNumbersList = useMemo(() => {
      return luckyNumbers.map((p: any) => p.number) || [];
    }, [luckyNumbers]);

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
   const { data: instantWinners } = useCampaignMysteryBoxWins(id || "", 5);
   const { data: rouletteWinners } = useCampaignRouletteSpins(id || "", 5);
   const { data: userSpins } = useUserCampaignSpins(user?.id || "", id || "");
 
   const handleShareCampaign = async () => {
     if (!campaign) return;
     const url = window.location.href;
     
     if (navigator.share) {
       try {
         await navigator.share({
           title: campaign.title,
           text: campaign.subtitle || 'Confira este sorteio incrível!',
           url: url,
         });
       } catch (err) {
         if ((err as Error).name !== 'AbortError') {
           console.error('Error sharing:', err);
         }
       }
     } else {
       navigator.clipboard.writeText(url);
       toast.success("Link da campanha copiado!");
     }
   };

   const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
   const [isPurchasing, setIsPurchasing] = useState(false);
   const [showSuccess, setShowSuccess] = useState(false);
 
    const soldTickets = useMemo(() => {
      return tickets?.filter(t => t.status === "confirmed" || t.status === "paid" || t.status === "reserved").map(t => t.number) || [];
    }, [tickets]);

    const availableInstantPrizes = useMemo(() => {
      return luckyNumbers.filter(p => !luckyNumbersStatus[p.number]).length;
    }, [luckyNumbers, luckyNumbersStatus]);

    const userTicketsCount = useMemo(() => {
      if (!user || !tickets) return 0;
      return tickets.filter(t => t.user_id === user.id && (t.status === 'confirmed' || t.status === 'paid')).length;
    }, [user, tickets]);

    const userSpinsAvailable = useMemo(() => {
      if (!campaign?.roulette_free_tickets || campaign.roulette_free_tickets <= 0) return 0;
      const totalEarnedSpins = Math.floor(userTicketsCount / campaign.roulette_free_tickets);
      const usedSpins = userSpins?.length || 0;
      return Math.max(0, totalEarnedSpins - usedSpins);
    }, [userTicketsCount, campaign, userSpins]);
 
   const campaignWinners = useMemo(() => {
     return allWinners?.filter(w => w.campaign_id === id) || [];
   }, [allWinners, id]);
 
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
        toast.error("Você precisa estar logado para comprar!");
        navigate("/entrar");
        return;
      }
      
      setIsPurchasing(true);
      
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
        
        // Redirect after short delay
        setTimeout(() => {
          navigate(`/checkout/${orderId}`);
        }, 3000);

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
  const drawTime = campaign.draw_date ? new Date(campaign.draw_date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar para campanhas
        </Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container pb-10">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
             <RaffleGallery 
               images={campaign.gallery_urls && campaign.gallery_urls.length > 0 ? campaign.gallery_urls : [campaign.image_url || ""]} 
               videoUrl={campaign.video_url} 
             />

            <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
              <div>
                <h1 className="font-display text-xl font-bold sm:text-2xl">{campaign.title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{campaign.subtitle}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="font-mono font-semibold text-foreground/70">{campaign.ltp_code}</span>
                <Badge variant={isActive ? "default" : "secondary"} className="text-[10px]">{isActive ? "Ativo" : "Concluído"}</Badge>
                {drawDate && (
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{drawDate} às {drawTime}</span>
                )}
              </div>
              <Separator />
               <div className="space-y-3">
                 <div className="h-4 overflow-hidden rounded-full bg-secondary border border-border/50 shadow-inner">
                   <motion.div 
                     initial={{ width: 0 }} 
                     animate={{ width: `${progress}%` }} 
                     transition={{ duration: 1.5, ease: "easeOut" }} 
                     className="h-full rounded-full bg-gradient-to-r from-primary via-[hsl(80,96%,60%)] to-primary shimmer-effect shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" 
                   />
                 </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso de vendas</span>
                  <span className="font-semibold text-primary">{progress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-secondary">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2, ease: "easeOut" }} className="h-full rounded-full bg-gradient-to-r from-primary to-[hsl(80,96%,60%)]" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{campaign.sold_tickets.toLocaleString("pt-BR")} vendidos</span>
                  <span>{campaign.total_tickets.toLocaleString("pt-BR")} total</span>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-secondary/50 p-3">
                  <Trophy className="mx-auto mb-1 h-5 w-5 text-primary" /><p className="text-xs text-muted-foreground">Prêmio</p><p className="text-xs font-semibold">Garantido</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <Shield className="mx-auto mb-1 h-5 w-5 text-primary" /><p className="text-xs text-muted-foreground">Pagamento</p><p className="text-xs font-semibold">Seguro</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <Users className="mx-auto mb-1 h-5 w-5 text-primary" /><p className="text-xs text-muted-foreground">Participantes</p><p className="text-xs font-semibold">{(campaign.sold_tickets / 3).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}+</p>
                </div>
              </div>
            </div>
          </div>

           <div className="lg:col-span-2">
             <div className="sticky top-20 space-y-6">
               <div className="rounded-3xl border border-border/50 bg-card p-1 shadow-xl ring-1 ring-primary/10 overflow-hidden">
                 <Tabs defaultValue="auto" className="w-full">
                    {canManualSelect && (
                      <div className="p-4 pb-0">
                        <TabsList className="grid w-full grid-cols-2 h-12 bg-secondary/50 rounded-2xl p-1">
                          <TabsTrigger value="auto" className="rounded-xl gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Zap className="h-4 w-4" /> Automático
                          </TabsTrigger>
                          <TabsTrigger value="manual" className="rounded-xl gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <MousePointer2 className="h-4 w-4" /> Manual
                          </TabsTrigger>
                        </TabsList>
                      </div>
                    )}
 
                   <TabsContent value="auto" className="p-5 mt-0">
                     <CampaignPricing campaign={campaign} onBuy={handleBuy} />
                   </TabsContent>
 
                   <TabsContent value="manual" className="p-5 mt-0 space-y-6">
                     <div className="space-y-4">
                       <p className="text-xs text-muted-foreground text-center">
                         Escolha seus números da sorte abaixo. Clique para selecionar.
                       </p>
                        {/* Lucky Numbers Section */}
                        {campaign.show_instant_prizes !== false && luckyNumbers.length > 0 && (
                          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3 mb-6 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
                            <h2 className="flex items-center gap-2 text-sm font-bold text-amber-500 uppercase tracking-wider">
                              <Star className="h-4 w-4 fill-current" /> Números Premiados
                            </h2>
                            <div className="grid gap-2">
                              {luckyNumbers.map((p: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-amber-500/10">
                                  <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 rounded bg-amber-500 text-white flex items-center justify-center font-mono font-bold text-[10px] shadow-lg shadow-amber-500/20">
                                      {p.number}
                                    </div>
                                    <span className="text-[10px] font-bold">{p.prize}</span>
                                  </div>
                                  <Badge variant={luckyNumbersStatus[p.number] ? "secondary" : "default"} className={cn("text-[8px] h-5", !luckyNumbersStatus[p.number] && "bg-amber-500 text-white")}>
                                    {luckyNumbersStatus[p.number] ? "Ganhado" : "Livre"}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
 
                        <TicketGrid 
                          totalTickets={campaign.total_tickets}
                          soldTickets={[...soldTickets, ...protectedNumbers]}
                          selectedTickets={selectedTickets}
                          onSelect={handleToggleTicket}
                          luckyNumbers={luckyNumbersList}
                        />
                       
                       <Button 
                         className="w-full h-14 rounded-2xl gap-3 text-lg font-black uppercase tracking-wide glow-primary"
                         disabled={selectedTickets.length === 0 || isPurchasing}
                         onClick={() => handleBuy(selectedTickets)}
                       >
                         {isPurchasing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
                         Reservar Números
                       </Button>
                     </div>
                   </TabsContent>
                 </Tabs>
               </div>
               
               {/* Payment Methods Info */}
               <div className="rounded-2xl border border-border/50 bg-secondary/30 p-4">
                 <div className="flex items-center justify-center gap-4 grayscale opacity-60">
                   <img src="https://logopng.com.br/logos/pix-106.png" className="h-4" alt="PIX" />
                   <img src="https://logodownload.org/wp-content/uploads/2014/10/visa-logo-1.png" className="h-3" alt="Visa" />
                   <img src="https://logodownload.org/wp-content/uploads/2014/07/mastercard-logo-7.png" className="h-4" alt="Mastercard" />
                   <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo.png" className="h-4" alt="Mercado Pago" />
                 </div>
               </div>
              
              {campaign.roulette_enabled && campaign.show_roulette_status !== false && roulettePrizes && roulettePrizes.length > 0 && (
                <div className="rounded-[40px] border border-white/5 bg-black/20 p-2 shadow-2xl backdrop-blur-xl">
                  <Roulette prizes={roulettePrizes} campaign={campaign} availableSpins={userSpinsAvailable} />
                </div>
              )}

              {campaign.mystery_box_enabled && mysteryBoxes && mysteryBoxes.length > 0 && (
                <MysteryBox boxes={mysteryBoxes} />
              )}

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-12 rounded-xl gap-2 text-sm font-bold border-primary/20 hover:bg-primary/5"
                  onClick={handleShareCampaign}
                >
                  <Share2 className="h-4 w-4 text-primary" /> Compartilhar
                </Button>
                <Button variant="outline" className="h-12 rounded-xl gap-2 text-sm font-bold border-primary/20 hover:bg-primary/5">
                  <Award className="h-4 w-4 text-primary" /> Afiliar-se
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

       <div className="container pb-20 space-y-16">
         {/* Top sections for stats and history */}
         <div className="space-y-16">
           <CampaignPublicInfo campaign={campaign} />
           
           {/* Maiores Compradores (Ranking) - Prominent position */}
           {campaign.ranking_enabled && (
             <section className="space-y-6">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                   <TrendingUp className="h-6 w-6 text-primary" />
                 </div>
                 <div>
                   <h2 className="text-xl font-black uppercase italic tracking-tighter">Maiores Compradores</h2>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Os que mais acreditaram na sorte</p>
                 </div>
               </div>
 
               <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                 {campaignRanking && campaignRanking.length > 0 ? campaignRanking.map((rank: any, i: number) => (
                   <motion.div 
                     key={i} 
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.05 }}
                     className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/5 transition-all group"
                   >
                     <div className="flex items-center gap-4">
                       <div className={cn(
                         "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black italic shadow-lg",
                         i === 0 ? "bg-amber-500 text-white" : i === 1 ? "bg-slate-400 text-white" : i === 2 ? "bg-amber-800 text-white" : "bg-zinc-800 text-slate-400"
                       )}>
                         #{i + 1}
                       </div>
                       <Avatar className="h-10 w-10 border-2 border-white/5 group-hover:border-primary/30 transition-all">
                         <AvatarImage src={rank.avatar_url} />
                         <AvatarFallback className="font-black text-[10px] bg-zinc-800">{rank.name.substring(0, 2)}</AvatarFallback>
                       </Avatar>
                       <div>
                         <p className="text-xs font-black uppercase tracking-tighter text-white truncate max-w-[80px]">{rank.name}</p>
                         <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{rank.total_tickets} COTAS</p>
                       </div>
                     </div>
                      {i === 0 && <Crown className="h-4 w-4 text-amber-500 opacity-20" />}
                   </motion.div>
                 )) : (
                   <div className="text-center py-10 text-slate-500 italic text-sm col-span-full border border-dashed border-white/10 rounded-[2rem]">Nenhum comprador ainda. Seja o primeiro!</div>
                 )}
               </div>
             </section>
           )}
         </div>
 
         <div className="grid gap-8 lg:grid-cols-3">
           <div className="lg:col-span-3">
             <CampaignPrizes 
               mainPrizes={campaign.main_prizes} 
               instantPrizes={campaign.lucky_numbers_prizes}
               roulettePrizes={roulettePrizes}
               showInstant={campaign.show_instant_prizes !== false}
               soldTickets={soldTickets}
             />
           </div>
 
           <div className="lg:col-span-2 space-y-8">
            {/* Description & Info */}
            <div className="space-y-6">
               <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
                 <h2 className="flex items-center gap-2 text-lg font-bold">
                   <Info className="h-5 w-5 text-primary" /> Descrição Completa
                 </h2>
                 <div className="prose prose-invert max-w-none text-muted-foreground text-sm leading-relaxed">
                   {campaign.description || "Sem descrição detalhada disponível."}
                 </div>
               </div>
 
               {campaign.regulations && (
                 <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
                   <h2 className="flex items-center gap-2 text-lg font-bold text-amber-500">
                     <BookOpen className="h-5 w-5" /> Regulamento & Termos
                   </h2>
                   <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                     {campaign.regulations}
                   </div>
                 </div>
               )}
             </div>

            {/* Winners section */}
            {campaignWinners.length > 0 && (
              <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  <Trophy className="h-5 w-5 text-primary" /> Ganhadores desta edição
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {campaignWinners.map((winner) => (
                    <div key={winner.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{winner.winner_name}</p>
                        <p className="text-[10px] text-muted-foreground">Bilhete #{winner.ticket_number}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

           <div className="space-y-6">
             {/* Gamification / VIP Box */}
            <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/30 p-6 border border-primary/20 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase">Sistema VIP</h3>
                  <p className="text-[10px] text-muted-foreground">Quanto mais você participa, mais ganha!</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span>Próximo Nível</span>
                  <span className="text-primary">XP: 450/1000</span>
                </div>
                <div className="h-2 rounded-full bg-background overflow-hidden border border-border/50">
                  <div className="h-full w-[45%] bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                </div>
                <p className="text-[10px] text-center text-muted-foreground italic">
                  "Membros VIP têm 2x mais chances na Caixa Misteriosa!"
                </p>
              </div>
              <Button variant="secondary" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest">
                Ver Benefícios
              </Button>
            </div>
           </div>
         </div>
       </div>
 
       <PurchaseAnimation 
         isVisible={showSuccess} 
         onComplete={() => {
           setShowSuccess(false);
           toast.success("Redirecionando para o pagamento...");
         }} 
       />
 
      <Footer />
    </div>
  );
};

export default CampaignDetail;
