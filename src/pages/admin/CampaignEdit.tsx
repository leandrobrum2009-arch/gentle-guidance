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
import { Loader2, ArrowLeft, Save, Plus, Trash2, Info, Settings2, Image as ImageIcon, Ticket, Percent, Trophy, HelpCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  roulette_spin_cost: number;
  roulette_multiplier_max: number;
  show_instant_prizes: boolean;
  show_roulette_status: boolean;
  min_tickets: number;
  max_tickets: number;
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
  manual_numbers: false,
  ticket_generation_type: 'auto',
  lucky_numbers_prizes: [],
  main_prizes: "[]",
  federal_lottery_draw: false,
  sales_goal: 0,
  roulette_free_tickets: 10,
  roulette_payout_rate: 0,
  roulette_spin_cost: 5.00,
  roulette_multiplier_max: 5,
  show_instant_prizes: true,
  show_roulette_status: true,
  min_tickets: 1,
  max_tickets: 10000,
};

export default function AdminCampaignEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<CampaignForm>(empty);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const fetchCampaign = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("campaigns").select("*").eq("id", id).single();
    if (error) {
      toast({ title: "Erro", description: "Não foi possível carregar a campanha", variant: "destructive" });
      navigate("/admin/campanhas");
    } else if (data) {
      setForm({
        title: data.title,
        slug: data.slug,
        subtitle: data.subtitle ?? "",
        description: data.description ?? "",
        image_url: data.image_url ?? "",
        ticket_price: data.ticket_price,
        total_tickets: data.total_tickets,
        status: data.status,
        ltp_code: data.ltp_code ?? "",
        urgency_tag: data.urgency_tag ?? "",
        draw_date: data.draw_date?.slice(0, 16) ?? "",
        mystery_box_enabled: data.mystery_box_enabled ?? false,
        roulette_enabled: data.roulette_enabled ?? false,
        ranking_enabled: data.ranking_enabled ?? true,
        featured: data.featured ?? false,
        price_bundles: JSON.stringify(data.price_bundles ?? [], null, 2),
        gallery_urls: JSON.stringify(data.gallery_urls ?? [], null, 2),
        video_url: data.video_url ?? "",
        regulations: data.regulations ?? "",
        auto_numbers: data.auto_numbers ?? true,
        manual_numbers: data.manual_numbers ?? false,
        ticket_generation_type: (data.ticket_generation_type as 'auto' | 'manual') ?? 'auto',
        lucky_numbers_prizes: (data.lucky_numbers_prizes as any[]) ?? [],
        main_prizes: JSON.stringify(data.main_prizes ?? [], null, 2),
        federal_lottery_draw: data.federal_lottery_draw ?? false,
        sales_goal: data.sales_goal ?? 0,
        roulette_free_tickets: data.roulette_free_tickets ?? 10,
        roulette_payout_rate: data.roulette_payout_rate ?? 0,
        roulette_spin_cost: data.roulette_spin_cost ?? 5.00,
        roulette_multiplier_max: data.roulette_multiplier_max ?? 5,
        show_instant_prizes: data.show_instant_prizes ?? true,
        show_roulette_status: data.show_roulette_status ?? true,
        min_tickets: data.min_tickets ?? 1,
        max_tickets: data.max_tickets ?? 10000,
      });
    }
    setLoading(false);
  };

  const set = (k: keyof CampaignForm, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        ticket_price: Number(form.ticket_price),
        total_tickets: Number(form.total_tickets),
        min_tickets: Number(form.min_tickets),
        max_tickets: Number(form.max_tickets),
        draw_date: form.draw_date || null,
        price_bundles: JSON.parse(form.price_bundles || "[]"),
        gallery_urls: JSON.parse(form.gallery_urls || "[]"),
        main_prizes: JSON.parse(form.main_prizes || "[]"),
        sales_goal: Number(form.sales_goal),
        roulette_free_tickets: Number(form.roulette_free_tickets),
        roulette_payout_rate: Number(form.roulette_payout_rate),
        roulette_spin_cost: Number(form.roulette_spin_cost),
        roulette_multiplier_max: Number(form.roulette_multiplier_max),
      };

      const { error } = id
        ? await supabase.from("campaigns").update(payload).eq("id", id)
        : await supabase.from("campaigns").insert(payload);

      if (error) throw error;

      toast({ title: id ? "Campanha atualizada" : "Campanha criada" });
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      navigate("/admin/campanhas");
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const FieldInfo = ({ text }: { text: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help ml-1 inline-block" />
        </TooltipTrigger>
        <TooltipContent className="max-w-[250px]">
          <p className="text-xs">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate("/admin/campanhas")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{id ? "Editar Campanha" : "Nova Campanha"}</h1>
              <p className="text-muted-foreground">Configure todos os detalhes da sua campanha de rifa.</p>
            </div>
          </div>
          <Button onClick={save} disabled={saving} size="lg">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Campanha
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" /> Informações Básicas
                </CardTitle>
                <CardDescription>O título e a descrição que os usuários verão.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Campanha <FieldInfo text="Nome principal da rifa. Ex: iPhone 15 Pro Max" /></Label>
                  <Input id="title" placeholder="Ex: iPhone 15 Pro Max" value={form.title} onChange={(e) => set("title", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="slug">Link amigável (Slug) <FieldInfo text="O que aparecerá no link. Ex: rifa-iphone-15. Não use espaços." /></Label>
                    <Input id="slug" placeholder="rifa-iphone-15" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtítulo <FieldInfo text="Uma frase curta de impacto. Ex: Apenas R$ 0,99 cada cota." /></Label>
                    <Input id="subtitle" placeholder="Apenas R$ 0,99 cada cota" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição Longa <FieldInfo text="Explique todos os detalhes do prêmio e da campanha." /></Label>
                  <Textarea id="description" placeholder="Descreva sua campanha aqui..." value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regulations">Regulamento <FieldInfo text="Regras específicas da sua campanha." /></Label>
                  <Textarea id="regulations" placeholder="Regras da campanha..." value={form.regulations} onChange={(e) => set("regulations", e.target.value)} rows={3} />
                </div>
              </CardContent>
            </Card>

            {/* Imagens e Mídia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" /> Imagens e Mídia
                </CardTitle>
                <CardDescription>Atraia visualmente seus participantes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image_url">Capa da Campanha <FieldInfo text="URL da imagem principal (formato JPG/PNG)." /></Label>
                  <Input id="image_url" placeholder="https://..." value={form.image_url} onChange={(e) => set("image_url", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gallery">Galeria de Imagens (JSON) <FieldInfo text='Lista de links das fotos adicionais. Ex: ["link1", "link2"]' /></Label>
                  <Textarea id="gallery" placeholder='["https://...", "https://..."]' value={form.gallery_urls} onChange={(e) => set("gallery_urls", e.target.value)} className="font-mono text-xs" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video_url">Vídeo do YouTube <FieldInfo text="Link do vídeo de apresentação (YouTube)." /></Label>
                  <Input id="video_url" placeholder="https://youtube.com/watch?v=..." value={form.video_url} onChange={(e) => set("video_url", e.target.value)} />
                </div>
              </CardContent>
            </Card>

            {/* Cotas e Prêmios Instantâneos */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" /> Cotas Premiadas
                    </CardTitle>
                    <CardDescription>Números da sorte que ganham prêmios na hora.</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => set("lucky_numbers_prizes", [...form.lucky_numbers_prizes, { number: "", prize: "", protected: false }])}>
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Cota
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.lucky_numbers_prizes.map((p, i) => (
                  <div key={i} className="flex gap-4 items-end border-b pb-4">
                    <div className="flex-1 space-y-2">
                      <Label>Número da Cota</Label>
                      <Input 
                        placeholder="Ex: 001234" 
                        value={p.number} 
                        onChange={(e) => {
                          const newList = [...form.lucky_numbers_prizes];
                          newList[i].number = e.target.value;
                          set("lucky_numbers_prizes", newList);
                        }}
                      />
                    </div>
                    <div className="flex-[2] space-y-2">
                      <Label>Prêmio</Label>
                      <Input 
                        placeholder="Ex: Pix de R$ 500,00" 
                        value={p.prize} 
                        onChange={(e) => {
                          const newList = [...form.lucky_numbers_prizes];
                          newList[i].prize = e.target.value;
                          set("lucky_numbers_prizes", newList);
                        }}
                      />
                    </div>
                    <div className="space-y-2 flex flex-col items-center">
                      <Label>Oculto?</Label>
                      <Switch 
                        checked={p.protected} 
                        onCheckedChange={(v) => {
                          const newList = [...form.lucky_numbers_prizes];
                          newList[i].protected = v;
                          set("lucky_numbers_prizes", newList);
                        }}
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive"
                      onClick={() => {
                        const newList = [...form.lucky_numbers_prizes];
                        newList.splice(i, 1);
                        set("lucky_numbers_prizes", newList);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {form.lucky_numbers_prizes.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                    Nenhuma cota premiada cadastrada.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            {/* Status e Configurações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-primary" /> Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status <FieldInfo text="Ativa: pública. Rascunho: invisível. Concluída: encerrada." /></Label>
                  <Select value={form.status} onValueChange={(v) => set("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativa</SelectItem>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="draw_date">Data do Sorteio <FieldInfo text="Data prevista para a realização do sorteio." /></Label>
                  <Input id="draw_date" type="datetime-local" value={form.draw_date} onChange={(e) => set("draw_date", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="generation">Tipo de Geração <FieldInfo text="Automática: sistema gera números aleatórios. Manual: usuário escolhe na grade." /></Label>
                  <Select value={form.ticket_generation_type} onValueChange={(v: any) => set("ticket_generation_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Geração Automática (Aleatória)</SelectItem>
                      <SelectItem value="manual">Escolha Manual (Grade de números)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">Campanha em Destaque?</Label>
                  <Switch id="featured" checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
                </div>
              </CardContent>
            </Card>

            {/* Preços e Cotas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" /> Valores e Quantidades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ticket_price">Preço por Cota (R$) <FieldInfo text="Valor unitário de cada bilhete." /></Label>
                  <Input id="ticket_price" type="number" step="0.01" value={form.ticket_price} onChange={(e) => set("ticket_price", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total_tickets">Total de Cotas <FieldInfo text="Quantidade total de números disponíveis." /></Label>
                  <Input id="total_tickets" type="number" value={form.total_tickets} onChange={(e) => set("total_tickets", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_tickets">Mínimo p/ Compra</Label>
                    <Input id="min_tickets" type="number" value={form.min_tickets} onChange={(e) => set("min_tickets", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_tickets">Máximo p/ Compra</Label>
                    <Input id="max_tickets" type="number" value={form.max_tickets} onChange={(e) => set("max_tickets", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bundles">Pacotes de Promoção (JSON) <FieldInfo text='Ex: [{"quantity": 10, "price": 9.00}] - 10 cotas por R$ 9,00' /></Label>
                  <Textarea id="bundles" placeholder='[{"quantity": 10, "price": 9.90}]' value={form.price_bundles} onChange={(e) => set("price_bundles", e.target.value)} className="font-mono text-xs" />
                </div>
              </CardContent>
            </Card>

            {/* Roleta Premiada */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="h-5 w-5 text-primary" /> Roleta Premiada
                  </CardTitle>
                  <Switch checked={form.roulette_enabled} onCheckedChange={(v) => set("roulette_enabled", v)} />
                </div>
                <CardDescription>Ganhos extras após a compra.</CardDescription>
              </CardHeader>
              <CardContent className={`space-y-4 ${!form.roulette_enabled && "opacity-50 pointer-events-none"}`}>
                <div className="space-y-2">
                  <Label htmlFor="free_spins">Giros Grátis <FieldInfo text="A cada quantas cotas compradas o usuário ganha 1 giro grátis?" /></Label>
                  <Input id="free_spins" type="number" value={form.roulette_free_tickets} onChange={(e) => set("roulette_free_tickets", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spin_cost">Custo por Giro (R$) <FieldInfo text="Valor cobrado do saldo para girar manualmente." /></Label>
                  <Input id="spin_cost" type="number" step="0.01" value={form.roulette_spin_cost} onChange={(e) => set("roulette_spin_cost", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payout">Taxa de Payout (%) <FieldInfo text="Porcentagem do prêmio da roleta sobre o valor do giro." /></Label>
                  <Input id="payout" type="number" value={form.roulette_payout_rate} onChange={(e) => set("roulette_payout_rate", e.target.value)} />
                </div>
              </CardContent>
            </Card>

            {/* Outros Recursos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recursos Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Caixa Misteriosa <FieldInfo text="Habilita sistema de caixas surpresa." /></Label>
                  <Switch checked={form.mystery_box_enabled} onCheckedChange={(v) => set("mystery_box_enabled", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Ranking de Compradores <FieldInfo text="Exibe os maiores compradores da campanha." /></Label>
                  <Switch checked={form.ranking_enabled} onCheckedChange={(v) => set("ranking_enabled", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Sorteio via Loteria Federal <FieldInfo text="Indica que o sorteio usará resultados oficiais." /></Label>
                  <Switch checked={form.federal_lottery_draw} onCheckedChange={(v) => set("federal_lottery_draw", v)} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}