import AdminLayout from "@/components/AdminLayout";
 import { useAdminRoulette, useAdminRouletteStats } from "@/hooks/useAdmin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Dices, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

 export default function AdminRoulette() {
   const { data: prizes, isLoading } = useAdminRoulette();
   const { data: stats, isLoading: isLoadingStats } = useAdminRouletteStats();
 
   return (
     <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
            Roletas Premiadas
          </h1>
          <p className="text-slate-400 mt-1">Configure prêmios, cores e probabilidades da roleta.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white font-bold shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] border-none">
          <Plus className="mr-2 h-4 w-4" /> Novo Prêmio
         </Button>
       </div>
 
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
         <Card className="border-white/5 bg-[#0d0d0f]/50 backdrop-blur-xl">
           <CardContent className="p-6">
             <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Total de Giros</p>
             <h3 className="text-2xl font-black text-white">{stats?.totalSpins || 0}</h3>
           </CardContent>
         </Card>
         <Card className="border-white/5 bg-[#0d0d0f]/50 backdrop-blur-xl">
           <CardContent className="p-6">
             <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Prêmios Distribuídos</p>
             <h3 className="text-2xl font-black text-emerald-400">R$ {stats?.totalPrizesValue.toFixed(2) || "0.00"}</h3>
           </CardContent>
         </Card>
         <Card className="border-white/5 bg-[#0d0d0f]/50 backdrop-blur-xl">
           <CardContent className="p-6">
             <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Giros Grátis / Pagos</p>
             <h3 className="text-2xl font-black text-white">
               {stats?.freeSpinsCount || 0} <span className="text-slate-600 text-sm">/ {stats?.paidSpinsCount || 0}</span>
             </h3>
           </CardContent>
         </Card>
         <Card className="border-white/5 bg-[#0d0d0f]/50 backdrop-blur-xl">
           <CardContent className="p-6">
             <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Receita Estimada</p>
             <h3 className="text-2xl font-black text-primary">R$ {stats?.estimatedRevenue.toFixed(2) || "0.00"}</h3>
           </CardContent>
         </Card>
       </div>
 
       <Card className="border-white/5 bg-[#0d0d0f]/50 backdrop-blur-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Prêmio</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Tipo</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Valor</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Chance</TableHead>
                  <TableHead className="text-slate-400 font-bold uppercase text-[10px]">Cor Visual</TableHead>
                  <TableHead className="text-right text-slate-400 font-bold uppercase text-[10px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prizes?.map((p) => (
                  <TableRow key={p.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell>
                      <span className="font-bold text-white tracking-tight">{p.label}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-white/5 border-white/10 text-white capitalize text-[10px]">
                        {p.prize_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-emerald-400 font-bold font-mono text-xs">
                      R$ {Number(p.value).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${p.chance_percent}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-300">{p.chance_percent}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: p.color }} />
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{p.color}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/10">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {prizes?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-500 font-medium italic">
                      Nenhum prêmio configurado na roleta.
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
