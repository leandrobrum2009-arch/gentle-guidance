import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar, ArrowLeft, Shield, Trophy, Users, Share2, Loader2,
  Gift, Award, TrendingUp, Info, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCampaign, useMysteryBoxes, useRoulettePrizes, useWinners } from "@/hooks/useData";
import CampaignPricing from "@/components/CampaignPricing";
import Roulette from "@/components/Roulette";
import MysteryBox from "@/components/MysteryBox";
import UserRanking from "@/components/UserRanking";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const QUICK_QTY = [1, 5, 10, 25, 50, 100];

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: campaign, isLoading } = useCampaign(id || "");
  const { data: mysteryBoxes } = useMysteryBoxes(id || "");
  const { data: roulettePrizes } = useRoulettePrizes(id || "");
  const { data: allWinners } = useWinners();

  const campaignWinners = useMemo(() => {
    return allWinners?.filter(w => w.campaign_id === id) || [];
  }, [allWinners, id]);

  const progress = campaign
    ? Math.round((campaign.sold_tickets / campaign.total_tickets) * 100)
    : 0;

  const handleBuy = (quantity: number) => {
    if (!user) {
      toast.error("Você precisa estar logado para comprar!");
      return;
    }
    toast.success(`Pedido de ${quantity} bilhetes gerado! Redirecionando para o pagamento...`);
    // Navigation logic here
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container flex flex-col items-center justify-center py-20">
          <h1 className="font-display text-2xl font-bold">Campanha não encontrada</h1>
          <Link to="/"><Button variant="outline" className="mt-4 gap-2"><ArrowLeft className="h-4 w-4" /> Voltar</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isActive = campaign.status === "active";
  const drawDate = campaign.draw_date ? new Date(campaign.draw_date).toLocaleDateString("pt-BR") : "";
  const drawTime = campaign.draw_date ? new Date(campaign.draw_date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar para campanhas
        </Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container pb-10">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <div className="relative overflow-hidden rounded-2xl border border-border/50">
              <img src={campaign.image_url || "/placeholder.svg"} alt={campaign.title} className="aspect-video w-full object-cover" />
              {campaign.urgency_tag && (
                <div className="absolute left-3 top-3">
                  <Badge className="animate-pulse-glow bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">{campaign.urgency_tag}</Badge>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
              <div>
                <h1 className="font-display text-xl font-bold sm:text-2xl">{campaign.title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{campaign.subtitle}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="font-mono font-semibold text-foreground/70">{campaign.ltp_code}</span>
                <Badge variant={isActive ? "default" : "secondary"} className="text-[10px]">{isActive ? "Ativo" : "Concluído"}</Badge>
                {drawDate && (
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{drawDate} às {drawTime}</span>
                )}
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso de vendas</span>
                  <span className="font-semibold text-primary">{progress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-secondary">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1.2, ease: "easeOut" }} className="h-full rounded-full bg-gradient-to-r from-primary to-[hsl(80,96%,60%)]" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{campaign.sold_tickets.toLocaleString("pt-BR")} vendidos</span>
                  <span>{campaign.total_tickets.toLocaleString("pt-BR")} total</span>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-secondary/50 p-3">
                  <Trophy className="mx-auto mb-1 h-5 w-5 text-primary" /><p className="text-xs text-muted-foreground">Prêmio</p><p className="text-xs font-semibold">Garantido</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <Shield className="mx-auto mb-1 h-5 w-5 text-primary" /><p className="text-xs text-muted-foreground">Pagamento</p><p className="text-xs font-semibold">Seguro</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <Users className="mx-auto mb-1 h-5 w-5 text-primary" /><p className="text-xs text-muted-foreground">Participantes</p><p className="text-xs font-semibold">{(campaign.sold_tickets / 3).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}+</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="sticky top-20 space-y-6">
              <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-xl ring-1 ring-primary/10">
                <CampaignPricing campaign={campaign} onBuy={handleBuy} />
              </div>
              
              {campaign.roulette_enabled && roulettePrizes && roulettePrizes.length > 0 && (
                <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-lg">
                  <Roulette prizes={roulettePrizes} />
                </div>
              )}

              {campaign.mystery_box_enabled && mysteryBoxes && mysteryBoxes.length > 0 && (
                <MysteryBox boxes={mysteryBoxes} />
              )}

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-12 rounded-xl gap-2 text-sm font-bold border-primary/20 hover:bg-primary/5">
                  <Share2 className="h-4 w-4 text-primary" /> Compartilhar
                </Button>
                <Button variant="outline" className="h-12 rounded-xl gap-2 text-sm font-bold border-primary/20 hover:bg-primary/5">
                  <Award className="h-4 w-4 text-primary" /> Afiliar-se
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container pb-20">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* Description & Info */}
            <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Info className="h-5 w-5 text-primary" /> Sobre esta rifa
              </h2>
              <div className="prose prose-invert max-w-none text-muted-foreground text-sm leading-relaxed">
                {campaign.description || "Sem descrição detalhada disponível."}
              </div>
            </div>

            {/* Winners section */}
            {campaignWinners.length > 0 && (
              <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  <Trophy className="h-5 w-5 text-primary" /> Ganhadores desta edição
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {campaignWinners.map((winner) => (
                    <div key={winner.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{winner.winner_name}</p>
                        <p className="text-[10px] text-muted-foreground">Bilhete #{winner.ticket_number}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {campaign.ranking_enabled && (
              <UserRanking />
            )}

            {/* Gamification / VIP Box */}
            <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/30 p-6 border border-primary/20 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-sm uppercase">Sistema VIP</h3>
                  <p className="text-[10px] text-muted-foreground">Quanto mais você participa, mais ganha!</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span>Próximo Nível</span>
                  <span className="text-primary">XP: 450/1000</span>
                </div>
                <div className="h-2 rounded-full bg-background overflow-hidden border border-border/50">
                  <div className="h-full w-[45%] bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                </div>
                <p className="text-[10px] text-center text-muted-foreground italic">
                  "Membros VIP têm 2x mais chances na Caixa Misteriosa!"
                </p>
              </div>
              <Button variant="secondary" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest">
                Ver Benefícios
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CampaignDetail;
