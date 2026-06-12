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
import { Loader2, ArrowLeft, Save, Plus, Trash2, Info, Settings2, Image as ImageIcon, Ticket, Percent, Trophy, HelpCircle, Sparkles, BookOpen, Crown, Box, Landmark, Upload, Target, Dices, Gift, Zap, Star, MousePointer2, X, TrendingUp, ShieldAlert, Calendar, Clock, Video, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useFeatureAccess, useRole } from "@/hooks/useAdmin";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { compressImage } from "@/lib/image-upload";
import LuckyHourManager from "@/components/admin/LuckyHourManager";


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
  show_timer: boolean; sections_order: string[]; timer_end_date: string;
  vip_group_link: string; vip_group_video_url: string;
  upsell_video_url: string; upsell_offer_text: string;
  upsell_enabled: boolean; upsell_probability: string;
  ranking_prizes: { id: string; title: string; start_date: string; end_date: string; prize_maior: string; prize_menor: string; active: boolean }[];
  prize_rules: { type: string; label: string; prize_greater?: string; prize_smaller?: string; active?: boolean }[];
  live_stream_url: string; live_stream_enabled: boolean; concurso: string; draw_number: string;
  fake_progress_enabled: boolean;
  fake_progress_percentage: number;
  progress_text: string;
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
  show_timer: false, sections_order: ["gallery", "header", "progress", "purchase", "description", "prizes", "roulette_footer", "scratch_footer", "winners", "ranking"],
  timer_end_date: "",
  vip_group_link: "",
  vip_group_video_url: "",
  upsell_video_url: "",
  upsell_offer_text: "",
  upsell_enabled: false,
  upsell_probability: "98%",
  ranking_prizes: [],
  prize_rules: [],
  live_stream_url: "",
  live_stream_enabled: false,
  concurso: "",
  draw_number: "",
  fake_progress_enabled: false,
  fake_progress_percentage: 0,
  progress_text: "",
};


