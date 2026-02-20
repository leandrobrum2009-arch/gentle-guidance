import { motion } from "framer-motion";
import { Calendar, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import type { Campaign } from "@/hooks/useData";

interface CampaignCardProps {
  campaign: Campaign;
  index: number;
}

const CampaignCard = ({ campaign, index }: CampaignCardProps) => {
  const isCompleted = campaign.status === "completed";
  const drawDate = campaign.draw_date
    ? new Date(campaign.draw_date).toLocaleDateString("pt-BR")
    : "";
  const drawTime = campaign.draw_date
    ? new Date(campaign.draw_date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link
        to={`/campanha/${campaign.id}`}
        className="group flex gap-4 rounded-xl border border-border/50 bg-card p-3 card-hover cursor-pointer"
      >
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-28">
          <img
            src={campaign.image_url || "/placeholder.svg"}
            alt={campaign.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {isCompleted && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60">
              <CheckCircle className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          <h3 className="font-display text-sm font-bold leading-tight sm:text-base">{campaign.title}</h3>
          <p className="truncate text-xs text-muted-foreground">{campaign.subtitle}</p>
          <p className="font-mono text-xs font-semibold text-foreground/60">{campaign.ltp_code}</p>
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <Badge variant="secondary" className="text-[10px]">Concluído</Badge>
            ) : (
              <Badge className="bg-primary text-[10px] text-primary-foreground">Ativo</Badge>
            )}
            {drawDate && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {drawDate} às {drawTime}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CampaignCard;
