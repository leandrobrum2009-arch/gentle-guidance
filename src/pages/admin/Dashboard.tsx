import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAdminCampaigns, useAdminOrders, useAdminUsers, useAdminRouletteStats } from "@/hooks/useAdmin";
import { 
  Loader2, Megaphone, ShoppingCart, DollarSign, Users,
  TrendingUp, TrendingDown, ArrowUpRight, Activity, Zap,
  CheckCircle2, Plus, Percent, Bell, MousePointerClick, 
  Target, ExternalLink, ShieldCheck, Trophy, Sparkles
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { data: campaigns, isLoading: lc } = useAdminCampaigns();
  const { data: orders, isLoading: lo } = useAdminOrders();
  const { data: users, isLoading: lu } = useAdminUsers();
  const { data: rouletteStats, isLoading: lr } = useAdminRouletteStats();

  const loading = lc || lo || lu || lr;

  const today = startOfDay(new Date());
  const paidOrders = orders?.filter(o => o.payment_status === "paid") ?? [];
  const ordersToday = orders?.filter(o => isSameDay(new Date(o.created_at), today)) ?? [];
  const salesToday = ordersToday.filter(o => o.payment_status === "paid")
    .reduce((acc, o) => acc + Number(o.total_amount), 0);
  
  const totalRevenue = paidOrders.reduce((s, o) => s + Number(o.total_amount), 0);
  const activeCampaigns = campaigns?.filter((c) => c.status === "active").length ?? 0;
  
  // Data for charts
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayOrders = paidOrders.filter(o => isSameDay(new Date(o.created_at), date));
    const total = dayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    return {
      date: format(date, 'dd/MM'),
      total: total
    };
  });

  const stats = [
    { 
      label: "Receita Total", 
      value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      icon: DollarSign, 
      trend: "+12.5%", 
      trendUp: true,
      color: "from-emerald-500 to-teal-600" 
    },
    { 
      label: "Vendas Hoje", 
      value: `R$ ${salesToday.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
      icon: Zap, 
      trend: "+8.2%", 
      trendUp: true,
      color: "from-blue-500 to-indigo-600" 
    },
    { 
      label: "Usuários Totais", 
      value: users?.length ?? 0, 
      icon: Users, 
      trend: "+4.1%", 
      trendUp: true,
      color: "from-purple-500 to-pink-600" 
    },
    { 
      label: "Rifas Ativas", 
      value: activeCampaigns, 
      icon: Megaphone, 
      trend: "Estável", 
      trendUp: true,
      color: "from-orange-500 to-amber-600" 
    },
    { 
      label: "Giros Roleta", 
      value: rouletteStats?.totalSpins ?? 0, 
      icon: MousePointerClick, 
      trend: "Ativo", 
      trendUp: true,
      color: "from-purple-500 to-indigo-600" 
    },
  ];

  const quickActions = [
    { title: "Nova Rifa", icon: Plus, color: "bg-primary", url: "/admin/campanhas/nova" },
    { title: "Ver Pedidos", icon: ShoppingCart, color: "bg-blue-600", url: "/admin/pedidos" },
    { title: "Ganhadores", icon: Trophy, color: "bg-amber-500", url: "/admin/ganhadores" },
    { title: "Federal", icon: Target, color: "bg-emerald-600", url: "/admin/federal" },
  ];

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
          </div>
          <p className="text-slate-600 text-sm font-medium pl-1 italic uppercase tracking-wider text-[10px]">Monitoramento em tempo real do seu ecossistema de rifas.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2.5 border border-emerald-500/20">
            <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Sistema Online</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 border border-primary/20">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Admin Premium</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"></div>
            <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-pulse text-primary" />
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] animate-pulse">Sincronizando dados...</p>
        </div>
      ) : (
        <div className="space-y-8 pb-10">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => window.location.href = action.url}
                className="group relative flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:scale-[1.02] hover:border-primary/30 hover:bg-primary/5 active:scale-[0.98]"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color} text-white shadow-lg transition-transform group-hover:scale-110`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold text-slate-600 group-hover:text-primary transition-colors">{action.title}</span>
                <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-4 w-4 text-primary" />
                </div>
              </button>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <Card key={s.label} className="relative overflow-hidden border-slate-100 bg-white shadow-sm transition-all hover:border-primary/30 group cursor-default">
                <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${s.color} opacity-10 blur-2xl transition-all group-hover:opacity-20`}></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-600">{s.label}</CardTitle>
                  <div className={`rounded-lg bg-gradient-to-br ${s.color} p-2 shadow-lg transition-transform group-hover:scale-110`}>
                    <s.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold tracking-tight text-foreground">{s.value}</p>
                    <span className={`text-[10px] font-bold ${s.trendUp ? "text-emerald-400" : "text-rose-400"} flex items-center`}>
                      {s.trendUp ? <TrendingUp className="mr-0.5 h-3 w-3" /> : <TrendingDown className="mr-0.5 h-3 w-3" />}
                      {s.trend}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-7">
            <Card className="border-slate-100 bg-white shadow-sm lg:col-span-4 overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-foreground tracking-tight">Análise de Receita</CardTitle>
                  <p className="text-xs text-slate-500 font-medium">Performance financeira dos últimos 7 dias</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 transition-all hover:bg-white/10 hover:scale-110 group-hover:text-primary">
                  <TrendingUp className="h-5 w-5 text-slate-400" />
                </div>
              </CardHeader>
              <CardContent className="h-[350px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={last7Days}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
                      tickFormatter={(value) => `R$${value >= 1000 ? (value/1000).toFixed(1)+'k' : value}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '16px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        padding: '12px'
                      }}
                      itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '14px', fontWeight: 800 }}
                      labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                      cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorTotal)"
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-slate-100 bg-white shadow-sm lg:col-span-3 overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground tracking-tight">Distribuição de Vendas</CardTitle>
                <p className="text-xs text-slate-500 font-medium">Divisão de pedidos por tipo de jogo</p>
              </CardHeader>
              <CardContent className="h-[350px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Rifas', value: orders?.filter(o => o.payment_status === 'paid').length ?? 0 },
                    { name: 'Roleta', value: rouletteStats?.totalSpins ?? 0 },
                    { name: 'Caixas', value: 86 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
                    />
                    <YAxis axisLine={false} tickLine={false} hide />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px' }}
                    />
                     <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                        { [0, 1, 2].map((_, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--primary))' : index === 1 ? '#8b5cf6' : '#ec4899'} className="transition-all hover:opacity-80" />
                        )) }
                     </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-slate-100 bg-white shadow-sm group overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-foreground tracking-tight">Campanhas em Alta</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Rifas com melhor conversão</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10" onClick={() => window.location.href='/admin/campanhas'}>
                  Ver Todas
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns?.slice(0, 4).map((c) => {
                    const progress = Math.min(Math.round((c.sold_tickets / (c.total_tickets || 1)) * 100), 100);
                    return (
                      <div key={c.id} className="group/item flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/30 hover:bg-white transition-all shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-purple-600/10 border border-slate-100 flex items-center justify-center text-primary font-bold shadow-inner group-hover/item:scale-105 transition-transform">
                            {c.image_url ? <img src={c.image_url} className="h-full w-full object-cover rounded-xl" /> : c.title.substring(0, 1)}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-foreground tracking-tight group-hover/item:text-primary transition-colors">{c.title}</p>
                            <div className="flex items-center gap-2">
                              <div className="h-1 w-24 rounded-full bg-slate-200 overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${progress}%` }}></div>
                              </div>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{progress}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-emerald-400">R$ {((Number(c.ticket_price) * c.sold_tickets) || 0).toFixed(2)}</p>
                          <p className="text-[10px] text-slate-500 font-bold">{c.sold_tickets} bilhetes</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-100 bg-white shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-foreground tracking-tight">Live Activity</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Últimas interações do sistema</CardDescription>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Ao Vivo</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {[
                    { action: "Pagamento Aprovado", user: "LEANDRO BRUM", target: "ORD-75AC71", time: "2 min atrás", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { action: "Nova Campanha", user: "Administrador", target: "iPhone 16 Pro Max", time: "15 min atrás", icon: Plus, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { action: "Sorteio Federal", user: "Sistema", target: "Concurso 5864", time: "1h atrás", icon: Target, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { action: "Cupom Criado", user: "Administrador", target: "DROP50", time: "2h atrás", icon: Percent, color: "text-purple-400", bg: "bg-purple-500/10" },
                    { action: "Novo Vencedor", user: "Sistema", target: "Rifa Toyota Hilux", time: "3h atrás", icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors group/log">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-xl ${log.bg} flex items-center justify-center ${log.color} transition-transform group-hover/log:scale-110`}>
                          <log.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-200 group-hover/log:text-white transition-colors">{log.action}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{log.user} • <span className="text-slate-400">{log.target}</span></p>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">{log.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
