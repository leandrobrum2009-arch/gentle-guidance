import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Shield,
  Trophy,
  Users,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { mockCampaigns } from "@/data/mockData";

const QUICK_QTY = [1, 5, 10, 25, 50, 100];

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const campaign = mockCampaigns.find((c) => c.id === id);
  const [quantity, setQuantity] = useState(1);

  const progress = campaign
    ? Math.round((campaign.soldTickets / campaign.totalTickets) * 100)
    : 0;

  const total = useMemo(
    () => (campaign ? quantity * campaign.ticketPrice : 0),
    [quantity, campaign]
  );

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container flex flex-col items-center justify-center py-20">
          <h1 className="font-display text-2xl font-bold">Campanha não encontrada</h1>
          <Link to="/">
            <Button variant="outline" className="mt-4 gap-2">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isActive = campaign.status === "active";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para campanhas
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container pb-10"
      >
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Image + Info */}
          <div className="space-y-4 lg:col-span-3">
            <div className="relative overflow-hidden rounded-2xl border border-border/50">
              <img
                src={campaign.image}
                alt={campaign.title}
                className="aspect-video w-full object-cover"
              />
              {campaign.urgencyTag && (
                <div className="absolute left-3 top-3">
                  <Badge className="animate-pulse-glow bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                    {campaign.urgencyTag}
                  </Badge>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
              <div>
                <h1 className="font-display text-xl font-bold sm:text-2xl">
                  {campaign.title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">{campaign.subtitle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="font-mono font-semibold text-foreground/70">
                  {campaign.code}
                </span>
                <Badge variant={isActive ? "default" : "secondary"} className="text-[10px]">
                  {isActive ? "Ativo" : "Concluído"}
                </Badge>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {campaign.drawDate} às {campaign.drawTime}
                </span>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso de vendas</span>
                  <span className="font-semibold text-primary">{progress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-[hsl(80,96%,60%)]"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{campaign.soldTickets.toLocaleString("pt-BR")} vendidos</span>
                  <span>{campaign.totalTickets.toLocaleString("pt-BR")} total</span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-secondary/50 p-3">
                  <Trophy className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <p className="text-xs text-muted-foreground">Prêmio</p>
                  <p className="text-xs font-semibold">Garantido</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <Shield className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <p className="text-xs text-muted-foreground">Pagamento</p>
                  <p className="text-xs font-semibold">Seguro</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <Users className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <p className="text-xs text-muted-foreground">Participantes</p>
                  <p className="text-xs font-semibold">
                    {(campaign.soldTickets / 3).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}+
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Selector Sidebar */}
          <div className="lg:col-span-2">
            <div className="sticky top-20 space-y-4">
              <div className="rounded-xl border border-border/50 bg-card p-5 space-y-5 glow-primary">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Valor por bilhete</p>
                  <p className="font-display text-3xl font-bold text-primary">
                    R$ {campaign.ticketPrice.toFixed(2).replace(".", ",")}
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="mb-2 text-center text-xs font-medium text-muted-foreground">
                    Selecione a quantidade
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {QUICK_QTY.map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuantity(q)}
                        className={`rounded-lg border py-2.5 text-sm font-semibold transition-all ${
                          quantity === q
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-secondary/50 text-foreground hover:border-primary/50"
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-foreground transition-colors hover:border-primary"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-16 text-center font-display text-2xl font-bold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-foreground transition-colors hover:border-primary"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-display text-2xl font-bold text-primary">
                    R$ {total.toFixed(2).replace(".", ",")}
                  </span>
                </div>

                <Button
                  size="lg"
                  className="w-full gap-2 text-base font-bold"
                  disabled={!isActive}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {isActive ? "Comprar Bilhetes" : "Campanha Encerrada"}
                </Button>

                <p className="text-center text-[11px] text-muted-foreground">
                  Pagamento via PIX • Confirmação instantânea
                </p>
              </div>

              <Button variant="outline" className="w-full gap-2 text-sm">
                <Share2 className="h-4 w-4" />
                Compartilhar Campanha
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default CampaignDetail;
