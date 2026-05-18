import confetti from 'canvas-confetti';
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
 import { RotateCw, Star, Trophy, Users, Zap, ShoppingCart, Sparkles, Coins, Gift, Info, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
 import { RoulettePrize, Campaign, useGlobalRouletteSpins } from "@/hooks/useData";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { playSound as playGlobalSound, hapticFeedback } from "@/lib/sounds";

interface RouletteProps {
  prizes: RoulettePrize[];
  onSpinComplete?: (prize: RoulettePrize) => void;
  campaign: Campaign;
  availableSpins?: number;
}

const SOUND_URLS = {
  spin: "https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3",
  win: "https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3",
  tick: "https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3"
};

 const Roulette = ({ prizes, onSpinComplete, campaign, availableSpins = 0 }: RouletteProps) => {
   const { data: globalSpins } = useGlobalRouletteSpins(10);
   const [isSpinning, setIsSpinning] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [wonPrize, setWonPrize] = useState<RoulettePrize | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const controls = useAnimation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', user?.id).single();
    setUserProfile(data);
  };


  const getWeightedPrize = () => {
    const totalWeight = prizes.reduce((acc, p) => acc + (Number(p.chance_percent) || 0), 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < prizes.length; i++) {
      if (random < (Number(prizes[i].chance_percent) || 0)) {
        return { prize: prizes[i], index: i };
      }
      random -= (Number(prizes[i].chance_percent) || 0);
    }
    return { prize: prizes[0], index: 0 };
  };

  const spin = async () => {
    if (isSpinning || prizes.length === 0) return;
    
    if (!user) {
      toast.error("Você precisa estar logado para girar a roleta!");
      return;
    }
    
    const spinCost = Number(campaign.roulette_spin_cost || 0);
    const isUsingFreeSpins = availableSpins >= multiplier;
    const totalCost = isUsingFreeSpins ? 0 : spinCost * multiplier;

    if (!isUsingFreeSpins && spinCost === 0 && availableSpins < multiplier) {
      toast.error(`Você não possui giros suficientes! Compre mais cotas para ganhar giros.`);
      return;
    }

    if (totalCost > 0 && (userProfile?.balance || 0) < totalCost) {
      toast.error(`Saldo insuficiente! O giro custa R$ ${totalCost.toFixed(2)}`);
      return;
    }

    setIsSpinning(true);
    playGlobalSound('shake'); // using shake for spin start
    hapticFeedback();

    // Initial vibration effect
    await controls.start({
      scale: [1, 1.05, 1],
      transition: { duration: 0.2 }
    });

    // Call secure server-side RPC to process the spin
    const { data: result, error: spinError } = await supabase.rpc('process_roulette_spin', {
      p_campaign_id: campaign.id,
      p_multiplier: multiplier
    });

    if (spinError) {
      setIsSpinning(false);
      toast.error(spinError.message || "Erro ao processar o giro.");
      return;
    }

    const { prize: wonPrizeData, final_value, is_free, new_balance } = result as any;
    const prize = wonPrizeData as RoulettePrize;
    
    // Find the index of the won prize to animate correctly
    const randomIndex = prizes.findIndex(p => p.id === prize.id);
    
    const segmentAngle = 360 / (prizes.length || 1);
    const extraSpins = 8; // More spins for dramatic effect
    const baseRotation = extraSpins * 360;
    // Calculate target angle to land in the middle of the segment
    // We need to rotate the wheel clockwise, so the target index moves under the pointer
    const targetAngle = baseRotation + (randomIndex * segmentAngle);
    
    await controls.start({
      rotate: targetAngle,
      transition: { 
        duration: 6, 
        ease: [0.2, 0, 0.1, 1] // Custom cubic-bezier for "cinematic" feel (starts fast, slow motion end)
      }
    });
    
    playGlobalSound('win');
    setWonPrize(prize);
    setShowWinAnimation(true);

    // Update local state with new data from server
    queryClient.invalidateQueries({ queryKey: ["roulette_spins"] });
    queryClient.invalidateQueries({ queryKey: ["user-campaign-spins"] });
    setUserProfile(prev => ({ ...prev, balance: new_balance }));

    // Add notification (this could also be moved to a DB trigger for better security, but leaving here for now as it's less critical)
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Você ganhou na roleta!",
      message: `Parabéns! Você ganhou ${prize.label}${multiplier > 1 ? ` (x${multiplier})` : ''} na Roleta da Sorte.`,
      type: "win"
    });

    setIsSpinning(false);
    
    // Celebration
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: [prize.color || '#FACC15', '#ffffff']
    });

    toast.success(`Parabéns! Você ganhou: ${prize.label}${multiplier > 1 ? ` x${multiplier}` : ''}!`);
    
    setTimeout(() => {
      setShowWinAnimation(false);
      setWonPrize(null);
    }, 5000);

    if (onSpinComplete) onSpinComplete(prize);
  };

  return (
    <div className="flex flex-col items-center gap-8 py-10 relative overflow-hidden rounded-3xl bg-black/40 border border-white/5 backdrop-blur-xl">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden rounded-3xl">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="flex flex-col items-center gap-4 z-10">
        <div className="flex items-center gap-3 w-full justify-center">
          <Badge className="bg-destructive/90 hover:bg-destructive text-white animate-pulse flex items-center gap-2 text-xs font-black px-3 py-1 border-none shadow-[0_0_15px_rgba(239,68,68,0.5)] uppercase italic">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" /> AO VIVO
          </Badge>
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md transition-colors">
                <FileText className="h-3.5 w-3.5 text-primary" /> 
                Regras
              </button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-black italic uppercase italic tracking-tighter flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Regras da Roleta
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase text-primary tracking-widest italic">Giros Grátis</h4>
                  <p className="text-sm text-white/70 leading-relaxed">
                    Você ganha <span className="text-white font-bold">1 giro grátis</span> automaticamente a cada <span className="text-white font-bold">{campaign.roulette_free_tickets} cotas pagas</span> nesta campanha.
                    Os giros grátis são consumidos prioritariamente antes do seu saldo.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase text-primary tracking-widest italic">Multiplicadores</h4>
                  <p className="text-sm text-white/70 leading-relaxed">
                    Ao selecionar um multiplicador (ex: 2x, 5x, 10x), você aumenta o <span className="text-white font-bold">valor do prêmio</span> proporcionalmente, mas o custo do giro também aumenta na mesma proporção.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-black uppercase text-primary tracking-widest italic">Tipos de Prêmios</h4>
                  <ul className="text-sm text-white/70 space-y-2">
                    <li className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-yellow-400" />
                      <span className="font-bold text-white">Saldo:</span> Adicionado instantaneamente à sua carteira.
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      <span className="font-bold text-white">Cotas:</span> Números da sorte para a campanha atual.
                    </li>
                    <li className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-purple-400" />
                      <span className="font-bold text-white">Prêmios Físicos:</span> Nossa equipe entrará em contato para entrega.
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <p className="text-[10px] text-white/40 uppercase font-bold text-center tracking-widest">
                    Boa sorte! O sistema garante aleatoriedade total baseada nas chances de cada item.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <div className="flex items-center gap-2 text-xs font-bold text-white/60 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
            <Users className="h-3.5 w-3.5 text-primary" /> 
            <span className="text-white">{(Math.random() * 200 + 50).toFixed(0)}</span> online
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col items-center gap-1 px-4 border-r border-white/10">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Seu Saldo</span>
              <span className="text-lg font-black text-white flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-400" />
                R$ {Number(userProfile?.balance || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 px-4">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Giros Grátis</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-white/20 hover:text-white/40" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-900 border-white/10 text-[10px] max-w-[200px]">
                      <p>Você ganha 1 giro grátis para cada {campaign.roulette_free_tickets} cotas pagas nesta campanha.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-lg font-black text-primary flex items-center gap-2">
                <Gift className="h-4 w-4" />
                {availableSpins}
              </span>
            </div>
          </div>
          
          {campaign.roulette_free_tickets > 0 && (
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 animate-pulse">
              <Zap className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                Promoção: 1 Giro a cada {campaign.roulette_free_tickets} Cotas!
              </span>
            </div>
          )}
         </div>
       </div>
 
       {/* Live Win Feed */}
       <div className="w-full px-6 mb-4">
         <div className="bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md overflow-hidden relative">
           <div className="flex items-center gap-2 mb-2">
             <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
             <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Ganhadores em Tempo Real</span>
           </div>
           <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
             {globalSpins?.map((spin, i) => (
               <div key={i} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 flex-shrink-0">
                 <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-black text-primary">
                   {spin.profiles?.name?.substring(0, 1)}
                 </div>
                 <span className="text-[10px] font-bold text-white">{spin.profiles?.name}</span>
                 <span className="text-[10px] text-white/40">ganhou</span>
                 <span className="text-[10px] font-black text-primary uppercase">{spin.prize_label}</span>
               </div>
             ))}
             {(!globalSpins || globalSpins.length === 0) && (
               <span className="text-[10px] text-white/20 italic">Aguardando novos giros...</span>
             )}
           </div>
         </div>
       </div>
 
       <div className="relative group">
        {/* Metallic Outer Ring */}
        <div className="absolute -inset-10 rounded-full border-[12px] border-white/5 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        <div className="absolute -inset-6 rounded-full border-[2px] border-white/20 pointer-events-none" />
        
        {/* Neon Ring */}
        <div className="absolute -inset-4 rounded-full border border-primary/30 shadow-[0_0_50px_rgba(var(--primary),0.2)] animate-pulse pointer-events-none" />

        {/* Pointer (Premium Metallic) */}
        <div className="absolute -top-8 left-1/2 z-20 -translate-x-1/2 transform drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
          <div className="w-10 h-14 bg-gradient-to-b from-white via-zinc-200 to-zinc-400 clip-path-triangle rotate-180 relative">
             <div className="absolute inset-[2px] bg-gradient-to-b from-zinc-100 to-zinc-500 clip-path-triangle" />
          </div>
        </div>

        {/* Wheel */}
        <div className="relative h-80 w-80 md:h-[420px] md:w-[420px] rounded-full p-2 bg-gradient-to-br from-zinc-800 to-zinc-950 shadow-[0_0_100px_rgba(0,0,0,0.8)] border-4 border-zinc-900 overflow-hidden">
          <motion.div
            animate={controls}
            initial={{ rotate: 0 }}
            className="relative h-full w-full rounded-full overflow-hidden shadow-inner"
            style={{ backfaceVisibility: "hidden" }}
            >
            {prizes.map((prize, i) => {
              const angle = 360 / prizes.length;
              const rotate = i * angle;
              return (
                <div
                  key={prize.id}
                  className="absolute inset-0 flex items-start justify-center origin-center"
                  style={{
                    transform: `rotate(${rotate}deg)`,
                    backgroundColor: prize.color || (i % 2 === 0 ? "#111" : "#1a1a1a"),
                    clipPath: `polygon(50% 50%, ${50 - Math.tan((angle / 2) * Math.PI / 180) * 50}% 0%, ${50 + Math.tan((angle / 2) * Math.PI / 180) * 50}% 0%)`
                  }}
                >
                  <div className="mt-12 md:mt-16 flex flex-col items-center gap-2 transform rotate-180" style={{ writingMode: "vertical-rl" }}>
                    <span className="text-[10px] md:text-sm font-black text-white uppercase tracking-tighter drop-shadow-lg">
                      {prize.label}
                    </span>
                    {prize.prize_type === 'balance' && <Coins className="h-4 w-4 text-yellow-400 opacity-50" />}
                    {prize.prize_type === 'ticket' && <Star className="h-4 w-4 text-primary opacity-50" />}
                  </div>
                </div>
              );
            })}
            
            {/* Light Bulbs around the edge */}
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-2 h-2 rounded-full bg-white/40 border border-white/20"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 30}deg) translate(0, -195px)`,
                }}
              />
            ))}
          </motion.div>
        </div>
        
        {/* Center hub */}
        <div className="absolute inset-0 m-auto h-20 w-20 md:h-28 md:w-28 rounded-full z-30 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-600 p-[2px] shadow-2xl">
            <div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center border-4 border-zinc-800">
              <div className="flex flex-col items-center">
                <Star className="h-6 w-6 md:h-10 md:w-10 text-primary fill-primary animate-pulse drop-shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multipliers & Controls */}
      <div className="text-center space-y-8 z-10 w-full px-6">
        <div className="space-y-4">
           <div className="flex flex-col items-center gap-3">
             <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Escolha seu Multiplicador</span>
             <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
               {[1, 2, 5, 10].map((m) => (
                 <button
                   key={m}
                   onClick={() => !isSpinning && setMultiplier(m)}
                   disabled={isSpinning || m > (campaign.roulette_multiplier_max || 10)}
                   className={cn(
                     "px-5 py-2 rounded-xl text-sm font-black transition-all duration-300 uppercase italic tracking-tighter",
                     multiplier === m 
                      ? "bg-primary text-white shadow-[0_0_20px_rgba(var(--primary),0.4)] scale-110" 
                      : "text-white/40 hover:text-white/70 hover:bg-white/5"
                   )}
                 >
                   {m}x
                 </button>
               ))}
             </div>
           </div>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={spin}
            disabled={isSpinning}
            size="lg"
            className="h-16 w-full md:w-72 gap-3 text-lg font-black uppercase italic tracking-tighter bg-gradient-to-r from-primary to-purple-600 hover:scale-105 transition-all duration-300 shadow-[0_20px_40px_-15px_rgba(var(--primary),0.5)] border-none group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            {isSpinning ? (
              <RotateCw className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Zap className="h-6 w-6 fill-current" />
                {campaign.roulette_spin_cost > 0 ? `Girar por R$ ${(campaign.roulette_spin_cost * multiplier).toFixed(2)}` : "Girar Agora"}
              </>
            )}
          </Button>
          
          <div className="flex items-center gap-2 text-white/40">
             <ShoppingCart className="h-4 w-4" />
             <span className="text-xs font-bold uppercase tracking-widest">Compra instantânea segura</span>
          </div>
        </div>
      </div>

      {/* Win Modal / Animation */}
      <AnimatePresence>
        {showWinAnimation && wonPrize && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-6 pointer-events-none"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <div className="relative flex flex-col items-center gap-6 p-10 rounded-[40px] bg-zinc-900 border-2 border-primary/50 shadow-[0_0_100px_rgba(var(--primary),0.3)] overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
              
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Trophy className="h-24 w-24 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]" />
              </motion.div>
              
              <div className="text-center space-y-2">
                <h2 className="text-4xl md:text-6xl font-black uppercase italic italic text-white leading-none tracking-tighter">
                  PARABÉNS!
                </h2>
                <p className="text-primary font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Você acaba de ganhar
                  <Sparkles className="h-4 w-4" />
                </p>
              </div>

              <div className="bg-white/5 px-8 py-4 rounded-3xl border border-white/10 backdrop-blur-xl">
                <span className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                  {wonPrize.label}
                  {multiplier > 1 && <span className="text-primary ml-2">x{multiplier}</span>}
                </span>
              </div>

              <div className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest">
                O prêmio foi adicionado à sua conta
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .clip-path-triangle {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
      `}</style>
    </div>
  );
};

export default Roulette;