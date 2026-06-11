import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAdminOrders } from "@/hooks/useAdmin";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Download, Filter, ArrowUpRight, ArrowDownLeft, 
  CreditCard, Wallet, Calendar, User, ShoppingBag, 
  Loader2, CheckCircle2, XCircle, Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminTransactions() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: orders, isLoading } = useAdminOrders();

  const filteredTransactions = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o: any) => {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        o.id.toLowerCase().includes(searchLower) ||
        (o.profiles?.name || "").toLowerCase().includes(searchLower) ||
        (o.profiles?.email || "").toLowerCase().includes(searchLower) ||
        (o.campaigns?.title || "").toLowerCase().includes(searchLower);
      
      const matchesStatus = statusFilter === "all" || o.payment_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const stats = useMemo(() => {
    if (!orders) return { total: 0, paid: 0, pending: 0, revenue: 0 };
    const paid = orders.filter((o: any) => o.payment_status === "paid");
    return {
      total: orders.length,
      paid: paid.length,
      pending: orders.filter((o: any) => o.payment_status === "pending").length,
      revenue: paid.reduce((acc: number, o: any) => acc + Number(o.total_amount), 0)
    };
  }, [orders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1"><CheckCircle2 className="h-3 w-3" /> Pago</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1"><Clock className="h-3 w-3" /> Pendente</Badge>;
      case 'cancelled':
      case 'expired':
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 gap-1"><XCircle className="h-3 w-3" /> {status === 'cancelled' ? 'Cancelado' : 'Expirado'}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-primary" /> Transações Financeiras
          </h1>
          <p className="text-muted-foreground mt-1">Histórico completo de entradas e fluxos de pagamento.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="rounded-xl font-bold uppercase text-[10px] tracking-widest gap-2">
            <Download className="h-3 w-3" /> Exportar CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {[
          { label: "Receita Total", val: `R$ ${stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Transações Pagas", val: stats.paid, icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Pendentes", val: stats.pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Total Geral", val: stats.total, icon: ShoppingBag, color: "text-primary", bg: "bg-primary/10" },
        ].map((stat, i) => (
          <Card key={i} className="border-border bg-card/50 backdrop-blur-xl">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-black text-foreground">{stat.val}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por cliente, ID ou campanha..." 
                className="pl-10 h-11 rounded-xl border-border bg-secondary/10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              {['all', 'paid', 'pending', 'cancelled'].map(f => (
                <Button 
                  key={f}
                  variant={statusFilter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(f)}
                  className="rounded-full text-[10px] font-bold uppercase tracking-widest px-4 h-9"
                >
                  {f === 'all' ? 'Todas' : f === 'paid' ? 'Pagas' : f === 'pending' ? 'Pendentes' : 'Canceladas'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest pl-6">Data / ID</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Cliente</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Campanha</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Valor</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Método</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-right pr-6">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-20 text-muted-foreground italic uppercase text-xs">
                      Nenhuma transação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx: any) => (
                    <TableRow key={tx.id} className="border-border hover:bg-secondary/20 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-foreground">
                            {format(new Date(tx.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </span>
                          <span className="text-[9px] font-mono text-muted-foreground uppercase">
                            #{tx.id.substring(0, 8)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">{tx.profiles?.name || "Convidado"}</span>
                            <span className="text-[9px] text-muted-foreground truncate max-w-[120px]">{tx.profiles?.email || "—"}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col max-w-[150px]">
                          <span className="text-[10px] font-bold text-foreground truncate">{tx.campaigns?.title || "—"}</span>
                          <span className="text-[9px] text-muted-foreground uppercase">{tx.quantity} títulos</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-black text-foreground">
                          R$ {Number(tx.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-tighter">
                          {tx.payment_provider || 'PIX'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(tx.payment_status)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 rounded-xl"
                          onClick={() => window.open(`/checkout/${tx.id}`, '_blank')}
                        >
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
