import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RouletteComponent from "@/components/Roulette";
import { useCampaigns, useRoulettePrizes } from "@/hooks/useData";
import { Loader2 } from "lucide-react";

export default function Roulette() {
  const { data: campaigns, isLoading: loadingCampaigns } = useCampaigns();
  const activeCampaign = campaigns?.find(c => c.roulette_enabled && c.status === "active");
  const { data: prizes, isLoading: loadingPrizes } = useRoulettePrizes(activeCampaign?.id || "");

  const isLoading = loadingCampaigns || (!!activeCampaign && loadingPrizes);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pt-32 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-black uppercase italic leading-none tracking-tighter">
              Roleta da <span className="text-primary neon-text-primary">Sorte</span>
            </h1>
            <p className="text-muted-foreground uppercase font-bold tracking-widest text-xs">
              Gire para ganhar prêmios instantâneos, pontos e saldo!
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : activeCampaign && prizes ? (
            <RouletteComponent campaign={activeCampaign} prizes={prizes} />
          ) : (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
              <p className="text-muted-foreground uppercase font-bold tracking-widest text-sm">
                Nenhuma roleta ativa no momento.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
