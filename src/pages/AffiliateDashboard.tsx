import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAffiliateData } from "@/hooks/useAffiliate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, DollarSign, Users, MousePointer2, TrendingUp, Copy, Check, PieChart, BarChart3, LayoutDashboard, Megaphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AffiliateDashboard() {
  const { data, isLoading } = useAffiliateData();
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    if (!data?.affiliate?.referral_code) return;
    const link = `${window.location.origin}?ref=${data.affiliate.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link de afiliado copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.isAffiliate) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container pt-32 pb-20 text-center space-y-6">
          <div className="max-w-md mx-auto p-8 rounded-3xl bg-secondary/20 border border-border">
            <LayoutDashboard className="h-16 w-16 text-primary/20 mx-auto mb-4" />
            <h1 className="text-2xl font-black uppercase italic">Painel de Afiliado</h1>
            <p className="text-muted-foreground mt-2">Você ainda não é um afiliado cadastrado. Entre em contato com o administrador.</p>
            <Button className="mt-6 rounded-xl font-bold uppercase italic" onClick={() => window.location.href = "/"}>Voltar ao Início</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Prepare chart data
  const last7Days = [...Array(7)].map((_, i) => {
    const date = subDays(new Date(), i);
    const count = data.clicksHistory.filter(c => isSameDay(new Date(c.created_at), date)).length;
    return {
      name: format(date, 'dd/MM'),
      clicks: count
    };
  }).reverse();

  const totalEarnings = data.commissions.reduce((acc, comm) => acc + (Number(comm.amount) || 0), 0);
  const pendingEarnings = data.commissions.filter(c => c.status === 'pending').reduce((acc, comm) => acc + (Number(comm.amount) || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pt-32 pb-20">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter">
                Painel do <span className="text-primary">Afiliado</span>
              </h1>
              <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mt-1">
                {data.affiliate.type === 'influencer' ? 'Nível Influenciador' : 'Afiliado Comum'}
              </p>
            </div>
            <div className="flex items-center gap-2 p-1 bg-secondary/30 rounded-2xl border border-border/50">
              <div className="px-4 py-2 text-xs font-mono font-bold text-primary">
                {window.location.origin}?ref={data.affiliate.referral_code}
              </div>
              <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl" onClick={copyLink}>
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <Card className="border-border bg-emerald-500/5 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-emerald-500 opacity-50" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Saldo Total</p>
                <h3 className="text-2xl font-black mt-1">R$ {totalEarnings.toFixed(2)}</h3>
              </CardContent>
            </Card>

            <Card className="border-border bg-amber-500/5 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                    <PieChart className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Pendente</p>
                <h3 className="text-2xl font-black mt-1">R$ {pendingEarnings.toFixed(2)}</h3>
              </CardContent>
            </Card>

            <Card className="border-border bg-blue-500/5 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                    <MousePointer2 className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Cliques Totais</p>
                <h3 className="text-2xl font-black mt-1">{data.totalClicks}</h3>
              </CardContent>
            </Card>

            <Card className="border-border bg-primary/5 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Taxa de Conv.</p>
                <h3 className="text-2xl font-black mt-1">
                  {data.totalClicks > 0 ? ((data.commissions.length / data.totalClicks) * 100).toFixed(1) : 0}%
                </h3>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Acessos nos últimos 7 dias
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={last7Days}>
                    <defs>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="rgba(255,255,255,0.3)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.3)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="clicks" 
                      stroke="var(--primary)" 
                      fillOpacity={1} 
                      fill="url(#colorClicks)" 
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-primary" />
                  Ganhos por Campanha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Group commissions by campaign */}
                  {Array.from(new Set(data.commissions.map(c => c.campaign_id))).map(campId => {
                    const campaignComm = data.commissions.filter(c => c.campaign_id === campId);
                    const amount = campaignComm.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
                    const title = campaignComm[0]?.campaigns?.title || "Geral / Outros";
                    
                    return (
                      <div key={campId || 'other'} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/50">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground truncate max-w-[150px]">{title}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-black">{campaignComm.length} vendas</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-500">R$ {amount.toFixed(2)}</span>
                      </div>
                    );
                  })}
                  {data.commissions.length === 0 && (
                    <div className="text-center py-10 opacity-30 italic text-sm">Nenhuma venda registrada.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
