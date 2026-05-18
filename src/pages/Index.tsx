import { 
  Zap, Trophy, Loader2, Sparkles, Gamepad2, Gift, 
  TrendingUp, Award, Clock, Star, Users, Flame,
   ArrowRight, ShieldCheck, Heart, Link as LinkIcon, RotateCw
} from "lucide-react";
import { motion } from "framer-motion";
 import { Link } from "react-router-dom";
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
  import LiveActivityFeed from "@/components/LiveActivityFeed";
 import Roulette from "@/components/Roulette";
import CountdownTimer from "@/components/CountdownTimer";
import { useCampaigns, useWinners } from "@/hooks/useData";
import { playSound, hapticFeedback } from "@/lib/sounds";
import Particles from "@/components/Particles";

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
     <div className="min-h-screen bg-background relative overflow-hidden">
       {/* Global Background Particles */}
       <div className="fixed inset-0 z-0">
         <Particles count={50} />
       </div>

       <Header />
        <div className="h-16 md:h-20" />

       {loadingCampaigns ? (
        <div className="flex h-[90vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
           {campaigns && campaigns.length > 0 && (
             <RaffleCarousel campaigns={campaigns.filter(c => c.featured || c.status === "active").slice(0, 5)} />
           )}

          {/* Gamification Navigation - Improved Spacing and Visuals */}
          <section className="container relative z-30 -mt-8 md:-mt-12 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                {[
                  { icon: Gamepad2, title: "Roleta Premiada", desc: "Gire e Ganhe Agora", color: "from-primary/40", href: "/roleta", badge: "HOT" },
                  { icon: Gift, title: "Caixa Misteriosa", desc: "Prêmios Secretos", color: "from-orange-500/40", href: "/caixa-misteriosa", badge: "NOVO" },
                  { icon: Award, title: "Ranking Top", desc: "Melhores do Mês", color: "from-blue-500/40", href: "/ranking" },
                  { icon: Users, title: "Afiliados", desc: "Ganhe Comissões", color: "from-purple-500/40", href: "/afiliados" },
                ].map((item, i) => (
                  <Link key={i} to={item.href} onClick={() => { playSound('click'); hapticFeedback(); }}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -12, scale: 1.05, boxShadow: "0 20px 40px -10px rgba(var(--primary-rgb), 0.3)" }}
                      onMouseEnter={() => playSound('hover')}
                      whileTap={{ scale: 0.95 }}
                       className={`group relative overflow-hidden h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-xl cursor-pointer transition-all duration-500 hover:border-primary/50`}
                    >
                    <div className={`absolute -right-8 -top-8 h-32 w-32 bg-gradient-to-br ${item.color} to-transparent blur-3xl transition-opacity group-hover:opacity-100 opacity-20`} />
                    {item.badge && (
                      <Badge className="absolute top-4 right-4 bg-primary text-[8px] font-black italic animate-bounce px-2 py-0.5">
                        {item.badge}
                      </Badge>
                    )}
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:border-primary/50 transition-all">
                      <item.icon className="relative z-10 h-6 w-6 text-primary" />
                    </div>
                    <h3 className="relative z-10 text-sm font-black uppercase tracking-widest text-foreground leading-none mb-2">{item.title}</h3>
                    <p className="relative z-10 text-[10px] text-slate-400 uppercase font-bold tracking-tighter">{item.desc}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>

           {/* Premium Draws & Live Activity */}
           <section className="container py-10">
             <div className="grid gap-12 lg:grid-cols-3">
               <div className="lg:col-span-2 space-y-8">
                 <SectionHeading 
                   icon={Zap} 
                   title="Sorteios Premium" 
                   subtitle="Os prêmios mais desejados do momento"
                   badge="Em Destaque"
                 />
                 <div className="grid gap-6 sm:grid-cols-2">
                   {otherCampaigns.slice(0, 4).map((campaign, i) => (
                     <CampaignCard key={campaign.id} campaign={campaign} index={i} />
                   ))}
                 </div>
               </div>
 
                <div className="space-y-6">
                  {/* Live Activity Feed */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
                    <LiveActivityFeed />
                  </div>
 
                 {/* Small Featured Roulette */}
                 {featuredCampaign?.roulette_enabled && (
                    <div className="rounded-3xl border border-primary/20 bg-white p-6 shadow-xl relative overflow-hidden group">
                     <div className="absolute -right-10 -top-10 h-40 w-40 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-all" />
                     <h3 className="text-sm font-black uppercase tracking-widest italic mb-4 flex items-center gap-2">
                       <Gamepad2 className="h-4 w-4 text-primary" /> Tente a <span className="text-primary">Sorte</span>
                     </h3>
                     <div className="scale-75 -my-10 origin-center">
                       {/* We need to fetch prizes for this campaign, but for the home page we can use a generic set or the first campaign's prizes */}
                       <Link to={`/campaign/${featuredCampaign.id}`}>
                         <Button className="w-full h-32 rounded-3xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all flex flex-col gap-2 group">
                           <RotateCw className="h-8 w-8 text-primary group-hover:rotate-180 transition-transform duration-500" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Ver Roleta da Campanha</span>
                         </Button>
                       </Link>
                     </div>
                     <p className="text-[9px] text-center text-muted-foreground uppercase font-bold tracking-tighter mt-4">
                       Prêmios instantâneos em todos os sorteios ativos
                     </p>
                   </div>
                 )}
               </div>
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
                    <div key={i} className="bg-white/60 backdrop-blur-sm border border-slate-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                       <div className="relative h-16 w-16 flex-shrink-0">
                         <img src={campaign.image_url || ""} className="h-full w-full rounded-xl object-cover" alt="" />
                         <div className="absolute inset-0 bg-primary/20 blur-sm rounded-xl animate-pulse" />
                       </div>
                      <div className="min-w-0 flex-1">
                         <div className="flex items-center justify-between mb-1 text-foreground">
                           <h4 className="font-bold text-xs truncate">{campaign.title}</h4>
                           {campaign.draw_date && <CountdownTimer targetDate={campaign.draw_date} className="scale-75 origin-right" />}
                         </div>
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
                 <Button 
                   size="lg" 
                   className="h-14 rounded-2xl px-8 font-black uppercase italic tracking-widest glow-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] animate-pulse"
                   onClick={() => { playSound('click'); hapticFeedback(); }}
                 >
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
                  <WinnerCard key={winner.id} winner={winner} index={i} />
                ))}
              </div>
            )}
          </section>

          {/* Social Proof / Security */}
          <section className="border-y border-slate-100 bg-slate-50 py-16">
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
                      <h4 className="text-xs font-black uppercase tracking-widest text-foreground">{item.title}</h4>
                      <p className="text-[11px] font-medium leading-relaxed text-slate-500 uppercase tracking-widest">{item.desc}</p>
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