export default function AdminCampaignEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: features } = useFeatureAccess();
  const { data: userRole } = useRole();
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
    if (data) setForm({ 
      ...data, 
      draw_date: data.draw_date?.slice(0, 16) ?? "", 
      timer_end_date: data.timer_end_date?.slice(0, 16) ?? "",
      price_bundles: (data.price_bundles as any[]) ?? [], 
      gallery_urls: (data.gallery_urls as any[]) ?? [], 
      lucky_numbers_prizes: (data.lucky_numbers_prizes as any[]) ?? [], 
      main_prizes: (data.main_prizes as any[]) ?? [], 
      roulette_rules: (data.roulette_rules as any[]) ?? [],
      ranking_prizes: (data.ranking_prizes as any[]) ?? [],
      prize_rules: (data.prize_rules as any[]) ?? [],
      progress_text: data.progress_text ?? "",
      sections_order: (data.sections_order as string[]) ?? ["gallery", "header", "progress", "purchase", "description", "prizes", "roulette_footer", "scratch_footer", "winners", "ranking"]
    } as unknown as CampaignForm);
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

        // Compress image before upload
        const processedFile = await compressImage(file);

        // Validate size of processed file
        if (processedFile.size > MAX_FILE_SIZE) {
          throw new Error(`O arquivo ${processedFile.name} é muito grande mesmo após compressão. O tamanho máximo permitido é 5MB.`);
        }

        const fileExt = processedFile.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('campaigns')
          .upload(filePath, processedFile);


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
    if (k === "fake_progress_percentage") {
      v = Math.min(100, Math.max(0, parseInt(v) || 0));
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
        timer_end_date: form.timer_end_date ? new Date(form.timer_end_date).toISOString() : null,
      };

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      const { error } = id
        ? await supabase.from("campaigns").update(payload).eq("id", id)
        : await supabase.from("campaigns").insert(payload);

      if (error) throw error;

      // Audit the change
      if (user) {
        await supabase.from("auth_audit_logs").insert({
          user_id: user.id,
          event: id ? "update_campaign" : "create_campaign",
          resource: "campaigns",
          status: "success",
          details: { 
            campaign_id: id || "new",
            title: form.title,
            status: form.status,
            draw_date: payload.draw_date,
            timestamp: new Date().toISOString()
          }
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["campaign-ticket-stats", id] });

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

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full justify-start bg-card border h-auto min-h-14 rounded-2xl p-1.5 flex flex-wrap lg:flex-nowrap overflow-x-auto overflow-y-hidden no-scrollbar">
            <TabsTrigger value="general" className="rounded-xl px-4 md:px-6 py-2 gap-2 text-xs md:text-sm font-bold flex-1 md:flex-none whitespace-nowrap"><BookOpen className="h-4 w-4" /> Geral</TabsTrigger>
            <TabsTrigger value="pricing" className="rounded-xl px-4 md:px-6 py-2 gap-2 text-xs md:text-sm font-bold flex-1 md:flex-none whitespace-nowrap"><Ticket className="h-4 w-4" /> Valores</TabsTrigger>
            <TabsTrigger value="media" className="rounded-xl px-4 md:px-6 py-2 gap-2 text-xs md:text-sm font-bold flex-1 md:flex-none whitespace-nowrap"><ImageIcon className="h-4 w-4" /> Mídia</TabsTrigger>
            <TabsTrigger value="prizes" className="rounded-xl px-4 md:px-6 py-2 gap-2 text-xs md:text-sm font-bold flex-1 md:flex-none whitespace-nowrap"><Trophy className="h-4 w-4" /> Prêmios</TabsTrigger>
            <TabsTrigger value="lucky_hour" className="rounded-xl px-4 md:px-6 py-2 gap-2 text-xs md:text-sm font-bold flex-1 md:flex-none whitespace-nowrap"><Clock className="h-4 w-4" /> Hora Premiada</TabsTrigger>
            {features?.roulette_enabled || features?.scratch_cards_enabled ? (
              <TabsTrigger value="engagement" className="rounded-xl px-4 md:px-6 py-2 gap-2 text-xs md:text-sm font-bold flex-1 md:flex-none whitespace-nowrap"><Zap className="h-4 w-4" /> Engajamento</TabsTrigger>
            ) : null}
            <TabsTrigger value="success_flow" className="rounded-xl px-4 md:px-6 py-2 gap-2 text-xs md:text-sm font-bold flex-1 md:flex-none whitespace-nowrap"><Star className="h-4 w-4" /> Pós-Venda</TabsTrigger>
            {features?.page_editing_enabled && (
              <TabsTrigger value="layout" className="rounded-xl px-4 md:px-6 py-2 gap-2 text-xs md:text-sm font-bold flex-1 md:flex-none whitespace-nowrap"><Settings2 className="h-4 w-4" /> Layout</TabsTrigger>
            )}
            {userRole === 'master' && (
              <TabsTrigger value="settings" className="rounded-xl px-4 md:px-6 py-2 gap-2 text-xs md:text-sm font-bold flex-1 md:flex-none whitespace-nowrap"><Settings2 className="h-4 w-4" /> Avançado</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="general" className="mt-6 space-y-6">
            <Card className="p-6 rounded-2xl border-border shadow-sm">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                 <div className="space-y-2 min-w-0">
                   <Label>Título da Campanha</Label>
                   <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
                 </div>
                 <div className="space-y-2 min-w-0">
                   <Label className="flex items-center gap-2">
                     Status da Campanha
                     <TooltipProvider>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                         </TooltipTrigger>
                         <TooltipContent className="p-4 w-72 space-y-3">
                           <div className="space-y-1">
                             <p className="font-bold text-xs text-emerald-500 uppercase tracking-tighter">Ativa</p>
                             <p className="text-[10px] leading-relaxed">Campanha visível e disponível para compra imediata por qualquer usuário.</p>
                           </div>
                           <div className="space-y-1">
                             <p className="font-bold text-xs text-amber-500 uppercase tracking-tighter">Pausada</p>
                             <p className="text-[10px] leading-relaxed">Visível no site, mas os botões de compra ficam desativados. Ideal para manutenções rápidas.</p>
                           </div>
                           <div className="space-y-1">
                             <p className="font-bold text-xs text-purple-500 uppercase tracking-tighter">Em Auditoria</p>
                             <p className="text-[10px] leading-relaxed">Indica que as vendas encerraram e o administrador está conferindo os pagamentos antes do sorteio.</p>
                           </div>
                           <div className="space-y-1">
                             <p className="font-bold text-xs text-blue-500 uppercase tracking-tighter">Finalizada</p>
                             <p className="text-[10px] leading-relaxed">Sorteio já realizado. Os bilhetes não podem mais ser comprados e o ganhador é exibido.</p>
                           </div>
                           <div className="space-y-1">
                             <p className="font-bold text-xs text-muted-foreground uppercase tracking-tighter">Rascunho</p>
                             <p className="text-[10px] leading-relaxed">Campanha invisível para os usuários. Use enquanto estiver configurando os detalhes.</p>
                           </div>
                         </TooltipContent>
                       </Tooltip>
                     </TooltipProvider>
                   </Label>
                   <Select value={form.status} onValueChange={(v) => set("status", v)}>
                     <SelectTrigger className="mt-2">
                       <SelectValue placeholder="Selecione o status" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="active">Ativa (Aberta para vendas)</SelectItem>
                       <SelectItem value="paused">Pausada (Vendas suspensas)</SelectItem>
                       <SelectItem value="audit">Em Auditoria (Verificação final)</SelectItem>
                       <SelectItem value="completed">Finalizada (Sorteio realizado)</SelectItem>
                       <SelectItem value="draft">Rascunho (Privada)</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
               </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4">
                   <div className="space-y-2 min-w-0">
                    <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Subtítulo / Chamada Rápida</Label>
                    <Input 
                      placeholder="Ex: Participe e concorra ao prêmio dos seus sonhos!" 
                      value={form.subtitle} 
                      onChange={(e) => set("subtitle", e.target.value)} 
                    />
                  </div>
                   <div className="space-y-2 min-w-0">
                    <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Código LTP (Opcional)</Label>
                    <Input 
                      placeholder="Ex: LTP-12345" 
                      value={form.ltp_code} 
                      onChange={(e) => set("ltp_code", e.target.value)} 
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4 pt-2 border-t">
                  <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Descrição Detalhada da Premiação</Label>
                  <Textarea 
                    value={form.description} 
                    onChange={(e) => set("description", e.target.value)} 
                    placeholder="Descreva os detalhes da premiação, modelo, ano, etc. Isso ajuda na conversão!" 
                    className="min-h-[120px] rounded-xl" 
                  />
                </div>
                
                <div className="space-y-2 mt-4 pt-2 border-t">
                  <Label className="font-bold text-xs uppercase tracking-wider text-amber-600 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" /> Regulamento e Termos de Uso
                  </Label>
                  <Textarea 
                    value={form.regulations} 
                    onChange={(e) => set("regulations", e.target.value)} 
                    placeholder="Regras oficiais do sorteio, prazos de entrega e condições." 
                    className="min-h-[150px] rounded-xl border-amber-200 focus-visible:ring-amber-500" 
                  />
                  <p className="text-[10px] text-muted-foreground italic">Este texto é fundamental para a transparência com o cliente.</p>
                </div>
             </Card>

            <Card className="p-6 rounded-2xl border-border shadow-sm mt-6">
               <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                 <Calendar className="h-5 w-5 text-primary" /> Datas do Sorteio
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                 <div className="space-y-2 min-w-0">
                   <Label className="flex items-center gap-2">
                     Data do Sorteio
                     <TooltipProvider>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                         </TooltipTrigger>
                         <TooltipContent>
                           <p className="w-48 text-[10px]">Data em que o sorteio será realizado. Esta data será exibida para os clientes.</p>
                         </TooltipContent>
                       </Tooltip>
                     </TooltipProvider>
                   </Label>
                   <Input 
                     type="datetime-local" 
                     value={form.draw_date} 
                     onChange={(e) => set("draw_date", e.target.value)} 
                   />
                 </div>
                 <div className="space-y-2 min-w-0">
                   <Label className="flex items-center gap-2">
                     Finalizar Vendas em
                     <TooltipProvider>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                         </TooltipTrigger>
                         <TooltipContent>
                           <p className="w-48 text-[10px]">Data em que o cronômetro chegará a zero e as vendas serão pausadas automaticamente.</p>
                         </TooltipContent>
                       </Tooltip>
                     </TooltipProvider>
                   </Label>
                   <Input 
                     type="datetime-local" 
                     value={form.timer_end_date} 
                     onChange={(e) => set("timer_end_date", e.target.value)} 
                   />
                  </div>
                   <div className="space-y-2 min-w-0">
                    <Label className="flex items-center gap-2">
                      Número do Concurso (Loteria Federal)
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-48 text-[10px]">Número do concurso da Loteria Federal que será usado como base para o sorteio.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input 
                      placeholder="Ex: 5932" 
                      value={form.draw_number} 
                      onChange={(e) => set("draw_number", e.target.value)} 
                    />
                  </div>
                </div>
               {form.draw_date && form.timer_end_date && new Date(form.timer_end_date) > new Date(form.draw_date) && (
                 <Alert variant="destructive" className="mt-4 bg-destructive/10 border-destructive/20 text-destructive">
                   <AlertCircle className="h-4 w-4" />
                   <AlertTitle className="text-xs font-bold uppercase tracking-tight">Aviso de Data</AlertTitle>
                   <AlertDescription className="text-[10px]">
                     A data de finalização das vendas está definida para <strong>após</strong> a data do sorteio. Geralmente as vendas terminam antes ou no momento do sorteio.
                   </AlertDescription>
                 </Alert>
               )}
            </Card>
            <Card className="p-6 rounded-2xl border-border shadow-sm mt-6">
               <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                 <TrendingUp className="h-5 w-5 text-primary" /> Progresso da Campanha
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl border border-border">
                   <div className="space-y-0.5">
                     <Label className="text-sm font-bold">Habilitar Progresso Fake</Label>
                     <p className="text-[10px] text-muted-foreground italic">Exibe uma barra de progresso personalizada para os clientes.</p>
                   </div>
                   <Switch 
                     checked={form.fake_progress_enabled} 
                     onCheckedChange={(v) => set("fake_progress_enabled", v)} 
                   />
                 </div>
                 
                 <div className={cn("space-y-2 transition-opacity", !form.fake_progress_enabled && "opacity-50 pointer-events-none")}>
                   <Label className="flex items-center gap-2">
                     Porcentagem de Vendas Exibida (%)
                     <TooltipProvider>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                         </TooltipTrigger>
                         <TooltipContent>
                           <p className="w-48 text-[10px]">Indique a porcentagem que você deseja mostrar na barra de progresso da página da campanha.</p>
                         </TooltipContent>
                       </Tooltip>
                     </TooltipProvider>
                   </Label>
                   <div className="relative">
                     <Input 
                       type="number" 
                       min="0"
                       max="100"
                       value={form.fake_progress_percentage} 
                       onChange={(e) => set("fake_progress_percentage", parseInt(e.target.value) || 0)} 
                       className="pr-8"
                     />
                     <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   </div>
                 </div>

                 <div className="space-y-2 md:col-span-2">
                   <Label className="flex items-center gap-2">
                     Texto Customizado do Progresso
                     <TooltipProvider>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                         </TooltipTrigger>
                         <TooltipContent>
                           <p className="w-48 text-[10px]">Substitui o número da porcentagem por um texto fixo (ex: "QUASE LÁ", "80% VENDIDO"). Deixe vazio para usar a porcentagem automática.</p>
                         </TooltipContent>
                       </Tooltip>
                     </TooltipProvider>
                   </Label>
                    <Input 
                      placeholder="Ex: QUASE LÁ ou 75% VENDIDO"
                      value={form.progress_text} 
                      onChange={(e) => set("progress_text", e.target.value)} 
                    />
                  </div>

                  <div className="space-y-4 md:col-span-2 pt-4 border-t">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pré-visualização da Barra</Label>
                    <div className="p-6 bg-card rounded-2xl border border-border shadow-inner">
                      <div className="space-y-4">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-2xl font-black text-primary italic leading-none">
                            {form.progress_text || (form.fake_progress_enabled ? `${form.fake_progress_percentage}%` : "75%")}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary px-2 py-1 rounded-md">
                            Progresso das Vendas
                          </span>
                        </div>
                        <div className="relative h-6 w-full bg-secondary/30 rounded-full overflow-hidden border border-border/50">
                          <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-primary/80 to-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-all duration-1000 ease-out"
                            style={{ width: `${form.fake_progress_enabled ? form.fake_progress_percentage : 75}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
             </Card>
          </TabsContent>

          <TabsContent value="pricing" className="mt-6 space-y-6">
            <Card className="p-6 rounded-2xl border-border shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 min-w-0">
                  <Label>Preço Unitário (R$)</Label>
                  <Input type="number" step="0.01" value={form.ticket_price} onChange={(e) => set("ticket_price", e.target.value)} className="mt-2" />
                </div>
                <div className="space-y-2 min-w-0">
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
                      onClick={() => {
                        set("ticket_generation_type", 'auto');
                        set("manual_numbers", false);
                        set("auto_numbers", true);
                      }}
                     className={cn(
                       "flex flex-col gap-3 p-5 rounded-2xl border-2 text-left transition-all",
                       form.ticket_generation_type === 'auto' 
                        ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20" 
                        : "border-border bg-card hover:border-primary/30"
                     )}
                   >
                     <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-colors", form.ticket_generation_type === 'auto' ? "bg-primary text-foreground" : "bg-secondary text-muted-foreground")}>
                       <Zap className="h-5 w-5" />
                     </div>
                     <div>
                       <p className="font-bold text-sm">Sorteio Aleatório (Automático)</p>
                       <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Os números são gerados pelo sistema apenas **após a confirmação do pagamento**. Ideal para grandes volumes de bilhetes.</p>
                     </div>
                   </button>

                   <button 
                     type="button"
                      onClick={() => {
                        set("ticket_generation_type", 'manual');
                        set("manual_numbers", true);
                        set("auto_numbers", false);
                      }}
                     className={cn(
                       "flex flex-col gap-3 p-5 rounded-2xl border-2 text-left transition-all",
                       form.ticket_generation_type === 'manual' 
                        ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20" 
                        : "border-border bg-card hover:border-primary/30"
                     )}
                   >
                     <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-colors", form.ticket_generation_type === 'manual' ? "bg-primary text-foreground" : "bg-secondary text-muted-foreground")}>
                       <MousePointer2 className="h-5 w-5" />
                     </div>
                     <div>
                       <p className="font-bold text-sm">Seleção Manual (Grade)</p>
                       <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">O cliente visualiza a grade e escolhe seus números **antes de pagar**. Agora suporta grandes volumes com busca por número.</p>
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
                   <div key={i} className="flex flex-col gap-4 bg-secondary/50 p-4 rounded-xl border border-border">
                     <div className="flex gap-4 items-center">
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
                     <div className="flex gap-4 items-center">
                       <div className="flex-1">
                         <Label className="text-[10px] uppercase font-bold text-muted-foreground">Badge (Ex: Mais Popular)</Label>
                         <Input placeholder="Opcional" value={(b as any).label || ""} onChange={(e) => {
                           const n = [...form.price_bundles];
                           (n[i] as any).label = e.target.value;
                           set("price_bundles", n);
                         }} />
                       </div>
                       <div className="flex flex-col items-center gap-1.5 px-4 pt-4">
                         <Label className="text-[9px] uppercase font-bold text-muted-foreground">Destaque</Label>
                         <Switch checked={(b as any).is_popular} onCheckedChange={(v) => {
                            const n = [...form.price_bundles];
                            (n[i] as any).is_popular = v;
                            set("price_bundles", n);
                         }} />
                       </div>
                     </div>
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
                        className="absolute top-2 right-2 p-2 bg-destructive text-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <X className="h-4 w-4" />
                       </button>
                     </div>
                   )}
                   <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <Input 
                          placeholder="Ou cole a URL da imagem aqui..." 
                          value={form.image_url} 
                          onChange={(e) => set("image_url", e.target.value)} 
                        />
                     </div>
                     <Label className="cursor-pointer">
                       <div className="flex items-center gap-2 px-3 md:px-4 h-10 rounded-xl bg-primary text-foreground font-bold text-xs md:text-sm transition-all hover:bg-primary/90 whitespace-nowrap">
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
                         className="absolute top-1 right-1 p-1.5 bg-destructive text-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                 {features?.lucky_numbers_enabled && (
                   <Button size="sm" onClick={() => set("lucky_numbers_prizes", [...form.lucky_numbers_prizes, {number: "", prize: "", protected: true}])}>
                     <Plus className="h-4 w-4 mr-2" /> Nova Cota
                   </Button>
                 )}
               </div>
               
               {!features?.lucky_numbers_enabled ? (
                  <div className="text-center py-12 bg-secondary/20 rounded-3xl border border-dashed border-border">
                    <ShieldAlert className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-30" />
                    <p className="text-sm font-bold text-muted-foreground">Recurso Desabilitado</p>
                    <p className="text-[10px] text-muted-foreground/60 max-w-xs mx-auto mt-1 uppercase font-black italic">Entre em contato com o suporte para ativar as cotas premiadas.</p>
                  </div>
               ) : (
                <div className="grid gap-3">
                 {form.lucky_numbers_prizes.map((p, i) => (
                   <div key={i} className="flex gap-4 items-center bg-secondary/50 p-4 rounded-2xl border border-border transition-all hover:border-amber-200">
                     <div className="w-32">
                       <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1.5 block">Nº da Cota</Label>
                       <Input 
                         placeholder="Ex: 5485" 
                         className="bg-card font-mono font-bold text-center"
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
                         className="bg-card"
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
                     <Button variant="ghost" size="icon" className="mt-5 text-foreground hover:text-destructive hover:bg-destructive/5" onClick={() => {
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
               )}
             </Card>

             <Card className="p-6 rounded-2xl border-border shadow-sm mt-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">Sorteio de Maior e Menor Cota</h3>
                    <p className="text-sm text-muted-foreground">Configure prêmios para quem comprar o maior e o menor número em um período.</p>
                  </div>
                  <Button size="sm" onClick={() => set("ranking_prizes", [...form.ranking_prizes, {id: crypto.randomUUID(), title: "", start_date: "", end_date: "", prize_maior: "", prize_menor: "", active: false}])}>
                    <Plus className="h-4 w-4 mr-2" /> Novo Sorteio
                  </Button>
                </div>

                <div className="grid gap-4">
                  {form.ranking_prizes.map((p, i) => (
                    <div key={p.id} className="p-6 rounded-2xl border border-border bg-secondary/20 space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Título do Evento</Label>
                          <Input 
                            placeholder="Ex: Sorteio das 19h" 
                            value={p.title} 
                            onChange={(e) => {
                              const n = [...form.ranking_prizes];
                              n[i].title = e.target.value;
                              set("ranking_prizes", n);
                            }} 
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-5">
                          <Label className="text-xs font-bold">Ativar</Label>
                          <Switch 
                            checked={p.active} 
                            onCheckedChange={(v) => {
                              const n = form.ranking_prizes.map((item, idx) => ({
                                ...item,
                                active: idx === i ? v : false // Only one can be active at a time
                              }));
                              set("ranking_prizes", n);
                            }} 
                          />
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                            const n = [...form.ranking_prizes];
                            n.splice(i, 1);
                            set("ranking_prizes", n);
                          }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Início do Período</Label>
                          <Input 
                            type="datetime-local" 
                            value={p.start_date.slice(0, 16)} 
                            onChange={(e) => {
                              const n = [...form.ranking_prizes];
                              n[i].start_date = new Date(e.target.value).toISOString();
                              set("ranking_prizes", n);
                            }} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fim do Período (Sorteio)</Label>
                          <Input 
                            type="datetime-local" 
                            value={p.end_date.slice(0, 16)} 
                            onChange={(e) => {
                              const n = [...form.ranking_prizes];
                              n[i].end_date = new Date(e.target.value).toISOString();
                              set("ranking_prizes", n);
                            }} 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Prêmio Maior Cota</Label>
                          <Input 
                            placeholder="Ex: R$ 50,00 no PIX" 
                            value={p.prize_maior} 
                            onChange={(e) => {
                              const n = [...form.ranking_prizes];
                              n[i].prize_maior = e.target.value;
                              set("ranking_prizes", n);
                            }} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Prêmio Menor Cota</Label>
                          <Input 
                            placeholder="Ex: R$ 50,00 no PIX" 
                            value={p.prize_menor} 
                            onChange={(e) => {
                              const n = [...form.ranking_prizes];
                              n[i].prize_menor = e.target.value;
                              set("ranking_prizes", n);
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {form.ranking_prizes.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-3xl text-muted-foreground bg-secondary/5 hidden md:block">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm font-medium">Nenhum sorteio periódico configurado.</p>
                      <p className="text-[10px] mt-1">Crie eventos para incentivar vendas em horários específicos!</p>
                    </div>
                  )}
                </div>
             </Card>

             <Card className="p-6 rounded-2xl border-border shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">Regras de Prêmios (Automação)</h3>
                    <p className="text-sm text-muted-foreground">Configure regras automáticas para destacar prêmios como Maior/Menor Cota.</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => set("prize_rules", [...form.prize_rules, { type: "greater_smaller", label: "Maior e Menor Cota", active: true }])}>
                    <Plus className="h-4 w-4 mr-2" /> Nova Regra
                  </Button>
                </div>

                <div className="space-y-4">
                  {form.prize_rules.map((rule, i) => (
                    <div key={i} className="p-6 bg-secondary/30 rounded-2xl border border-border space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Select 
                            value={rule.type} 
                            onValueChange={(v) => {
                              const n = [...form.prize_rules];
                              n[i].type = v;
                              set("prize_rules", n);
                            }}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Tipo de Regra" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="greater_smaller">Maior e Menor Cota</SelectItem>
                            </SelectContent>
                          </Select>
                          <Switch 
                            checked={rule.active} 
                            onCheckedChange={(v) => {
                              const n = [...form.prize_rules];
                              n[i].active = v;
                              set("prize_rules", n);
                            }} 
                          />
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                          const n = [...form.prize_rules];
                          n.splice(i, 1);
                          set("prize_rules", n);
                        }}><Trash2 className="h-4 w-4" /></Button>
                      </div>

                      {rule.type === 'greater_smaller' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold">Prêmio Maior Cota</Label>
                            <Input 
                              placeholder="Ex: R$ 500,00 no PIX" 
                              value={rule.prize_greater || ""} 
                              onChange={(e) => {
                                const n = [...form.prize_rules];
                                n[i].prize_greater = e.target.value;
                                set("prize_rules", n);
                              }} 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold">Prêmio Menor Cota</Label>
                            <Input 
                              placeholder="Ex: R$ 200,00 no PIX" 
                              value={rule.prize_smaller || ""} 
                              onChange={(e) => {
                                const n = [...form.prize_rules];
                                n[i].prize_smaller = e.target.value;
                                set("prize_rules", n);
                              }} 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
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

          <TabsContent value="success_flow" className="mt-6 space-y-6">
            <Card className="p-6 rounded-2xl border-border shadow-sm">
               <div className="flex items-center gap-2 mb-6">
                 <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                   <Crown className="h-5 w-5" />
                 </div>
                 <div className="flex-1">
                   <h3 className="text-lg font-bold">Fluxo de Pós-Venda (Check-out)</h3>
                   <p className="text-sm text-muted-foreground">Configure o que o cliente vê após o pagamento ser confirmado</p>
                 </div>
               </div>

               <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
                   <div className="space-y-4">
                     <div className="flex items-center justify-between">
                       <Label className="font-bold">Oferta de Upsell (Aumentar Sorte)</Label>
                       <Switch checked={form.upsell_enabled} onCheckedChange={(v) => set("upsell_enabled", v)} />
                     </div>
                     <p className="text-[11px] text-muted-foreground leading-relaxed">Mostra um vídeo e um cronômetro após o pagamento, incentivando o cliente a comprar mais cotas com "melhores chances".</p>
                     
                     {form.upsell_enabled && (
                       <div className="space-y-4 pt-2">
                         <div className="space-y-2">
                           <Label className="text-xs">URL do Vídeo (Embed)</Label>
                           <Input placeholder="Ex: https://www.youtube.com/embed/..." value={form.upsell_video_url} onChange={(e) => set("upsell_video_url", e.target.value)} />
                         </div>
                         <div className="space-y-2">
                           <Label className="text-xs">Texto da Oferta</Label>
                           <Textarea placeholder="Ex: Garanta agora mais números com 98% de chance..." value={form.upsell_offer_text} onChange={(e) => set("upsell_offer_text", e.target.value)} />
                         </div>
                         <div className="space-y-2">
                           <Label className="text-xs">Porcentagem de Chance (Texto)</Label>
                           <Input placeholder="Ex: 98%" value={form.upsell_probability} onChange={(e) => set("upsell_probability", e.target.value)} />
                         </div>
                       </div>
                     )}
                   </div>

                   <div className="space-y-4">
                     <Label className="font-bold">Comunidade VIP (WhatsApp/Telegram)</Label>
                     <p className="text-[11px] text-muted-foreground leading-relaxed">Convida o cliente a entrar em um grupo exclusivo após o pagamento.</p>
                     
                     <div className="space-y-4 pt-2">
                       <div className="space-y-2">
                         <Label className="text-xs">Link do Grupo</Label>
                         <Input placeholder="Ex: https://chat.whatsapp.com/..." value={form.vip_group_link} onChange={(e) => set("vip_group_link", e.target.value)} />
                       </div>
                       <div className="space-y-2">
                         <Label className="text-xs">URL do Vídeo de Convite (Embed)</Label>
                         <Input placeholder="Ex: https://www.youtube.com/embed/..." value={form.vip_group_video_url} onChange={(e) => set("vip_group_video_url", e.target.value)} />
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
            </Card>
          </TabsContent>

          <TabsContent value="layout" className="mt-6 space-y-6">
            <Card className="p-6 rounded-2xl border-border shadow-sm">
               <div className="flex items-center gap-2 mb-6">
                 <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                   <Settings2 className="h-5 w-5" />
                 </div>
                 <h3 className="text-lg font-bold">Personalização do Layout</h3>
               </div>
               
               <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border">
                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-bold">Exibir Cronômetro</Label>
                        <p className="text-[11px] text-muted-foreground">Contagem regressiva na página</p>
                      </div>
                      <Switch checked={form.show_timer} onCheckedChange={(v) => set("show_timer", v)} />
                    </div>
                    {form.show_timer && (
                      <div className="space-y-2">
                        <Label>Data Final do Cronômetro</Label>
                        <Input 
                          type="datetime-local" 
                          value={form.timer_end_date} 
                          onChange={(e) => set("timer_end_date", e.target.value)} 
                          className={cn(
                            form.draw_date && form.timer_end_date && new Date(form.timer_end_date) > new Date(form.draw_date) && "border-destructive focus-visible:ring-destructive"
                          )}
                        />
                        <p className="text-[10px] text-muted-foreground italic">Caso vazio, usará a data do sorteio.</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base font-bold">Ordem das Seções</Label>
                    <p className="text-xs text-muted-foreground mb-4">Arraste para reordenar como os elementos aparecem na página da campanha.</p>
                    
                    <div className="grid gap-2">
                      {form.sections_order.map((section, index) => (
                        <div key={section} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl shadow-sm">
                          <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground font-bold text-xs">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold capitalize">
                              {section === 'gallery' ? 'Galeria de Imagens' :
                               section === 'header' ? 'Título e Informações' :
                               section === 'progress' ? 'Barra de Progresso' :
                               section === 'purchase' ? 'Área de Compra' :
                               section === 'description' ? 'Descrição da Rifa' :
                               section === 'prizes' ? 'Cotas Premiadas' :
                               section === 'roulette_footer' ? 'Simulador de Roleta (Final)' :
                               section === 'scratch_footer' ? 'Simulador de Raspadinha (Final)' :
                               section === 'winners' ? 'Histórico de Ganhadores' :
                               section === 'ranking' ? 'Ranking de Compradores' : section}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              disabled={index === 0}
                              onClick={() => {
                                const newOrder = [...form.sections_order];
                                [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
                                set("sections_order", newOrder);
                              }}
                            >
                              <ArrowLeft className="h-4 w-4 rotate-90" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              disabled={index === form.sections_order.length - 1}
                              onClick={() => {
                                const newOrder = [...form.sections_order];
                                [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
                                set("sections_order", newOrder);
                              }}
                            >
                              <ArrowLeft className="h-4 w-4 -rotate-90" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
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
                    <Label>Concurso da Federal</Label>
                    <Input value={form.concurso} onChange={(e) => set("concurso", e.target.value)} placeholder="Ex: 5867" />
                  </div>
                  <div className="space-y-2">
                    <Label>Link do Sorteio ao Vivo (YouTube)</Label>
                    <Input value={form.live_stream_url} onChange={(e) => set("live_stream_url", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
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

          <TabsContent value="lucky_hour" className="mt-6 space-y-6">
            <LuckyHourManager campaignId={id || ""} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
