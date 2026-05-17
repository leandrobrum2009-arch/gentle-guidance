import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Calendar, CheckCircle, Zap, Clock, ShieldCheck, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import type { Campaign } from "@/hooks/useData";

interface CampaignCardProps {
  campaign: Campaign;
  index: number;
}

const CampaignCard = ({ campaign, index }: CampaignCardProps) => {
  const isCompleted = campaign.status === "completed";
  const progress = Math.round((campaign.sold_tickets / campaign.total_tickets) * 100);
  
  // 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group relative h-full perspective-1000"
    >
      <Link to={`/campanha/${campaign.id}`} className="block h-full">
        <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-card/40 p-4 transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)] glass-morphism backdrop-blur-sm">
          
          {/* Reflection Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
            <img
              src={campaign.image_url || "/placeholder.svg"}
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
              {progress > 80 && (
                <Badge variant="destructive" className="px-2 py-0.5 text-[8px] font-black uppercase tracking-widest animate-pulse">
                  Quase Encerrando
                </Badge>
              )}
              {campaign.status === 'active' && (
                <Badge className="bg-green-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest gap-1">
                  <div className="h-1 w-1 rounded-full bg-white animate-ping" /> Ao Vivo
                </Badge>
              )}
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black italic text-primary neon-text-primary">
                <Zap className="h-3 w-3 fill-current" />
                R$ {Number(campaign.ticket_price).toFixed(2).replace(".", ",")}
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-white/70">
                <Clock className="h-3 w-3" /> 2d 14h
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <h3 className="font-display text-base font-black uppercase italic tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                {campaign.title}
              </h3>
              <p className="text-[10px] font-medium text-muted-foreground line-clamp-1 mt-0.5">
                {campaign.subtitle}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> {campaign.sold_tickets.toLocaleString()} vendidos
                </span>
                <span className="text-primary">{progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/40 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <ShieldCheck className="h-3 w-3 text-muted-foreground" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Garantido</span>
              </div>
              <Button size="sm" className="h-8 rounded-full text-[10px] font-black uppercase tracking-widest px-4 glow-primary">
                Ver Detalhes
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CampaignCard;
