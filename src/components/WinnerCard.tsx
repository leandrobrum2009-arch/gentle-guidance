import { motion } from "framer-motion";
import { Trophy, Play, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Winner } from "@/hooks/useData";

interface WinnerCardProps {
  winner: Winner;
  index: number;
}

const WinnerCard = ({ winner, index }: WinnerCardProps) => {
  const campaignTitle = winner.campaigns?.title || "Campanha";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="rounded-xl border border-border/50 bg-card p-5 card-hover"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Trophy className="h-5 w-5 text-primary" />
        </div>
        {winner.video_url && (
          <Button size="sm" variant="outline" className="gap-1.5 text-xs">
            <Play className="h-3 w-3" />
            Vídeo
          </Button>
        )}
      </div>

      <h3 className="font-display text-base font-bold">{winner.winner_name}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{campaignTitle}</p>

      <div className="mt-3 space-y-1.5 text-xs">
        <p className="text-muted-foreground">
          Prêmio: <span className="font-medium text-foreground">{winner.prize_description}</span>
        </p>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            Nº da sorte: <span className="font-mono font-bold text-primary">{winner.ticket_number}</span>
          </span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Data: {new Date(winner.draw_date).toLocaleDateString("pt-BR")}</span>
          {winner.phone_masked && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {winner.phone_masked}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WinnerCard;
