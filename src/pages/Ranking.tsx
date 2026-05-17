import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserRanking from "@/components/UserRanking";

export default function Ranking() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pt-32 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-black uppercase italic leading-none tracking-tighter">
              Ranking <span className="text-primary neon-text-primary">Top 10</span>
            </h1>
            <p className="text-muted-foreground uppercase font-bold tracking-widest text-xs">
              Os maiores jogadores e colecionadores de pontos da plataforma!
            </p>
          </div>
          <UserRanking />
        </div>
      </main>
      <Footer />
    </div>
  );
}
