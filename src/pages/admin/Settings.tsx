import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Settings, Save, Percent, DollarSign, MessageSquare, Layout, Globe, Image as ImageIcon, Zap, Sparkles, MousePointer2, Palette, Sliders, CreditCard, Upload, Trash2, Check, Smartphone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function AdminSettings() {
  const [settings, setSettings] = useState<any[]>([]);
  const [initialSettings, setInitialSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const settingNames: Record<string, string> = {
    hero_transition_speed: "Velocidade do Slide (ms)",
    button_glow_speed: "Velocidade do Brilho do Botão",
    title_shimmer_speed: "Velocidade do Brilho do Título",
    button_hover_effect: "Efeito Hover nos Botões",
    border_shimmer_opacity: "Opacidade da Borda",
    animation_easing: "Curva de Animação",
    button_glow_intensity: "Intensidade do Brilho",
    primary_color: "Cor Primária do Sistema",
    title_shimmer_primary: "Cor de Destaque do Título",
    title_shimmer_secondary: "Cor Secundária (Dark)",
    title_shimmer_secondary_light: "Cor Secundária (Light)",
    home_hero_style: "Estilo do Carrossel Principal",
    hero_transition_type: "Tipo de Transição",
    site_name: "Nome da Plataforma",
    site_logo_url: "Logotipo Principal",
    support_whatsapp: "WhatsApp de Atendimento",
    cashback_percent: "% de Cashback por Compra",
    affiliate_commission_percent: "% de Comissão de Afiliados",
    min_withdrawal_amount: "Valor Mínimo de Saque (R$)",
    company_name: "Nome Fantasia / Razão Social",
    company_cnpj: "CNPJ",
    company_address: "Endereço Completo",
    company_phone: "Telefone de Contato",
    company_email: "E-mail de Contato",
    home_marquee_enabled: "Habilitar Faixa de Texto",
    home_marquee_text: "Texto da Faixa Corrida",
    mercadopago_access_token: "Mercado Pago: Access Token",
    mercadopago_public_key: "Mercado Pago: Public Key",
    manual_payment_enabled: "Pagamento Manual (PIX)",
    manual_payment_pix_key: "Chave PIX Manual",
    manual_payment_pix_name: "Nome do Titular PIX",
    paggue_client_key: "Paggue: Client Key",
    paggue_client_secret: "Paggue: Client Secret",
    active_payment_provider: "Provedor de Pagamento Ativo"
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("site_settings").select("*");
    if (!error) {
      setSettings(data);
      setInitialSettings(JSON.parse(JSON.stringify(data)));
    }
    setLoading(false);
  };

  const handleUpdate = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const handleUpload = async (key: string, file: File) => {
    setUploading(key);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${key}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `settings/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);

      handleUpdate(key, publicUrl);
      toast.success("Imagem enviada com sucesso!");
    } catch (error: any) {
      toast.error("Erro no upload: " + error.message);
    } finally {
      setUploading(null);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      for (const s of settings) {
        const initial = initialSettings.find(i => i.key === s.key);
        if (initial && initial.value !== s.value) {
          await supabase.from("site_settings").update({ value: s.value }).eq("key", s.key);
        }
      }
      setInitialSettings(JSON.parse(JSON.stringify(settings)));
      toast.success("Todas as configurações foram atualizadas!");
      // Force refresh data in hooks if needed, or user can just refresh
    } catch (error) {
      toast.error("Erro ao salvar algumas configurações.");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  const getIcon = (key: string) => {
    if (key.includes('cashback') || key.includes('percent')) return <Percent className="h-4 w-4" />;
    if (key.includes('amount') || key.includes('withdrawal')) return <DollarSign className="h-4 w-4" />;
    if (key.includes('whatsapp') || key.includes('support') || key.includes('phone')) return <MessageSquare className="h-4 w-4" />;
    if (key.includes('hero_style') || key.includes('marquee')) return <Layout className="h-4 w-4" />;
    if (key.includes('site_name') || key.includes('company_name')) return <Globe className="h-4 w-4" />;
    if (key.includes('logo')) return <ImageIcon className="h-4 w-4" />;
    if (key.includes('transition') || key.includes('speed')) return <Zap className="h-4 w-4" />;
    if (key.includes('shimmer') || key.includes('glow')) return <Sparkles className="h-4 w-4" />;
    if (key.includes('hover')) return <MousePointer2 className="h-4 w-4" />;
    if (key.includes('color')) return <Palette className="h-4 w-4" />;
    if (key.includes('opacity') || key.includes('easing')) return <Sliders className="h-4 w-4" />;
    if (key.includes('mercadopago') || key.includes('manual_payment') || key.includes('paggue') || key.includes('payment_provider')) return <CreditCard className="h-4 w-4" />;
    return <Settings className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">Painel de Configurações</h1>
          <p className="text-muted-foreground text-sm">Personalize a identidade visual e as regras do seu sistema.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSettings} disabled={saving}>
            Descartar
          </Button>
          <Button onClick={saveSettings} disabled={saving || !hasChanges} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Tudo
          </Button>
        </div>
      </div>

      <Tabs defaultValue="visual" className="space-y-6">
        <TabsList className="bg-secondary/50 p-1 rounded-xl h-12 w-full justify-start overflow-x-auto overflow-y-hidden">
          <TabsTrigger value="visual" className="rounded-lg px-6 data-[state=active]:bg-background">Visual & Design</TabsTrigger>
          <TabsTrigger value="payment" className="rounded-lg px-6 data-[state=active]:bg-background">Pagamentos</TabsTrigger>
          <TabsTrigger value="finance" className="rounded-lg px-6 data-[state=active]:bg-background">Financeiro</TabsTrigger>
          <TabsTrigger value="company" className="rounded-lg px-6 data-[state=active]:bg-background">Empresa</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-8 outline-none">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5 text-primary" /> Identidade Principal
                </CardTitle>
                <CardDescription>Nome e Logotipo da sua plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SettingField 
                  s={settings.find(s => s.key === 'site_name')} 
                  onUpdate={handleUpdate} 
                  label={settingNames['site_name']}
                  getIcon={getIcon}
                />
                <SettingField 
                  s={settings.find(s => s.key === 'site_logo_url')} 
                  onUpdate={handleUpdate} 
                  label={settingNames['site_logo_url']}
                  getIcon={getIcon}
                  onUpload={handleUpload}
                  uploading={uploading === 'site_logo_url'}
                />
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="h-5 w-5 text-primary" /> Cores do Sistema
                </CardTitle>
                <CardDescription>Defina a paleta de cores predominante</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SettingField 
                  s={settings.find(s => s.key === 'primary_color')} 
                  onUpdate={handleUpdate} 
                  label={settingNames['primary_color']}
                  getIcon={getIcon}
                />
                <div className="grid grid-cols-2 gap-4">
                  <SettingField 
                    s={settings.find(s => s.key === 'title_shimmer_primary')} 
                    onUpdate={handleUpdate} 
                    label={settingNames['title_shimmer_primary']}
                    getIcon={getIcon}
                  />
                  <SettingField 
                    s={settings.find(s => s.key === 'title_shimmer_secondary')} 
                    onUpdate={handleUpdate} 
                    label={settingNames['title_shimmer_secondary']}
                    getIcon={getIcon}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Layout className="h-5 w-5 text-primary" /> Layout & Carrossel
                </CardTitle>
                <CardDescription>Configurações de exibição da Home</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <SettingField 
                    s={settings.find(s => s.key === 'home_hero_style')} 
                    onUpdate={handleUpdate} 
                    label={settingNames['home_hero_style']}
                    getIcon={getIcon}
                    type="select"
                    options={[
                      { label: "Estilo Moderno (Grid)", value: "1" },
                      { label: "Estilo Clássico (Full)", value: "2" },
                      { label: "Estilo Minimalista", value: "3" }
                    ]}
                  />
                  <SettingField 
                    s={settings.find(s => s.key === 'hero_transition_type')} 
                    onUpdate={handleUpdate} 
                    label={settingNames['hero_transition_type']}
                    getIcon={getIcon}
                    type="select"
                    options={[
                      { label: "Deslizar (Slide)", value: "slide" },
                      { label: "Esmaecer (Fade)", value: "fade" },
                      { label: "Zoom", value: "zoom" }
                    ]}
                  />
                  <SettingField 
                    s={settings.find(s => s.key === 'hero_transition_speed')} 
                    onUpdate={handleUpdate} 
                    label={settingNames['hero_transition_speed']}
                    getIcon={getIcon}
                  />
                  <SettingField 
                    s={settings.find(s => s.key === 'animation_easing')} 
                    onUpdate={handleUpdate} 
                    label={settingNames['animation_easing']}
                    getIcon={getIcon}
                    type="select"
                    options={[
                      { label: "Suave (Ease-in-out)", value: "cubic-bezier(0.4, 0, 0.2, 1)" },
                      { label: "Linear", value: "linear" },
                      { label: "Rebote (Bounce)", value: "cubic-bezier(0.68, -0.55, 0.27, 1.55)" }
                    ]}
                  />
                   <SettingField 
                    s={settings.find(s => s.key === 'home_marquee_enabled')} 
                    onUpdate={handleUpdate} 
                    label={settingNames['home_marquee_enabled']}
                    getIcon={getIcon}
                  />
                  <SettingField 
                    s={settings.find(s => s.key === 'home_marquee_text')} 
                    onUpdate={handleUpdate} 
                    label={settingNames['home_marquee_text']}
                    getIcon={getIcon}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6 outline-none">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
             <div className="bg-primary/10 p-4 border-b border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-bold text-sm">Controle de Pagamentos</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Escolha qual meio de pagamento será utilizado</p>
                  </div>
                </div>
                <div className="w-64">
                   <SettingField 
                    s={settings.find(s => s.key === 'active_payment_provider')} 
                    onUpdate={handleUpdate} 
                    label=""
                    getIcon={() => null}
                    type="select"
                    options={[
                      { label: "Mercado Pago (Recomendado)", value: "mercadopago" },
                      { label: "Paggue", value: "paggue" },
                      { label: "Manual (Apenas PIX)", value: "manual" }
                    ]}
                  />
                </div>
             </div>
             
             <div className="p-6 grid gap-8 lg:grid-cols-3">
                {/* Mercado Pago */}
                <div className="space-y-4 p-5 rounded-2xl bg-secondary/20 border border-border/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-[#009EE3] flex items-center justify-center text-white">
                      <span className="font-black">MP</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Mercado Pago</h4>
                      <p className="text-[10px] text-muted-foreground font-bold">API Oficial</p>
                    </div>
                  </div>
                  <SettingField 
                    s={settings.find(s => s.key === 'mercadopago_public_key')} 
                    onUpdate={handleUpdate} 
                    label="Public Key"
                    getIcon={getIcon}
                  />
                  <SettingField 
                    s={settings.find(s => s.key === 'mercadopago_access_token')} 
                    onUpdate={handleUpdate} 
                    label="Access Token"
                    getIcon={getIcon}
                    type="password"
                  />
                </div>

                {/* Paggue */}
                <div className="space-y-4 p-5 rounded-2xl bg-secondary/20 border border-border/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                      <span className="font-black">PG</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Paggue</h4>
                      <p className="text-[10px] text-muted-foreground font-bold">Integração PIX</p>
                    </div>
                  </div>
                  <SettingField 
                    s={settings.find(s => s.key === 'paggue_client_key')} 
                    onUpdate={handleUpdate} 
                    label="Client Key"
                    getIcon={getIcon}
                  />
                  <SettingField 
                    s={settings.find(s => s.key === 'paggue_client_secret')} 
                    onUpdate={handleUpdate} 
                    label="Client Secret"
                    getIcon={getIcon}
                    type="password"
                  />
                </div>

                {/* Manual */}
                <div className="space-y-4 p-5 rounded-2xl bg-secondary/20 border border-border/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center text-white">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Pagamento Manual</h4>
                      <p className="text-[10px] text-muted-foreground font-bold">Confirmação via Chat</p>
                    </div>
                  </div>
                  <SettingField 
                    s={settings.find(s => s.key === 'manual_payment_enabled')} 
                    onUpdate={handleUpdate} 
                    label="Habilitar PIX Manual"
                    getIcon={getIcon}
                  />
                  <SettingField 
                    s={settings.find(s => s.key === 'manual_payment_pix_key')} 
                    onUpdate={handleUpdate} 
                    label="Chave PIX"
                    getIcon={getIcon}
                  />
                  <SettingField 
                    s={settings.find(s => s.key === 'manual_payment_pix_name')} 
                    onUpdate={handleUpdate} 
                    label="Nome do Titular"
                    getIcon={getIcon}
                  />
                </div>
             </div>
          </Card>
        </TabsContent>

        <TabsContent value="finance" className="space-y-6 outline-none">
           <div className="grid gap-6 md:grid-cols-3">
              {['cashback_percent', 'affiliate_commission_percent', 'min_withdrawal_amount', 'support_whatsapp'].map(key => (
                 <SettingField 
                  key={key}
                  s={settings.find(s => s.key === key)} 
                  onUpdate={handleUpdate} 
                  label={settingNames[key]}
                  getIcon={getIcon}
                />
              ))}
           </div>
        </TabsContent>

        <TabsContent value="company" className="space-y-6 outline-none">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Informações Legais</CardTitle>
              <CardDescription>Estes dados aparecem no rodapé e nos termos do site</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              {settings.filter(s => s.key.includes('company_')).map(s => (
                 <SettingField 
                  key={s.id}
                  s={s} 
                  onUpdate={handleUpdate} 
                  label={settingNames[s.key]}
                  getIcon={getIcon}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

function SettingField({ 
  s, 
  onUpdate, 
  getIcon, 
  label, 
  type = "text", 
  options = [],
  onUpload,
  uploading
}: { 
  s: any, 
  onUpdate: any, 
  getIcon: any, 
  label: string,
  type?: "text" | "password" | "select" | "boolean" | "color",
  options?: { label: string, value: string }[],
  onUpload?: (key: string, file: File) => void,
  uploading?: boolean
}) {
  if (!s) return null;

  const isBoolean = s.value === 'true' || s.value === 'false';
  const isColor = s.key.includes('color') || s.key.includes('shimmer_primary') || s.key.includes('shimmer_secondary');
  const isImage = s.key.includes('logo') || s.key.includes('image_url');

  const renderInput = () => {
    if (isBoolean) {
      return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
          <span className="text-xs font-bold uppercase tracking-wider">{s.value === 'true' ? 'Ativado' : 'Desativado'}</span>
          <Switch checked={s.value === 'true'} onCheckedChange={(checked) => onUpdate(s.key, checked.toString())} />
        </div>
      );
    }

    if (type === "select") {
      return (
        <Select value={s.value} onValueChange={(val) => onUpdate(s.key, val)}>
          <SelectTrigger className="w-full bg-secondary/30 border-border/50 h-11 rounded-xl font-bold">
            <SelectValue placeholder="Selecione uma opção" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {options.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (isColor) {
      return (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input 
              value={s.value} 
              onChange={(e) => onUpdate(s.key, e.target.value)} 
              className="pl-12 bg-secondary/30 border-border/50 h-11 rounded-xl font-mono text-xs uppercase" 
            />
            <div 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg border border-border shadow-sm pointer-events-none"
              style={{ backgroundColor: s.value }}
            />
          </div>
          <Input 
            type="color" 
            value={s.value} 
            onChange={(e) => onUpdate(s.key, e.target.value)}
            className="w-12 h-11 p-1 bg-secondary/30 border-border/50 rounded-xl cursor-pointer"
          />
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="space-y-4">
           {s.value && (
             <div className="relative group aspect-[3/1] rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-secondary/10">
                <img src={s.value} alt="Preview" className="max-h-full max-w-full object-contain p-4" />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-8 w-8"
                  onClick={() => onUpdate(s.key, "")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
             </div>
           )}
           <div className="flex gap-2">
              <Input 
                value={s.value} 
                placeholder="URL da imagem..."
                onChange={(e) => onUpdate(s.key, e.target.value)} 
                className="flex-1 bg-secondary/30 border-border/50 h-11 rounded-xl" 
              />
              <div className="relative">
                <Input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && onUpload?.(s.key, e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <Button variant="secondary" className="h-11 rounded-xl px-4" disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
              </div>
           </div>
        </div>
      );
    }

    return (
      <Input 
        type={type}
        value={s.value} 
        onChange={(e) => onUpdate(s.key, e.target.value)} 
        className="bg-secondary/30 border-border/50 h-11 rounded-xl" 
      />
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="p-1 rounded bg-primary/5 text-primary">{getIcon(s.key)}</div>
        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{label || s.key}</Label>
      </div>
      {renderInput()}
    </div>
  );
}