import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, ArrowRight, Video, Users, ExternalLink, 
  Ticket, Sparkles, Clock, Star, Play, Gift, 
  ChevronRight, AlertCircle, Share2, Instagram, MessageCircle, Crown, ShoppingCart, Percent, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import Roulette from "@/components/Roulette";
import ScratchCard from "@/components/ScratchCard";
import { supabase } from "@/integrations/supabase/client";
import { useCampaigns } from "@/hooks/useData";

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

  useEffect(() => {
    if (order.payment_status === 'paid') {
      fetchRewards();
    }
  }, [order]);

  useEffect(() => {
    if (step === 3) {
      const timer = setInterval(() => {
        setCountdown(prev => prev > 0 ? prev - 1 : 0);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  const fetchRewards = async () => {
    // Check if user has roulette spins
    const spinRule = campaign.roulette_rules?.find((r: any) => order.quantity >= r.min_tickets);
    if (spinRule) {
      setAvailableSpins(spinRule.spins);
    } else if (campaign.roulette_free_tickets > 0) {
      setAvailableSpins(Math.floor(order.quantity / campaign.roulette_free_tickets));
    }

    // Check if user has scratch cards
    if (campaign.scratch_cards_enabled) {
      const scratchRule = campaign.scratch_card_rules?.find((r: any) => order.quantity >= r.min_tickets);
      if (scratchRule) {
        setAvailableScratchCards(scratchRule.scratches || 1);
      } else {
        // Default 1 scratch card for buying anything if enabled and no specific rule
        setAvailableScratchCards(1);
      }
    }

    // Fetch roulette prizes for this campaign
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

                {(availableSpins > 0 || availableScratchCards > 0) && (
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col gap-4">
                    {availableSpins > 0 && (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-primary animate-pulse" />
                          <p className="text-sm font-bold text-primary">Você ganhou {availableSpins} giro(s)!</p>
                        </div>
                        <Button size="sm" onClick={() => setStep(2)} className="rounded-xl font-bold bg-primary text-black hover:bg-primary/90">GIRAR AGORA</Button>
                      </div>
                    )}
                    
                    {availableScratchCards > 0 && (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Gift className="h-5 w-5 text-primary animate-pulse" />
                          <p className="text-sm font-bold text-primary">Você ganhou {availableScratchCards} raspadinha(s)!</p>
                        </div>
                        <Button size="sm" onClick={() => setStep(5)} className="rounded-xl font-bold bg-primary text-black hover:bg-primary/90">RASPAR AGORA</Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4 pt-4">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-destructive/20 to-orange-500/20 border border-destructive/30 text-center space-y-4 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                    <div className="flex justify-center gap-2 items-center">
                      <AlertCircle className="h-6 w-6 text-destructive animate-pulse" />
                      <h3 className="text-xl font-black uppercase italic tracking-tighter text-destructive">Presta muita atenção!</h3>
                      <AlertCircle className="h-6 w-6 text-destructive animate-pulse" />
                    </div>
                    <p className="text-sm text-white/90 font-bold">Você acaba de ganhar uma oportunidade de mudar de vida! Clica no botão abaixo 👇</p>
                    <Button onClick={() => setStep(3)} className="w-full h-16 rounded-2xl bg-green-500 text-white font-black uppercase italic tracking-widest text-lg shadow-[0_10px_20px_rgba(34,197,94,0.3)] hover:scale-105 transition-transform border-b-4 border-green-700">
                      PEGAR AGORA
                    </Button>
                  </div>

                  <Button variant="ghost" className="text-white/40 hover:text-white font-bold uppercase tracking-widest text-xs" onClick={() => setStep(4)}>
                    Pular e ver meus números
                  </Button>
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

        {step === 3 && (
          <motion.div key="step3" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-xs font-black uppercase tracking-widest text-white/40">Seja rápido, você só tem:</p>
              <p className="text-4xl font-black text-destructive font-mono tracking-tighter">{formatTime(countdown)}</p>
            </div>

            <Card className="border-none bg-black/40 backdrop-blur-xl border border-white/5 overflow-hidden rounded-3xl">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-zinc-900 flex items-center justify-center group cursor-pointer">
                  {campaign.upsell_video_url ? (
                    <iframe 
                      src={campaign.upsell_video_url} 
                      className="w-full h-full" 
                      allow="autoplay; fullscreen" 
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Play className="h-8 w-8 fill-current" />
                      </div>
                      <p className="text-sm font-bold uppercase tracking-widest opacity-40">Assista ao vídeo</p>
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-destructive text-white gap-2 font-black italic">
                      <span className="h-2 w-2 rounded-full bg-white animate-ping" /> CONVITE
                    </Badge>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-tight">
                      ATENÇÃO, {(order.profiles?.name || "Campeão").split(' ')[0]}! <br />
                      <span className="text-primary">VOCÊ ATIVOU O MÁXIMO DE SORTE!</span>
                    </h2>
                    <p className="text-sm text-white/60 font-medium">
                      {campaign.upsell_offer_text || "Quem é de dentro ganha primeiro. Garanta agora mais números com 98% de chance de sair a cota premiada!"}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                        <span>Probabilidade de sair a cota premiada</span>
                        <span className="text-primary">{campaign.upsell_probability || "98%"}</span>
                      </div>
                      <Progress value={98} className="h-4 bg-white/5 border border-white/10" indicatorClassName="bg-gradient-to-r from-destructive via-orange-500 to-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                      <p className="text-[10px] font-bold text-destructive uppercase tracking-widest text-center italic">Risco altíssimo — Compre agora por esta página</p>
                    </div>

                    <Link to={`/campanha/${campaign.slug}`}>
                      <Button className="w-full h-16 rounded-2xl bg-primary text-black font-black uppercase italic tracking-widest text-xl shadow-[0_15px_30px_rgba(var(--primary-rgb),0.4)] hover:scale-[1.02] transition-transform">
                        PEGAR MINHA SORTE AGORA
                      </Button>
                    </Link>
                    
                    <Button variant="ghost" className="w-full text-white/30 hover:text-white/60 font-bold uppercase tracking-widest text-[10px]" onClick={() => setStep(4)}>
                      Não quero aumentar minhas chances
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

                <div className="space-y-3">
                  {[
                    "Sorteios relâmpago só pra membros",
                    "Cotas grátis toda semana",
                    `Canal VIP no WhatsApp do ${campaign.title.split(' ')[0]}`
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 text-left">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-xs font-bold text-white/80">{text}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <a href={campaign.vip_group_link || "#"} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full h-16 rounded-2xl bg-primary text-black font-black uppercase italic tracking-widest text-lg shadow-[0_10px_20px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02] transition-transform">
                      QUERO ENTRAR NO VIP <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Acesso imediato • Cancela quando quiser</p>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-6 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Seus Números</h3>
                    <Badge variant="outline" className="border-primary/30 text-primary font-black uppercase tracking-widest text-[10px]">{order.quantity} Títulos</Badge>
                  </div>
                  
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {order.tickets?.map((ticket: any, i: number) => (
                      <div key={i} className="bg-primary/10 border border-primary/20 text-primary font-black text-[10px] py-1.5 rounded-lg text-center tracking-tighter">
                        {ticket.number}
                      </div>
                    ))}
                    {(!order.tickets || order.tickets.length === 0) && (
                      <div className="col-span-full py-4 text-center bg-white/5 rounded-xl border border-dashed border-white/10">
                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Seus números estão sendo gerados...</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    <Link to="/conta">
                      <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 hover:bg-white/5 font-bold uppercase tracking-widest text-xs gap-2">
                        Ver na minha área do cliente <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <div className="flex gap-3">
                      <Button variant="ghost" className="flex-1 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-500 font-bold text-xs gap-2">
                        <MessageCircle className="h-4 w-4" /> Compartilhar
                      </Button>
                      <Button variant="ghost" className="flex-1 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 font-bold text-xs gap-2">
                        <Instagram className="h-4 w-4" /> Seguir Canal
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {step === 5 && (
          <motion.div key="step5" variants={containerVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-black uppercase italic tracking-tighter">Sua Raspadinha da Sorte</h2>
               <Badge className="bg-primary text-black font-bold">{availableScratchCards} restantes</Badge>
            </div>
            
            <ScratchCard 
              campaignId={campaign.id} 
              onComplete={() => {
                setAvailableScratchCards(prev => prev - 1);
                if (availableScratchCards <= 1) {
                  setTimeout(() => setStep(3), 5000);
                }
              }}
            />
            
            <Button variant="outline" className="w-full rounded-2xl border-white/10 text-white/60" onClick={() => setStep(3)}>
              Continuar para próxima etapa
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
