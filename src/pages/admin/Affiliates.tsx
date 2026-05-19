import AdminLayout from "@/components/AdminLayout";
import { useAdminAffiliates } from "@/hooks/useAdmin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UsersRound, DollarSign, ExternalLink, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AdminAffiliates() {
  const { data: affiliates, isLoading } = useAdminAffiliates();

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">Afiliados</h1>
          <p className="text-muted-foreground mt-1">Gerencie a rede de parceiros e comissões.</p>
        </div>
        <Badge className="bg-primary/20 text-primary border-primary/20 py-1.5 px-4 font-bold tracking-wider">
          {affiliates?.length || 0} PARCEIROS
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="border-border bg-emerald-500/5 backdrop-blur-xl group hover:border-emerald-500/30 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-500">
                <DollarSign className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/20">ESTÁVEL</Badge>
            </div>
            <div className="mt-4">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Total Comissões</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">R$ 12.450,00</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border bg-blue-500/5 backdrop-blur-xl group hover:border-blue-500/30 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-500">
                <UsersRound className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="text-[10px] text-blue-500 border-blue-500/20">+4 HOJE</Badge>
            </div>
            <div className="mt-4">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Afiliados Ativos</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">{affiliates?.length || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-purple-500/5 backdrop-blur-xl group hover:border-purple-500/30 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-500">
                <ExternalLink className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="text-[10px] text-purple-500 border-purple-500/20">TOP RANK</Badge>
            </div>
            <div className="mt-4">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Clicks Totais</p>
              <h3 className="text-3xl font-bold text-foreground mt-1">45.890</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Parceiro</TableHead>
                  <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Código/Link</TableHead>
                  <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Comissão</TableHead>
                  <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Ganhos Totais</TableHead>
                  <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliates?.map((a) => (
                  <TableRow key={a.id} className="border-border hover:bg-secondary/20 transition-colors group">
                    <TableCell>
                      <div className="flex flex-col">
                       <span className="font-bold text-foreground">{(a.profiles as any)?.name || "Sem Nome"}</span>
                       <span className="text-[10px] text-muted-foreground">Afiliado Premium</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-secondary/20 px-2 py-1 rounded text-primary text-xs font-bold">{a.referral_code}</code>
                    </TableCell>
                    <TableCell className="text-foreground font-medium">{Number(a.commission_rate * 100).toFixed(0)}%</TableCell>
                    <TableCell className="text-emerald-400 font-bold tracking-tight">R$ 0,00</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                        <ShieldCheck className="h-3 w-3" />
                        Verificado
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {affiliates?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground font-medium italic">
                      Nenhum afiliado encontrado.
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
