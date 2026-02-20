import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { Campaign } from "@/hooks/useData";

interface HeroCampaignProps {
  campaign: Campaign;
}

const HeroCampaign = ({ campaign }: HeroCampaignProps) => {
  const progress = Math.round((campaign.sold_tickets / campaign.total_tickets) * 100);
  const drawDate = campaign.draw_date
    ? new Date(campaign.draw_date).toLocaleDateString("pt-BR")
    : "";
  const drawTime = campaign.draw_date
    ? new Date(campaign.draw_date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="container py-6"
    >
      <Link to={`/campanha/${campaign.id}`}>
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-card glow-primary cursor-pointer card-hover">
          <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[21/9]">
            <img
              src={campaign.image_url || "/placeholder.svg"}
              alt={campaign.title}
              className="h-full w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
            {campaign.urgency_tag && (
              <div className="absolute left-4 top-4">
                <Badge className="animate-pulse-glow bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  {campaign.urgency_tag}
                </Badge>
              </div>
            )}
          </div>

          <div className="space-y-4 p-5 sm:p-6">
            <div>
              <h2 className="font-display text-xl font-bold sm:text-2xl lg:text-3xl">{campaign.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">{campaign.subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="font-mono font-semibold text-foreground/70">{campaign.ltp_code}</span>
              {drawDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {drawDate} às {drawTime}
                </span>
              )}
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
                  R$ {Number(campaign.ticket_price).toFixed(2).replace(".", ",")}
                </p>
              </div>
              <Button size="lg" className="gap-2 font-semibold">
                Participar Agora
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.section>
  );
};

export default HeroCampaign;
