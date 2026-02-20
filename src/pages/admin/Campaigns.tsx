import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { useAdminCampaigns } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

interface CampaignForm {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  image_url: string;
  ticket_price: number;
  total_tickets: number;
  status: string;
  ltp_code: string;
  urgency_tag: string;
  draw_date: string;
}

const empty: CampaignForm = {
  title: "", slug: "", subtitle: "", description: "", image_url: "",
  ticket_price: 0.99, total_tickets: 100000, status: "active",
  ltp_code: "", urgency_tag: "", draw_date: "",
};

export default function AdminCampaigns() {
  const { data: campaigns, isLoading } = useAdminCampaigns();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CampaignForm>(empty);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof CampaignForm, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const openNew = () => { setEditId(null); setForm(empty); setOpen(true); };
  const openEdit = (c: any) => {
    setEditId(c.id);
    setForm({
      title: c.title, slug: c.slug, subtitle: c.subtitle ?? "",
      description: c.description ?? "", image_url: c.image_url ?? "",
      ticket_price: c.ticket_price, total_tickets: c.total_tickets,
      status: c.status, ltp_code: c.ltp_code ?? "",
      urgency_tag: c.urgency_tag ?? "", draw_date: c.draw_date?.slice(0, 16) ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      ...form,
      ticket_price: Number(form.ticket_price),
      total_tickets: Number(form.total_tickets),
      draw_date: form.draw_date || null,
      subtitle: form.subtitle || null,
      description: form.description || null,
      image_url: form.image_url || null,
      ltp_code: form.ltp_code || null,
      urgency_tag: form.urgency_tag || null,
    };

    const { error } = editId
      ? await supabase.from("campaigns").update(payload).eq("id", editId)
      : await supabase.from("campaigns").insert(payload);

    setSaving(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: editId ? "Campanha atualizada" : "Campanha criada" });
    queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    setOpen(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir esta campanha?")) return;
    const { error } = await supabase.from("campaigns").delete().eq("id", id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Campanha excluída" });
    queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
  };

  const statusColor = (s: string) => s === "active" ? "default" : s === "completed" ? "secondary" : "outline";

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Campanhas</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Nova Campanha</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editId ? "Editar" : "Nova"} Campanha</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input placeholder="Título *" value={form.title} onChange={(e) => set("title", e.target.value)} />
              <Input placeholder="Slug *" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
              <Input placeholder="Subtítulo" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
              <Textarea placeholder="Descrição" value={form.description} onChange={(e) => set("description", e.target.value)} />
              <Input placeholder="URL da imagem" value={form.image_url} onChange={(e) => set("image_url", e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" placeholder="Preço do bilhete" value={form.ticket_price} onChange={(e) => set("ticket_price", e.target.value)} />
                <Input type="number" placeholder="Total de bilhetes" value={form.total_tickets} onChange={(e) => set("total_tickets", e.target.value)} />
              </div>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Código LTP" value={form.ltp_code} onChange={(e) => set("ltp_code", e.target.value)} />
              <Input placeholder="Tag de urgência" value={form.urgency_tag} onChange={(e) => set("urgency_tag", e.target.value)} />
              <Input type="datetime-local" value={form.draw_date} onChange={(e) => set("draw_date", e.target.value)} />
              <Button onClick={save} disabled={saving || !form.title || !form.slug}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editId ? "Salvar" : "Criar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                    <TableCell className="font-medium">{c.title}</TableCell>
                    <TableCell><Badge variant={statusColor(c.status)}>{c.status}</Badge></TableCell>
                    <TableCell>R$ {Number(c.ticket_price).toFixed(2)}</TableCell>
                    <TableCell>{c.sold_tickets}/{c.total_tickets}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
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
