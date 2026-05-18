import { useState, useEffect } from "react";
import { motion } from "framer-motion";
 import { 
    User, LogOut, Trophy, History, Coins, Activity,
    Wallet, Bell, TrendingUp, CreditCard, Star, Gift,
    Zap, Ticket, ArrowUpRight, ArrowDownLeft, ChevronRight, RotateCw, Crown,
    Package, ShoppingBag, Users, CheckCircle2, Lock, ChevronLeft, Copy, Share2
 } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
 import { 
   useUserOrders, 
   useUserWalletTransactions, 
   useUserAchievements, 
   useUserRewards,
   useRanking,
    useUserNotifications,
    useUserSpins,
    useUserMysteryBoxWins,
    markNotificationsAsRead,
    useUserReferrals,
    useAffiliateCommissions
 } from "@/hooks/useData";
 import { useIsAdmin } from "@/hooks/useAdmin";
 import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UserRanking from "@/components/UserRanking";
import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
 import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from "@/lib/utils";

 export default function Account() {
   const { user, signOut } = useAuth();
   const { data: orders } = useUserOrders(user?.id || "");
   const { data: spins } = useUserSpins(user?.id || "");
   const { data: boxWins } = useUserMysteryBoxWins(user?.id || "");
   const { data: txs } = useUserWalletTransactions(user?.id || "");
   const { data: achievements } = useUserAchievements(user?.id || "");
   const { data: ranking } = useRanking(10);
   const { data: notifications } = useUserNotifications(user?.id || "");
    const { data: rewards } = useUserRewards(user?.id || "");

   const [spinsPage, setSpinsPage] = useState(1);
   const [boxesPage, setBoxesPage] = useState(1);
   const [ordersPage, setOrdersPage] = useState(1);
   const [txsPage, setTxsPage] = useState(1);
   const [commissionsPage, setCommissionsPage] = useState(1);
   const ITEMS_PER_PAGE = 5;
 
   const [profile, setProfile] = useState<any>(null);
   const [affiliate, setAffiliate] = useState<any>(null);
   const { data: referrals } = useUserReferrals(affiliate?.referral_code || "");
   const { data: commissions } = useAffiliateCommissions(affiliate?.id || "");

   const [isLoading, setIsLoading] = useState(true);
   const [activeTab, setActiveTab] = useState(() => {
     const hash = window.location.hash.replace('#', '');
     const validTabs = ["overview", "notifications", "finance", "ranking", "achievements", "games"];
     return validTabs.includes(hash) ? hash : "overview";
   });
 
   useEffect(() => {
     const handleHashChange = () => {
       const hash = window.location.hash.replace('#', '');
       const validTabs = ["overview", "notifications", "finance", "ranking", "achievements", "games"];
       if (validTabs.includes(hash)) {
         setActiveTab(hash);
       }
     };
     window.addEventListener('hashchange', handleHashChange);
     return () => window.removeEventListener('hashchange', handleHashChange);
   }, []);
 
   useEffect(() => {
     if (user) {
       const fetchData = async () => {
         const { data: p } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
         setProfile(p);
         const { data: a } = await supabase.from("affiliates").select("*").eq("user_id", user.id).maybeSingle();
         setAffiliate(a);
         setIsLoading(false);
       };
       fetchData();
     }
   }, [user]);
 

  const progressPercent = ((profile?.xp || 0) % 1000) / 10;
  const chartData = (txs || []).slice(0, 10).reverse().map((t: any) => ({
    name: format(new Date(t.created_at), "dd/MM"),
    amount: Number(t.amount)
  }));

  const ALL_ACHIEVEMENTS = [
    { key: 'first_deposit', title: 'Primeiro Passo', description: 'Realize seu primeiro depósito na plataforma', icon: Wallet, points: 100, category: 'Financeiro' },
    { key: 'referral_1', title: 'Embaixador', description: 'Convide 1 amigo que realize um depósito', icon: Users, points: 500, category: 'Social' },
    { key: 'spin_10', title: 'Mestre da Roleta', description: 'Realize 10 giros na roleta', icon: RotateCw, points: 200, category: 'Jogos' },
    { key: 'box_5', title: 'Caçador de Tesouros', description: 'Abra 5 caixas misteriosas', icon: Package, points: 300, category: 'Jogos' },
    { key: 'lucky_win', title: 'Pé Quente', description: 'Ganhe seu primeiro prêmio em uma rifa', icon: Trophy, points: 1000, category: 'Rifas' },
    { key: 'vip_silver', title: 'Membro Prata', description: 'Alcance o nível 5 VIP', icon: Star, points: 2000, category: 'Nível' },
  ];

  const queryClient = useQueryClient();

  const copyReferral = () => {
    if (affiliate?.referral_code) {
      const link = `${window.location.origin}/?ref=${affiliate.referral_code}`;
      navigator.clipboard.writeText(link);
      toast.success("Link de indicação copiado!");
    } else {
      toast.error("Você ainda não possui um código de indicação.");
    }
  };

  const handleShareReferral = async () => {
    if (!affiliate?.referral_code) return;
    const link = `${window.location.origin}/?ref=${affiliate.referral_code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'RifasPro - Indique e Ganhe!',
          text: 'Participe dos melhores sorteios com prêmios incríveis!',
          url: link,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      copyReferral();
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await markNotificationsAsRead(user.id);
      toast.success("Notificações marcadas como lidas");
      queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
    } catch (error) {
      toast.error("Erro ao marcar notificações como lidas");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Header />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container relative z-10 py-10 pt-24"
      >
        <div className="grid gap-8 lg:grid-cols-12">
          <aside className="lg:col-span-3 space-y-6">
            <Card className="bg-[#0d0d0f]/50 border-white/5 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-1 mb-4 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
                     <div className="h-full w-full rounded-full bg-[#0d0d0f] flex items-center justify-center">
                        <User className="h-10 w-10 text-white" />
                     </div>
                  </div>
                  <h2 className="text-lg font-bold">{profile?.name || "Usuário"}</h2>
                  <p className="text-xs text-slate-500 mb-4">{user?.email}</p>
                  <div className="w-full bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2">
                      <span>Nível {profile?.vip_level || 1} VIP</span>
                      <span>{profile?.xp || 0} XP</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <nav className="space-y-2">
              {[
                { label: "Painel Geral", id: "overview", icon: Activity },
                { label: "Notificações", id: "notifications", icon: Bell },
                { label: "Carteira & PIX", id: "finance", icon: Wallet },
                { label: "Ranking Global", id: "ranking", icon: Trophy },
                 { label: "Conquistas", id: "achievements", icon: Star },
                 { label: "Giros & Caixas", id: "games", icon: ShoppingBag },
              ].map((item) => (
                <Button 
                    key={item.id} 
                    variant="ghost" 
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                        "w-full justify-start gap-3 rounded-xl transition-all duration-300",
                        activeTab === item.id ? "bg-primary/10 text-primary border border-primary/20" : "text-slate-400 hover:text-white"
                    )}
                >
                  <item.icon className="h-4 w-4" /> {item.label}
                </Button>
              ))}
              <Separator className="bg-white/5 my-4" />
              <Button variant="ghost" className="w-full justify-start gap-3 text-rose-400 hover:text-rose-300 rounded-xl hover:bg-rose-500/10" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" /> Sair
              </Button>
            </nav>
          </aside>

          <main className="lg:col-span-9 space-y-6">
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { label: "Saldo", val: `R$ ${Number(profile?.balance || 0).toFixed(2)}`, icon: Wallet, color: "text-emerald-400" },
                { label: "Cashback", val: `R$ ${Number(profile?.cashback_balance || 0).toFixed(2)}`, icon: Coins, color: "text-amber-400" },
                { label: "Giros Totais", val: `${profile?.xp || 0}`, icon: RotateCw, color: "text-primary" },
                { label: "Vitórias", val: orders?.filter((o:any) => o.payment_status === 'won').length || 0, icon: Trophy, color: "text-purple-400" },
              ].map((stat, i) => (
                <Card key={i} className="bg-[#0d0d0f]/50 border-white/5 p-4 group hover:bg-white/5 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                       <stat.icon className={`h-5 w-5 ${stat.color} filter drop-shadow-[0_0_5px_currentColor]`} />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-500">{stat.label}</p>
                      <p className="font-bold text-lg">{stat.val}</p>
                    </div>
                  </div>

                      {referrals && referrals.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                            <Users className="h-3 w-3" /> Seus Convidados ({referrals.length})
                          </h4>
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {referrals.map((ref: any, i: number) => (
                              <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="h-8 w-8 rounded-lg overflow-hidden bg-zinc-800">
                                  <img src={ref.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ref.name}`} className="h-full w-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[10px] font-bold text-white truncate">{ref.name}</p>
                                  <p className="text-[8px] text-slate-500 uppercase font-black">{format(new Date(ref.created_at), "dd/MM/yy")}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                </Card>
              ))}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsContent value="overview" className="space-y-6">
                 <div className="grid lg:grid-cols-2 gap-6">
                     <Card className="bg-[#0d0d0f]/50 border-white/5 p-6 backdrop-blur-xl">
                         <CardHeader className="p-0 mb-6">
                             <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                 <TrendingUp className="h-4 w-4 text-primary" /> Performance Financeira
                             </CardTitle>
                             <CardDescription className="text-[10px] uppercase font-bold text-slate-500">Últimos 10 lançamentos</CardDescription>
                         </CardHeader>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0d0d0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                     </Card>

                     <Card className="bg-[#0d0d0f]/50 border-white/5 p-6 backdrop-blur-xl">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <Star className="h-4 w-4 text-amber-400" /> Suas Conquistas
                            </CardTitle>
                        </CardHeader>
                        <div className="space-y-3 max-h-[200px] overflow-auto pr-2 custom-scrollbar">
                            {achievements?.length ? achievements.map((a: any) => (
                                <div key={a.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all">
                                    <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                        <Star className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-tight">{a.title}</p>
                                        <p className="text-[9px] text-slate-500">{a.description}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8">
                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">Nenhuma conquista ainda</p>
                                </div>
                            )}
                        </div>
                     </Card>
                  </div>

                   <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/20 p-6 backdrop-blur-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                         <Share2 className="h-32 w-32" />
                      </div>
                      <CardHeader className="p-0 mb-6">
                         <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                             <Users className="h-4 w-4" /> Programa de Afiliados
                         </CardTitle>
                         <CardDescription className="text-[10px] uppercase font-bold text-slate-500">Convide amigos e ganhe comissões sobre cada depósito</CardDescription>
                      </CardHeader>
                      
                      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                        <div className="flex-1 w-full space-y-4">
                          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                            <div className="flex-1">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Seu Link de Indicação</p>
                              <p className="text-xs font-bold text-white truncate max-w-[200px] md:max-w-md">
                                {affiliate?.referral_code ? `${window.location.origin}/?ref=${affiliate.referral_code}` : 'Carregando...'}
                              </p>
                            </div>
                            <Button 
                              onClick={copyReferral}
                              size="sm" 
                              className="bg-primary hover:bg-primary/90 text-white font-black uppercase italic tracking-widest text-[10px] px-4 gap-2 h-10 rounded-xl glow-primary"
                            >
                              <Copy className="h-3 w-3" /> Copiar
                            </Button>
                            <Button 
                              onClick={handleShareReferral}
                              size="sm" 
                              variant="outline"
                              className="border-white/10 hover:bg-white/5 text-white font-black uppercase italic tracking-widest text-[10px] px-4 gap-2 h-10 rounded-xl"
                            >
                              <Share2 className="h-3 w-3" /> Compartilhar
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ganhos Totais</p>
                            <p className="text-lg font-black italic text-emerald-400">R$ {Number(affiliate?.total_earned || 0).toFixed(2)}</p>
                          </div>
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Comissão</p>
                            <p className="text-lg font-black italic text-primary">{Number(affiliate?.commission_rate || 5)}%</p>
                          </div>
                        </div>
                      </div>
                   </Card>

                   <Card className="bg-[#0d0d0f]/50 border-white/5 p-6 backdrop-blur-xl">
                      <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
                         <div>
                         <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                             <Ticket className="h-4 w-4 text-primary" /> Participações em Rifas
                         </CardTitle>
                         <CardDescription className="text-[10px] uppercase font-bold text-slate-500">Acompanhe seus bilhetes</CardDescription>
                         </div>
                         <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              disabled={ordersPage === 1}
                              onClick={() => setOrdersPage(p => p - 1)}
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </Button>
                            <span className="text-[10px] font-bold text-slate-500">{ordersPage}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              disabled={!orders || orders.length <= ordersPage * ITEMS_PER_PAGE}
                              onClick={() => setOrdersPage(p => p + 1)}
                            >
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                         </div>
                      </CardHeader>
                     <div className="space-y-3">
                        {orders?.length ? orders.slice((ordersPage - 1) * ITEMS_PER_PAGE, ordersPage * ITEMS_PER_PAGE).map((o: any) => (
                            <div key={o.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <img src={o.campaigns?.image_url || "/placeholder.svg"} className="h-12 w-12 rounded-xl object-cover" />
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-tighter">{o.campaigns?.title}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{format(new Date(o.created_at), "dd/MM/yyyy")}</p>
                                    </div>
                                </div>
                                <Badge className={cn(
                                    "text-[10px] font-black italic uppercase px-3",
                                    o.payment_status === 'paid' ? "bg-emerald-500/20 text-emerald-500" : "bg-amber-500/20 text-amber-500"
                                )}>
                                    {o.payment_status === 'paid' ? 'APROVADO' : 'PENDENTE'}
                                </Badge>
                            </div>
                        )) : (
                            <div className="text-center py-10 opacity-40">
                                <p className="text-xs font-black uppercase tracking-widest italic">Nenhuma rifa participada</p>
                            </div>
                        )}
                     </div>
                  </Card>
               </TabsContent>

               <TabsContent value="finance" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                     <Card className="bg-gradient-to-br from-primary/20 to-zinc-900/50 border-primary/20 p-8 rounded-[32px] overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                            <ArrowUpRight className="h-32 w-32" />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter">Depositar via PIX</h3>
                            <p className="text-sm text-white/60 font-medium">Crédito instantâneo na sua carteira.</p>
                            <Button className="h-12 px-6 rounded-xl bg-white text-black font-black uppercase italic tracking-widest hover:bg-slate-200">Depositar Agora</Button>
                        </div>
                     </Card>

                     <Card className="bg-gradient-to-br from-emerald-500/20 to-zinc-900/50 border-emerald-500/20 p-8 rounded-[32px] overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                            <ArrowDownLeft className="h-32 w-32" />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter">Solicitar Saque</h3>
                            <p className="text-sm text-white/60 font-medium">Resgate seu saldo para seu banco.</p>
                            <Button className="h-12 px-6 rounded-xl bg-emerald-500 text-white font-black uppercase italic tracking-widest hover:bg-emerald-600 glow-emerald">Efetuar Saque</Button>
                        </div>
                     </Card>
                  </div>

                  <Card className="bg-[#0d0d0f]/50 border-white/5 p-6 backdrop-blur-xl">
                     <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <History className="h-4 w-4 text-primary" /> Extrato Detalhado
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              disabled={txsPage === 1}
                              onClick={() => setTxsPage(p => p - 1)}
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </Button>
                            <span className="text-[10px] font-bold text-slate-500">{txsPage}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              disabled={!txs || txs.length <= txsPage * ITEMS_PER_PAGE}
                              onClick={() => setTxsPage(p => p + 1)}
                            >
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                         </div>
                     </CardHeader>
                     <div className="space-y-2">
                        {txs?.length ? txs.slice((txsPage - 1) * ITEMS_PER_PAGE, txsPage * ITEMS_PER_PAGE).map((t: any) => (
                            <div key={t.id} className="flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/5 rounded-2xl border border-white/5 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-10 w-10 rounded-xl flex items-center justify-center",
                                        t.type === 'deposit' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                    )}>
                                        {t.type === 'deposit' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-tight">{t.description || t.type.toUpperCase()}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{format(new Date(t.created_at), "dd/MM/yyyy HH:mm")}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={cn(
                                        "text-sm font-black italic",
                                        t.type === 'deposit' ? "text-emerald-500" : "text-rose-500"
                                    )}>
                                        {t.type === 'deposit' ? '+' : '-'} R$ {Number(t.amount).toFixed(2)}
                                    </p>
                                    <Badge className="text-[8px] font-black uppercase tracking-tighter py-0 h-4">{t.status}</Badge>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-20 opacity-30">
                                <p className="text-[10px] font-black uppercase tracking-widest italic">Nenhuma transação registrada</p>
                            </div>
                        )}
                     </div>
                  </Card>
               </TabsContent>

                <TabsContent value="achievements" className="space-y-6">
                   <div className="grid gap-4 md:grid-cols-3">
                     <Card className="bg-primary/5 border-primary/20 p-4">
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Total de Pontos</p>
                       <p className="text-2xl font-black italic">{profile?.points || 0} PTS</p>
                     </Card>
                     <Card className="bg-white/5 border-white/10 p-4">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Conquistas Desbloqueadas</p>
                       <p className="text-2xl font-black italic">{achievements?.length || 0} / {ALL_ACHIEVEMENTS.length}</p>
                     </Card>
                     <Card className="bg-white/5 border-white/10 p-4">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Nível de Prestígio</p>
                       <p className="text-2xl font-black italic">{profile?.vip_level || 1} VIP</p>
                     </Card>
                   </div>

                   <Card className="bg-[#0d0d0f]/50 border-white/5 p-6 backdrop-blur-xl">
                      <CardHeader className="p-0 mb-8">
                         <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                             <Star className="h-4 w-4 text-amber-400" /> Galeria de Conquistas
                         </CardTitle>
                         <CardDescription className="text-[10px] uppercase font-bold text-slate-500">Acompanhe seu progresso e ganhe recompensas exclusivas</CardDescription>
                      </CardHeader>
                      
                      <div className="space-y-8">
                        {['Jogos', 'Financeiro', 'Social', 'Rifas', 'Nível'].map((cat) => {
                          const catAchievements = ALL_ACHIEVEMENTS.filter(a => a.category === cat);
                          if (catAchievements.length === 0) return null;
                          
                          return (
                            <div key={cat} className="space-y-4">
                              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                                <div className="h-px w-8 bg-white/10" /> {cat}
                              </h3>
                              <div className="grid gap-4 sm:grid-cols-2">
                                {catAchievements.map((achievement) => {
                                  const isUnlocked = achievements?.some(a => a.achievement_key === achievement.key);
                                  const unlockedData = achievements?.find(a => a.achievement_key === achievement.key);
                                  const Icon = achievement.icon;
                                  
                                  return (
                                    <div 
                                      key={achievement.key} 
                                      className={cn(
                                        "relative overflow-hidden flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 group",
                                        isUnlocked 
                                          ? "bg-primary/5 border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]" 
                                          : "bg-white/[0.02] border-white/5 opacity-60 grayscale"
                                      )}
                                    >
                                      {isUnlocked && (
                                        <div className="absolute top-0 right-0 p-2">
                                          <CheckCircle2 className="h-4 w-4 text-primary" />
                                        </div>
                                      )}
                                      <div className={cn(
                                        "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110",
                                        isUnlocked ? "bg-primary/10 text-primary" : "bg-white/5 text-slate-600"
                                      )}>
                                        <Icon className="h-7 w-7" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <p className="text-sm font-black uppercase tracking-tight">{achievement.title}</p>
                                          {!isUnlocked && <Lock className="h-3 w-3 text-slate-600" />}
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium leading-tight mb-2">{achievement.description}</p>
                                        <div className="flex items-center justify-between">
                                          <Badge variant="outline" className={cn(
                                            "text-[8px] font-black px-2 py-0 h-4 uppercase",
                                            isUnlocked ? "border-primary/50 text-primary" : "border-white/10 text-slate-600"
                                          )}>
                                            +{achievement.points} PTS
                                          </Badge>
                                          {isUnlocked && unlockedData && (
                                            <span className="text-[8px] text-slate-600 font-bold uppercase">
                                              {format(new Date(unlockedData.created_at), "dd/MM/yy")}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                   </Card>

                   {/* Rewards Section */}
                   <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-white/5 p-6 backdrop-blur-xl">
                      <CardHeader className="p-0 mb-6">
                         <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                             <Gift className="h-4 w-4 text-primary" /> Loja de Recompensas
                         </CardTitle>
                         <CardDescription className="text-[10px] uppercase font-bold text-slate-500">Troque seus pontos por vantagens reais</CardDescription>
                      </CardHeader>
                      
                      <div className="grid gap-4 sm:grid-cols-3">
                        {[
                          { title: 'Bônus de R$ 10', cost: 1000, icon: Coins, color: 'text-emerald-400' },
                          { title: 'Giro de Elite', cost: 500, icon: RotateCw, color: 'text-primary' },
                          { title: 'Sorte em Dobro', cost: 2000, icon: Zap, color: 'text-amber-400' },
                        ].map((reward, i) => (
                          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4 hover:border-primary/30 transition-all group">
                            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <reward.icon className={cn("h-6 w-6", reward.color)} />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-tight">{reward.title}</p>
                              <p className="text-[10px] text-primary font-black">{reward.cost} PONTOS</p>
                            </div>
                            <Button size="sm" className="w-full h-8 text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white border-white/10" disabled={(profile?.points || 0) < reward.cost}>
                              Resgatar
                            </Button>
                          </div>
                        ))}
                      </div>
                   </Card>
                </TabsContent>

                <TabsContent value="games" className="space-y-6">
                   <div className="grid gap-4 sm:grid-cols-3">
                      <Card className="bg-white/5 border-white/10 p-4">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Giros Totais</p>
                         <p className="text-2xl font-black italic">{spins?.length || 0}</p>
                      </Card>
                      <Card className="bg-white/5 border-white/10 p-4">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Caixas Abertas</p>
                         <p className="text-2xl font-black italic">{boxWins?.length || 0}</p>
                      </Card>
                      <Card className="bg-primary/5 border-primary/20 p-4">
                         <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Total Ganho (Jogos)</p>
                         <p className="text-2xl font-black italic">R$ {(
                            (spins?.reduce((acc: number, s: any) => acc + (Number(s.prize_value) || 0), 0) || 0) +
                            (boxWins?.reduce((acc: number, bw: any) => acc + (Number(bw.prize_value) || 0), 0) || 0)
                         ).toFixed(2)}</p>
                      </Card>
                   </div>

                   <div className="grid lg:grid-cols-2 gap-6">
                      <Card className="bg-[#0d0d0f]/50 border-white/5 p-6 backdrop-blur-xl">
                         <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
                             <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                 <RotateCw className="h-4 w-4 text-primary" /> Últimos Giros
                             </CardTitle>
                             <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6" 
                                  disabled={spinsPage === 1}
                                  onClick={() => setSpinsPage(p => p - 1)}
                                >
                                  <ChevronLeft className="h-3 w-3" />
                                </Button>
                                <span className="text-[10px] font-bold text-slate-500">{spinsPage}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6" 
                                  disabled={!spins || spins.length <= spinsPage * ITEMS_PER_PAGE}
                                  onClick={() => setSpinsPage(p => p + 1)}
                                >
                                  <ChevronRight className="h-3 w-3" />
                                </Button>
                             </div>
                         </CardHeader>
                         <div className="space-y-3">
                            {spins?.length ? spins.slice((spinsPage - 1) * ITEMS_PER_PAGE, spinsPage * ITEMS_PER_PAGE).map((s: any) => (
                                <div key={s.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-tight">{s.prize_label}</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase">{s.campaigns?.title}</p>
                                    </div>
                                    <p className="text-xs font-bold text-primary">R$ {Number(s.prize_value).toFixed(2)}</p>
                                </div>
                            )) : <p className="text-center py-10 text-[10px] text-slate-600 font-black uppercase italic">Sem giros registrados</p>}
                         </div>
                      </Card>

                      <Card className="bg-[#0d0d0f]/50 border-white/5 p-6 backdrop-blur-xl">
                         <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
                             <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                 <Package className="h-4 w-4 text-orange-400" /> Caixas Abertas
                             </CardTitle>
                             <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6" 
                                  disabled={boxesPage === 1}
                                  onClick={() => setBoxesPage(p => p - 1)}
                                >
                                  <ChevronLeft className="h-3 w-3" />
                                </Button>
                                <span className="text-[10px] font-bold text-slate-500">{boxesPage}</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6" 
                                  disabled={!boxWins || boxWins.length <= boxesPage * ITEMS_PER_PAGE}
                                  onClick={() => setBoxesPage(p => p + 1)}
                                >
                                  <ChevronRight className="h-3 w-3" />
                                </Button>
                             </div>
                         </CardHeader>
                         <div className="space-y-3">
                            {boxWins?.length ? boxWins.slice((boxesPage - 1) * ITEMS_PER_PAGE, boxesPage * ITEMS_PER_PAGE).map((bw: any) => (
                                <div key={bw.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-tight">{bw.prize_title}</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase">{format(new Date(bw.created_at), 'dd/MM HH:mm')}</p>
                                    </div>
                                    <p className="text-xs font-bold text-orange-400">R$ {Number(bw.prize_value).toFixed(2)}</p>
                                </div>
                            )) : <p className="text-center py-10 text-[10px] text-slate-600 font-black uppercase italic">Sem vitórias em caixas</p>}
                         </div>
                      </Card>
                   </div>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                   <Card className="bg-[#0d0d0f]/50 border-white/5 p-6 backdrop-blur-xl">
                      <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
                         <div>
                             <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                 <Bell className="h-4 w-4 text-primary" /> Central de Notificações
                             </CardTitle>
                             <CardDescription className="text-[10px] uppercase font-bold text-slate-500">Fique por dentro de tudo</CardDescription>
                         </div>
                         {notifications && notifications.some(n => !n.is_read) && (
                             <div className="flex gap-2">
                                 <Button 
                                     variant="outline" 
                                     size="sm" 
                                     onClick={() => {
                                         if ('Notification' in window) {
                                             Notification.requestPermission().then(permission => {
                                                 if (permission === 'granted') {
                                                     toast.success("Notificações do navegador ativadas!");
                                                 } else {
                                                     toast.error("Permissão negada para notificações");
                                                 }
                                             });
                                         } else {
                                           toast.error("Seu navegador não suporta notificações");
                                         }
                                     }}
                                     className="text-[10px] font-black uppercase tracking-widest border-white/10 hover:bg-white/5"
                                 >
                                     Ativar Push
                                 </Button>
                                 <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80">
                                     Marcar todas como lidas
                                 </Button>
                             </div>
                         )}
                      </CardHeader>
                      <div className="space-y-3">
                         {notifications?.length ? notifications.map((n: any) => (
                             <div key={n.id} className={cn(
                                 "flex items-center justify-between p-4 rounded-2xl border transition-all",
                                 n.is_read ? "bg-white/[0.02] border-white/5" : "bg-primary/5 border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]"
                             )}>
                                 <div className="flex items-center gap-4">
                                     <div className={cn(
                                         "h-10 w-10 rounded-xl flex items-center justify-center",
                                         n.type === 'win' ? "bg-emerald-500/10 text-emerald-500" : 
                                         n.type === 'bonus' ? "bg-amber-500/10 text-amber-500" :
                                         "bg-primary/10 text-primary"
                                     )}>
                                         {n.type === 'win' ? <Trophy className="h-5 w-5" /> : 
                                          n.type === 'bonus' ? <Gift className="h-5 w-5" /> : 
                                          <Bell className="h-5 w-5" />}
                                     </div>
                                     <div>
                                         <p className="text-xs font-black uppercase tracking-tight">{n.title}</p>
                                         <p className="text-[10px] text-slate-400 font-medium">{n.message}</p>
                                         <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-1">{format(new Date(n.created_at), "dd/MM HH:mm")}</p>
                                     </div>
                                 </div>
                                 {!n.is_read && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                             </div>
                         )) : (
                             <div className="text-center py-20 opacity-30">
                                 <Bell className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                                 <p className="text-xs font-black uppercase tracking-widest italic">Nenhuma notificação</p>
                             </div>
                         )}
                      </div>
                   </Card>
                </TabsContent>

                <TabsContent value="ranking" className="space-y-6">
                   <div className="bg-[#0d0d0f]/50 border border-white/5 rounded-[40px] p-6 md:p-10 backdrop-blur-2xl">
                     <UserRanking />
                   </div>
                </TabsContent>
             </Tabs>
           </main>
         </div>
       </motion.div>
       <Footer />
     </div>
  );
}
