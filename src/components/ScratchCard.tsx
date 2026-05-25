import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trophy, Zap, RefreshCw, Info, FileText, Gift, History, Clock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { playSound, hapticFeedback } from "@/lib/sounds";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useGlobalScratchCardScratches } from "@/hooks/useData";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ScratchCardProps {
  prizeLabel?: string;
  prizeImage?: string;
  isWinner?: boolean;
  onComplete?: () => void;
  cost?: number;
  potentialPrizes?: string[];
  isSimulation?: boolean;
  campaignId?: string;
  availableScratches?: number;
}

const ScratchCard = ({ 
  prizeLabel: initialPrizeLabel, 
  prizeImage, 
  isWinner: initialIsWinner, 
  onComplete, 
  cost = 0,
  potentialPrizes = [],
  isSimulation = false,
  campaignId,
  availableScratches = 0
}: ScratchCardProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: globalWins } = useGlobalScratchCardScratches(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const [prizeLabel, setPrizeLabel] = useState(initialPrizeLabel || "");
  const [isWinner, setIsWinner] = useState(initialIsWinner ?? false);
  const [localHistory, setLocalHistory] = useState<{name: string, prize: string, time: string, isWinner: boolean}[]>([]);

  const history = useMemo(() => {
    const apiHistory = globalWins?.map(win => ({
      name: win.profiles?.name || "Usuário",
      prize: win.prize_label || "Prêmio",
      time: win.created_at ? formatDistanceToNow(new Date(win.created_at), { addSuffix: true, locale: ptBR }) : "Agora",
      isWinner: win.is_winner
    })) || [];
    
    return [...localHistory, ...apiHistory].slice(0, 10);
  }, [globalWins, localHistory]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const initCanvas = useCallback(() => {
    if (canvasRef.current && canvasSize.width > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear any previous drawings
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "source-over";

      // Fill with "scratchable" layer
      const gradient = ctx.createLinearGradient(0, 0, canvasSize.width, canvasSize.height);
      gradient.addColorStop(0, "#333");
      gradient.addColorStop(0.5, "#555");
      gradient.addColorStop(1, "#222");
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      // Add logo if available
      const logoUrl = localStorage.getItem('site_logo') || "";
      if (logoUrl) {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.src = logoUrl;
        logoImg.onload = () => {
          const logoSize = 60;
          ctx.globalAlpha = 0.3;
          ctx.drawImage(logoImg, (canvasSize.width - logoSize) / 2, (canvasSize.height - logoSize) / 2 - 20, logoSize, logoSize);
          ctx.globalAlpha = 1.0;
          
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.font = "bold 16px Inter";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("RASPE AQUI", canvasSize.width / 2, canvasSize.height / 2 + 40);
        };
      } else {
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.font = "bold 20px Inter";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("RASPE AQUI", canvasSize.width / 2, canvasSize.height / 2);
      }
      
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvasSize.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvasSize.height);
        ctx.stroke();
      }
    }
  }, [canvasSize]);

  useEffect(() => {
    initCanvas();
  }, [canvasSize, initCanvas]);

  const resetScratchCard = () => {
    setHasStarted(false);
    setIsScratched(false);
    setScratchPercentage(0);
    setIsDrawing(false);
    setPrizeLabel("");
    setIsWinner(false);
    initCanvas();
  };

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width > 0 && height > 0) {
          setCanvasSize({ width, height });
        }
      }
    };

    updateSize();
    
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, []);

  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startScratch = async () => {
    if (isSimulation) {
      const winner = Math.random() > 0.7;
      setIsWinner(winner);
      setPrizeLabel(winner ? "R$ 10,00 Simulado" : "Tente novamente");
      return;
    }

    if (!user) {
      toast.error("Entre para jogar e ganhar prêmios reais!");
      setIsDrawing(false);
      return;
    }

    setIsProcessing(true);
    try {
      // Ensure we have a valid campaignId if possible, or try global scratch
      const { data, error } = await supabase.rpc('process_scratch_card_play', {
        p_campaign_id: campaignId || null,
        p_cost: Number(cost) || 0
      });

      if (error) {
        toast.error(error.message || "Erro ao processar a raspadinha");
        // Reset state so they can try again if it was just a connection/auth issue
        setHasStarted(false);
        setIsDrawing(false);
        throw error;
      }

      const res = data as any;
      setIsWinner(res.is_winner);
      setPrizeLabel(res.is_winner ? (res.prize?.label || "Prêmio!") : "Tente novamente");
      
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (error: any) {
      console.error("Scratch error:", error);
      setIsProcessing(false);
      setHasStarted(false);
      setIsDrawing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const scratch = async (x: number, y: number) => {
    if (!canvasRef.current || isScratched || isProcessing) return;

    if (!hasStarted) {
      setHasStarted(true);
      await startScratch();
      // If startScratch failed or is still processing, we might want to return
      // But we can let them "start" scratching visually if we want.
      // However, if we don't have the result yet, we don't know what's underneath.
      // So we wait for processing to finish before allowing more scratching.
      return;
    }

    if (isProcessing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.fill();

    // Calculate scratch percentage (optimized: only every 10 scratches or so, or debounced)
    // For now, let's keep it simple but use willReadFrequently
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentPixels++;
    }
    const percentage = (transparentPixels / (pixels.length / 4)) * 100;
    setScratchPercentage(percentage);

    if (percentage > 45 && !isScratched) {
      reveal();
    }
  };

  const reveal = () => {
    setIsScratched(true);
    if (isWinner && prizeLabel !== "Tente novamente") {
      playSound('win');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      const newEntry = {
        name: "Você",
        prize: prizeLabel,
        time: "Agora",
        isWinner: true
      };
      setLocalHistory(prev => [newEntry, ...prev].slice(0, 5));
      
      if (!isSimulation && user) {
        supabase.from("notifications").insert({
          user_id: user.id,
          title: "Ganhou na raspadinha!",
          message: `Parabéns! Você ganhou ${prizeLabel} na raspadinha.`,
          type: "win"
        }).then(({ error }) => {
          if (error) console.error("Error inserting notification:", error);
        });
      }
    } else {
      const newEntry = {
        name: "Você",
        prize: "Tente novamente",
        time: "Agora",
        isWinner: false
      };
      setLocalHistory(prev => [newEntry, ...prev].slice(0, 5));
    }
    if (onComplete) onComplete();
    queryClient.invalidateQueries({ queryKey: ["global-scratch-card-scratches"] });
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const { x, y } = getMousePos(e);
    scratch(x, y);
    hapticFeedback();
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getMousePos(e);
    scratch(x, y);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto p-4 md:p-6 rounded-3xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden relative">
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/20 blur-[80px] rounded-full" />

      <div className="w-full flex justify-between items-center z-10">
        <Badge className={cn("bg-primary/20 text-primary border-none text-[10px] font-black uppercase tracking-widest", isSimulation && "bg-amber-500/20 text-amber-500")}>
          {isSimulation ? "Simulador de Sorte" : "Raspadinha Premiada"}
        </Badge>
        <div className="flex items-center gap-2">
           <div className={cn("h-2 w-2 rounded-full animate-pulse", isSimulation ? "bg-amber-500" : "bg-green-500")} />
           <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
             {isSimulation ? "Versão de Teste" : "Ativo Agora"}
           </span>
        </div>
      </div>

      <div className="text-center space-y-2 z-10">
        <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-tight">
          Tente a sua <span className="text-primary neon-text-primary">Sorte</span>!
        </h2>
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
            Raspe o cartão e descubra seu prêmio instantâneo
          </p>
          {!isSimulation && (
            <Badge className="bg-primary/20 text-primary border-primary/20 text-[10px] font-black uppercase italic mt-1">
              {availableScratches} {availableScratches === 1 ? 'raspadinha disponível' : 'raspadinhas disponíveis'}
            </Badge>
          )}
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-zinc-800 bg-zinc-950 group"
        style={{ cursor: isScratched ? "default" : "crosshair" }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-zinc-900 to-black">
          <AnimatePresence>
            {isScratched && !isProcessing && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto border-2 border-primary/20 shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">
                  {isWinner ? (
                    <Trophy className="h-12 w-12 text-primary drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                  ) : (
                    <Zap className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">
                    {isWinner ? "PARABÉNS, VOCÊ GANHOU!" : "QUASE LÁ! TENTE DE NOVO"}
                  </h3>
                  <p className="text-2xl font-black text-primary neon-text-primary uppercase tracking-tighter">
                    {prizeLabel}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {isProcessing && (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Processando Sorte...</p>
            </div>
          )}

          {!isScratched && !isProcessing && (
             <div className="opacity-10 scale-150 grayscale blur-sm">
                <Gift className="h-20 w-20 text-white" />
             </div>
          )}
        </div>

        {!isProcessing && (
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            className={cn(
              "absolute inset-0 z-20 transition-opacity duration-1000",
              isScratched && "opacity-0 pointer-events-none"
            )}
          />
        )}
        
        {!isScratched && !isProcessing && (
          <div className="absolute inset-0 pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity">
            <Sparkles className="absolute top-4 left-4 h-4 w-4 text-primary animate-pulse" />
            <Sparkles className="absolute bottom-4 right-4 h-4 w-4 text-secondary animate-pulse" />
          </div>
        )}
      </div>

      <div className="w-full flex flex-col gap-4 z-10">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
           <span>Área raspada: {Math.round(scratchPercentage)}%</span>
           {cost > 0 && <span>Custo: R$ {cost.toFixed(2)}</span>}
        </div>
        
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${scratchPercentage}%` }}
          />
        </div>

        {isScratched && !isProcessing && (
          <Button 
            className="w-full h-14 rounded-2xl font-black uppercase italic tracking-widest glow-primary group"
            onClick={resetScratchCard}
          >
            TENTAR NOVAMENTE <RefreshCw className="ml-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
          </Button>
        )}
      </div>

      <div className="pt-4 border-t border-white/5 w-full flex justify-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <Trophy className="h-4 w-4 text-primary opacity-50" />
          <span className="text-[8px] font-bold text-white/40 uppercase tracking-tighter">Grandes Prêmios</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Zap className="h-4 w-4 text-amber-500 opacity-50" />
          <span className="text-[8px] font-bold text-white/40 uppercase tracking-tighter">Instantâneo</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Gift className="h-4 w-4 text-secondary opacity-50" />
          <span className="text-[8px] font-bold text-white/40 uppercase tracking-tighter">Prêmios VIP</span>
        </div>
      </div>

      <div className="w-full mt-4 space-y-3 z-10">
        <div className="flex items-center gap-2 px-1">
          <History className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Histórico Recente</span>
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar pr-1">
          <AnimatePresence>
            {history.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary opacity-60" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white">{item.name}</p>
                    <div className="flex items-center gap-1">
                      <Clock className="h-2 w-2 text-white/40" />
                      <span className="text-[8px] font-bold text-white/40 uppercase tracking-tighter">{item.time}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-tighter",
                    item.isWinner ? "text-primary" : "text-white/40"
                  )}>
                    {item.prize}
                  </p>
                  <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
                    {item.isWinner ? "Ganhador" : "Participou"}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ScratchCard;