import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Campaign } from "@/data/mockData";

interface HeroCampaignProps {
  campaign: Campaign;
}

const HeroCampaign = ({ campaign }: HeroCampaignProps) => {
  const progress = Math.round((campaign.soldTickets / campaign.totalTickets) * 100);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="container py-6"
    >
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card glow-primary">
        <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[21/9]">
          <img
            src={campaign.image}
            alt={campaign.title}
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

          {campaign.urgencyTag && (
            <div className="absolute left-4 top-4">
              <Badge className="animate-pulse-glow bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                {campaign.urgencyTag}
              </Badge>
            </div>
          )}
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <div>
            <h2 className="font-display text-xl font-bold sm:text-2xl lg:text-3xl">
              {campaign.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              {campaign.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="font-mono font-semibold text-foreground/70">
              {campaign.code}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {campaign.drawDate} às {campaign.drawTime}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Bilhetes vendidos</span>
              <span className="font-semibold text-primary">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-[hsl(80,96%,60%)]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs text-muted-foreground">A partir de</span>
              <p className="text-2xl font-bold text-primary">
                R$ {campaign.ticketPrice.toFixed(2).replace(".", ",")}
              </p>
            </div>
            <Button size="lg" className="gap-2 font-semibold">
              Participar Agora
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default HeroCampaign;
