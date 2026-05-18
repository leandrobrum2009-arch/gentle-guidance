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
 import { Loader2, ArrowLeft, Save, Plus, Trash2, Info, Settings2, Image as ImageIcon, Ticket, Percent, Trophy, HelpCircle, Sparkles, BookOpen, Crown, Box, Landmark, Upload } from "lucide-react";
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
  price_bundles: { quantity: number; price: number }[];
  gallery_urls: string[];
  video_url: string;
  regulations: string;
  auto_numbers: boolean;
  manual_numbers: boolean;
  ticket_generation_type: 'manual' | 'auto';
  lucky_numbers_prizes: { number: string; prize: string; protected?: boolean }[];
  main_prizes: { position: number; prize: string }[];
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
  price_bundles: [],
  gallery_urls: [],
  video_url: "",
  regulations: "",
  auto_numbers: true,
  manual_numbers: false,
  ticket_generation_type: 'auto',
  lucky_numbers_prizes: [],
  main_prizes: [
    { position: 1, prize: "" },
    { position: 2, prize: "" },
    { position: 3, prize: "" },
    { position: 4, prize: "" },
    { position: 5, prize: "" },
  ],
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
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string, index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('campaigns')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('campaigns')
        .getPublicUrl(filePath);

      if (field === 'image_url') {
        set('image_url', publicUrl);
      } else if (field === 'gallery_urls' && index !== undefined) {
        const newList = [...form.gallery_urls];
        newList[index] = publicUrl;
        set('gallery_urls', newList);
      }

      toast({ title: "Upload concluído!", description: "A imagem foi carregada com sucesso." });
    } catch (error: any) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
    }
  };

  const generateWithAI = async () => {
    const prompt = window.prompt("O que você quer sortear? (Ex: Um iPhone 15 Pro Max de 256GB azul)");
    if (!prompt) return;

    setAiGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-campaign', {
        body: { prompt }
      });

      if (error) throw error;

      setForm(prev => ({
        ...prev,
        title: data.title || prev.title,
        slug: data.slug || prev.slug,
        subtitle: data.subtitle || prev.subtitle,
        description: data.description || prev.description,
        image_url: data.image_url || prev.image_url,
        ticket_price: data.ticket_price || prev.ticket_price,
        total_tickets: data.total_tickets || prev.total_tickets,
        urgency_tag: data.urgency_tag || prev.urgency_tag,
        price_bundles: data.price_bundles || prev.price_bundles,
        gallery_urls: data.gallery_urls || prev.gallery_urls,
        regulations: data.regulations || prev.regulations,
        lucky_numbers_prizes: data.lucky_numbers_prizes || prev.lucky_numbers_prizes,
        main_prizes: data.main_prizes || prev.main_prizes,
      }));

      toast({ title: "Campanha Gerada!", description: "Os campos foram preenchidos pela IA. Revise antes de salvar." });
    } catch (error: any) {
      toast({ title: "Erro na IA", description: error.message, variant: "destructive" });
    } finally {
      setAiGenerating(false);
    }
  };

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
        price_bundles: (data.price_bundles as any[]) ?? [],
        gallery_urls: (data.gallery_urls as string[]) ?? [],
        video_url: data.video_url ?? "",
        regulations: data.regulations ?? "",
        auto_numbers: data.auto_numbers ?? true,
        manual_numbers: data.manual_numbers ?? false,
        ticket_generation_type: (data.ticket_generation_type as 'auto' | 'manual') ?? 'auto',
        lucky_numbers_prizes: (data.lucky_numbers_prizes as any[]) ?? [],
        main_prizes: (data.main_prizes as any[])?.length > 0 
          ? (data.main_prizes as any[]) 
          : [
              { position: 1, prize: "" },
              { position: 2, prize: "" },
              { position: 3, prize: "" },
              { position: 4, prize: "" },
              { position: 5, prize: "" },
            ],
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
        price_bundles: form.price_bundles,
        gallery_urls: form.gallery_urls,
        main_prizes: form.main_prizes,
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
         {/* Top Section */}
         <div className="space-y-6">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex items-center gap-4">
               <Button variant="outline" size="icon" onClick={() => navigate("/admin/campanhas")}>
                 <ArrowLeft className="h-4 w-4" />
               </Button>
               <div className="space-y-1">
                 <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                   {id ? "Editar Campanha" : "Nova Campanha"}
                 </h1>
                 <p className="text-sm text-muted-foreground">Gestão completa e detalhada das configurações da sua rifa.</p>
               </div>
             </div>
             
             <div className="flex items-center gap-3">
               <Button 
                 variant="outline" 
                 onClick={generateWithAI} 
                 disabled={aiGenerating} 
                 className="border-primary/50 text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10"
               >
                 {aiGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                 Gerar com IA
               </Button>
               <Button onClick={save} disabled={saving} size="lg" className="shadow-lg hover:scale-105 transition-transform">
                 {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                 Salvar Campanha
               </Button>
             </div>
           </div>
 
           <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
             <div className="bg-primary/20 p-2 rounded-xl">
               <Sparkles className="h-5 w-5 text-primary" />
             </div>
             <div>
               <h3 className="text-sm font-bold text-primary uppercase tracking-tight">Dica de Especialista</h3>
               <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                 Passe o mouse nos ícones de interrogação <HelpCircle className="h-3 w-3 inline text-primary/60" /> para ajuda instantânea em cada campo. 
                 Use o botão <strong>Gerar com IA</strong> para criar uma campanha completa em segundos!
               </p>
             </div>
           </div>
         </div>
         {/* Seção de Guias Rápidos */}
         <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/10 bg-primary/5 hover:bg-primary/10 transition-colors cursor-help" onClick={() => setShowHelp(!showHelp)}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg text-primary"><Box className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Caixa Misteriosa</p>
                <p className="text-[10px] text-muted-foreground">O que é e como funciona?</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-500/10 bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-help" onClick={() => setShowHelp(!showHelp)}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500"><Crown className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Ranking</p>
                <p className="text-[10px] text-muted-foreground">Aumente suas vendas com competição.</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/10 bg-blue-500/5 hover:bg-blue-500/10 transition-colors cursor-help" onClick={() => setShowHelp(!showHelp)}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500"><Landmark className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Sorteio Federal</p>
                <p className="text-[10px] text-muted-foreground">Como integrar com a loteria?</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors cursor-help" onClick={() => setShowHelp(!showHelp)}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-500"><Trophy className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Cotas Premiadas</p>
                <p className="text-[10px] text-muted-foreground">Ganhou, achou! Entenda a lógica.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {showHelp && (
          <Card className="border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-top-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> Guia Completo da Plataforma
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 text-sm">
              <div className="space-y-2">
                <h4 className="font-bold text-primary flex items-center gap-1"><Box className="h-4 w-4" /> Caixa Misteriosa</h4>
                <p className="text-muted-foreground">
                  Funciona como um prêmio surpresa. Ao habilitar, você pode configurar prêmios específicos que os usuários ganham aleatoriamente ou descontos progressivos. Isso aumenta a curiosidade e o engajamento na página da campanha.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-amber-500 flex items-center gap-1"><Crown className="h-4 w-4" /> Ranking de Compradores</h4>
                <p className="text-muted-foreground">
                  O ranking exibe publicamente quem são os maiores compradores daquela rifa. Isso cria um "gatilho de competição", onde os usuários compram mais cotas apenas para aparecer no topo e, opcionalmente, você pode dar um prêmio extra para o "Top 1" do ranking ao final.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-blue-500 flex items-center gap-1"><Landmark className="h-4 w-4" /> Sorteio Loteria Federal</h4>
                <p className="text-muted-foreground">
                  Ao ativar esta opção, o site informará aos usuários que o resultado será baseado no sorteio oficial da Caixa Econômica. A lógica comum é usar os últimos dígitos do 1º prêmio sorteado para definir o ganhador da sua rifa, garantindo total transparência.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-emerald-500 flex items-center gap-1"><Trophy className="h-4 w-4" /> Cotas Premiadas (Achou, Ganhou)</h4>
                <p className="text-muted-foreground">
                  São números específicos (ex: 777, 1234) que você define como ganhadores. No momento em que um usuário compra e o sistema gera esses números para ele, o site exibe um alerta de "Você Ganhou!" instantaneamente. Você pode ocultar esses números (Protegido) para que ninguém saiba quais são até que sejam encontrados.
                </p>
              </div>
            </CardContent>
          </Card>
         )}
 
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="bg-white p-1 border rounded-2xl h-14 flex overflow-x-auto no-scrollbar">
              <TabsTrigger value="general" className="flex-1 rounded-xl gap-2 h-10 min-w-[120px]">
                <Info className="h-4 w-4" /> Geral
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex-1 rounded-xl gap-2 h-10 min-w-[120px]">
                <Ticket className="h-4 w-4" /> Valores
              </TabsTrigger>
              <TabsTrigger value="media" className="flex-1 rounded-xl gap-2 h-10 min-w-[120px]">
                <ImageIcon className="h-4 w-4" /> Mídia
              </TabsTrigger>
              <TabsTrigger value="interactive" className="flex-1 rounded-xl gap-2 h-10 min-w-[120px]">
                <Sparkles className="h-4 w-4" /> Interativo
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex-1 rounded-xl gap-2 h-10 min-w-[120px]">
                <Settings2 className="h-4 w-4" /> Avançado
              </TabsTrigger>
            </TabsList>
 
            <TabsContent value="general" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50">
                      <CardTitle className="text-lg font-bold">Informações Básicas</CardTitle>
                      <CardDescription>O título e a descrição principal da sua campanha.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título da Campanha <FieldInfo text="Nome principal. Ex: iPhone 15 Pro Max" /></Label>
                        <Input id="title" placeholder="Ex: iPhone 15 Pro Max" value={form.title} onChange={(e) => set("title", e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="subtitle">Subtítulo <FieldInfo text="Frase de impacto curta." /></Label>
                          <Input id="subtitle" placeholder="Apenas R$ 0,99 cada cota" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="slug">Link Amigável (Slug) <FieldInfo text="Link da rifa no site." /></Label>
                          <Input id="slug" placeholder="rifa-iphone-15" value={form.slug} onChange={(e) => set("slug", e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição <FieldInfo text="Explique os detalhes do prêmio." /></Label>
                        <Textarea id="description" placeholder="Descreva sua campanha..." value={form.description} onChange={(e) => set("description", e.target.value)} rows={5} />
                      </div>
                    </CardContent>
                  </Card>
 
                  <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50">
                      <CardTitle className="text-lg font-bold">Premiação Principal</CardTitle>
                      <CardDescription>Defina os prêmios por posição (1º ao 5º lugar).</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                        {form.main_prizes.map((p, i) => (
                          <div key={i} className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <span className="text-sm font-black text-slate-400 w-20">{p.position}º Lugar</span>
                            <Input 
                              placeholder={`Prêmio do ${p.position}º lugar`}
                              value={p.prize}
                              onChange={(e) => {
                                const newList = [...form.main_prizes];
                                newList[i].prize = e.target.value;
                                set("main_prizes", newList);
                              }}
                              className="bg-white border-slate-200"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
 
                <div className="space-y-6">
                  <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-50/50">
                      <CardTitle className="text-lg font-bold">Status e Data</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <Label>Status da Campanha</Label>
                        <Select value={form.status} onValueChange={(v) => set("status", v)}>
                          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Ativa (Visível)</SelectItem>
                            <SelectItem value="draft">Rascunho (Oculta)</SelectItem>
                            <SelectItem value="completed">Concluída (Encerrada)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Data do Sorteio</Label>
                        <Input type="datetime-local" value={form.draw_date} onChange={(e) => set("draw_date", e.target.value)} className="rounded-xl" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <Label className="font-bold">Em Destaque?</Label>
                        <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
 
            <TabsContent value="pricing" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
                  <CardHeader className="bg-slate-50/50">
                    <CardTitle className="text-lg font-bold">Configuração de Bilhetes</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Preço por Cota (R$)</Label>
                        <Input type="number" step="0.01" value={form.ticket_price} onChange={(e) => set("ticket_price", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Total de Bilhetes</Label>
                        <Input type="number" value={form.total_tickets} onChange={(e) => set("total_tickets", e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Mínimo por Compra</Label>
                        <Input type="number" value={form.min_tickets} onChange={(e) => set("min_tickets", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Máximo por Compra</Label>
                        <Input type="number" value={form.max_tickets} onChange={(e) => set("max_tickets", e.target.value)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
 
                <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
                  <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold">Pacotes de Desconto</CardTitle>
                      <CardDescription>Combos que incentivam compras maiores.</CardDescription>
                    </div>
                    <Button type="button" size="sm" onClick={() => set("price_bundles", [...form.price_bundles, { quantity: 10, price: 9.00 }])}>
                      <Plus className="h-4 w-4 mr-1" /> Add Combo
                    </Button>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {form.price_bundles.map((bundle, i) => (
                        <div key={i} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="flex-1">
                            <Label className="text-[10px] uppercase font-bold text-slate-400">Qtd Bilhetes</Label>
                            <Input type="number" value={bundle.quantity} onChange={(e) => {
                              const newList = [...form.price_bundles];
                              newList[i].quantity = Number(e.target.value);
                              set("price_bundles", newList);
                            }} />
                          </div>
                          <div className="flex-1">
                            <Label className="text-[10px] uppercase font-bold text-slate-400">Preço Total (R$)</Label>
                            <Input type="number" step="0.01" value={bundle.price} onChange={(e) => {
                              const newList = [...form.price_bundles];
                              newList[i].price = Number(e.target.value);
                              set("price_bundles", newList);
                            }} />
                          </div>
                          <Button variant="ghost" size="icon" className="mt-5" onClick={() => {
                            const newList = [...form.price_bundles];
                            newList.splice(i, 1);
                            set("price_bundles", newList);
                          }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      {form.price_bundles.length === 0 && (
                        <div className="text-center py-6 text-slate-400 italic text-sm border-2 border-dashed rounded-xl">Nenhum pacote cadastrado.</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

             <TabsContent value="media" className="space-y-6">
               <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
                 <CardHeader className="bg-slate-50/50">
                   <CardTitle className="text-lg font-bold flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" /> Mídia da Campanha</CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 space-y-6">
                   <div className="space-y-2">
                     <Label>Foto de Capa (URL)</Label>
                     <div className="flex gap-2">
                       <Input value={form.image_url} onChange={(e) => set("image_url", e.target.value)} />
                       <Button variant="outline" size="icon" onClick={() => document.getElementById('main-image-upload')?.click()}><Upload className="h-4 w-4" /></Button>
                       <input type="file" className="hidden" id="main-image-upload" accept="image/*" onChange={(e) => handleImageUpload(e, 'image_url')} />
                     </div>
                   </div>
                   <div className="space-y-2">
                     <Label>Vídeo do YouTube (URL)</Label>
                     <Input placeholder="https://youtube.com/watch?v=..." value={form.video_url} onChange={(e) => set("video_url", e.target.value)} />
                   </div>
                 </CardContent>
               </Card>
             </TabsContent>
 
             <TabsContent value="interactive" className="space-y-6">
               <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
                 <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between">
                   <div>
                     <CardTitle className="text-lg font-bold">Cotas Premiadas</CardTitle>
                     <CardDescription>Números que dão prêmios instantâneos.</CardDescription>
                   </div>
                   <Button type="button" size="sm" onClick={() => set("lucky_numbers_prizes", [...form.lucky_numbers_prizes, { number: "", prize: "", protected: false }])}>
                     <Plus className="h-4 w-4 mr-1" /> Add Cota
                   </Button>
                 </CardHeader>
                 <CardContent className="p-6">
                   <div className="space-y-4">
                     {form.lucky_numbers_prizes.map((p, i) => (
                       <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 items-end">
                         <div className="md:col-span-1">
                           <Label className="text-[10px] uppercase font-bold text-slate-400">Número</Label>
                           <Input placeholder="Ex: 777" value={p.number} onChange={(e) => {
                             const newList = [...form.lucky_numbers_prizes];
                             newList[i].number = e.target.value;
                             set("lucky_numbers_prizes", newList);
                           }} />
                         </div>
                         <div className="md:col-span-2">
                           <Label className="text-[10px] uppercase font-bold text-slate-400">Prêmio</Label>
                           <Input placeholder="Ex: Pix R$ 100" value={p.prize} onChange={(e) => {
                             const newList = [...form.lucky_numbers_prizes];
                             newList[i].prize = e.target.value;
                             set("lucky_numbers_prizes", newList);
                           }} />
                         </div>
                         <div className="flex items-center gap-2">
                           <Button variant="ghost" size="icon" onClick={() => {
                             const newList = [...form.lucky_numbers_prizes];
                             newList.splice(i, 1);
                             set("lucky_numbers_prizes", newList);
                           }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                         </div>
                       </div>
                     ))}
                   </div>
                 </CardContent>
               </Card>
             </TabsContent>
 
             <TabsContent value="advanced" className="space-y-6">
               <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
                 <CardHeader className="bg-slate-50/50">
                   <CardTitle className="text-lg font-bold">Funcionalidades Adicionais</CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 space-y-4">
                   <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                     <div className="space-y-0.5">
                       <Label>Caixa Misteriosa</Label>
                       <p className="text-[10px] text-slate-500">Habilita prêmios aleatórios na compra.</p>
                     </div>
                     <Switch checked={form.mystery_box_enabled} onCheckedChange={(v) => set("mystery_box_enabled", v)} />
                   </div>
                   <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                     <div className="space-y-0.5">
                       <Label>Roleta Premiada</Label>
                       <p className="text-[10px] text-slate-500">Giro da sorte após a compra.</p>
                     </div>
                     <Switch checked={form.roulette_enabled} onCheckedChange={(v) => set("roulette_enabled", v)} />
                   </div>
                   <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                     <div className="space-y-0.5">
                       <Label>Ranking de Compradores</Label>
                       <p className="text-[10px] text-slate-500">Exibe os maiores compradores.</p>
                     </div>
                     <Switch checked={form.ranking_enabled} onCheckedChange={(v) => set("ranking_enabled", v)} />
                   </div>
                 </CardContent>
               </Card>
             </TabsContent>
           </Tabs>
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <Label>Promoções (Combos) <FieldInfo text="Crie descontos para quem compra mais. Ex: Se 1 cota custa R$ 1,00, você pode fazer 10 cotas por R$ 8,00. Isso incentiva compras maiores." /></Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => set("price_bundles", [...form.price_bundles, { quantity: 10, price: 9.00 }])}>
                      <Plus className="h-3 w-3 mr-1" /> Add Pacote
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {form.price_bundles.map((bundle, i) => (
                      <div key={i} className="flex gap-2 items-end border p-3 rounded-lg bg-secondary/10">
                        <div className="flex-1 space-y-1">
                           <Label className="text-[10px] uppercase font-bold">Quantidade de Números</Label>
                          <Input 
                            type="number"
                            value={bundle.quantity}
                            onChange={(e) => {
                              const newList = [...form.price_bundles];
                              newList[i].quantity = Number(e.target.value);
                              set("price_bundles", newList);
                            }}
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                           <Label className="text-[10px] uppercase font-bold">Preço Promocional (Total)</Label>
                          <Input 
                            type="number"
                            step="0.01"
                            value={bundle.price}
                            onChange={(e) => {
                              const newList = [...form.price_bundles];
                              newList[i].price = Number(e.target.value);
                              set("price_bundles", newList);
                            }}
                          />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => {
                          const newList = [...form.price_bundles];
                          newList.splice(i, 1);
                          set("price_bundles", newList);
                        }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    {form.price_bundles.length === 0 && (
                      <p className="text-xs text-center py-2 text-muted-foreground border-2 border-dashed rounded italic">
                        Nenhum pacote de desconto cadastrado.
                      </p>
                    )}
                  </div>
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