import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { useAdminWinners, useAdminCampaigns } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface WinnerForm {
  campaign_id: string;
  winner_name: string;
  ticket_number: string;
  prize_description: string;
  phone_masked: string;
  video_url: string;
  draw_date: string;
}

const empty: WinnerForm = {
  campaign_id: "", winner_name: "", ticket_number: "",
  prize_description: "", phone_masked: "", video_url: "", draw_date: "",
};

export default function AdminWinners() {
  const { data: winners, isLoading } = useAdminWinners();
  const { data: campaigns } = useAdminCampaigns();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<WinnerForm>(empty);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof WinnerForm, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("winners").insert({
      campaign_id: form.campaign_id,
      winner_name: form.winner_name,
      ticket_number: form.ticket_number,
      prize_description: form.prize_description,
      phone_masked: form.phone_masked || null,
      video_url: form.video_url || null,
      draw_date: form.draw_date,
    });
    setSaving(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Ganhador registrado!" });
    queryClient.invalidateQueries({ queryKey: ["admin-winners"] });
    queryClient.invalidateQueries({ queryKey: ["winners"] });
    setForm(empty);
    setOpen(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Remover este ganhador?")) return;
    const { error } = await supabase.from("winners").delete().eq("id", id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Ganhador removido" });
    queryClient.invalidateQueries({ queryKey: ["admin-winners"] });
    queryClient.invalidateQueries({ queryKey: ["winners"] });
  };

  const valid = form.campaign_id && form.winner_name && form.ticket_number && form.prize_description && form.draw_date;

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Ganhadores</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setForm(empty); setOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Registrar Ganhador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Novo Ganhador</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <Select value={form.campaign_id} onValueChange={(v) => set("campaign_id", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione a campanha *" /></SelectTrigger>
                <SelectContent>
                  {campaigns?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Nome do ganhador *" value={form.winner_name} onChange={(e) => set("winner_name", e.target.value)} />
              <Input placeholder="Número do bilhete *" value={form.ticket_number} onChange={(e) => set("ticket_number", e.target.value)} />
              <Input placeholder="Prêmio *" value={form.prize_description} onChange={(e) => set("prize_description", e.target.value)} />
              <Input placeholder="Telefone (mascarado)" value={form.phone_masked} onChange={(e) => set("phone_masked", e.target.value)} />
              <Input placeholder="URL do vídeo" value={form.video_url} onChange={(e) => set("video_url", e.target.value)} />
              <Input type="date" value={form.draw_date} onChange={(e) => set("draw_date", e.target.value)} />
              <Button onClick={save} disabled={saving || !valid}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : !winners?.length ? (
            <p className="p-6 text-center text-muted-foreground">Nenhum ganhador registrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Bilhete</TableHead>
                  <TableHead>Prêmio</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {winners.map((w: any) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.winner_name}</TableCell>
                    <TableCell>{w.campaigns?.title ?? "—"}</TableCell>
                    <TableCell>{w.ticket_number}</TableCell>
                    <TableCell>{w.prize_description}</TableCell>
                    <TableCell>{format(new Date(w.draw_date), "dd/MM/yy")}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => remove(w.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
