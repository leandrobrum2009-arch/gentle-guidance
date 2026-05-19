import AdminLayout from "@/components/AdminLayout";
import { useAdminCoupons } from "@/hooks/useAdmin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Percent, Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AdminCoupons() {
  const { data: coupons, isLoading } = useAdminCoupons();

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Cupons de Desconto</h1>
          <p className="text-muted-foreground mt-1">Crie códigos promocionais para aumentar suas vendas.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white font-bold shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] border-none">
          <Plus className="mr-2 h-4 w-4" /> Novo Cupom
        </Button>
      </div>

      <Card className="border-white/5 bg-[#0d0d0f]/50 backdrop-blur-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Código</TableHead>
                  <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Desconto</TableHead>
                  <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Uso</TableHead>
                  <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Expira em</TableHead>
                  <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground font-bold uppercase text-[10px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons?.map((c) => (
                  <TableRow key={c.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell>
                      <code className="bg-primary/10 px-3 py-1.5 rounded-lg text-primary text-sm font-bold tracking-widest border border-primary/20">
                        {c.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-white tracking-tight">
                        {c.discount_type === 'percentage' ? `${c.discount_value}%` : `R$ ${Number(c.discount_value).toFixed(2)}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-300">{c.current_uses} / {c.max_uses || '∞'}</span>
                        <div className="h-1 w-16 bg-white/5 rounded-full mt-1">
                          <div 
                            className="h-full bg-emerald-500" 
                            style={{ width: c.max_uses ? `${(c.current_uses / c.max_uses) * 100}%` : '0%' }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {c.expires_at ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(c.expires_at), 'dd/MM/yy')}
                        </div>
                      ) : 'Nunca'}
                    </TableCell>
                    <TableCell>
                      <Badge className={c.is_active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" : "bg-secondary/500/20 text-muted-foreground border-slate-500/20"}>
                        {c.is_active ? "ATIVO" : "INATIVO"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {coupons?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground font-medium italic">
                      Nenhum cupom de desconto encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
