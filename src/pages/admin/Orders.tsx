import { useState, useMemo } from "react";
 import AdminLayout from "@/components/AdminLayout";
 import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/useAdmin";
 import { Card, CardContent } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, CheckCircle2, XCircle, Clock, ShoppingBag, CreditCard, Search, Filter, Download, User, Calendar, MoreVertical } from "lucide-react";
 import { format } from "date-fns";
 import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
  DropdownMenuLabel,
   DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu";
 
 export default function AdminOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
   const { data: orders, isLoading } = useAdminOrders();
   const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();
 
   const statusLabel: Record<string, string> = {
     pending: "Pendente",
     paid: "Pago",
     expired: "Expirado",
     cancelled: "Cancelado",
   };
 
   const statusIcon = (s: string) => {
     switch (s) {
       case "paid": return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
       case "pending": return <Clock className="h-3.5 w-3.5 text-amber-400" />;
       case "cancelled": return <XCircle className="h-3.5 w-3.5 text-rose-400" />;
       default: return <Clock className="h-3.5 w-3.5 text-slate-400" />;
     }
   };
 
   const statusBg = (s: string) => {
     switch (s) {
       case "paid": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
       case "pending": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
       case "cancelled": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
       default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
     }
   };
 
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(o => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        o.id.toLowerCase().includes(searchLower) ||
        (o.profiles?.name || "").toLowerCase().includes(searchLower) ||
        (o.profiles?.email || "").toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === "all" || o.payment_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    if (!orders) return { total: 0, pending: 0, paid: 0 };
    return {
      total: orders.length,
      pending: orders.filter(o => o.payment_status === "pending").length,
      paid: orders.filter(o => o.payment_status === "paid").length,
    };
  }, [orders]);

   return (
     <AdminLayout>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Gestão de Pedidos</h1>
          <p className="text-slate-400 mt-1">Monitore e aprove pagamentos em tempo real.</p>
        </div>
        <div className="flex items-center gap-3">
          {[
            { label: "Pendentes", value: stats.pending, color: "text-amber-400", bg: "bg-amber-500/10" },
            { label: "Pagos", value: stats.paid, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Total", value: stats.total, color: "text-primary", bg: "bg-primary/10" },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-end">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{s.label}</p>
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${s.color.replace('text', 'bg')} animate-pulse`} />
                <p className="text-xl font-bold text-white leading-none">{s.value}</p>
              </div>
            </div>
          ))}
          <Button variant="outline" size="icon" className="h-10 w-10 border-white/10 bg-white/5 text-slate-400 hover:text-white">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input 
            placeholder="Buscar por ID, nome ou e-mail..." 
            className="pl-10 border-white/5 bg-[#0d0d0f]/50 text-white focus:border-primary/50 h-12 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 md:col-span-2">
          {["all", "pending", "paid", "cancelled"].map((s) => (
            <Button
              key={s}
              variant="ghost"
              className={`flex-1 h-12 rounded-xl text-[10px] uppercase font-bold tracking-widest border transition-all ${
                statusFilter === s 
                  ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]" 
                  : "border-white/5 bg-white/5 text-slate-500 hover:text-slate-300"
              }`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "Todos" : statusLabel[s] || s}
            </Button>
          ))}
        </div>
      </div>
 
       <Card className="border-white/5 bg-[#0d0d0f]/50 backdrop-blur-xl">
         <CardContent className="p-0">
           {isLoading ? (
             <div className="flex justify-center py-20">
               <Loader2 className="h-10 w-10 animate-spin text-primary" />
             </div>
            ) : !filteredOrders.length ? (
             <div className="p-20 text-center">
               <CreditCard className="h-12 w-12 text-slate-700 mx-auto mb-4" />
               <p className="text-slate-500 font-medium">Nenhum pedido encontrado no sistema.</p>
             </div>
           ) : (
             <Table>
               <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent bg-white/[0.02]">
                    <TableHead className="text-slate-400 font-bold uppercase text-[9px] tracking-widest pl-8 py-5">Identificação</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[9px] tracking-widest py-5">Cliente</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[9px] tracking-widest py-5">Campanha</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[9px] tracking-widest py-5 text-center">Qtde</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[9px] tracking-widest py-5">Total</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[9px] tracking-widest py-5">Status</TableHead>
                    <TableHead className="text-right text-slate-400 font-bold uppercase text-[9px] tracking-widest pr-8 py-5">Ações</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                  {filteredOrders.map((o: any) => (
                    <TableRow key={o.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                      <TableCell className="pl-8 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-[10px] text-primary font-bold tracking-tighter">ORD-{o.id.substring(0, 8).toUpperCase()}</span>
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Calendar className="h-3 w-3" />
                            <span className="text-[10px] font-medium uppercase">{format(new Date(o.created_at), "dd/MM, HH:mm")}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                            <User className="h-4 w-4 text-slate-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-200 leading-tight">{o.profiles?.name || "Convidado"}</span>
                            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">{o.profiles?.email || "—"}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-primary" />
                          <span className="font-bold text-slate-300 tracking-tight text-xs uppercase">{o.campaigns?.title ?? "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-white/5 border-white/10 text-white font-bold h-6 rounded-md">
                          {o.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-white tracking-tighter text-sm">R$ {Number(o.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </TableCell>
                     <TableCell>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border w-fit font-bold text-[9px] uppercase tracking-widest ${statusBg(o.payment_status)}`}>
                         {statusIcon(o.payment_status)}
                         {statusLabel[o.payment_status] ?? o.payment_status}
                       </div>
                     </TableCell>
                      <TableCell className="text-right pr-8">
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                              <MoreVertical className="h-5 w-5" />
                           </Button>
                         </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 bg-[#131316] border-white/10 text-slate-200 shadow-2xl rounded-xl p-1.5">
                            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 py-2">Opções do Pedido</DropdownMenuLabel>
                            <div className="space-y-1">
                              {o.payment_status !== 'paid' && (
                                <DropdownMenuItem 
                                  className="flex items-center gap-3 focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer py-3 rounded-lg font-bold text-xs"
                                  onClick={() => updateStatus({ orderId: o.id, status: 'paid' })}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Aprovar Pagamento
                                </DropdownMenuItem>
                              )}
                              {o.payment_status !== 'cancelled' && (
                                <DropdownMenuItem 
                                  className="flex items-center gap-3 focus:bg-rose-500/10 focus:text-rose-400 cursor-pointer py-3 rounded-lg font-bold text-xs"
                                  onClick={() => updateStatus({ orderId: o.id, status: 'cancelled' })}
                                >
                                  <XCircle className="h-4 w-4" />
                                  Cancelar Compra
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="flex items-center gap-3 focus:bg-white/5 focus:text-white cursor-pointer py-3 rounded-lg font-bold text-xs"
                                onClick={() => window.open(`/checkout/${o.id}`, '_blank')}
                              >
                                <ShoppingBag className="h-4 w-4" />
                                Ver Comprovante
                              </DropdownMenuItem>
                            </div>
                          </DropdownMenuContent>
                       </DropdownMenu>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           )}
         </CardContent>
       </Card>
     </AdminLayout>
   );
 }
