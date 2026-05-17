import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MysteryBoxComponent from "@/components/MysteryBox";
import { useCampaigns, useMysteryBoxes } from "@/hooks/useData";
import { Loader2 } from "lucide-react";

export default function MysteryBoxPage() {
  const { data: campaigns, isLoading: loadingCampaigns } = useCampaigns();
  const activeCampaign = campaigns?.find(c => c.mystery_box_enabled && c.status === "active");
  const { data: boxes, isLoading: loadingBoxes } = useMysteryBoxes(activeCampaign?.id || "");

  const isLoading = loadingCampaigns || (!!activeCampaign && loadingBoxes);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pt-32 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-black uppercase italic leading-none tracking-tighter">
              Caixa <span className="text-primary neon-text-primary">Misteriosa</span>
            </h1>
            <p className="text-muted-foreground uppercase font-bold tracking-widest text-xs">
              Abra caixas e descubra prêmios incríveis instantaneamente!
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : activeCampaign && boxes ? (
            <MysteryBoxComponent campaignId={activeCampaign.id} boxes={boxes} />
          ) : (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
              <p className="text-muted-foreground uppercase font-bold tracking-widest text-sm">
                Nenhuma caixa misteriosa ativa no momento.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
