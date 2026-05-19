import { motion } from "framer-motion";
import { Trophy, Play, Phone, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Winner } from "@/hooks/useData";

interface WinnerCardProps {
  winner: Winner;
  index: number;
}

const WinnerCard = ({ winner, index }: WinnerCardProps) => {
  const campaignTitle = winner.campaigns?.title || "Campanha";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-sm hover:border-primary/30 hover:shadow-md transition-all group"
    >
      {/* Background Icon */}
      <Trophy className="absolute -right-4 -top-4 h-32 w-32 text-primary/5 rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-6" />

      <div className="relative z-10">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Trophy className="h-6 w-6 text-primary neon-text-primary" />
          </div>
          <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase tracking-widest italic">
            Ganhador Certificado
          </Badge>
        </div>

        <div className="space-y-1">
          <h3 className="font-display text-lg font-black uppercase italic tracking-tighter italic leading-none group-hover:text-primary transition-colors">
            {winner.winner_name}
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate">{campaignTitle}</p>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border space-y-3">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-muted-foreground">Prêmio</span>
            <span className="text-primary neon-text-primary italic">{winner.prize_description}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-muted-foreground">Nº da sorte</span>
            <span className="font-mono text-xs font-black text-foreground px-2 py-0.5 rounded bg-white border border-border">{winner.ticket_number}</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Entrega Realizada</span>
          </div>
          {winner.video_url && (
            <Button size="sm" variant="outline" className="h-9 rounded-full gap-2 border-border bg-secondary/50 hover:bg-secondary text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <Play className="h-3 w-3 fill-current" /> Vídeo
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WinnerCard;
