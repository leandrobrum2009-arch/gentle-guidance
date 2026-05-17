 import confetti from "canvas-confetti";
import { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { RotateCw, Star, Trophy, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoulettePrize, RouletteSpin } from "@/hooks/useData";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RouletteProps {
  prizes: RoulettePrize[];
  onSpinComplete?: (prize: RoulettePrize) => void;
  campaignId?: string;
}

const Roulette = ({ prizes, onSpinComplete, campaignId }: RouletteProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const controls = useAnimation();
  const wheelRef = useRef<HTMLDivElement>(null);

  const spin = async () => {
    if (isSpinning || prizes.length === 0) return;
    
    if (!user) {
      toast.error("Você precisa estar logado para girar a roleta!");
      return;
    }
    
    setIsSpinning(true);
    
    // Randomly pick a prize based on weight (simplified here for now)
    const randomIndex = Math.floor(Math.random() * prizes.length);
    const prize = prizes[randomIndex];
    
    const segmentAngle = 360 / prizes.length;
    const extraSpins = 5; // Number of full rotations
    const targetAngle = extraSpins * 360 + (randomIndex * segmentAngle);
    
    await controls.start({
      rotate: -targetAngle,
      transition: { duration: 4, ease: [0.15, 0, 0.15, 1] }
    });
    
    // Save spin result to database if campaignId is provided
    if (campaignId && user) {
      const { error } = await supabase.from("roulette_spins").insert({
        user_id: user.id,
        campaign_id: campaignId,
        prize_label: prize.label,
        prize_type: prize.prize_type,
        prize_value: prize.value
      });
      
      if (!error) {
        queryClient.invalidateQueries({ queryKey: ["roulette_spins"] });
      }
    }

    setIsSpinning(false);
    
    // Celebration
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: [prize.color || '#FACC15', '#ffffff']
    });

    toast.success(`Parabéns! Você ganhou: ${prize.label}!`);
    if (onSpinComplete) onSpinComplete(prize);
  };

  return (
    <div className="flex flex-col items-center gap-8 py-6">
      <div className="flex items-center gap-2 mb-2">
        <Badge className="bg-destructive animate-pulse flex items-center gap-1 text-[10px] font-bold px-2">
          <span className="h-1 w-1 rounded-full bg-white animate-ping" /> AO VIVO
        </Badge>
        <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          <Users className="h-3 w-3" /> {(Math.random() * 50 + 10).toFixed(0)} pessoas assistindo
        </div>
      </div>

      <div className="relative">
        {/* Pointer */}
        <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 transform">
          <div className="h-8 w-6 bg-primary clip-path-triangle rotate-180" />
        </div>

        {/* Wheel */}
        <motion.div
          animate={controls}
          className="relative h-72 w-72 rounded-full border-8 border-border shadow-2xl overflow-hidden"
          style={{ background: "conic-gradient(from 0deg, #1a1a1a 0%, #1a1a1a 100%)" }}
        >
          {prizes.map((prize, i) => {
            const angle = 360 / prizes.length;
            const rotate = i * angle;
            return (
              <div
                key={prize.id}
                className="absolute inset-0 flex items-start justify-center pt-8 origin-center"
                style={{
                  transform: `rotate(${rotate}deg)`,
                  backgroundColor: prize.color || (i % 2 === 0 ? "#222" : "#333"),
                  clipPath: `polygon(50% 50%, ${50 - Math.tan((angle / 2) * Math.PI / 180) * 50}% 0%, ${50 + Math.tan((angle / 2) * Math.PI / 180) * 50}% 0%)`
                }}
              >
                <span className="text-[10px] font-bold text-white uppercase rotate-180" style={{ writingMode: "vertical-rl" }}>
                  {prize.label}
                </span>
              </div>
            );
          })}
        </motion.div>
        
        {/* Center hub */}
        <div className="absolute inset-0 m-auto h-12 w-12 rounded-full bg-border border-4 border-primary flex items-center justify-center shadow-lg">
          <Star className="h-6 w-6 text-primary fill-current" />
        </div>
      </div>

      <div className="text-center space-y-4">
        <div>
          <h3 className="text-xl font-bold flex items-center justify-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Roleta Premiada
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Gire e ganhe prêmios instantâneos!</p>
        </div>
        
        <Button
          onClick={spin}
          disabled={isSpinning}
          size="lg"
          className="w-48 gap-2 font-bold uppercase tracking-widest glow-primary"
        >
          <RotateCw className={isSpinning ? "animate-spin" : ""} />
          {isSpinning ? "Girando..." : "Girar Agora"}
        </Button>
      </div>
    </div>
  );
};

export default Roulette;