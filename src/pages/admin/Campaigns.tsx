import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { useAdminCampaigns } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Trophy } from "lucide-react";

export default function AdminCampaigns() {
  const navigate = useNavigate();
  const { data: campaigns, isLoading } = useAdminCampaigns();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const remove = async (id: string) => {
    if (!confirm("Excluir esta campanha?")) return;
    const { error } = await supabase.from("campaigns").delete().eq("id", id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Campanha excluída" });
    queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
  };

   const statusColor = (s: string) => s === "active" ? "default" : s === "completed" ? "secondary" : "outline";
 
  const performDraw = async (id: string) => {
    if (!confirm("Realizar o sorteio desta campanha agora? Esta ação é irreversível.")) return;
    setSaving(true);
    const { error } = await supabase.rpc('perform_draw', { p_campaign_id: id });
    setSaving(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Sorteio concluído com sucesso!" });
    queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["winners"] });
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Campanhas</h1>
        <Button onClick={() => navigate("/admin/campanhas/nova")}><Plus className="mr-2 h-4 w-4" /> Nova Campanha</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Vendidos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns?.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{c.title}</span>
                        {c.federal_lottery_draw && (
                          <Badge variant="outline" className="w-fit text-[10px] py-0 h-4 border-primary text-primary">Sorteio Federal</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={statusColor(c.status)}>{c.status}</Badge></TableCell>
                    <TableCell>R$ {Number(c.ticket_price).toFixed(2)}</TableCell>
                    <TableCell>{c.sold_tickets}/{c.total_tickets}</TableCell>
                    <TableCell className="text-right">
                      {c.status === "active" && (
                        <Button variant="ghost" size="icon" className="text-amber-500 hover:text-amber-600 hover:bg-amber-50" onClick={() => performDraw(c.id)}>
                          <Trophy className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/campanhas/editar/${c.id}`)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
