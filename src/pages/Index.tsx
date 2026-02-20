import { Zap, Trophy, Loader2 } from "lucide-react";
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
