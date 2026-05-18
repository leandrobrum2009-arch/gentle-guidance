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
 import { Loader2, Plus, Pencil, Trash2, Settings2, Trophy } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  mystery_box_enabled: boolean;
  roulette_enabled: boolean;
  ranking_enabled: boolean;
  featured: boolean;
  price_bundles: string;
  gallery_urls: string;
  video_url: string;
  regulations: string;
  auto_numbers: boolean;
  manual_numbers: boolean;
  ticket_generation_type: 'manual' | 'auto';
  lucky_numbers_prizes: { number: string; prize: string; protected?: boolean }[];
  main_prizes: string;
  federal_lottery_draw: boolean;
  sales_goal: number;
  roulette_free_tickets: number;
  roulette_payout_rate: number;
  show_instant_prizes: boolean;
  show_roulette_status: boolean;
}

const empty: CampaignForm = {
  title: "", slug: "", subtitle: "", description: "", image_url: "",
  ticket_price: 0.99, total_tickets: 100000, status: "active",
  ltp_code: "", urgency_tag: "", draw_date: "",
  mystery_box_enabled: false,
  roulette_enabled: false,
  ranking_enabled: true,
  featured: false,
  price_bundles: "[]",
  gallery_urls: "[]",
  video_url: "",
  regulations: "",
  auto_numbers: true,
  manual_numbers: true,
  ticket_generation_type: 'auto',
  lucky_numbers_prizes: [],
  main_prizes: "[]",
  federal_lottery_draw: false,
  sales_goal: 0,
  roulette_free_tickets: 10,
  roulette_payout_rate: 0,
  show_instant_prizes: true,
  show_roulette_status: true,
};

