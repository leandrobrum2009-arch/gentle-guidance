import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Ticket, Users, Award, Wallet, TrendingUp, 
  Settings, LogOut, Copy, ExternalLink, ShieldCheck, 
  ChevronRight, Sparkles, Star, Zap, Bell, CheckCircle, Trash2,
  CreditCard, ArrowUpRight, ArrowDownLeft, Trophy, Gift, Dices,
  History, Coins, Activity, Crown, Search, Clock, Package
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdmin";
import { 
  useUserNotifications, 
  useUserOrders, 
  useUserSpins, 
  useUserMysteryBoxWins 
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
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
  };

  const deleteNotification = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    toast.success("Notificação excluída");
    queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <Header />
      <div className="container py-10 pt-24">
        <div className="grid gap-8 lg:grid-cols-12">
          
          <aside className="lg:col-span-3 space-y-6">
            <Card className="bg-[#0d0d0f]/50 border-white/5 backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-1 mb-4">
                     <div className="h-full w-full rounded-full bg-[#0d0d0f] flex items-center justify-center">
                        <User className="h-10 w-10 text-white" />
                     </div>
                  </div>
                  <h2 className="text-lg font-bold tracking-tight">{profile?.name || "Usuário"}</h2>
                  <p className="text-xs text-slate-500 mb-4">{user?.email}</p>
                  
                  <div className="w-full space-y-2 mt-4 bg-white/5 p-4 rounded-xl">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>Nível {profile?.vip_level || 1}</span>
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
                { label: "Dashboard", id: "overview", icon: Activity },
                { label: "Carteira", id: "finance", icon: Wallet },
                { label: "Histórico", id: "history", icon: History },
                { label: "Notificações", id: "notifs", icon: Bell },
              ].map((item) => (
                <Button key={item.id} variant="ghost" className="w-full justify-start gap-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
                  <item.icon className="h-4 w-4" /> {item.label}
                </Button>
              ))}
              <Separator className="bg-white/5 my-4" />
              <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" /> Sair
              </Button>
            </nav>
          </aside>

          <main className="lg:col-span-9 space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Saldo", val: `R$ ${Number(profile?.balance || 0).toFixed(2)}`, icon: Wallet, color: "text-emerald-400" },
                { label: "Cashback", val: `R$ ${Number(profile?.cashback_balance || 0).toFixed(2)}`, icon: Coins, color: "text-amber-400" },
                { label: "Pontos", val: `${profile?.points || 0} PTS`, icon: Trophy, color: "text-primary" },
              ].map((stat, i) => (
                <Card key={i} className="bg-[#0d0d0f]/50 border-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500">{stat.label}</p>
                      <p className="font-bold text-lg">{stat.val}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-[#0d0d0f]/50 border border-white/5 rounded-2xl p-1 h-auto">
                <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-white/10">Visão Geral</TabsTrigger>
                <TabsTrigger value="orders" className="rounded-xl data-[state=active]:bg-white/10">Rifas</TabsTrigger>
                <TabsTrigger value="games" className="rounded-xl data-[state=active]:bg-white/10">Histórico de Jogos</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                 <Card className="bg-[#0d0d0f]/50 border-white/5">
                    <CardHeader><CardTitle>Atividade Recente</CardTitle></CardHeader>
                    <CardContent>
                       <div className="space-y-4">
                          {orders?.slice(0, 3).map((o: any) => (
                             <div key={o.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                <div className="flex items-center gap-3">
                                   <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                                      <Ticket className="h-5 w-5" />
                                   </div>
                                   <div>
                                      <p className="text-sm font-bold">{o.campaigns?.title}</p>
                                      <p className="text-xs text-slate-400">{format(new Date(o.created_at), 'dd/MM/yyyy', { locale: ptBR })}</p>
                                   </div>
                                </div>
                                <Badge>{o.payment_status}</Badge>
                             </div>
                          ))}
                       </div>
                    </CardContent>
                 </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
