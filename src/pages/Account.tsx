 import { useState, useEffect } from "react";
 import { useNavigate } from "react-router-dom";
 import { motion, AnimatePresence } from "framer-motion";
 import { 
   User, Ticket, Users, Award, Wallet, TrendingUp, 
    Settings, LogOut, Copy, ExternalLink, ShieldCheck, 
    ChevronRight, Sparkles, Star, Zap, Bell, CheckCircle, Trash2,
    CreditCard, ArrowUpRight, ArrowDownLeft, Trophy, Gift, Dices,
    History, Coins, Activity, Crown, Search, Clock
 } from "lucide-react";
 import { useAuth } from "@/contexts/AuthContext";
 import { useIsAdmin } from "@/hooks/useAdmin";
 import { 
   useUserNotifications, 
   useUserOrders, 
   useUserSpins, 
   useUserMysteryBoxWins,
   Notification 
 } from "@/hooks/useData";
 import { useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import Header from "@/components/Header";
 import Footer from "@/components/Footer";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Badge } from "@/components/ui/badge";
 import { Separator } from "@/components/ui/separator";
 import { toast } from "sonner";
 import { format } from "date-fns";
 import { ptBR } from "date-fns/locale";
 
 export default function Account() {
   const { user, signOut } = useAuth();
   const navigate = useNavigate();
   const { data: isAdmin } = useIsAdmin();
   const { data: notifications } = useUserNotifications(user?.id || "");
   const { data: orders } = useUserOrders(user?.id || "");
   const { data: spins } = useUserSpins(user?.id || "");
   const { data: boxWins } = useUserMysteryBoxWins(user?.id || "");
   const queryClient = useQueryClient();
 
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
 
   const markAsRead = async (id: string) => {
     const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
     if (!error) queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
   };
 
   const deleteNotification = async (id: string) => {
     const { error } = await supabase.from("notifications").delete().eq("id", id);
     if (!error) {
       toast.success("Notificação excluída");
       queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
     }
   };
 
   const copyReferral = () => {
     if (affiliate?.referral_code) {
       const url = `${window.location.origin}/register?ref=${affiliate.referral_code}`;
       navigator.clipboard.writeText(url);
       toast.success("Link de afiliado copiado!");
     }
   };
 
   const xpToNextLevel = 1000 - ((profile?.xp || 0) % 1000);
   const progressPercent = ((profile?.xp || 0) % 1000) / 10;
 
   const getStatusBadge = (status: string) => {
     switch(status) {
       case 'paid': return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20 text-[10px] font-bold">PAGO</Badge>;
       case 'pending': return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/20 text-[10px] font-bold">PENDENTE</Badge>;
       case 'cancelled': return <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/20 text-[10px] font-bold">CANCELADO</Badge>;
       default: return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
     }
   };
 
   if (isLoading) {
     return (
       <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
         <div className="relative">
           <div className="h-24 w-24 rounded-full border-4 border-primary/20"></div>
           <div className="absolute top-0 h-24 w-24 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
           <Sparkles className="absolute inset-0 m-auto h-8 w-8 animate-pulse text-primary" />
         </div>
       </div>
     );
   }
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: isAdmin } = useIsAdmin();
              {isAdmin && (
                <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-xl text-sm font-bold text-primary hover:bg-primary/10" onClick={() => navigate("/admin")}>
                  <ShieldCheck className="h-4 w-4" /> Painel Admin
                </Button>
              )}
  const { data: notifications } = useUserNotifications(user?.id || "");
  const queryClient = useQueryClient();

  const [profile, setProfile] = useState<any>(null);
  const markAsRead = async (id: string) => {
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    if (!error) queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (!error) {
      toast.success("Notificação excluída");
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    }
  };

  const [affiliate, setAffiliate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const copyReferral = () => {
    if (affiliate?.referral_code) {
      const url = `${window.location.origin}/register?ref=${affiliate.referral_code}`;
      navigator.clipboard.writeText(url);
      toast.success("Link de afiliado copiado!");
    }
  };

  const xpToNextLevel = 1000 - ((profile?.xp || 0) % 1000);
  const progressPercent = ((profile?.xp || 0) % 1000) / 10;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-10">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-border/50 overflow-hidden">
              <div className="h-20 bg-gradient-to-r from-primary/20 to-secondary" />
              <CardContent className="relative pt-12 pb-6 px-6">
                <div className="absolute -top-10 left-6">
                  <div className="h-20 w-20 rounded-2xl bg-primary border-4 border-background shadow-xl flex items-center justify-center overflow-hidden">
                    <User className="h-10 w-10 text-primary-foreground" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h2 className="font-display text-lg font-bold truncate">
                    {user?.user_metadata?.name || user?.email?.split('@')[0]}
                  </h2>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground uppercase tracking-wider">Nível {profile?.vip_level || 1}</span>
                    <span className="font-bold text-primary">{profile?.xp || 0} XP</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${progressPercent}%` }} 
                      className="h-full bg-primary"
                    />
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground italic">
                    Faltam {xpToNextLevel} XP para o próximo nível
                  </p>
                </div>
              </CardContent>
            </Card>

            <nav className="space-y-1">
              <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-xl text-sm font-bold">
                <Ticket className="h-4 w-4 text-primary" /> Meus Números
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-xl text-sm font-bold">
                <Award className="h-4 w-4 text-primary" /> Conquistas
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-xl text-sm font-bold">
                <Settings className="h-4 w-4 text-primary" /> Configurações
              </Button>
              <Separator className="my-2" />
              <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/10" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" /> Sair da conta
              </Button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Overview */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Saldo Disponível</p>
                      <p className="text-xl font-black">R$ {Number(profile?.balance || 0).toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cashback Acumulado</p>
                      <p className="text-xl font-black">R$ {Number(profile?.cashback_balance || 0).toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Star className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pontos Reward</p>
                      <p className="text-xl font-black">{profile?.points || 0} PTS</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-secondary/50 p-1 gap-1 h-12 rounded-2xl w-full sm:w-auto">
                 <TabsTrigger value="overview" className="rounded-xl px-6 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Geral</TabsTrigger>
                 <TabsTrigger value="notifications" className="rounded-xl px-6 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Notificações</TabsTrigger>
               <TabsContent value="notifications" className="space-y-6 outline-none">
                 <Card className="border-border/50">
                   <CardHeader>
                     <CardTitle className="text-base flex items-center gap-2 italic uppercase">
                       <Bell className="h-4 w-4 text-primary" /> Central de Notificações
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="p-0">
                     {!notifications || notifications.length === 0 ? (
                       <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                         <Bell className="h-12 w-12 text-muted-foreground/30 mb-2" />
                         <p className="text-sm font-bold">Nenhuma notificação</p>
                       </div>
                     ) : (
                       <div className="divide-y divide-white/5">
                         {notifications.map((n) => (
                           <div key={n.id} className={`flex items-start gap-4 p-5 transition-colors ${!n.is_read ? 'bg-primary/5' : 'hover:bg-white/5'}`}>
                             <div className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${!n.is_read ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
                             <div className="flex-1 space-y-1">
                               <p className={`text-sm ${!n.is_read ? 'font-bold' : 'font-medium'}`}>{n.title}</p>
                               <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                               <p className="text-[10px] text-muted-foreground/50 pt-1">
                                 {new Date(n.created_at).toLocaleString('pt-BR')}
                               </p>
                             </div>
                             <div className="flex items-center gap-2">
                               {!n.is_read && (
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => markAsRead(n.id)}>
                                   <CheckCircle className="h-4 w-4" />
                                 </Button>
                               )}
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteNotification(n.id)}>
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </CardContent>
                 </Card>
               </TabsContent>
 
                <TabsTrigger value="affiliate" className="rounded-xl px-6 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Afiliados</TabsTrigger>
                <TabsTrigger value="vip" className="rounded-xl px-6 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Programa VIP</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 outline-none">
                <div className="grid gap-6 sm:grid-cols-2">
                  <Card className="border-border/50 overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Zap className="h-4 w-4 text-primary fill-current" /> Recentemente Participou
                        </CardTitle>
                        <Button variant="link" size="sm" className="text-xs font-bold text-primary px-0">Ver todos</Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center justify-center py-10 text-center space-y-2 opacity-50">
                        <Ticket className="h-12 w-12 text-muted-foreground/30 mb-2" />
                        <p className="text-sm font-bold">Nenhum bilhete ativo</p>
                        <p className="text-xs text-muted-foreground">Participe de uma rifa e veja seus números aqui!</p>
                        <Button size="sm" variant="outline" className="mt-4" onClick={() => (window.location.href = '/')}>Explorar Rifas</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" /> Missões Diárias
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-xs font-medium">Verificar ganhadores</span>
                        </div>
                        <Badge variant="secondary" className="text-[10px]">+10 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span className="text-xs font-medium">Comprar sua 1ª rifa</span>
                        </div>
                        <Badge className="text-[10px]">+100 XP</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50 opacity-50">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-muted" />
                          <span className="text-xs font-medium">Convidar um amigo</span>
                        </div>
                        <Badge variant="outline" className="text-[10px]">+50 XP</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="affiliate" className="space-y-6 outline-none">
                <div className="grid gap-6">
                  <Card className="bg-gradient-to-br from-primary/10 via-background to-secondary/20 border-primary/20">
                    <CardContent className="p-8">
                      <div className="grid gap-8 sm:grid-cols-2 items-center">
                        <div className="space-y-4">
                          <Badge className="bg-primary/20 text-primary border-none font-black tracking-tighter italic">PROGRAMA DE AFILIADOS</Badge>
                          <h3 className="font-display text-3xl font-black italic uppercase leading-none">Indique e Ganhe <span className="text-primary">Dinheiro Real</span></h3>
                          <p className="text-sm text-muted-foreground">
                            Compartilhe seu link exclusivo e ganhe <span className="text-primary font-bold">10% de comissão</span> em cada compra feita pelos seus indicados.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <div className="flex-1 h-12 rounded-xl bg-background border border-border/50 flex items-center px-4 font-mono text-xs overflow-hidden">
                              {window.location.origin}/register?ref={affiliate?.referral_code || "..."}
                            </div>
                            <Button className="h-12 rounded-xl gap-2 font-bold px-6" onClick={copyReferral}>
                              <Copy className="h-4 w-4" /> Copiar Link
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-2xl bg-background/50 border border-border/50 p-4 text-center">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Total Indicados</p>
                            <p className="text-2xl font-black italic">0</p>
                          </div>
                          <div className="rounded-2xl bg-background/50 border border-border/50 p-4 text-center">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Comissões</p>
                            <p className="text-2xl font-black italic text-primary">R$ 0,00</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="vip" className="space-y-6 outline-none">
                <div className="grid gap-6 sm:grid-cols-3">
                  {[
                    { level: 1, name: "Bronze", perks: ["Cashback de 1%", "Acesso às rifas comuns"], active: true },
                    { level: 2, name: "Prata", perks: ["Cashback de 2%", "Caixa Misteriosa destravada"], active: false },
                    { level: 3, name: "Ouro", perks: ["Cashback de 5%", "Sorteios exclusivos VIP"], active: false },
                  ].map((tier) => (
                    <Card key={tier.name} className={`border-border/50 relative overflow-hidden ${tier.active ? 'ring-2 ring-primary border-primary/50 bg-primary/5' : 'opacity-70'}`}>
                      {tier.active && <Badge className="absolute top-2 right-2 bg-primary">Seu Nível</Badge>}
                      <CardHeader>
                        <CardTitle className="text-xl font-black italic uppercase italic">{tier.name}</CardTitle>
                        <CardDescription>Nível {tier.level}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          {tier.perks.map(perk => (
                            <div key={perk} className="flex items-center gap-2 text-xs font-medium">
                              <ShieldCheck className={`h-4 w-4 ${tier.active ? 'text-primary' : 'text-muted-foreground'}`} /> {perk}
                            </div>
                          ))}
                        </div>
                        {!tier.active && (
                          <Button variant="outline" className="w-full text-[10px] font-bold uppercase tracking-widest mt-4">Bloqueado</Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}