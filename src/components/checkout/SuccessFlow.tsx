import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, ArrowRight, Video, Users, ExternalLink, 
  Ticket, Sparkles, Clock, Star, Play, Gift, 
  ChevronRight, AlertCircle, Share2, Instagram, MessageCircle, Crown, ShoppingCart, Percent, TrendingUp,
  Trophy, PartyPopper
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import Roulette from "@/components/Roulette";
import ScratchCard from "@/components/ScratchCard";
import { supabase } from "@/integrations/supabase/client";
import { useCampaigns } from "@/hooks/useData";
import { toast } from "sonner";

interface SuccessFlowProps {
  order: any;
  campaign: any;
}

export default function SuccessFlow({ order, campaign }: SuccessFlowProps) {
  const [step, setStep] = useState(1);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [availableSpins, setAvailableSpins] = useState(0);
  const [availableScratchCards, setAvailableScratchCards] = useState(0);
  const [prizes, setPrizes] = useState<any[]>([]);
  const [localTickets, setLocalTickets] = useState<any[]>([]);
  const [hasCheckedLucky, setHasCheckedLucky] = useState(false);
  const { data: otherCampaigns } = useCampaigns();
  const navigate = useNavigate();

  const displayTickets = useMemo(() => {
    return localTickets.length > 0 ? localTickets : (order.tickets || []);
  }, [localTickets, order.tickets]);

  const premiumTickets = useMemo(() => {
    return displayTickets.filter((t: any) => t.is_lucky);
  }, [displayTickets]);

  useEffect(() => {
    if (order.payment_status === 'paid') {
      fetchRewards();
      
      const fetchAllTickets = async () => {
        const { data } = await supabase
          .from('tickets')
          .select('*')
          .eq('order_id', order.id);
        
        if (data && data.length > 0) {
          setLocalTickets(data);
          setHasCheckedLucky(true);
        } else {
          // Retry logic if tickets aren't ready
          setTimeout(fetchAllTickets, 2000);
        }
      };

      fetchAllTickets();
    }
  }, [order]);

  // Handle automatic transitions
  useEffect(() => {
    if (step === 1 && hasCheckedLucky) {
      const timer = setTimeout(() => {
        if (premiumTickets.length > 0) {
          setStep(0); // Show premium tickets step
        } else if (availableSpins > 0) {
          setStep(2); // Go to roulette
        } else if (availableScratchCards > 0) {
          setStep(5); // Go to scratch cards
        } else {
          setStep(3); // Go to upsell
        }
      }, 3000); // Wait 3 seconds on "Payment Identified" screen
      return () => clearTimeout(timer);
    }
  }, [step, hasCheckedLucky, premiumTickets, availableSpins, availableScratchCards]);

  useEffect(() => {
    if (step === 3) {
      const timer = setInterval(() => {
        setCountdown(prev => prev > 0 ? prev - 1 : 0);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  const fetchRewards = async () => {
    const spinRule = campaign.roulette_rules?.find((r: any) => order.quantity >= r.min_tickets);
    if (spinRule) {
      setAvailableSpins(spinRule.spins);
    } else if (campaign.roulette_free_tickets > 0) {
      setAvailableSpins(Math.floor(order.quantity / campaign.roulette_free_tickets));
    }

    if (campaign.scratch_cards_enabled) {
      const scratchRule = campaign.scratch_card_rules?.find((r: any) => order.quantity >= r.min_tickets);
      if (scratchRule) {
        setAvailableScratchCards(scratchRule.scratches || 1);
      } else {
        setAvailableScratchCards(1);
      }
    }

    const { data } = await supabase.from('roulette_prizes').select('*').eq('campaign_id', campaign.id);
    if (data) setPrizes(data);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="w-full space-y-6">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <Card className="border-none bg-black/40 backdrop-blur-xl border border-white/5 overflow-hidden rounded-3xl">
              <CardContent className="p-8 text-center space-y-6">
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="mx-auto h-24 w-24 rounded-full bg-amber-500 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.5)]"
                >
                  <Trophy className="h-12 w-12 text-white" />
                </motion.div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-amber-500">COTA PREMIADA!</h2>
                  <p className="text-white/80 font-bold">PARABÉNS! Você encontrou {premiumTickets.length} cota(s) premiada(s)!</p>
                </div>

                <div className="grid gap-3">
                  {premiumTickets.map((ticket: any) => (
                    <div key={ticket.id} className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center font-black text-white">#{ticket.number}</div>
                        <div className="text-left">
                          <p className="text-xs font-black uppercase tracking-widest text-amber-500">Prêmio Instantâneo</p>
                          <p className="text-sm font-bold text-white">Consulte seu prêmio no regulamento</p>
                        </div>
                      </div>
                      <PartyPopper className="h-6 w-6 text-amber-500 animate-bounce" />
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => {
                    if (availableSpins > 0) setStep(2);
                    else if (availableScratchCards > 0) setStep(5);
                    else setStep(3);
                  }} 
                  className="w-full h-16 rounded-2xl bg-amber-500 text-white font-black uppercase italic tracking-widest text-lg shadow-lg hover:scale-105 transition-transform"
                >
                  CONTINUAR MINHA SORTE
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <Card className="border-none bg-black/40 backdrop-blur-xl border border-white/5 overflow-hidden rounded-3xl">
              <CardContent className="p-8 text-center space-y-6">
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }} 
                  animate={{ scale: 1, rotate: 0 }} 
                  className="mx-auto h-24 w-24 rounded-full bg-primary flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary-rgb),0.5)]"
                >
                  <CheckCircle2 className="h-12 w-12 text-black" />
                </motion.div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">Pagamento Identificado!</h2>
                  <p className="text-white/60 font-medium">Seu pagamento foi aprovado com sucesso.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 text-left">
                  <div className="h-12 w-12 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={campaign.image_url} alt={campaign.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black uppercase truncate">{campaign.title}</p>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Cotas Adquiridas: {order.quantity}</p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: "100%" }} 
                      transition={{ duration: 3 }}
                      className="h-full bg-primary"
                    />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 animate-pulse">
                    Verificando seus prêmios instantâneos...
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-black uppercase italic tracking-tighter">Sua Sorte Instantânea</h2>
               <Badge className="bg-primary text-black font-bold">{availableSpins} giros restantes</Badge>
            </div>
            
            <Roulette 
              prizes={prizes} 
              campaign={campaign} 
              availableSpins={availableSpins}
              onSpinComplete={() => {
                setAvailableSpins(prev => prev - 1);
                if (availableSpins <= 1) {
                  setTimeout(() => setStep(3), 5000);
                }
              }}
            />
            
            <Button variant="outline" className="w-full rounded-2xl border-white/10 text-white/60" onClick={() => setStep(3)}>
              Continuar para próxima etapa
            </Button>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step5" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-black uppercase italic tracking-tighter">Raspadinha da Sorte</h2>
               <Badge className="bg-primary text-black font-bold">{availableScratchCards} restantes</Badge>
            </div>
            
            <ScratchCard 
              campaignId={campaign.id}
              onComplete={() => {
                setAvailableScratchCards(prev => prev - 1);
                if (availableScratchCards <= 1) {
                  setTimeout(() => setStep(3), 3000);
                }
              }}
            />
            
            <Button variant="outline" className="w-full rounded-2xl border-white/10 text-white/60" onClick={() => setStep(3)}>
              Continuar para próxima etapa
            </Button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div className="text-center space-y-2">
              <Badge className="bg-destructive text-white animate-bounce mb-2">OFERTA ÚNICA E EXCLUSIVA</Badge>
              <p className="text-xs font-black uppercase tracking-widest text-white/40">Sua chance expira em:</p>
              <p className="text-4xl font-black text-destructive font-mono tracking-tighter shadow-destructive/20 drop-shadow-lg">{formatTime(countdown)}</p>
            </div>

            <Card className="border-none bg-black/40 backdrop-blur-xl border border-white/5 overflow-hidden rounded-3xl shadow-2xl">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-zinc-900 flex items-center justify-center group cursor-pointer border-b border-white/5">
                  {campaign.upsell_video_url ? (
                    <iframe 
                      src={campaign.upsell_video_url} 
                      className="w-full h-full" 
                      allow="autoplay; fullscreen" 
                      allowFullScreen
                    />
                  ) : (
                    <img src={campaign.image_url} alt={campaign.title} className="w-full h-full object-cover opacity-60" />
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-destructive text-white gap-2 font-black italic shadow-lg">
                      <span className="h-2 w-2 rounded-full bg-white animate-ping" /> OPORTUNIDADE DE OURO
                    </Badge>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="text-center space-y-3">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-tight text-white">
                      ATENÇÃO, {(order.profiles?.name || "Campeão").split(' ')[0]}! <br />
                      <span className="text-primary text-animate-gradient">ESTRATÉGIA DE CHANCES ATIVADA!</span>
                    </h2>
                    <p className="text-sm text-white/80 font-bold leading-relaxed">
                      O sistema identificou que você está no 'Fluxo de Sorte'. Comprar mais cotas AGORA aumenta em <span className="text-primary">90% suas chances de ser sorteado</span> e ser o grande vencedor!
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Percent className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-xs font-black uppercase text-white/70">Desconto Exclusivo Liberado</span>
                      </div>
                      <Badge className="bg-green-500 text-white font-black italic">ATIVO!</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Sua probabilidade de vitória subiu para 90%</span>
                    </div>
                    <Progress value={90} className="h-3 bg-white/5" indicatorClassName="bg-primary" />
                  </div>

                  <div className="space-y-4">
                    <Link to={`/campanha/${campaign.slug}?upsell=true`}>
                      <Button className="w-full h-20 rounded-2xl bg-primary text-black font-black uppercase italic tracking-widest text-xl shadow-[0_15px_30px_rgba(var(--primary-rgb),0.4)] hover:scale-[1.02] transition-transform animate-pulse border-b-4 border-black/20">
                        GARANTIR MAIS CHANCES AGORA
                      </Button>
                    </Link>
                    
                    <Button variant="ghost" className="w-full text-white/30 hover:text-white/60 font-bold uppercase tracking-widest text-[10px]" onClick={() => setStep(4)}>
                      Ver meus números e entrar no grupo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <Card className="border-none bg-black/40 backdrop-blur-xl border border-white/5 overflow-hidden rounded-3xl">
              <CardContent className="p-8 text-center space-y-8">
                <div className="space-y-4">
                  <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-xl">
                    <Crown className="h-10 w-10 text-black" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">ENTRA PRO TIME VIP.</h2>
                    <p className="text-white/60 text-sm font-medium">Fique por dentro de sorteios exclusivos e ganhe cotas grátis toda semana!</p>
                  </div>
                </div>

                {campaign.vip_group_link && (
                  <div className="space-y-4">
                    <a href={campaign.vip_group_link} target="_blank" rel="noopener noreferrer" className="block">
                      <Button className="w-full h-16 rounded-2xl bg-primary text-black font-black uppercase italic tracking-widest text-lg shadow-lg hover:scale-[1.02] transition-transform">
                        QUERO ENTRAR NO VIP <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </a>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Acesso imediato ao grupo oficial</p>
                  </div>
                )}

                <div className="pt-8 border-t border-white/5 space-y-6 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Seus Números Adquiridos</h3>
                    <Badge variant="outline" className="border-primary/30 text-primary font-black uppercase tracking-widest text-[10px]">{order.quantity} Títulos</Badge>
                  </div>
                  
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {displayTickets.map((ticket: any, i: number) => (
                      <div key={i} className="aspect-square rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/80">
                        {ticket.number}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full h-14 rounded-2xl font-black uppercase italic tracking-widest bg-white/10 text-white hover:bg-white/20 border-white/10"
                    onClick={() => navigate(`/campanha/${campaign.slug}`)}
                  >
                    VOLTAR PARA A RIFA
                  </Button>
                  <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Obrigado pela sua participação e boa sorte!</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}