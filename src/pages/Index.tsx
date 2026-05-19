import { useState, useEffect } from "react";
import { 
  Zap, Trophy, Loader2, Sparkles, Gamepad2, Gift, 
  TrendingUp, Award, Clock, Star, Users, Flame,
   ArrowRight, ShieldCheck, Heart, Link as LinkIcon, RotateCw
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useAdmin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
import HeroModel1 from "@/components/hero/HeroModel1";
import HeroModel2 from "@/components/hero/HeroModel2";
import HeroModel3 from "@/components/hero/HeroModel3";
import HeroModel4 from "@/components/hero/HeroModel4";
import CampaignCard from "@/components/CampaignCard";
import WinnerCard from "@/components/WinnerCard";
import LiveActivityFeed from "@/components/LiveActivityFeed";
import Roulette from "@/components/Roulette";
import CountdownTimer from "@/components/CountdownTimer";
import GoogleReviews from "@/components/GoogleReviews";
import { useCampaigns, useWinners, useSiteSettings } from "@/hooks/useData";
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
  const { data: siteSettings } = useSiteSettings();
  const { data: isAdmin } = useIsAdmin();
  const [heroStyle, setHeroStyle] = useState<number>(1); // Default style 1
  
  useEffect(() => {
    if (siteSettings?.home_hero_style) {
      setHeroStyle(parseInt(siteSettings.home_hero_style));
    } else {
      const savedStyle = localStorage.getItem('home_hero_style');
      if (savedStyle) setHeroStyle(parseInt(savedStyle));
    }
  }, [siteSettings]);

  const changeHeroStyle = (style: number) => {
    setHeroStyle(style);
    // Also save to localStorage for immediate visual feedback if needed, 
    // but the source of truth is now the database via site_settings
    localStorage.setItem('home_hero_style', style.toString());
    toast.success(`Estilo do slide alterado para Modelo ${style}!`);
  };

  const featuredCampaign = campaigns?.find((c) => c.featured && (c.status === "active" || c.status === "paused")) || campaigns?.find(c => c.status === "active");
  const otherCampaigns = campaigns?.filter((c) => c.id !== featuredCampaign?.id && (c.status === 'active' || c.status === 'paused' || c.status === 'completed' || c.status === 'audit')) ?? [];
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
             <div className="relative group">
                 {/* Style Selector - Only visible for admins to test visually */}
                 {isAdmin && (
                   <div className="absolute top-4 right-4 z-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {[1, 2, 3, 4].map(i => (
                        <Button 
                          key={i} 
                          size="sm" 
                          variant={heroStyle === i ? "default" : "outline"}
                          className="h-8 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md"
                          onClick={() => changeHeroStyle(i)}
                        >
                          M{i}
                        </Button>
                      ))}
                   </div>
                 )}

                {heroStyle === 1 && (
                  <HeroModel1 campaigns={campaigns.filter(c => c.featured || c.status === "active" || c.status === "paused" || c.status === "audit").slice(0, 5)} />
                )}
                {heroStyle === 2 && (
                  <HeroModel2 campaigns={campaigns.filter(c => c.featured || c.status === "active" || c.status === "paused" || c.status === "audit").slice(0, 5)} />
                )}
                {heroStyle === 3 && (
                  <HeroModel3 campaigns={campaigns.filter(c => c.featured || c.status === "active" || c.status === "paused" || c.status === "audit").slice(0, 5)} />
                )}
                {heroStyle === 4 && (
                  <HeroModel4 campaigns={campaigns.filter(c => c.featured || c.status === "active" || c.status === "paused" || c.status === "audit").slice(0, 5)} />
                )}
             </div>
           )}

          {/* Gamification Navigation - Improved Spacing and Visuals */}
          <section className="container relative z-30 -mt-8 md:-mt-12 py-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6">
                {[
                  { icon: Gamepad2, title: "Roleta Premiada", desc: "Gire e Ganhe Agora", color: "from-primary/40", href: "/roleta", badge: "HOT" },
                  { icon: Sparkles, title: "Raspadinha", desc: "Prêmios Instantâneos", color: "from-amber-500/40", href: "/raspadinha", badge: "NOVO" },
                  { icon: Gift, title: "Caixa Misteriosa", desc: "Prêmios Secretos", color: "from-orange-500/40", href: "/caixa-misteriosa", badge: "HOT" },
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
                       className={`group relative overflow-hidden h-full rounded-3xl border border-border bg-card p-6 shadow-xl cursor-pointer transition-all duration-500 hover:border-primary/50`}
                    >
                    <div className={`absolute -right-8 -top-8 h-32 w-32 bg-gradient-to-br ${item.color} to-transparent blur-3xl transition-opacity group-hover:opacity-100 opacity-20`} />
                    {item.badge && (
                      <Badge className="absolute top-4 right-4 bg-primary text-[8px] font-black italic animate-bounce px-2 py-0.5">
                        {item.badge}
                      </Badge>
                    )}
                    <div className="h-12 w-12 rounded-2xl bg-secondary border border-border flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:border-primary/50 transition-all">
                      <item.icon className="relative z-10 h-6 w-6 text-primary" />
                    </div>
                    <h3 className="relative z-10 text-sm font-black uppercase tracking-widest text-foreground leading-none mb-2">{item.title}</h3>
                    <p className="relative z-10 text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{item.desc}</p>
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
                    {otherCampaigns.map((campaign, i) => (
                      <CampaignCard key={campaign.id} campaign={campaign} index={i} />
                    ))}
                  </div>
               </div>
 
                <div className="space-y-6">
                  {/* Live Activity Feed */}
                  <div className="rounded-3xl border border-border bg-card p-6 shadow-xl">
                    <LiveActivityFeed />
                  </div>
 
                 {/* Small Featured Roulette - Redesigned */}
                 {featuredCampaign?.roulette_enabled && (
                    <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/10 p-8 shadow-2xl relative overflow-hidden group">
                     {/* Decorative Elements */}
                     <div className="absolute -right-16 -top-16 h-48 w-48 bg-primary/30 blur-3xl rounded-full group-hover:bg-primary/40 transition-all duration-700" />
                     <div className="absolute -left-16 -bottom-16 h-48 w-48 bg-secondary/30 blur-3xl rounded-full" />
                     
                     <div className="relative z-10 flex flex-col items-center text-center">
                        <Badge className="bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-lg shadow-primary/20">
                          🔥 OPORTUNIDADE ÚNICA
                        </Badge>
                        <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-tight mb-2">
                          Gire a <span className="text-primary neon-text-primary">Sorte</span> Agora!
                        </h3>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-6 max-w-xs">
                          Prêmios instantâneos exclusivos para participantes ativos. Não fique de fora!
                        </p>
                        
                        <div className="relative flex justify-center py-4 mb-6">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="relative h-40 w-40 rounded-full border-4 border-dashed border-primary/30 flex items-center justify-center p-3"
                          >
                             <div className="h-full w-full rounded-full bg-gradient-to-tr from-primary/20 via-card to-secondary/20 border-2 border-primary/30 flex items-center justify-center shadow-inner">
                               <RotateCw className="h-12 w-12 text-primary opacity-60" />
                             </div>
                          </motion.div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Gamepad2 className="h-12 w-12 text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
                            </motion.div>
                          </div>
                        </div>

                        <Link to={`/roleta`} className="w-full">
                          <Button className="w-full h-14 rounded-2xl font-black uppercase italic tracking-widest glow-primary group shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                            ACESSAR ROLETA <Sparkles className="ml-2 h-5 w-5" />
                          </Button>
                        </Link>
                        
                        <div className="flex items-center gap-2 mt-6">
                           <div className="flex -space-x-2">
                              {[1,2,3].map(i => (
                                <div key={i} className="h-6 w-6 rounded-full border-2 border-card bg-secondary flex items-center justify-center overflow-hidden">
                                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                                </div>
                              ))}
                           </div>
                           <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                             +1.2k giraram hoje
                           </p>
                        </div>
                     </div>
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
                  {endingSoon.slice(0, 4).map((campaign, i) => (
                    <div key={i} className="bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-4 flex items-center gap-4 shadow-sm group hover:border-primary/50 transition-all duration-300">
                       <div className="relative h-16 w-16 flex-shrink-0">
                         <img src={campaign.image_url || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=256&h=256&auto=format&fit=crop"} className="h-full w-full rounded-xl object-cover" alt="" />
                         <div className="absolute inset-0 bg-primary/20 blur-sm rounded-xl animate-pulse group-hover:bg-primary/40" />
                       </div>
                      <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between mb-1 text-foreground">
                            <h4 className="font-bold text-xs truncate uppercase tracking-tighter">{campaign.title}</h4>
                            {campaign.draw_date && <CountdownTimer targetDate={campaign.draw_date} className="scale-75 origin-right" />}
                          </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: `${(campaign.sold_tickets/campaign.total_tickets)*100}%` }}
                              className="h-full bg-primary" 
                            />
                          </div>
                          <span className="text-[8px] font-black text-primary">{(campaign.sold_tickets/campaign.total_tickets*100).toFixed(0)}%</span>
                        </div>
                        {/* Participants faces */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="flex -space-x-2">
                            {[
                              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=32&h=32&auto=format&fit=crop",
                              "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=32&h=32&auto=format&fit=crop",
                              "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=32&h=32&auto=format&fit=crop",
                              "https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?q=80&w=32&h=32&auto=format&fit=crop",
                              "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=32&h=32&auto=format&fit=crop"
                            ].map((img, idx) => (
                              <img key={idx} src={img} className="h-5 w-5 rounded-full border-2 border-card object-cover" alt="User" />
                            ))}
                          </div>
                          <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">+ {Math.floor(Math.random() * 500)} participando</span>
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

          {/* Ganhadores Cinematic Section - Hall da Fama */}
          <section className="container py-20 relative">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 bg-primary/10 blur-[100px] rounded-full" />
            
            <SectionHeading 
              icon={Trophy} 
              title="Hall da Fama" 
              subtitle="Conheça os mais novos sortudos da plataforma"
              badge="Inspire-se"
            />
            
            {loadingWinners ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
               <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                 {(winners && winners.length > 0 ? winners : [
                    { id: "1", winner_name: "José Ferreira", prize_description: "iPhone 15 Pro", ticket_number: "8293", campaigns: { title: "Rifa de Verão" }, avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop", winner_type: "raffle", draw_date: new Date().toISOString() },
                    { id: "2", winner_name: "Maria Luiza", prize_description: "R$ 5.000,00 no PIX", ticket_number: "1029", campaigns: { title: "Super PIX" }, avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&h=256&auto=format&fit=crop", winner_type: "lucky_number", draw_date: new Date().toISOString() },
                    { id: "3", winner_name: "Carlos Manoel", prize_description: "R$ 100,00 de Saldo", ticket_number: "ROLETA", campaigns: { title: "Giro da Sorte" }, avatar_url: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=256&h=256&auto=format&fit=crop", winner_type: "roulette", draw_date: new Date().toISOString() },
                    { id: "4", winner_name: "Beatriz Souza", prize_description: "R$ 50,00 Instantâneo", ticket_number: "RASPA", campaigns: { title: "Raspadinha" }, avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&auto=format&fit=crop", winner_type: "scratchcard", draw_date: new Date().toISOString() }
                 ]).slice(0, 8).map((winner, i) => (
                  <div key={winner.id} className="relative group">
                    {/* Speech Bubble / Balloon Effect */}
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        delay: i * 0.2,
                        duration: 0.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        repeatDelay: 5
                      }}
                      className="absolute -top-14 left-4 right-4 bg-primary text-primary-foreground p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center shadow-xl z-20 group-hover:scale-110 transition-transform"
                    >
                      {["EU GANHEI!", "ACREDITEI E FOI!", "DEU BOM!", "SÓ ALEGRIA!"][i % 4]}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-t-8 border-t-primary border-x-8 border-x-transparent" />
                    </motion.div>
                    
                    <WinnerCard winner={winner as any} index={i} />
                  </div>
                ))}
              </div>
            )}
          </section>

          <GoogleReviews />

          {/* Social Proof / Security */}
          <section className="border-y border-border bg-secondary/30 py-16">
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
