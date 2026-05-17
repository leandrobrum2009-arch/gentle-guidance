import { Zap, Trophy, Loader2, Sparkles, Gamepad2, Gift } from "lucide-react";
      {/* Gamification Teaser */}
      <section className="container py-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/30 p-4 border border-primary/20 flex flex-col items-center text-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Gamepad2 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-tighter">Roleta da Sorte</h3>
            <p className="text-[10px] text-muted-foreground">Gire e ganhe prêmios!</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-secondary/30 to-background p-4 border border-border/50 flex flex-col items-center text-center gap-2">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-tighter">Caixa Premiada</h3>
            <p className="text-[10px] text-muted-foreground">Prêmios instantâneos</p>
          </div>
        </div>
      </section>

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroCampaign from "@/components/HeroCampaign";
import CampaignCard from "@/components/CampaignCard";
import WinnerCard from "@/components/WinnerCard";
import { useCampaigns, useWinners } from "@/hooks/useData";

const Index = () => {
  const { data: campaigns, isLoading: loadingCampaigns } = useCampaigns();
  const { data: winners, isLoading: loadingWinners } = useWinners();

  const activeCampaign = campaigns?.find((c) => c.status === "active");
  const otherCampaigns = campaigns?.filter((c) => c.id !== activeCampaign?.id) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container pt-6">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h1 className="font-display text-lg font-bold">Campanhas</h1>
          <span className="text-sm text-muted-foreground">Escolha sua sorte</span>
        </div>
      </div>

      {loadingCampaigns ? (
        <div className="container flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {activeCampaign && <HeroCampaign campaign={activeCampaign} />}
          <section className="container space-y-3 pb-8">
            {otherCampaigns.map((campaign, i) => (
              <CampaignCard key={campaign.id} campaign={campaign} index={i} />
            ))}
          </section>
        </>
      )}

      <section className="container pb-8">
        <div className="mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-bold">Ganhadores</h2>
          <span className="text-sm text-muted-foreground">Sortudos</span>
        </div>

        {loadingWinners ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {winners?.map((winner, i) => (
              <WinnerCard key={winner.id} winner={winner} index={i} />
            ))}
          </div>
        )}
      </section>

      <section className="container pb-8">
        <div className="flex items-center justify-between rounded-xl bg-primary p-4">
          <div>
            <h3 className="font-display text-sm font-bold text-primary-foreground">
              Instalar o APP Grátis
            </h3>
            <p className="text-xs text-primary-foreground/70">
              Receba promoções exclusivas!
            </p>
          </div>
          <button className="rounded-lg bg-primary-foreground/20 p-2.5 text-primary-foreground">
            →
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
