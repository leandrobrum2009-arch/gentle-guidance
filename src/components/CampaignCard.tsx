import { motion } from "framer-motion";
import { Calendar, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Campaign } from "@/data/mockData";

interface CampaignCardProps {
  campaign: Campaign;
  index: number;
}

const CampaignCard = ({ campaign, index }: CampaignCardProps) => {
  const isCompleted = campaign.status === "completed";

  return (
    <motion.a
      href={`/campanha/${campaign.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group flex gap-4 rounded-xl border border-border/50 bg-card p-3 card-hover cursor-pointer"
    >
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-28">
        <img
          src={campaign.image}
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
        <h3 className="font-display text-sm font-bold leading-tight sm:text-base">
          {campaign.title}
        </h3>
        <p className="truncate text-xs text-muted-foreground">
          {campaign.subtitle}
        </p>
        <p className="font-mono text-xs font-semibold text-foreground/60">
          {campaign.code}
        </p>
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <Badge variant="secondary" className="text-[10px]">
              Concluído
            </Badge>
          ) : (
            campaign.urgencyTag && (
              <Badge className="bg-primary text-[10px] text-primary-foreground">
                Ativo
              </Badge>
            )
          )}
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {campaign.drawDate} às {campaign.drawTime}
          </span>
        </div>
      </div>
    </motion.a>
  );
};

export default CampaignCard;
