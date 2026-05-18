import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Save, Plus, Trash2, Info, Settings2, Image as ImageIcon, Ticket, Percent, Trophy, HelpCircle, Sparkles, BookOpen, Crown, Box, Landmark, Upload, Target, Dices, Gift, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CampaignForm {
  title: string; slug: string; subtitle: string; description: string; image_url: string; ticket_price: number;
  total_tickets: number; status: string; ltp_code: string; urgency_tag: string; draw_date: string;
  mystery_box_enabled: boolean; roulette_enabled: boolean; ranking_enabled: boolean; featured: boolean;
  price_bundles: { quantity: number; price: number }[]; gallery_urls: string[]; video_url: string;
  regulations: string; auto_numbers: boolean; manual_numbers: boolean; ticket_generation_type: 'manual' | 'auto';
  lucky_numbers_prizes: { number: string; prize: string; protected?: boolean }[];
  main_prizes: { position: number; prize: string }[];
  federal_lottery_draw: boolean; sales_goal: number; roulette_free_tickets: number;
  roulette_payout_rate: number; roulette_spin_cost: number; roulette_multiplier_max: number;
  show_instant_prizes: boolean; show_roulette_status: boolean; min_tickets: number; max_tickets: number;
}

const empty: CampaignForm = {
  title: "", slug: "", subtitle: "", description: "", image_url: "",
  ticket_price: 0.99, total_tickets: 100000, status: "active",
  ltp_code: "", urgency_tag: "", draw_date: "",
  mystery_box_enabled: false, roulette_enabled: false, ranking_enabled: true, featured: false,
  price_bundles: [], gallery_urls: [], video_url: "", regulations: "",
  auto_numbers: true, manual_numbers: false, ticket_generation_type: 'auto',
  lucky_numbers_prizes: [],
  main_prizes: [{position:1,prize:""},{position:2,prize:""},{position:3,prize:""},{position:4,prize:""},{position:5,prize:""}],
  federal_lottery_draw: false, sales_goal: 0, roulette_free_tickets: 10,
  roulette_payout_rate: 0, roulette_spin_cost: 5.00, roulette_multiplier_max: 5,
  show_instant_prizes: true, show_roulette_status: true, min_tickets: 1, max_tickets: 10000,
};

