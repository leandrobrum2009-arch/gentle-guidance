import AdminLayout from "@/components/AdminLayout";
import { useAdminMysteryBoxes } from "@/hooks/useAdmin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Gift, Plus, Pencil, Trash2, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminMysteryBoxes() {
  const { data: boxes, isLoading } = useAdminMysteryBoxes();

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Caixas Misteriosas</h1>
          <p className="text-muted-foreground mt-1">Gerencie tipos de caixas, custos e prêmios.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white font-bold shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] border-none">
          <Plus className="mr-2 h-4 w-4" /> Nova Caixa
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        {['Comum', 'Raro', 'Épico', 'Lendário'].map((rarity, i) => (
          <Card key={rarity} className="border-white/5 bg-[#0d0d0f]/50 backdrop-blur-xl relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-full h-1 ${
              rarity === 'Comum' ? 'bg-slate-400' :
              rarity === 'Raro' ? 'bg-blue-400' :
              rarity === 'Épico' ? 'bg-purple-400' : 'bg-amber-400'
            }`} />
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{rarity}</p>
                <p className="text-xl font-bold text-white mt-1">
                  {boxes?.filter(b => (b as any).rarity === rarity).length || 0} Ativas
                </p>
              </div>
              <Box className={`h-8 w-8 ${
                rarity === 'Comum' ? 'text-muted-foreground' :
                rarity === 'Raro' ? 'text-blue-400' :
                rarity === 'Épico' ? 'text-purple-400' : 'text-amber-400'
              } opacity-20`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-white/5 bg-[#0d0d0f]/50 backdrop-blur-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Caixa</TableHead>
                  <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Custo</TableHead>
                  <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Prêmio Máx</TableHead>
                  <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground font-bold uppercase text-[10px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boxes?.map((b) => (
                  <TableRow key={b.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-white tracking-tight">{b.title}</span>
                        <span className="text-[10px] text-muted-foreground">{(b as any).rarity || 'Geral'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-bold font-mono text-xs">
                      R$ {Number(b.cost_to_open || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-emerald-400 font-bold font-mono text-xs">
                      R$ {Number(b.prize_value || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] font-bold tracking-widest ${b.is_active ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-secondary/500/20 text-muted-foreground border-slate-500/20'}`}>
                        {b.is_active ? 'ATIVA' : 'INATIVA'}
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
                {boxes?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground font-medium italic">
                      Nenhuma caixa misteriosa encontrada.
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