export default function AdminCampaigns() {
  const { data: campaigns, isLoading } = useAdminCampaigns();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CampaignForm>(empty);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof CampaignForm, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const openNew = () => { setEditId(null); setForm(empty); setOpen(true); };
  const openEdit = (c: any) => {
    setEditId(c.id);
    setForm({
      title: c.title, slug: c.slug, subtitle: c.subtitle ?? "",
      description: c.description ?? "", image_url: c.image_url ?? "",
      ticket_price: c.ticket_price, total_tickets: c.total_tickets,
      status: c.status, ltp_code: c.ltp_code ?? "",
      urgency_tag: c.urgency_tag ?? "", draw_date: c.draw_date?.slice(0, 16) ?? "",
      mystery_box_enabled: c.mystery_box_enabled ?? false,
      roulette_enabled: c.roulette_enabled ?? false,
      ranking_enabled: c.ranking_enabled ?? true,
      featured: c.featured ?? false,
      price_bundles: JSON.stringify(c.price_bundles ?? [], null, 2),
      gallery_urls: JSON.stringify(c.gallery_urls ?? [], null, 2),
      video_url: c.video_url ?? "",
      regulations: c.regulations ?? "",
      auto_numbers: c.auto_numbers ?? true,
      manual_numbers: c.manual_numbers ?? false,
      ticket_generation_type: c.ticket_generation_type ?? 'auto',
      lucky_numbers_prizes: c.lucky_numbers_prizes ?? [],
      main_prizes: JSON.stringify(c.main_prizes ?? [], null, 2),
      federal_lottery_draw: c.federal_lottery_draw ?? false,
      sales_goal: c.sales_goal ?? 0,
      roulette_free_tickets: c.roulette_free_tickets ?? 10,
      roulette_payout_rate: c.roulette_payout_rate ?? 0,
      show_instant_prizes: c.show_instant_prizes ?? true,
      show_roulette_status: c.show_roulette_status ?? true,
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
      mystery_box_enabled: form.mystery_box_enabled,
      roulette_enabled: form.roulette_enabled,
      ranking_enabled: form.ranking_enabled,
      featured: form.featured,
      price_bundles: JSON.parse(form.price_bundles || "[]"),
      gallery_urls: JSON.parse(form.gallery_urls || "[]"),
      lucky_numbers_prizes: form.lucky_numbers_prizes,
      auto_numbers: form.auto_numbers,
      manual_numbers: form.manual_numbers,
      ticket_generation_type: form.ticket_generation_type,
      main_prizes: JSON.parse(form.main_prizes || "[]"),
      federal_lottery_draw: form.federal_lottery_draw,
      sales_goal: Number(form.sales_goal),
      roulette_free_tickets: Number(form.roulette_free_tickets),
      roulette_payout_rate: Number(form.roulette_payout_rate),
      show_instant_prizes: form.show_instant_prizes,
      show_roulette_status: form.show_roulette_status,
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
 
   const performDraw = async (id: string) => {
     if (!confirm("Realizar o sorteio desta campanha agora? Esta ação é irreversível.")) return;
     setSaving(true);
     const { data, error } = await supabase.rpc('perform_draw', { p_campaign_id: id });
     setSaving(false);
     if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
     toast({ title: "Sorteio concluído com sucesso!" });
     queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
     queryClient.invalidateQueries({ queryKey: ["winners"] });
   };

  const addLuckyNumber = () => {
    set("lucky_numbers_prizes", [...form.lucky_numbers_prizes, { number: "", prize: "", protected: false }]);
  };

  const removeLuckyNumber = (index: number) => {
    const newList = [...form.lucky_numbers_prizes];
    newList.splice(index, 1);
    set("lucky_numbers_prizes", newList);
  };

  const updateLuckyNumber = (index: number, key: string, value: any) => {
    const newList = [...form.lucky_numbers_prizes];
    newList[index] = { ...newList[index], [key]: value };
    set("lucky_numbers_prizes", newList);
  };

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
              <Textarea placeholder="Regulamento" value={form.regulations} onChange={(e) => set("regulations", e.target.value)} />
              <Input placeholder="URL da imagem" value={form.image_url} onChange={(e) => set("image_url", e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" placeholder="Preço do bilhete" value={form.ticket_price} onChange={(e) => set("ticket_price", e.target.value)} />
                <Input type="number" placeholder="Total de bilhetes" value={form.total_tickets} onChange={(e) => set("total_tickets", e.target.value)} />
                <Input type="number" placeholder="Meta de vendas (R$)" value={form.sales_goal} onChange={(e) => set("sales_goal", e.target.value)} />
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Tipo de Geração</Label>
                  <Select value={form.ticket_generation_type} onValueChange={(v: any) => set("ticket_generation_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Automática (Até 10M)</SelectItem>
                      <SelectItem value="manual">Manual (Até 5k)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Giro Grátis a cada X cotas</Label>
                  <Input type="number" value={form.roulette_free_tickets} onChange={(e) => set("roulette_free_tickets", e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">% de Premiação Roleta</Label>
                  <Input type="number" placeholder="Ex: 10" value={form.roulette_payout_rate} onChange={(e) => set("roulette_payout_rate", e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">Galeria (URLs JSON)</Label>
                <Textarea placeholder='["https://...", "https://..."]' value={form.gallery_urls} onChange={(e) => set("gallery_urls", e.target.value)} rows={2} className="font-mono text-xs" />
              </div>

              <Input placeholder="URL do Vídeo (Youtube)" value={form.video_url} onChange={(e) => set("video_url", e.target.value)} />

              <div className="space-y-4 rounded-xl border border-border p-4 bg-secondary/20">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  <Settings2 className="h-4 w-4" /> Funcionalidades
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="mystery">Caixa Misteriosa</Label>
                    <Switch id="mystery" checked={form.mystery_box_enabled} onCheckedChange={(v) => set("mystery_box_enabled", v)} />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="roulette">Roleta</Label>
                    <Switch id="roulette" checked={form.roulette_enabled} onCheckedChange={(v) => set("roulette_enabled", v)} />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="ranking">Ranking</Label>
                    <Switch id="ranking" checked={form.ranking_enabled} onCheckedChange={(v) => set("ranking_enabled", v)} />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="featured">Destaque</Label>
                    <Switch id="featured" checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="auto_num">Venda Automática</Label>
                    <Switch id="auto_num" checked={form.auto_numbers} onCheckedChange={(v) => set("auto_numbers", v)} />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="manual_num">Escolha Manual</Label>
                    <Switch id="manual_num" checked={form.manual_numbers} onCheckedChange={(v) => set("manual_numbers", v)} />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="fed_draw">Sorteio Federal</Label>
                    <Switch id="fed_draw" checked={form.federal_lottery_draw} onCheckedChange={(v) => set("federal_lottery_draw", v)} />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="show_instant">Mostrar Prêmios Instantâneos</Label>
                    <Switch id="show_instant" checked={form.show_instant_prizes} onCheckedChange={(v) => set("show_instant_prizes", v)} />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="show_roulette">Status da Roleta</Label>
                    <Switch id="show_roulette" checked={form.show_roulette_status} onCheckedChange={(v) => set("show_roulette_status", v)} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">Pacotes de Preços (JSON)</Label>
                <Textarea placeholder='[{"quantity": 10, "price": 9.90}]' value={form.price_bundles} onChange={(e) => set("price_bundles", e.target.value)} rows={4} className="font-mono text-xs" />
              </div>
              <div className="space-y-4 rounded-xl border border-border p-4 bg-secondary/10">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase">Cotas Premiadas (Achou, Ganhou)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLuckyNumber} className="h-7 text-[10px] uppercase font-bold">
                    <Plus className="h-3 w-3 mr-1" /> Add Número
                  </Button>
                </div>
                <div className="space-y-3">
                  {form.lucky_numbers_prizes.map((p, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-end border-b border-border/50 pb-3">
                      <div className="col-span-3 space-y-1">
                        <Label className="text-[10px] uppercase opacity-50">Número</Label>
                        <Input 
                          placeholder="000123" 
                          value={p.number} 
                          onChange={(e) => updateLuckyNumber(i, 'number', e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-5 space-y-1">
                        <Label className="text-[10px] uppercase opacity-50">Prêmio</Label>
                        <Input 
                          placeholder="iPhone 15" 
                          value={p.prize} 
                          onChange={(e) => updateLuckyNumber(i, 'prize', e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="col-span-3 flex flex-col items-center gap-1">
                        <Label className="text-[10px] uppercase opacity-50">Protegido</Label>
                        <Switch 
                          checked={p.protected} 
                          onCheckedChange={(v) => updateLuckyNumber(i, 'protected', v)}
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeLuckyNumber(i)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {form.lucky_numbers_prizes.length === 0 && (
                    <p className="text-[10px] text-muted-foreground text-center italic py-2">Nenhum número premiado configurado.</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase">Premiação Principal (1º ao 5º) (JSON)</Label>
                <Textarea placeholder='[{"position": 1, "prize": "Carro"}, {"position": 2, "prize": "Moto"}]' value={form.main_prizes} onChange={(e) => set("main_prizes", e.target.value)} rows={3} className="font-mono text-xs" />
              </div>
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
