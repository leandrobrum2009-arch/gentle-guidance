import { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Gift, Sparkles, Box, Loader2, Trophy, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MysteryBox as MysteryBoxType, useMysteryBoxWins } from "@/hooks/useData";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MysteryBoxProps {
  boxes: MysteryBoxType[];
  campaignId?: string;
}

const MysteryBox = ({ boxes, campaignId }: MysteryBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [selectedBox, setSelectedBox] = useState<MysteryBoxType | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: recentWins } = useMysteryBoxWins(3);
  const boxControls = useAnimation();

  const handleOpen = async () => {
    if (boxes.length === 0 || isOpening) return;
    if (!user) {
      toast.error("Você precisa estar logado para abrir a caixa!");
      return;
    }

    setIsOpening(true);
    
    // Shake animation
    await boxControls.start({
      rotate: [0, -10, 10, -10, 10, 0],
      scale: [1, 1.1, 1],
      transition: { duration: 0.5, repeat: 3 }
    });

    const randomBox = boxes[Math.floor(Math.random() * boxes.length)];
    
    // Save win to DB
    const { error } = await supabase.from("mystery_box_wins").insert({
      user_id: user.id,
      box_id: randomBox.id,
      prize_title: randomBox.title,
      prize_value: randomBox.prize_value
    });

    if (error) {
      toast.error("Erro ao processar prêmio. Tente novamente.");
      setIsOpening(false);
      return;
    }

    setSelectedBox(randomBox);
    setIsOpening(false);
    setIsOpen(true);
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    toast.success(`Incrível! Você ganhou: ${randomBox.title}`);
    queryClient.invalidateQueries({ queryKey: ["mystery_box_wins"] });
  };

  return (
    <div className="flex flex-col gap-6 py-8 px-6 bg-card/40 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
      {/* Ambient background glow */}
      <div className="absolute -left-20 -top-20 h-40 w-40 bg-primary/20 blur-3xl rounded-full" />
      
       <div className="text-center space-y-2 relative z-10">
         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
           <Sparkles className="h-3 w-3" />
           Caixa Misteriosa
         </div>
         <h2 className="text-2xl font-black italic uppercase tracking-tight">Prêmios Instantâneos</h2>
         <p className="text-sm text-muted-foreground max-w-xs mx-auto">
           Ao comprar seus bilhetes, você pode desbloquear caixas com prêmios surpresa!
         </p>
       </div>

      <div className="relative h-48 w-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="closed"
              animate={boxControls}
              initial={{ scale: 1 }}
              className="relative cursor-pointer"
              onClick={handleOpen}
            >
              <div className="relative group">
                <Box className="h-32 w-32 text-primary group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_30px_rgba(var(--primary-rgb),0.6)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Gift className="h-10 w-10 text-primary-foreground animate-bounce" />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 -z-10 animate-pulse" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-32 w-32 rounded-2xl bg-primary/20 border-2 border-primary/50 flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]"
              >
                <Gift className="h-16 w-16 text-primary" />
              </motion.div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-primary">{selectedBox?.title}</h3>
               <p className="text-sm text-muted-foreground">{selectedBox?.description}</p>
               <div className="flex items-center justify-center gap-2 text-primary pt-2">
                 <Zap className="h-4 w-4 fill-current" />
                 <span className="text-xs font-black uppercase tracking-widest">Resgate Imediato</span>
               </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Fechar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isOpen && (
        <div className="flex flex-col gap-4 items-center">
          <Button 
            size="lg" 
            onClick={handleOpen}
            disabled={isOpening}
            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest italic glow-primary text-lg gap-2"
          >
            {isOpening ? <Loader2 className="h-6 w-6 animate-spin" /> : <Zap className="h-6 w-6 fill-current" />}
            {isOpening ? "Abrindo..." : "Abrir Agora"}
          </Button>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
            {boxes[0]?.cost_to_open && boxes[0].cost_to_open > 0 
              ? `Custo: R$ ${boxes[0].cost_to_open.toFixed(2)} por tentativa`
              : "GRÁTIS para quem já comprou bilhetes!"}
          </p>
        </div>
      )}

      {/* Recent wins mini-feed */}
      {recentWins && recentWins.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Trophy className="h-3 w-3 text-primary" /> Útimos Prêmios
          </p>
          <div className="space-y-2">
            {recentWins.map((win) => (
              <div key={win.id} className="flex items-center justify-between text-[10px] bg-white/5 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={win.profiles?.avatar_url || ""} />
                    <AvatarFallback className="text-[8px] bg-primary/20 text-primary">{win.profiles?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-bold truncate max-w-[80px]">{win.profiles?.name}</span>
                </div>
                <span className="text-primary font-bold italic">{win.prize_title}</span>
                <span className="text-[8px] text-muted-foreground">
                  {formatDistanceToNow(new Date(win.created_at), { locale: ptBR })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MysteryBox;
