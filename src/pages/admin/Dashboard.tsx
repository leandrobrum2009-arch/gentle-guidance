 import AdminLayout from "@/components/AdminLayout";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { useAdminCampaigns, useAdminOrders, useAdminUsers } from "@/hooks/useAdmin";
 import { 
   Loader2, Megaphone, ShoppingCart, DollarSign, Users, 
   TrendingUp, TrendingDown, ArrowUpRight, Activity, Zap
 } from "lucide-react";
 import { 
   AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
   ResponsiveContainer, BarChart, Bar, Cell
 } from 'recharts';
 import { format, subDays, startOfDay, isSameDay } from 'date-fns';
 import { ptBR } from 'date-fns/locale';
 
 export default function AdminDashboard() {
   const { data: campaigns, isLoading: lc } = useAdminCampaigns();
   const { data: orders, isLoading: lo } = useAdminOrders();
   const { data: users, isLoading: lu } = useAdminUsers();
 
   const loading = lc || lo || lu;
 
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
   ];
 
   return (
     <AdminLayout>
       <div className="mb-8 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
         <div>
           <h1 className="font-display text-3xl font-bold tracking-tight text-white underline decoration-primary decoration-4 underline-offset-8">
             Visão Geral
           </h1>
           <p className="mt-2 text-slate-400">Bem-vindo de volta ao seu centro de controle premium.</p>
         </div>
         <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 border border-primary/20">
             <Activity className="h-4 w-4 text-primary animate-pulse" />
             <span className="text-xs font-bold uppercase tracking-wider text-primary">14 usuários online</span>
           </div>
         </div>
       </div>
 
       {loading ? (
         <div className="flex h-96 items-center justify-center">
           <div className="relative">
             <div className="h-24 w-24 rounded-full border-4 border-primary/20"></div>
             <div className="absolute top-0 h-24 w-24 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
             <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-pulse text-primary" />
           </div>
         </div>
       ) : (
         <div className="space-y-8">
           {/* Stats Grid */}
           <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
             {stats.map((s) => (
               <Card key={s.label} className="relative overflow-hidden border-white/5 bg-[#0d0d0f]/50 backdrop-blur-xl transition-all hover:border-primary/30 group">
                 <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${s.color} opacity-10 blur-2xl transition-all group-hover:opacity-20`}></div>
                 <CardHeader className="flex flex-row items-center justify-between pb-2">
                   <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">{s.label}</CardTitle>
                   <div className={`rounded-lg bg-gradient-to-br ${s.color} p-2 shadow-lg`}>
                     <s.icon className="h-4 w-4 text-white" />
                   </div>
                 </CardHeader>
                 <CardContent>
                   <div className="flex items-baseline gap-2">
                     <p className="text-2xl font-bold tracking-tight text-white">{s.value}</p>
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
             <Card className="border-white/5 bg-[#0d0d0f]/50 backdrop-blur-xl lg:col-span-4">
               <CardHeader className="flex flex-row items-center justify-between">
                 <div>
                   <CardTitle className="text-lg font-bold text-white">Análise de Receita</CardTitle>
                   <p className="text-xs text-slate-400">Faturamento dos últimos 7 dias</p>
                 </div>
                 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 transition-colors hover:bg-white/10">
                   <ArrowUpRight className="h-4 w-4 text-slate-400" />
                 </div>
               </CardHeader>
               <CardContent className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={last7Days}>
                     <defs>
                       <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                     <XAxis 
                       dataKey="date" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fill: '#94a3b8', fontSize: 10 }}
                       dy={10}
                     />
                     <YAxis 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fill: '#94a3b8', fontSize: 10 }}
                       tickFormatter={(value) => `R$${value}`}
                     />
                     <Tooltip 
                       contentStyle={{ backgroundColor: '#131316', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                       itemStyle={{ color: '#fff', fontSize: '12px' }}
                       labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '10px' }}
                     />
                     <Area 
                       type="monotone" 
                       dataKey="total" 
                       stroke="hsl(var(--primary))" 
                       strokeWidth={3}
                       fillOpacity={1} 
                       fill="url(#colorTotal)" 
                     />
                   </AreaChart>
                 </ResponsiveContainer>
               </CardContent>
             </Card>
 
             <Card className="border-white/5 bg-[#0d0d0f]/50 backdrop-blur-xl lg:col-span-3">
               <CardHeader>
                 <CardTitle className="text-lg font-bold text-white">Vendas por Categoria</CardTitle>
                 <p className="text-xs text-slate-400">Distribuição de pedidos pagos</p>
               </CardHeader>
               <CardContent className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={[
                     { name: 'Rifas', value: orders?.filter(o => o.payment_status === 'paid').length ?? 0 },
                     { name: 'Roleta', value: 124 },
                     { name: 'Caixas', value: 86 }
                   ]}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                     <XAxis 
                       dataKey="name" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fill: '#94a3b8', fontSize: 10 }}
                     />
                     <YAxis axisLine={false} tickLine={false} hide />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#131316', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                     />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                         { [0, 1, 2].map((_, index) => (
                           <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--primary))' : index === 1 ? '#8b5cf6' : '#ec4899'} />
                         )) }
                      </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               </CardContent>
             </Card>
           </div>
 
           {/* Recent Activity / Top Campaigns */}
           <div className="grid gap-6 lg:grid-cols-2">
             <Card className="border-white/5 bg-[#0d0d0f]/50 backdrop-blur-xl">
               <CardHeader>
                 <CardTitle className="text-lg font-bold text-white">Campanhas em Destaque</CardTitle>
                 <p className="text-xs text-slate-400">Desempenho das rifas mais populares</p>
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   {campaigns?.slice(0, 4).map((c) => (
                     <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-primary/20 transition-all">
                       <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                           {c.title.substring(0, 1)}
                         </div>
                         <div>
                           <p className="text-sm font-bold text-white tracking-tight">{c.title}</p>
                           <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{c.status}</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="text-sm font-bold text-emerald-400">R$ {((Number(c.ticket_price) * c.sold_tickets) || 0).toFixed(2)}</p>
                         <p className="text-[10px] text-slate-500">{c.sold_tickets} vendas</p>
                       </div>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
 
             <Card className="border-white/5 bg-[#0d0d0f]/50 backdrop-blur-xl">
               <CardHeader>
                 <CardTitle className="text-lg font-bold text-white">Logs do Sistema</CardTitle>
                 <p className="text-xs text-slate-400">Últimas ações administrativas</p>
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   {[
                     { action: "Pagamento Aprovado", user: "Admin", target: "#ORD-5432", time: "2 min atrás", icon: CheckCircle2, color: "text-emerald-400" },
                     { action: "Nova Campanha Criada", user: "Admin", target: "Rifa iPhone 15", time: "15 min atrás", icon: Plus, color: "text-blue-400" },
                     { action: "Cupom Gerado", user: "Admin", target: "PROMO20", time: "1h atrás", icon: Percent, color: "text-purple-400" },
                     { action: "Notificação Enviada", user: "Admin", target: "Todos usuários", time: "3h atrás", icon: Bell, color: "text-amber-400" },
                   ].map((log, i) => (
                     <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                       <div className="flex items-center gap-3">
                         <log.icon className={`h-4 w-4 ${log.color}`} />
                         <div>
                           <p className="text-xs font-bold text-slate-200">{log.action}</p>
                           <p className="text-[10px] text-slate-500">{log.user} • {log.target}</p>
                         </div>
                       </div>
                       <span className="text-[10px] text-slate-600 font-medium">{log.time}</span>
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
