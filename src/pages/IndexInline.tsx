import { Link } from "react-router-dom";
import { Sparkles, Gamepad2, Gift, RotateCw } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CampaignCard from "@/components/CampaignCard";
import { useCampaigns, useSiteSettings } from "@/hooks/useData";
import FinishedRafflesInline from "@/components/inline/FinishedRafflesInline";
import TestimonialsCarouselInline from "@/components/inline/TestimonialsCarouselInline";
import { SEO } from "@/components/SEO";

const IndexInline = () => {
  const { data: campaigns } = useCampaigns();
  const { data: settings } = useSiteSettings();

  const now = new Date();
  const active = (campaigns || []).filter((c: any) => {
    const ended = ["completed", "finished", "drawn"].includes(c.status);
    const expired = c.draw_date && new Date(c.draw_date) <= now;
    return !ended && !expired;
  });

  const testimonialsCount = parseInt(String(settings?.inline_testimonials_count ?? "3"), 10) || 3;
  const showFinished = String(settings?.inline_show_finished_raffles ?? "true") === "true";

  const games = [
    { to: "/roleta-premiada", label: "Roleta", icon: RotateCw },
    { to: "/raspadinha-da-sorte", label: "Raspadinha", icon: Sparkles },
    { to: "/caixa-misteriosa-de-premios", label: "Caixas", icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO title={settings?.site_title || settings?.site_name || "Rifas Online"} />
      <Header />

      {/* Hero compacto */}
      <section className="px-3 pt-4 pb-3">
        <div className="rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 p-4">
          <h1 className="text-lg font-black uppercase italic tracking-tighter leading-tight">
            Concorra a <span className="text-primary">Prêmios Incríveis</span>
          </h1>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Compre cotas e ganhe prêmios instantâneos
          </p>
        </div>
      </section>

      {/* Jogos rápidos */}
      <section className="px-3 pb-3">
        <div className="grid grid-cols-3 gap-2">
          {games.map((g) => (
            <Link
              key={g.to}
              to={g.to}
              className="flex flex-col items-center gap-1 rounded-2xl border border-border/60 bg-card/60 py-3 hover:border-primary/50 transition"
            >
              <g.icon className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.15em]">{g.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Rifas ativas */}
      <section className="px-3 py-3">
        <div className="flex items-center gap-2 mb-3">
          <Gamepad2 className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-black uppercase tracking-[0.2em]">Rifas Ativas</h2>
        </div>
        {active.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Nenhuma rifa ativa no momento.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {active.slice(0, 6).map((c: any, i: number) => (
              <CampaignCard key={c.id} campaign={c} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Finalizadas em lista */}
      {showFinished && <FinishedRafflesInline />}

      {/* Depoimentos carrossel */}
      <TestimonialsCarouselInline count={testimonialsCount} />

      <Footer />
    </div>
  );
};

export default IndexInline;