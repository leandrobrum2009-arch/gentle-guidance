import { motion } from "framer-motion";
import { Calendar, CheckCircle, Zap, Clock, ShieldCheck, TrendingUp, RotateCw, Star, Gift, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/hooks/useData";
import CountdownTimer from "./CountdownTimer";

interface CampaignCardProps {
  campaign: Campaign;
  index: number;
}

const CampaignCard = ({ campaign, index }: CampaignCardProps) => {
  const isCompleted = campaign.status === "completed";
  const progress = Math.round((campaign.sold_tickets / campaign.total_tickets) * 100);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative h-full"
    >
      <Link to={`/campanha/${campaign.id}`} className="block h-full outline-none">
        <div className="relative h-full overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)] group-hover:scale-[1.02] shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 border-light-path border-[#22c55e]/20">
          
          {/* Reflection Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-secondary/30">
            <img
              src={campaign.image_url || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=640&h=360&auto=format&fit=crop"}
              alt={campaign.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Badges */}
            <div className="absolute left-3 top-3 flex flex-col gap-2">
              {campaign.featured && (
                <Badge className="bg-primary px-2 py-0.5 text-[8px] font-black uppercase italic tracking-widest glow-primary">
                  Premium
                </Badge>
              )}
              {progress > 80 && campaign.status === 'active' && (
                <Badge variant="destructive" className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest animate-pulse">
                  Últimas Cotas
                </Badge>
              )}
              {campaign.status === 'active' && (
                <Badge className="bg-green-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest gap-1">
                  <div className="h-1 w-1 rounded-full bg-white animate-ping" /> Ao Vivo
                </Badge>
              )}
              {campaign.status === 'paused' && (
                <Badge className="bg-amber-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">
                  Pausada
                </Badge>
              )}
              {campaign.status === 'completed' && (
                <Badge className="bg-blue-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">
                  Finalizada
                </Badge>
              )}
              {campaign.status === 'audit' && (
                <Badge className="bg-purple-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest animate-pulse">
                  Em Auditoria
                </Badge>
              )}
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-2">
              {campaign.draw_date && (
                <CountdownTimer targetDate={campaign.draw_date} className="scale-90 origin-left" />
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black italic text-primary neon-text-primary">
                  <Zap className="h-3 w-3 fill-current" />
                  R$ {Number(campaign.ticket_price).toFixed(2).replace(".", ",")}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-white/70">
                  <Clock className="h-3 w-3" /> 
                  {campaign.status === 'completed' ? (
                    <span>Sorteado</span>
                  ) : campaign.status === 'paused' ? (
                    <span>Pausada</span>
                  ) : campaign.draw_date ? (
                    <span>Sorteio em breve</span>
                  ) : (
                    <span>Em breve</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <h3 className="font-display text-base md:text-lg font-black uppercase italic tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                {campaign.title}
              </h3>
              <p className="text-[10px] md:text-[11px] font-bold text-muted-foreground line-clamp-1 mt-0.5 uppercase tracking-widest">
                {campaign.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 py-1">
              {campaign.lucky_numbers_prizes && campaign.lucky_numbers_prizes.length > 0 && (
                <div className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-full border border-border">
                  <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                  <span className="text-[8px] font-black uppercase text-foreground">{campaign.lucky_numbers_prizes.length} cotas premiadas disponíveis</span>
                </div>
              )}
              {campaign.roulette_enabled && (
                <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  <RotateCw className="h-2.5 w-2.5 text-primary" />
                  <span className="text-[8px] font-black uppercase text-primary">roleta disponíveis</span>
                </div>
              )}
              {campaign.mystery_box_enabled && (
                <div className="flex items-center gap-1 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                  <Sparkles className="h-2.5 w-2.5 text-purple-500" />
                  <span className="text-[8px] font-black uppercase text-purple-500">raspadinhas disponíveis</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" /> {campaign.status === 'completed' ? 'Finalizado' : `${campaign.sold_tickets.toLocaleString()} vendidos`}
                </span>
                <span className={cn("font-black", campaign.status === 'completed' ? "text-blue-500" : "text-primary")}>
                  {campaign.status === 'completed' ? '100%' : `${progress}%`}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden border border-border">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: campaign.status === 'completed' ? '100%' : `${progress}%` }}
                  className={cn("h-full rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]", 
                    campaign.status === 'completed' ? "bg-blue-500" : "bg-primary"
                  )}
                />
              </div>
            </div>

            {campaign.status === 'completed' && campaign.winners && campaign.winners.length > 0 && (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 flex items-center gap-3 animate-fade-in">
                <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Trophy className="h-5 w-5 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-tighter text-blue-600">Ganhador(a)</p>
                  <p className="text-xs font-black text-foreground truncate">{campaign.winners.find(w => w.winner_type === 'raffle')?.winner_name || campaign.winners[0].winner_name}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-secondary border border-border flex items-center justify-center">
                  {campaign.status === 'completed' ? (
                    <CheckCircle className="h-3 w-3 text-blue-500" />
                  ) : (
                    <ShieldCheck className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {campaign.status === 'completed' ? 'Encerrado' : 'Garantido'}
                </span>
              </div>
              <Button 
                size="sm" 
                className={cn(
                  "h-8 rounded-full text-[10px] font-black uppercase tracking-widest px-4 relative z-10",
                  campaign.status === 'completed' 
                    ? "bg-secondary text-muted-foreground border-border hover:bg-secondary/80" 
                    : "glow-primary border-light-path border-[#22c55e]/30"
                )}
              >
                {campaign.status === 'completed' ? 'VER RESULTADO' : 'COMPRAR AGORA'}
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CampaignCard;