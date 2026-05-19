 import { useState, useMemo, useEffect } from "react";
  import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Calendar, ArrowLeft, Shield, Trophy, Users, Share2, Loader2, CheckCircle2,
     Gift, Award, TrendingUp, Info, Zap, MousePointer2, Sparkles, BookOpen, Star, Crown, Ticket, RotateCw, Gamepad2, Activity
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
      if (!userSpins) return 0;
      // Count spins that have no prize label (pre-awarded but not yet used)
      return userSpins.filter((s: any) => !s.prize_label).length;
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
       {/* Sticky Mobile Purchase Bar */}
       <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-lg border-t border-border lg:hidden animate-in fade-in slide-in-from-bottom-4">
         <div className="flex items-center gap-4">
           <div className="flex-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Valor por cota</p>
             <p className="text-lg font-black text-primary italic">R$ {Number(campaign.ticket_price).toFixed(2).replace(".", ",")}</p>
           </div>
           <Button 
             className="flex-[2] h-12 rounded-2xl font-black uppercase tracking-wide glow-primary"
             onClick={() => {
               const element = document.getElementById('purchase-tabs');
               element?.scrollIntoView({ behavior: 'smooth' });
             }}
           >
             <Sparkles className="mr-2 h-4 w-4" /> Comprar Agora
           </Button>
         </div>
       </div>
 
       <Footer />
      </div>
    );
  }

  const isActive = campaign.status === "active";
  const drawDate = campaign.draw_date ? new Date(campaign.draw_date).toLocaleDateString("pt-BR") : "";
  const drawTime = campaign.draw_date ? new Date(campaign.draw_date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";

   return (
     <div className="min-h-screen bg-slate-50">
       <Header />
       
       {/* Hero Image Section */}
       <div className="w-full bg-black relative aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1] overflow-hidden mt-14">
         <RaffleGallery 
           images={campaign.gallery_urls && campaign.gallery_urls.length > 0 ? campaign.gallery_urls : [campaign.image_url || ""]} 
           videoUrl={campaign.video_url} 
         />
         <div className="absolute bottom-4 right-4 z-10">
           <Button size="sm" variant="secondary" className="bg-black/60 text-white backdrop-blur-md border-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider px-4">
             <Ticket className="mr-2 h-3 w-3" /> Ver meus títulos
           </Button>
         </div>
       </div>
 
       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container py-6 space-y-6">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
           <div className="space-y-1">
             <h1 className="text-2xl font-black text-slate-900 leading-tight">{campaign.title}</h1>
              <p className="text-sm text-slate-600 font-medium">{campaign.subtitle}</p>
           </div>
           <div className="flex items-center gap-2">
             <Badge variant={isActive ? "default" : "secondary"} className="rounded-full px-4 h-6 text-[10px] font-bold uppercase tracking-wider">
               {isActive ? "Sorteio Ativo" : "Concluído"}
             </Badge>
             {drawDate && (
               <Badge variant="outline" className="rounded-full px-4 h-6 text-[10px] font-bold uppercase tracking-wider bg-white">
                 <Calendar className="mr-1.5 h-3 w-3" /> {drawDate}
               </Badge>
             )}
           </div>
         </div>
 
         {/* Progress Bar Section */}
         <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
           <div className="flex items-center justify-between">
              <span className="text-sm font-black text-slate-900 italic">{progress}% <span className="text-slate-500 not-italic font-bold">concluído</span></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{campaign.sold_tickets.toLocaleString("pt-BR")} vendidos</span>
           </div>
           <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }} 
               animate={{ width: `${progress}%` }} 
               transition={{ duration: 1.5 }}
               className="h-full bg-primary rounded-full"
             />
           </div>
         </div>
 
         <div className="grid gap-6 lg:grid-cols-3">
           <div className="lg:col-span-2 space-y-6">
             {/* Purchase Area */}
             <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden" id="purchase-tabs">
               <Tabs defaultValue="auto" className="w-full">
                 {canManualSelect && (
                   <div className="px-6 pt-6">
                     <TabsList className="grid w-full grid-cols-2 h-12 bg-slate-100 rounded-2xl p-1">
                       <TabsTrigger value="auto" className="rounded-xl gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                         <Zap className="h-4 w-4" /> Automático
                       </TabsTrigger>
                       <TabsTrigger value="manual" className="rounded-xl gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                         <MousePointer2 className="h-4 w-4" /> Manual
                       </TabsTrigger>
                     </TabsList>
                   </div>
                 )}
 
                 <TabsContent value="auto" className="p-6">
                   <CampaignPricing campaign={campaign} onBuy={handleBuy} />
                 </TabsContent>
 
                 <TabsContent value="manual" className="p-6">
                   <div className="space-y-6">
                      <p className="text-xs text-slate-600 text-center font-bold uppercase tracking-widest">Escolha seus números da sorte abaixo</p>
                     <TicketGrid 
                       totalTickets={campaign.total_tickets}
                       soldTickets={[...soldTickets, ...protectedNumbers]}
                       selectedTickets={selectedTickets}
                       onSelect={handleToggleTicket}
                       luckyNumbers={luckyNumbersList}
                     />
                     <Button 
                       className="w-full h-14 rounded-2xl font-black uppercase tracking-wide"
                       disabled={selectedTickets.length === 0 || isPurchasing}
                       onClick={() => handleBuy(selectedTickets)}
                     >
                       {isPurchasing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                       Reservar Números
                     </Button>
                   </div>
                 </TabsContent>
               </Tabs>
             </div>
 
             {/* Info Sections */}
             <CampaignPublicInfo campaign={campaign} />
 
             {/* Instant Prizes Section (Cotas Premiadas) */}
             {luckyNumbers.length > 0 && (
               <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
                 <div className="flex items-center justify-between">
                   <h3 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2">
                     <Trophy className="h-5 w-5 text-amber-500" /> Cotas Premiadas
                   </h3>
                   <Badge variant="outline" className="rounded-full bg-slate-50 text-[10px] font-bold">
                     {availableInstantPrizes} disponíveis
                   </Badge>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                   {luckyNumbers.map((p: any, i: number) => (
                     <div 
                       key={i} 
                       className={cn(
                         "flex items-center justify-between p-4 rounded-2xl border transition-all",
                         luckyNumbersStatus[p.number] 
                           ? "bg-slate-50 border-slate-100 opacity-60" 
                           : "bg-amber-500/5 border-amber-500/10 hover:border-amber-500/30"
                       )}
                     >
                       <div className="flex items-center gap-3">
                         <div className={cn(
                           "h-10 w-10 rounded-xl flex items-center justify-center font-black italic text-sm",
                           luckyNumbersStatus[p.number] ? "bg-slate-200 text-slate-400" : "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                         )}>
                           #{p.number}
                         </div>
                         <div className="text-left">
                           <p className={cn("text-xs font-black uppercase tracking-tight", luckyNumbersStatus[p.number] ? "text-slate-400" : "text-slate-900")}>
                             {p.prize}
                           </p>
                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                             {luckyNumbersStatus[p.number] ? "Já sorteado" : "Disponível"}
                           </p>
                         </div>
                       </div>
                       {luckyNumbersStatus[p.number] && (
                         <CheckCircle2 className="h-4 w-4 text-slate-300" />
                       )}
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {campaign.description && (
               <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-4">
                 <h3 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2">
                   <Info className="h-5 w-5 text-primary" /> Descrição
                 </h3>
                 <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                   {campaign.description}
                 </div>
               </div>
             )}
           </div>
 
             <div className="space-y-6">
                {/* Roulette Incentive Section */}
                {campaign.roulette_enabled && campaign.roulette_rules && (campaign.roulette_rules as any[]).length > 0 && (
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-sm font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-2">
                      <RotateCw className="h-4 w-4 text-primary" /> Promoção da Roleta
                    </h3>
                    <div className="space-y-2">
                      {(campaign.roulette_rules as any[]).map((rule, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                          <span className="text-[11px] font-bold text-slate-700">Compre +{rule.min_tickets} cotas</span>
                          <Badge className="bg-primary text-white border-none text-[10px] font-black uppercase tracking-wider">
                            Ganha {rule.spins} {rule.spins > 1 ? 'Giros' : 'Giro'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

               {/* Compact Games Section */}
               {(campaign.roulette_enabled || campaign.mystery_box_enabled) && (
                 <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                   <h3 className="text-sm font-black uppercase italic tracking-tighter text-slate-900 flex items-center gap-2">
                     <Gamepad2 className="h-4 w-4 text-primary" /> Jogos Instantâneos
                   </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {campaign.roulette_enabled && roulettePrizes && roulettePrizes.length > 0 && (
                       <Dialog>
                         <DialogTrigger asChild>
                           <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/50 hover:bg-white transition-all group">
                             <div className="flex items-center gap-3">
                               <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:rotate-180 transition-transform duration-500">
                                 <RotateCw className="h-5 w-5" />
                               </div>
                               <div className="text-left">
                                 <p className="text-xs font-black uppercase tracking-tight text-slate-900">Roleta Premiada</p>
                                 <p className="text-[10px] font-medium text-slate-500">Gire e ganhe prêmios agora</p>
                               </div>
                             </div>
                             <div className="flex items-center gap-2">
                               <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black">{userSpinsAvailable} Giros</Badge>
                               <ArrowLeft className="h-4 w-4 text-slate-300 rotate-180" />
                             </div>
                           </button>
                         </DialogTrigger>
                         <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
                            <Roulette prizes={roulettePrizes} campaign={campaign} availableSpins={userSpinsAvailable} />
                         </DialogContent>
                       </Dialog>
                     )}

                     {campaign.mystery_box_enabled && mysteryBoxes && mysteryBoxes.length > 0 && (
                       <MysteryBox boxes={mysteryBoxes} isCompact />
                     )}
                   </div>
                 </div>
               )}

               {/* Sidebar Content */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
               <h3 className="text-sm font-black uppercase italic tracking-tighter text-slate-900">Como participar</h3>
               <div className="space-y-4">
                 {[
                   { icon: Ticket, title: "1. Escolha", desc: "Selecione seus números" },
                   { icon: Zap, title: "2. Pague", desc: "Confirmação rápida via PIX" },
                   { icon: Trophy, title: "3. Concorra", desc: "Aguarde o sorteio oficial" },
                 ].map((step, i) => (
                   <div key={i} className="flex items-center gap-4">
                     <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                       <step.icon className="h-5 w-5 text-primary" />
                     </div>
                     <div>
                       <p className="text-xs font-black uppercase tracking-tight text-slate-900">{step.title}</p>
                       <p className="text-[10px] font-medium text-slate-500">{step.desc}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
 
            </div>
          </div>

          {/* Compact Inline Statistics Section */}
          <section className="space-y-4 pt-10 border-t border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-1.5 italic">
                  <Activity className="h-3.5 w-3.5 text-primary" /> Live <span className="text-primary">Stats</span>
                </h2>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Atualizado agora</span>
            </div>

            <div className="flex flex-col gap-2">
              {/* Unified Compact Ticker-style Row */}
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 px-2">
                {/* Priority Ranking Info */}
                {campaign.ranking_enabled && campaignRanking?.slice(0, 3).map((rank: any, i: number) => (
                  <div key={`rank-${i}`} className="flex-shrink-0 flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-slate-100 shadow-sm">
                    <div className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black",
                      i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                    )}>
                      #{i + 1}
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">{rank.name}</span>
                    <Badge variant="outline" className="h-5 px-1.5 text-[8px] border-amber-200 text-amber-600 font-black">{rank.total_tickets} cotas</Badge>
                  </div>
                ))}

                {/* Live Activity Stream */}
                {[...(instantWinners || []), ...(rouletteWinners || [])]
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 8)
                  .map((activity, i) => (
                    <div key={`act-${i}`} className="flex-shrink-0 flex items-center gap-2 bg-slate-50/80 px-3 py-2 rounded-full border border-slate-100/50">
                      <Avatar className="h-6 w-6 border border-white shadow-sm">
                        <AvatarImage src={activity.profiles?.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-black">
                          {activity.profiles?.name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-[11px] font-medium text-slate-600 whitespace-nowrap">
                        <span className="font-bold text-slate-900">{activity.profiles?.name?.split(' ')[0] || "Usuário"}</span>
                        <span className="mx-1.5 text-slate-400">ganhou</span>
                        <span className="text-primary font-black uppercase italic text-[10px]">{(activity as any).prize_label || (activity as any).prize_title}</span>
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        </motion.div>
 
       <PurchaseAnimation 
         isVisible={showSuccess} 
         onComplete={() => {
           setShowSuccess(false);
           toast.success("Redirecionando para o pagamento...");
         }} 
       />
 
       <Footer />
       
       {/* Sticky Mobile Purchase Bar */}
       <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-lg border-t lg:hidden">
         <div className="flex items-center gap-4">
           <div className="flex-1">
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor cota</p>
             <p className="text-lg font-black text-primary">R$ {Number(campaign.ticket_price).toFixed(2).replace(".", ",")}</p>
           </div>
           <Button 
             className="flex-[2] h-12 rounded-2xl font-black uppercase"
             onClick={() => {
               const element = document.getElementById('purchase-tabs');
               element?.scrollIntoView({ behavior: 'smooth' });
             }}
           >
             Comprar agora
           </Button>
         </div>
       </div>
     </div>
   );
};

export default CampaignDetail;
