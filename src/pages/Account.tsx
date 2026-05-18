import { useState, useEffect } from "react";
import { motion } from "framer-motion";
 import { 
   User, LogOut, Trophy, History, Coins, Activity, 
   Wallet, Bell, TrendingUp, CreditCard, Star, Gift, 
   Zap, Ticket, ArrowUpRight, ArrowDownLeft, ChevronRight, RotateCw, Crown,
   Package, ShoppingBag
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
    markNotificationsAsRead
 } from "@/hooks/useData";
 import { useIsAdmin } from "@/hooks/useAdmin";
 import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
 
   const [profile, setProfile] = useState<any>(null);
   const [affiliate, setAffiliate] = useState<any>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [activeTab, setActiveTab] = useState("overview");
 
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

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await markNotificationsAsRead(user.id);
      toast.success("Notificações marcadas como lidas");
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

                   <Card className="bg-[#0d0d0f]/50 border-white/5 p-6 backdrop-blur-xl">
                      <CardHeader className="p-0 mb-6">
                         <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                             <Ticket className="h-4 w-4 text-primary" /> Participações em Rifas
                         </CardTitle>
                         <CardDescription className="text-[10px] uppercase font-bold text-slate-500">Acompanhe seus bilhetes</CardDescription>
                      </CardHeader>
                     <div className="space-y-3">
                        {orders?.length ? orders.slice(0, 5).map((o: any) => (
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
                     <CardHeader className="p-0 mb-6">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <History className="h-4 w-4 text-primary" /> Extrato Detalhado
                        </CardTitle>
                     </CardHeader>
                     <div className="space-y-2">
                        {txs?.length ? txs.map((t: any) => (
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
                   <Card className="bg-[#0d0d0f]/50 border-white/5 p-6 backdrop-blur-xl">
                      <CardHeader className="p-0 mb-6">
                         <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                             <Star className="h-4 w-4 text-amber-400" /> Galeria de Conquistas
                         </CardTitle>
                         <CardDescription className="text-[10px] uppercase font-bold text-slate-500">Seu legado na plataforma</CardDescription>
                      </CardHeader>
                      <div className="grid gap-4 sm:grid-cols-2">
                         {achievements?.length ? achievements.map((a: any) => (
                             <div key={a.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                     <Trophy className="h-6 w-6 text-amber-500" />
                                 </div>
                                 <div>
                                     <p className="text-sm font-black uppercase tracking-tight">{a.title}</p>
                                     <p className="text-xs text-slate-500">{a.description}</p>
                                 </div>
                             </div>
                         )) : (
                             <div className="col-span-full text-center py-20 opacity-30">
                                 <p className="text-sm font-black uppercase tracking-widest">Nenhuma conquista ainda</p>
                             </div>
                         )}
                      </div>
                   </Card>
                </TabsContent>

                <TabsContent value="games" className="space-y-6">
                   <div className="grid lg:grid-cols-2 gap-6">
                      <Card className="bg-[#0d0d0f]/50 border-white/5 p-6 backdrop-blur-xl">
                         <CardHeader className="p-0 mb-6">
                             <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                 <RotateCw className="h-4 w-4 text-primary" /> Últimos Giros
                             </CardTitle>
                         </CardHeader>
                         <div className="space-y-3">
                            {spins?.length ? spins.slice(0, 5).map((s: any) => (
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
                         <CardHeader className="p-0 mb-6">
                             <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                 <Package className="h-4 w-4 text-orange-400" /> Caixas Abertas
                             </CardTitle>
                         </CardHeader>
                         <div className="space-y-3">
                            {boxWins?.length ? boxWins.slice(0, 5).map((bw: any) => (
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
                             <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80">
                                 Marcar todas como lidas
                             </Button>
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
                  <Card className="bg-[#0d0d0f]/50 border-white/5 p-8 rounded-[40px] overflow-hidden relative">
                     <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Crown className="h-64 w-64" />
                     </div>
                     <div className="relative z-10 flex flex-col items-center text-center space-y-6 mb-12">
                        <Trophy className="h-16 w-16 text-primary drop-shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]" />
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Ranking Global</h2>
                            <p className="text-sm text-slate-400 font-medium max-w-md uppercase tracking-widest leading-relaxed italic">Os maiores competidores da plataforma.</p>
                        </div>
                     </div>

                     <div className="space-y-3">
                        {ranking?.map((r: any, i: number) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-3xl border transition-all",
                                    i === 0 ? "bg-primary/20 border-primary/40" : "bg-white/5 border-white/5"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={cn(
                                        "text-xl font-black italic",
                                        i === 0 ? "text-primary" : "text-white/20"
                                    )}>#{i + 1}</span>
                                    <div className="h-10 w-10 rounded-xl bg-zinc-800 border border-white/10 overflow-hidden">
                                        <img src={r.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.name}`} className="h-full w-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-tighter">{r.name}</p>
                                        <Badge variant="outline" className="text-[8px] border-white/10 uppercase tracking-widest">{r.xp} XP</Badge>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black italic text-primary">{r.points} PTS</p>
                                </div>
                            </motion.div>
                        ))}
                     </div>
                  </Card>
               </TabsContent>
             </Tabs>
           </main>
         </div>
       </motion.div>
       <Footer />
     </div>
  );
}
