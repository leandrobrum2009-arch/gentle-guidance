import { 
  Zap, Trophy, Loader2, Sparkles, Gamepad2, Gift, 
  TrendingUp, Award, Clock, Star, Users, Flame,
  ArrowRight, ShieldCheck, Heart
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
 import RaffleCarousel from "@/components/RaffleCarousel";
import CampaignCard from "@/components/CampaignCard";
import WinnerCard from "@/components/WinnerCard";
import { useCampaigns, useWinners } from "@/hooks/useData";

const SectionHeading = ({ icon: Icon, title, subtitle, badge }: { icon: any, title: string, subtitle: string, badge?: string }) => (
  <div className="flex flex-col gap-2 mb-8">
    <div className="flex items-center gap-2">
      {badge && <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase tracking-widest">{badge}</Badge>}
    </div>
    <div className="flex items-center justify-between items-end">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <h2 className="font-display text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-none">
            {title.split(' ')[0]} <span className="text-primary neon-text-primary">{title.split(' ').slice(1).join(' ')}</span>
          </h2>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">{subtitle}</p>
      </div>
      <Button variant="ghost" size="sm" className="hidden sm:flex text-[10px] font-black uppercase tracking-widest gap-1 hover:text-primary">
        Ver Todos <ArrowRight className="h-3 w-3" />
      </Button>
    </div>
  </div>
);

const Index = () => {
  const { data: campaigns, isLoading: loadingCampaigns } = useCampaigns();
  const { data: winners, isLoading: loadingWinners } = useWinners();

  const featuredCampaign = campaigns?.find((c) => c.featured && c.status === "active") || campaigns?.find(c => c.status === "active");
  const otherCampaigns = campaigns?.filter((c) => c.id !== featuredCampaign?.id && c.status === 'active') ?? [];
  const endingSoon = campaigns?.filter(c => c.status === 'active' && c.sold_tickets / c.total_tickets > 0.8) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {loadingCampaigns ? (
        <div className="flex h-[90vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
           {campaigns && campaigns.length > 0 && (
             <RaffleCarousel campaigns={campaigns.filter(c => c.featured || c.status === "active").slice(0, 5)} />
           )}

          {/* Gamification Navigation */}
          <section className="container -mt-10 relative z-20 pb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Gamepad2, title: "Roleta VIP", desc: "Gire e Ganhe", color: "from-primary/20" },
                { icon: Gift, title: "Caixa Misteriosa", desc: "Prêmios Secretos", color: "from-orange-500/20" },
                { icon: Award, title: "Ranking Top", desc: "Melhores do Mês", color: "from-blue-500/20" },
                { icon: Users, title: "Afiliados", desc: "Ganhe Comissões", color: "from-purple-500/20" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 p-6 glass-morphism backdrop-blur-md cursor-pointer`}
                >
                  <div className={`absolute -right-4 -top-4 h-24 w-24 bg-gradient-to-br ${item.color} to-transparent blur-2xl transition-opacity group-hover:opacity-100 opacity-50`} />
                  <item.icon className="relative z-10 h-8 w-8 text-primary mb-4" />
                  <h3 className="relative z-10 text-xs font-black uppercase tracking-widest">{item.title}</h3>
                  <p className="relative z-10 text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mt-1">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Featured Section */}
          <section className="container py-10">
            <SectionHeading 
              icon={Zap} 
              title="Sorteios Premium" 
              subtitle="Os prêmios mais desejados do momento"
              badge="Em Destaque"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {otherCampaigns.slice(0, 3).map((campaign, i) => (
                <CampaignCard key={campaign.id} campaign={campaign} index={i} />
              ))}
            </div>
          </section>

          {/* Ending Soon */}
          <section className="container py-10">
            <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-background to-secondary/20 border border-primary/20 p-8 md:p-12 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 hidden lg:block">
                <Clock className="h-64 w-64 text-primary" />
              </div>
              <div className="relative z-10 max-w-2xl space-y-6">
                <Badge className="bg-destructive text-white border-none font-black italic tracking-tighter animate-pulse">
                  🔥 CORRE QUE TÁ ACABANDO
                </Badge>
                <h2 className="text-4xl md:text-6xl font-black uppercase italic italic leading-none tracking-tighter">
                  Últimas <span className="text-primary neon-text-primary">Oportunidades</span>
                </h2>
                <p className="text-muted-foreground text-sm md:text-lg font-medium">
                  Esses sorteios já venderam mais de 80% dos bilhetes. Sua chance de ganhar pode ser o próximo clique.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {endingSoon.slice(0, 2).map((campaign, i) => (
                    <div key={i} className="bg-background/40 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                      <img src={campaign.image_url || ""} className="h-16 w-16 rounded-xl object-cover" alt="" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs truncate">{campaign.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${(campaign.sold_tickets/campaign.total_tickets)*100}%` }} />
                          </div>
                          <span className="text-[8px] font-black text-primary">{(campaign.sold_tickets/campaign.total_tickets*100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button size="lg" className="h-14 rounded-2xl px-8 font-black uppercase italic tracking-widest glow-primary">
                  Ver Tudo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </section>

          {/* Ganhadores Cinematic Section */}
          <section className="container py-20">
            <SectionHeading 
              icon={Trophy} 
              title="Hall da Fama" 
              subtitle="Conheça os mais novos sortudos da plataforma"
            />
            {loadingWinners ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {winners?.slice(0, 4).map((winner, i) => (
                  <motion.div
                    key={winner.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-4 hover:border-primary/50 transition-all cursor-pointer"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl mb-4">
                      <img src={winner.video_url || "/placeholder.svg"} className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full border-2 border-primary bg-background flex items-center justify-center font-black italic text-[10px] text-primary">
                          {winner.winner_name[0]}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase italic tracking-tighter text-white leading-none">{winner.winner_name}</p>
                          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Ganhador(a)</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">{winner.prize_description}</p>
                      <p className="text-[10px] font-bold text-muted-foreground">Sorteio: {winner.campaigns?.title}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Social Proof / Security */}
          <section className="border-y border-white/5 bg-white/[0.02] py-16">
            <div className="container">
              <div className="grid gap-12 lg:grid-cols-3">
                {[
                  { icon: ShieldCheck, title: "100% SEGURO", desc: "Processamos milhares de transações diariamente com segurança militar." },
                  { icon: Award, title: "PRÊMIOS REAIS", desc: "Todos os nossos sorteios são auditados e os prêmios entregues pessoalmente." },
                  { icon: Heart, title: "SOCIAL", desc: "Parte de cada arrecadação é destinada a instituições de caridade parceiras." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-12 w-12 flex-shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase tracking-widest text-white">{item.title}</h4>
                      <p className="text-[11px] font-medium leading-relaxed text-muted-foreground uppercase tracking-widest">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
};

export default Index;