export default function AdminCampaignEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<CampaignForm>(empty);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    if (id) fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("campaigns").select("*").eq("id", id).single();
    if (data) setForm({ ...data, draw_date: data.draw_date?.slice(0, 16) ?? "", price_bundles: (data.price_bundles as any[]) ?? [], gallery_urls: (data.gallery_urls as any[]) ?? [], lucky_numbers_prizes: (data.lucky_numbers_prizes as any[]) ?? [], main_prizes: (data.main_prizes as any[]) ?? [] } as CampaignForm);
    setLoading(false);
  };

  const set = (k: keyof CampaignForm, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const { error } = id
        ? await supabase.from("campaigns").update(form).eq("id", id)
        : await supabase.from("campaigns").insert(form);
      if (error) throw error;
      toast({ title: "Sucesso!" });
      navigate("/admin/campanhas");
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLayout><div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Button variant="outline" size="icon" onClick={() => navigate("/admin/campanhas")}><ArrowLeft className="h-4 w-4" /></Button>
             <h1 className="text-2xl font-bold">{id ? "Editar" : "Nova"} Campanha</h1>
          </div>
          <Button onClick={save} disabled={saving}>{saving && <Loader2 className="mr-2 animate-spin h-4 w-4" />} Salvar</Button>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="w-full justify-start bg-white border h-14 rounded-2xl p-1 overflow-x-auto">
            <TabsTrigger value="general" className="rounded-xl px-6">Geral</TabsTrigger>
            <TabsTrigger value="pricing" className="rounded-xl px-6">Valores</TabsTrigger>
            <TabsTrigger value="media" className="rounded-xl px-6">Mídia</TabsTrigger>
            <TabsTrigger value="prizes" className="rounded-xl px-6">Prêmios</TabsTrigger>
            <TabsTrigger value="engagement" className="rounded-xl px-6">Engajamento</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl px-6">Avançado</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6 space-y-6">
            <Card className="p-6 rounded-2xl border-slate-100 shadow-sm">
               <Label>Título da Campanha</Label>
               <Input value={form.title} onChange={(e) => set("title", e.target.value)} className="mt-2" />
               <Label className="mt-4 block">Subtítulo</Label>
               <Input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} className="mt-2" />
               <Label className="mt-4 block">Descrição</Label>
               <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="mt-2" rows={5} />
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="mt-6 space-y-6">
            <Card className="p-6 rounded-2xl border-slate-100 shadow-sm grid grid-cols-2 gap-4">
               <div>
                 <Label>Preço Unitário (R$)</Label>
                 <Input type="number" step="0.01" value={form.ticket_price} onChange={(e) => set("ticket_price", e.target.value)} className="mt-2" />
               </div>
               <div>
                 <Label>Total de Bilhetes</Label>
                 <Input type="number" value={form.total_tickets} onChange={(e) => set("total_tickets", e.target.value)} className="mt-2" />
               </div>
            </Card>
            
            <Card className="p-6 rounded-2xl border-slate-100 shadow-sm">
               <div className="flex justify-between items-center mb-4">
                 <Label className="text-lg font-bold">Combos de Desconto</Label>
                 <Button size="sm" onClick={() => set("price_bundles", [...form.price_bundles, {quantity: 10, price: 9}])}><Plus className="h-4 w-4 mr-2" /> Novo Combo</Button>
               </div>
               <div className="space-y-3">
                 {form.price_bundles.map((b, i) => (
                   <div key={i} className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl">
                     <div className="flex-1">
                       <Label className="text-[10px] uppercase font-bold text-slate-400">Quantidade</Label>
                       <Input type="number" value={b.quantity} onChange={(e) => {
                         const n = [...form.price_bundles];
                         n[i].quantity = Number(e.target.value);
                         set("price_bundles", n);
                       }} />
                     </div>
                     <div className="flex-1">
                       <Label className="text-[10px] uppercase font-bold text-slate-400">Preço (R$)</Label>
                       <Input type="number" step="0.01" value={b.price} onChange={(e) => {
                         const n = [...form.price_bundles];
                         n[i].price = Number(e.target.value);
                         set("price_bundles", n);
                       }} />
                     </div>
                     <Button variant="ghost" size="icon" className="mt-5" onClick={() => {
                       const n = [...form.price_bundles];
                       n.splice(i, 1);
                       set("price_bundles", n);
                     }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                   </div>
                 ))}
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="mt-6 space-y-6">
             <Card className="p-6 rounded-2xl border-slate-100 shadow-sm space-y-4">
               <Label>URL da Imagem de Capa</Label>
               <Input value={form.image_url} onChange={(e) => set("image_url", e.target.value)} />
               <Label>URL do Vídeo (YouTube)</Label>
               <Input value={form.video_url} onChange={(e) => set("video_url", e.target.value)} />
             </Card>
          </TabsContent>

          <TabsContent value="prizes" className="mt-6 space-y-6">
             <Card className="p-6 rounded-2xl border-slate-100 shadow-sm">
                <Label className="text-lg font-bold mb-4 block">Premiação Principal</Label>
                <div className="space-y-3">
                  {form.main_prizes.map((p, i) => (
                    <div key={i} className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl">
                      <span className="w-20 font-bold text-slate-400">{p.position}º Lugar</span>
                      <Input value={p.prize} onChange={(e) => {
                        const n = [...form.main_prizes];
                        n[i].prize = e.target.value;
                        set("main_prizes", n);
                      }} />
                    </div>
                  ))}
                </div>
             </Card>

             <Card className="p-6 rounded-2xl border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-lg font-bold">Cotas Premiadas (Instantâneas)</Label>
                  <Button size="sm" onClick={() => set("lucky_numbers_prizes", [...form.lucky_numbers_prizes, {number: "", prize: ""}])}><Plus className="h-4 w-4 mr-2" /> Nova Cota</Button>
                </div>
                <div className="space-y-3">
                  {form.lucky_numbers_prizes.map((p, i) => (
                    <div key={i} className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl">
                      <div className="w-32">
                        <Label className="text-[10px] uppercase font-bold text-slate-400">Número</Label>
                        <Input value={p.number} onChange={(e) => {
                          const n = [...form.lucky_numbers_prizes];
                          n[i].number = e.target.value;
                          set("lucky_numbers_prizes", n);
                        }} />
                      </div>
                      <div className="flex-1">
                        <Label className="text-[10px] uppercase font-bold text-slate-400">Prêmio</Label>
                        <Input value={p.prize} onChange={(e) => {
                          const n = [...form.lucky_numbers_prizes];
                          n[i].prize = e.target.value;
                          set("lucky_numbers_prizes", n);
                        }} />
                      </div>
                      <Button variant="ghost" size="icon" className="mt-5" onClick={() => {
                        const n = [...form.lucky_numbers_prizes];
                        n.splice(i, 1);
                        set("lucky_numbers_prizes", n);
                      }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
             </Card>
          </TabsContent>

          <TabsContent value="engagement" className="mt-6 space-y-6">
            <Card className="p-6 rounded-2xl border-slate-100 shadow-sm">
               <div className="flex items-center gap-2 mb-6">
                 <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                   <Dices className="h-5 w-5" />
                 </div>
                 <h3 className="text-lg font-bold">Roleta Premiada</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold">Habilitar Roleta</Label>
                      <p className="text-[11px] text-slate-500">Permitir que compradores girem a roleta</p>
                    </div>
                    <Switch checked={form.roulette_enabled} onCheckedChange={(v) => set("roulette_enabled", v)} />
                  </div>
                  {form.roulette_enabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Giro Grátis a cada X números</Label>
                        <Input type="number" value={form.roulette_free_tickets} onChange={(e) => set("roulette_free_tickets", Number(e.target.value))} />
                      </div>
                      <div className="space-y-2">
                        <Label>Custo do Giro Individual (R$)</Label>
                        <Input type="number" step="0.01" value={form.roulette_spin_cost} onChange={(e) => set("roulette_spin_cost", Number(e.target.value))} />
                      </div>
                    </>
                  )}
               </div>
            </Card>

            <Card className="p-6 rounded-2xl border-slate-100 shadow-sm">
               <div className="flex items-center gap-2 mb-6">
                 <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                   <Target className="h-5 w-5" />
                 </div>
                 <h3 className="text-lg font-bold">Metas e Urgência</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Meta de Vendas (%)</Label>
                    <Input type="number" value={form.sales_goal} onChange={(e) => set("sales_goal", Number(e.target.value))} />
                    <p className="text-[10px] text-slate-400">Exibida como barra de progresso</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Tag de Urgência</Label>
                    <Input placeholder="Ex: ÚLTIMAS COTAS" value={form.urgency_tag} onChange={(e) => set("urgency_tag", e.target.value)} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold">Em Destaque</Label>
                      <p className="text-[11px] text-slate-500">Aparece no topo da página inicial</p>
                    </div>
                    <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold">Exibir Ranking</Label>
                      <p className="text-[11px] text-slate-500">Mostrar maiores compradores</p>
                    </div>
                    <Switch checked={form.ranking_enabled} onCheckedChange={(v) => set("ranking_enabled", v)} />
                  </div>
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6 space-y-6">
            <Card className="p-6 rounded-2xl border-slate-100 shadow-sm">
               <div className="flex items-center gap-2 mb-6">
                 <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                   <Settings2 className="h-5 w-5" />
                 </div>
                 <h3 className="text-lg font-bold">Configurações Avançadas</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Slug da URL (Personalizado)</Label>
                    <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="iphone-15-pro-max" />
                  </div>
                  <div className="space-y-2">
                    <Label>Data do Sorteio</Label>
                    <Input type="datetime-local" value={form.draw_date} onChange={(e) => set("draw_date", e.target.value)} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold">Extração pela Federal</Label>
                      <p className="text-[11px] text-slate-500">Usa os números da Loteria Federal</p>
                    </div>
                    <Switch checked={form.federal_lottery_draw} onCheckedChange={(v) => set("federal_lottery_draw", v)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Mínimo de Cotas por Pedido</Label>
                    <Input type="number" value={form.min_tickets} onChange={(e) => set("min_tickets", Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Máximo de Cotas por Pedido</Label>
                    <Input type="number" value={form.max_tickets} onChange={(e) => set("max_tickets", Number(e.target.value))} />
                  </div>
               </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
