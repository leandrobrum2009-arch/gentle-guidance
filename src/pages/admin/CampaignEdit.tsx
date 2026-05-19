import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Save, Plus, Trash2, Info, Settings2, Image as ImageIcon, Ticket, Percent, Trophy, HelpCircle, Sparkles, BookOpen, Crown, Box, Landmark, Upload, Target, Dices, Gift, Zap, Star, MousePointer2, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { compressImage } from "@/lib/image-upload";


interface CampaignForm {
  title: string; slug: string; subtitle: string; description: string; image_url: string; ticket_price: number;
  total_tickets: number; status: string; ltp_code: string; urgency_tag: string; draw_date: string;
  mystery_box_enabled: boolean; roulette_enabled: boolean; ranking_enabled: boolean; featured: boolean;
  price_bundles: { quantity: number; price: number }[]; gallery_urls: string[]; video_url: string;
  regulations: string; auto_numbers: boolean; manual_numbers: boolean; ticket_generation_type: 'manual' | 'auto';
  lucky_numbers_prizes: { number: string; prize: string; protected?: boolean }[];
  main_prizes: { position: number; prize: string }[];
  roulette_rules: { min_tickets: number; spins: number }[];
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
  roulette_rules: [],
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
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("campaigns").select("*").eq("id", id).single();
    if (data) setForm({ ...data, draw_date: data.draw_date?.slice(0, 16) ?? "", price_bundles: (data.price_bundles as any[]) ?? [], gallery_urls: (data.gallery_urls as any[]) ?? [], lucky_numbers_prizes: (data.lucky_numbers_prizes as any[]) ?? [], main_prizes: (data.main_prizes as any[]) ?? [], roulette_rules: (data.roulette_rules as any[]) ?? [] } as CampaignForm);
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'gallery') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    try {
      setUploading(type);
      
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate type
        if (!ALLOWED_TYPES.includes(file.type)) {
          throw new Error(`O arquivo ${file.name} não é uma imagem válida (JPG, PNG, WebP ou GIF).`);
        }

        // Validate size
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`O arquivo ${file.name} é muito grande. O tamanho máximo permitido é 5MB.`);
        }

        const fileExt = file.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('campaigns')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('campaigns')
          .getPublicUrl(filePath);
          
        return publicUrl;
      });

      const urls = await Promise.all(uploadPromises);

      if (type === 'cover') {
        set("image_url", urls[0]);
      } else {
        setForm(p => ({ ...p, gallery_urls: [...p.gallery_urls, ...urls] }));
      }
      
      toast({ title: "Sucesso", description: `${urls.length} imagem(ns) enviada(s) com sucesso!` });
    } catch (error: any) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
    } finally {
      setUploading(null);
      // Reset input value so same file can be selected again
      e.target.value = '';
    }
  };

  const deleteStorageFile = async (url: string) => {
    try {
      const fileName = url.split('/').pop();
      if (!fileName) return;

      const { error } = await supabase.storage
        .from('campaigns')
        .remove([fileName]);

      if (error) throw error;
    } catch (error) {
      console.error("Erro ao deletar arquivo do storage:", error);
    }
  };

  const removeGalleryImage = async (index: number) => {
    const urlToRemove = form.gallery_urls[index];
    if (confirm("Deseja realmente excluir esta imagem permanentemente?")) {
      await deleteStorageFile(urlToRemove);
      const newGallery = [...form.gallery_urls];
      newGallery.splice(index, 1);
      set("gallery_urls", newGallery);
      toast({ title: "Sucesso", description: "Imagem removida e deletada do servidor." });
    }
  };

  const removeCoverImage = async () => {
    if (form.image_url && confirm("Deseja realmente excluir a imagem de capa permanentemente?")) {
      await deleteStorageFile(form.image_url);
      set("image_url", "");
      toast({ title: "Sucesso", description: "Capa removida e deletada do servidor." });
    }
  };

  const set = (k: keyof CampaignForm, v: any) => {
    // Auto-generate slug if title is changed and slug is empty or matches previous title slug
    if (k === "title" && !id) {
      const newSlug = v.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setForm(p => ({ ...p, title: v, slug: p.slug === "" || p.slug === p.title.toLowerCase().replace(/[\s_-]+/g, '-') ? newSlug : p.slug }));
      return;
    }
    setForm((p) => ({ ...p, [k]: v }));
  };

  const save = async () => {
    setSaving(true);
    try {
      if (!form.title) throw new Error("O título é obrigatório");
      if (!form.slug) throw new Error("O slug da URL é obrigatório");

      // Prepare clean payload for Supabase
      const { 
        id: _, 
        created_at: __, 
        updated_at: ___, 
        sold_tickets: ____,
        ...rest 
      } = form as any;

      const payload = {
        ...rest,
        ticket_price: Number(form.ticket_price),
        total_tickets: Number(form.total_tickets),
        sales_goal: Number(form.sales_goal || 0),
        roulette_free_tickets: Number(form.roulette_free_tickets || 0),
        roulette_payout_rate: Number(form.roulette_payout_rate || 0),
        roulette_spin_cost: Number(form.roulette_spin_cost || 0),
        roulette_multiplier_max: Number(form.roulette_multiplier_max || 0),
        min_tickets: Number(form.min_tickets || 1),
        max_tickets: Number(form.max_tickets || 10000),
        draw_date: form.draw_date ? new Date(form.draw_date).toISOString() : null,
      };

      const { error } = id
        ? await supabase.from("campaigns").update(payload).eq("id", id)
        : await supabase.from("campaigns").insert(payload);

      if (error) throw error;
      
      toast({ title: "Sucesso!", description: "Campanha salva com sucesso." });
      navigate("/admin/campanhas");
    } catch (e: any) {
      console.error("Erro ao salvar campanha:", e);
      toast({ 
        title: "Erro ao salvar", 
        description: e.message || "Ocorreu um erro de sintaxe ou validação. Verifique os campos e tente novamente.", 
        variant: "destructive" 
      });
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
            <TabsTrigger value="general" className="rounded-xl px-6 gap-2"><BookOpen className="h-4 w-4" /> Geral</TabsTrigger>
            <TabsTrigger value="pricing" className="rounded-xl px-6 gap-2"><Ticket className="h-4 w-4" /> Valores</TabsTrigger>
            <TabsTrigger value="media" className="rounded-xl px-6 gap-2"><ImageIcon className="h-4 w-4" /> Mídia</TabsTrigger>
            <TabsTrigger value="prizes" className="rounded-xl px-6 gap-2"><Trophy className="h-4 w-4" /> Prêmios</TabsTrigger>
            <TabsTrigger value="engagement" className="rounded-xl px-6 gap-2"><Zap className="h-4 w-4" /> Engajamento</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl px-6 gap-2"><Settings2 className="h-4 w-4" /> Avançado</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6 space-y-6">
            <Card className="p-6 rounded-2xl border-border shadow-sm">
               <Label>Título da Campanha</Label>
               <Input value={form.title} onChange={(e) => set("title", e.target.value)} className="mt-2" />
               <Label className="mt-4 block">Subtítulo</Label>
               <Input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} className="mt-2" />
               <Label className="mt-4 block">Descrição</Label>
               <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="mt-2" rows={5} />
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="mt-6 space-y-6">
            <Card className="p-6 rounded-2xl border-border shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <Label>Preço Unitário (R$)</Label>
                 <Input type="number" step="0.01" value={form.ticket_price} onChange={(e) => set("ticket_price", e.target.value)} className="mt-2" />
               </div>
               <div>
                 <Label>Total de Bilhetes</Label>
                 <Input type="number" value={form.total_tickets} onChange={(e) => set("total_tickets", e.target.value)} className="mt-2" />
               </div>
               <div className="md:col-span-2 space-y-4 pt-4 border-t">
                 <div className="flex items-center gap-2">
                   <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                     <Dices className="h-5 w-5" />
                   </div>
                   <div className="flex-1">
                     <Label className="text-base font-bold">Modo de Operação</Label>
                     <p className="text-xs text-muted-foreground">Defina como os números serão entregues ao cliente.</p>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <button 
                     type="button"
                     onClick={() => set("ticket_generation_type", 'auto')}
                     className={cn(
                       "flex flex-col gap-3 p-5 rounded-2xl border-2 text-left transition-all",
                       form.ticket_generation_type === 'auto' 
                        ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20" 
                        : "border-border bg-white hover:border-primary/30"
                     )}
                   >
                     <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-colors", form.ticket_generation_type === 'auto' ? "bg-primary text-white" : "bg-secondary text-muted-foreground")}>
                       <Zap className="h-5 w-5" />
                     </div>
                     <div>
                       <p className="font-bold text-sm">Sorteio Aleatório (Automático)</p>
                       <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Os números são gerados pelo sistema apenas **após a confirmação do pagamento**. Ideal para grandes volumes de bilhetes.</p>
                     </div>
                   </button>

                   <button 
                     type="button"
                     onClick={() => set("ticket_generation_type", 'manual')}
                     className={cn(
                       "flex flex-col gap-3 p-5 rounded-2xl border-2 text-left transition-all",
                       form.ticket_generation_type === 'manual' 
                        ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20" 
                        : "border-border bg-white hover:border-primary/30"
                     )}
                   >
                     <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-colors", form.ticket_generation_type === 'manual' ? "bg-primary text-white" : "bg-secondary text-muted-foreground")}>
                       <MousePointer2 className="h-5 w-5" />
                     </div>
                     <div>
                       <p className="font-bold text-sm">Seleção Manual (Grade)</p>
                       <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">O cliente visualiza a grade e escolhe seus números **antes de pagar**. Recomendado para rifas com até 5.000 números.</p>
                     </div>
                   </button>
                 </div>
               </div>
            </Card>
            
            <Card className="p-6 rounded-2xl border-border shadow-sm">
               <div className="flex justify-between items-center mb-4">
                 <Label className="text-lg font-bold">Combos de Desconto</Label>
                 <Button size="sm" onClick={() => set("price_bundles", [...form.price_bundles, {quantity: 10, price: 9}])}><Plus className="h-4 w-4 mr-2" /> Novo Combo</Button>
               </div>
               <div className="space-y-3">
                 {form.price_bundles.map((b, i) => (
                   <div key={i} className="flex gap-4 items-center bg-secondary/50 p-4 rounded-xl">
                     <div className="flex-1">
                       <Label className="text-[10px] uppercase font-bold text-muted-foreground">Quantidade</Label>
                       <Input type="number" value={b.quantity} onChange={(e) => {
                         const n = [...form.price_bundles];
                         n[i].quantity = Number(e.target.value);
                         set("price_bundles", n);
                       }} />
                     </div>
                     <div className="flex-1">
                       <Label className="text-[10px] uppercase font-bold text-muted-foreground">Preço (R$)</Label>
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
             <Card className="p-6 rounded-2xl border-border shadow-sm space-y-6">
               <div className="space-y-4">
                 <Label className="text-base font-bold">Imagem de Capa (Principal)</Label>
                 <div className="flex flex-col gap-4">
                   {form.image_url && (
                     <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border group">
                       <img src={form.image_url} alt="Capa" className="w-full h-full object-cover" />
                       <button 
                        onClick={removeCoverImage}
                        className="absolute top-2 right-2 p-2 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <X className="h-4 w-4" />
                       </button>
                     </div>
                   )}
                   <div className="flex items-center gap-4">
                     <div className="flex-1">
                        <Input 
                          placeholder="Ou cole a URL da imagem aqui..." 
                          value={form.image_url} 
                          onChange={(e) => set("image_url", e.target.value)} 
                        />
                     </div>
                     <Label className="cursor-pointer">
                       <div className="flex items-center gap-2 px-4 h-10 rounded-xl bg-primary text-white font-bold text-sm transition-all hover:bg-primary/90">
                         {uploading === 'cover' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                         Fazer Upload
                       </div>
                       <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => handleUpload(e, 'cover')} disabled={!!uploading} />
                     </Label>
                   </div>
                 </div>
               </div>

               <Separator />

               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                   <div className="flex flex-col gap-0.5">
                     <Label className="text-base font-bold">Galeria de Fotos (Slide)</Label>
                     <p className="text-[10px] text-primary font-bold flex items-center gap-1">
                       <Sparkles className="h-3 w-3" /> Slide criado automaticamente
                     </p>
                   </div>
                   <Label className="cursor-pointer">
                     <div className="flex items-center gap-2 px-4 h-9 rounded-lg bg-secondary text-foreground font-bold text-xs transition-all hover:bg-secondary/80">
                       {uploading === 'gallery' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                       Adicionar Foto
                     </div>
                     <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => handleUpload(e, 'gallery')} disabled={!!uploading} />
                   </Label>
                 </div>
                 
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                   {form.gallery_urls.map((url, index) => (
                     <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                       <img src={url} alt={`Galeria ${index}`} className="w-full h-full object-cover" />
                       <button 
                         onClick={() => removeGalleryImage(index)}
                         className="absolute top-1 right-1 p-1.5 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <X className="h-3 w-3" />
                       </button>
                     </div>
                   ))}
                   {form.gallery_urls.length === 0 && (
                     <div className="col-span-full py-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground bg-secondary/20">
                       <ImageIcon className="h-8 w-8 mb-2 opacity-20" />
                       <p className="text-xs font-medium">Sua galeria está vazia.</p>
                     </div>
                   )}
                 </div>
               </div>

               <Separator />

               <div className="space-y-4">
                 <Label className="text-base font-bold">Vídeo do YouTube</Label>
                 <Input 
                   placeholder="Link do vídeo (Ex: https://www.youtube.com/watch?v=...)" 
                   value={form.video_url} 
                   onChange={(e) => set("video_url", e.target.value)} 
                 />
               </div>
             </Card>
          </TabsContent>

          <TabsContent value="prizes" className="mt-6 space-y-6">
             <Card className="p-6 rounded-2xl border-border shadow-sm">
                <Label className="text-lg font-bold mb-4 block">Premiação Principal</Label>
                <div className="space-y-3">
                  {form.main_prizes.map((p, i) => (
                    <div key={i} className="flex items-center gap-4 bg-secondary/50 p-3 rounded-xl">
                      <span className="w-20 font-bold text-muted-foreground">{p.position}º Lugar</span>
                      <Input value={p.prize} onChange={(e) => {
                        const n = [...form.main_prizes];
                        n[i].prize = e.target.value;
                        set("main_prizes", n);
                      }} />
                    </div>
                  ))}
                </div>
             </Card>

            <Card className="p-6 rounded-2xl border-border shadow-sm overflow-hidden">
               <div className="flex justify-between items-center mb-6">
                 <div className="space-y-1">
                   <Label className="text-lg font-bold flex items-center gap-2">
                     <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                     Cotas Premiadas (Instantâneas)
                   </Label>
                   <p className="text-xs text-muted-foreground">Números que ganham prêmios no momento da compra.</p>
                 </div>
                 <Button size="sm" onClick={() => set("lucky_numbers_prizes", [...form.lucky_numbers_prizes, {number: "", prize: "", protected: true}])}>
                   <Plus className="h-4 w-4 mr-2" /> Nova Cota
                 </Button>
               </div>
               
               <div className="grid gap-3">
                 {form.lucky_numbers_prizes.map((p, i) => (
                   <div key={i} className="flex gap-4 items-center bg-secondary/50 p-4 rounded-2xl border border-border transition-all hover:border-amber-200">
                     <div className="w-32">
                       <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1.5 block">Nº da Cota</Label>
                       <Input 
                         placeholder="Ex: 5485" 
                         className="bg-white font-mono font-bold text-center"
                         value={p.number} 
                         onChange={(e) => {
                           const n = [...form.lucky_numbers_prizes];
                           n[i].number = e.target.value;
                           set("lucky_numbers_prizes", n);
                         }} 
                       />
                     </div>
                     <div className="flex-1">
                       <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1.5 block">Descrição do Prêmio</Label>
                       <Input 
                         placeholder="Ex: iPhone 16 Pro Max" 
                         className="bg-white"
                         value={p.prize} 
                         onChange={(e) => {
                           const n = [...form.lucky_numbers_prizes];
                           n[i].prize = e.target.value;
                           set("lucky_numbers_prizes", n);
                         }} 
                       />
                     </div>
                     <div className="flex flex-col items-center gap-1.5 pt-5">
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <div className="flex flex-col items-center gap-1">
                               <Label className="text-[9px] uppercase font-bold text-muted-foreground">Protegida</Label>
                               <Switch 
                                 checked={p.protected !== false} 
                                 onCheckedChange={(v) => {
                                   const n = [...form.lucky_numbers_prizes];
                                   n[i].protected = v;
                                   set("lucky_numbers_prizes", n);
                                 }} 
                               />
                             </div>
                           </TooltipTrigger>
                           <TooltipContent>
                             <p className="w-48 text-[10px]">Cotas protegidas não são sorteadas aleatoriamente para compradores comuns. Elas ficam reservadas exclusivamente para ganhadores instantâneos.</p>
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                     </div>
                     <Button variant="ghost" size="icon" className="mt-5 text-slate-300 hover:text-destructive hover:bg-destructive/5" onClick={() => {
                       const n = [...form.lucky_numbers_prizes];
                       n.splice(i, 1);
                       set("lucky_numbers_prizes", n);
                     }}><Trash2 className="h-4 w-4" /></Button>
                   </div>
                 ))}
                 {form.lucky_numbers_prizes.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-3xl text-muted-foreground bg-secondary/10">
                     <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-20" />
                     <p className="text-sm font-medium">Nenhuma cota premiada configurada.</p>
                     <p className="text-[10px] mt-1">Clique em "Nova Cota" para começar a premiar seus clientes!</p>
                   </div>
                 )}
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="mt-6 space-y-6">
            <Card className="p-6 rounded-2xl border-border shadow-sm">
               <div className="flex items-center gap-2 mb-6">
                 <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                   <Dices className="h-5 w-5" />
                 </div>
                 <div className="flex-1">
                   <h3 className="text-lg font-bold">Incentivos da Roleta</h3>
                   <p className="text-sm text-muted-foreground">Configure quantos giros o cliente ganha ao comprar certas quantidades</p>
                 </div>
                 <Switch checked={form.roulette_enabled} onCheckedChange={(v) => set("roulette_enabled", v)} />
               </div>
               
               {form.roulette_enabled && (
                 <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <Label className="font-bold">Regras de Premiação</Label>
                     <Button size="sm" variant="outline" onClick={() => set("roulette_rules", [...form.roulette_rules, {min_tickets: 50, spins: 1}])}>
                       <Plus className="h-4 w-4 mr-2" /> Adicionar Regra
                     </Button>
                   </div>
                   
                   <div className="grid gap-3">
                     {form.roulette_rules.map((rule, i) => (
                       <div key={i} className="flex gap-4 items-center bg-secondary/50 p-4 rounded-xl border border-border">
                         <div className="flex-1">
                           <Label className="text-[10px] uppercase font-bold text-muted-foreground">Ao comprar acima de (Qtd)</Label>
                           <Input type="number" value={rule.min_tickets} onChange={(e) => {
                             const n = [...form.roulette_rules];
                             n[i].min_tickets = Number(e.target.value);
                             set("roulette_rules", n);
                           }} />
                         </div>
                         <div className="flex-1">
                           <Label className="text-[10px] uppercase font-bold text-muted-foreground">Ganha (Giros)</Label>
                           <Input type="number" value={rule.spins} onChange={(e) => {
                             const n = [...form.roulette_rules];
                             n[i].spins = Number(e.target.value);
                             set("roulette_rules", n);
                           }} />
                         </div>
                         <Button variant="ghost" size="icon" className="mt-5" onClick={() => {
                           const n = [...form.roulette_rules];
                           n.splice(i, 1);
                           set("roulette_rules", n);
                         }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                       </div>
                     ))}
                     {form.roulette_rules.length === 0 && (
                       <div className="text-center py-8 border-2 border-dashed rounded-2xl text-muted-foreground">
                         Nenhuma regra definida. O cliente não ganhará giros automáticos.
                       </div>
                     )}
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                     <div className="space-y-2">
                       <Label>Custo do Giro Individual (R$)</Label>
                       <Input type="number" step="0.01" value={form.roulette_spin_cost} onChange={(e) => set("roulette_spin_cost", Number(e.target.value))} />
                       <p className="text-[10px] text-muted-foreground italic">Caso queira permitir compra avulsa de giros</p>
                     </div>
                   </div>
                 </div>
               )}
            </Card>

            <Card className="p-6 rounded-2xl border-border shadow-sm">
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
                    <p className="text-[10px] text-muted-foreground">Exibida como barra de progresso</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Tag de Urgência</Label>
                    <Input placeholder="Ex: ÚLTIMAS COTAS" value={form.urgency_tag} onChange={(e) => set("urgency_tag", e.target.value)} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold">Em Destaque</Label>
                      <p className="text-[11px] text-muted-foreground">Aparece no topo da página inicial</p>
                    </div>
                    <Switch checked={form.featured} onCheckedChange={(v) => set("featured", v)} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold">Exibir Ranking</Label>
                      <p className="text-[11px] text-muted-foreground">Mostrar maiores compradores</p>
                    </div>
                    <Switch checked={form.ranking_enabled} onCheckedChange={(v) => set("ranking_enabled", v)} />
                  </div>
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6 space-y-6">
            <Card className="p-6 rounded-2xl border-border shadow-sm">
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
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-bold">Extração pela Federal</Label>
                      <p className="text-[11px] text-muted-foreground">Usa os números da Loteria Federal</p>
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
