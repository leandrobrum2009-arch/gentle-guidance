import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Settings, Save, Percent, DollarSign, MessageSquare, Layout, Globe, Image, Zap, Sparkles, MousePointer2, Palette, Sliders, RotateCcw, Box, Plus, Trash2, Eye, X, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminSettings() {
  const [settings, setSettings] = useState<any[]>([]);
  const [initialSettings, setInitialSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const settingNames: Record<string, string> = {
    hero_transition_speed: "Velocidade do Slide",
    button_glow_speed: "Velocidade do Brilho do Botão",
    title_shimmer_speed: "Velocidade do Brilho do Título",
    button_hover_effect: "Efeito ao passar o mouse",
    border_shimmer_opacity: "Opacidade da Borda",
    animation_easing: "Curva de Animação",
    button_glow_intensity: "Intensidade do Brilho",
    primary_color: "Cor Primária",
    title_shimmer_primary: "Cor de Destaque do Título",
    title_shimmer_secondary: "Cor de Borda do Título (Escuro)",
    title_shimmer_secondary_light: "Cor de Borda do Título (Claro)",
    home_hero_style: "Estilo do Carrossel",
    hero_transition_type: "Tipo de Transição",
    site_name: "Nome do Site",
    site_logo_url: "Logotipo do Site",
    support_whatsapp: "WhatsApp de Suporte",
    cashback_percent: "Porcentagem de Cashback",
    affiliate_commission_percent: "Comissão de Afiliados",
    min_withdrawal_amount: "Valor Mínimo de Saque",
    company_name: "Razão Social / Nome da Empresa",
    company_cnpj: "CNPJ",
    company_address: "Endereço da Empresa",
    company_phone: "Telefone Corporativo",
    company_email: "E-mail Corporativo",
    home_marquee_enabled: "Habilitar Faixa de Texto",
    home_marquee_text: "Texto da Faixa (Marquee)",
    mercadopago_access_token: "Mercado Pago: Access Token",
    mercadopago_public_key: "Mercado Pago: Public Key",
    manual_payment_enabled: "Pagamento Manual (PIX)",
    manual_payment_pix_key: "Chave PIX Manual",
    manual_payment_pix_name: "Nome do Titular PIX",
    paggue_client_key: "Paggue: Client Key",
    paggue_client_secret: "Paggue: Client Secret"
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
      toast.success("Configurações salvas!");
    } catch (error) {
      toast.error("Erro ao salvar.");
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
    if (key.includes('logo')) return <Image className="h-4 w-4" />;
    if (key.includes('transition') || key.includes('speed')) return <Zap className="h-4 w-4" />;
    if (key.includes('shimmer') || key.includes('glow')) return <Sparkles className="h-4 w-4" />;
    if (key.includes('hover')) return <MousePointer2 className="h-4 w-4" />;
    if (key.includes('color')) return <Palette className="h-4 w-4" />;
    if (key.includes('opacity')) return <Sliders className="h-4 w-4" />;
    if (key.includes('mercadopago') || key.includes('manual_payment') || key.includes('paggue')) return <CreditCard className="h-4 w-4" />;
    return <Settings className="h-4 w-4" />;
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">Configurações do Sistema</h1>
        </div>
        <Button onClick={saveSettings} disabled={saving || !hasChanges} className="bg-primary hover:bg-primary/90 text-foreground font-bold">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar Alterações
        </Button>
      </div>

      <div className="space-y-12 pb-20">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
        ) : (
          <>
            <section className="space-y-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-primary italic">Identidade Visual</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {settings.filter(s => ['site_name', 'site_logo_url', 'primary_color', 'home_hero_style', 'home_marquee_enabled', 'home_marquee_text', 'hero_transition_type', 'hero_transition_speed', 'animation_easing'].includes(s.key)).map(s => <SettingCard key={s.id} s={s} onUpdate={handleUpdate} getIcon={getIcon} settingNames={settingNames} />)}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-emerald-500 italic">Configurações de Pagamento</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {settings.filter(s => s.key.includes('mercadopago') || s.key.includes('manual_payment') || s.key.includes('paggue')).map(s => <SettingCard key={s.id} s={s} onUpdate={handleUpdate} getIcon={getIcon} settingNames={settingNames} />)}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-blue-500 italic">Financeiro e Campanhas</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {settings.filter(s => ['cashback_percent', 'affiliate_commission_percent', 'min_withdrawal_amount', 'support_whatsapp'].includes(s.key)).map(s => <SettingCard key={s.id} s={s} onUpdate={handleUpdate} getIcon={getIcon} settingNames={settingNames} />)}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-purple-500 italic">Dados da Empresa</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {settings.filter(s => s.key.includes('company_')).map(s => <SettingCard key={s.id} s={s} onUpdate={handleUpdate} getIcon={getIcon} settingNames={settingNames} />)}
              </div>
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function SettingCard({ s, onUpdate, getIcon, settingNames }: { s: any, onUpdate: any, getIcon: any, settingNames: any }) {
  const isBoolean = s.value === 'true' || s.value === 'false';
  const isColor = s.key.includes('color') || s.key.includes('shimmer_primary') || s.key.includes('shimmer_secondary');

  return (
    <Card className="border-border bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-secondary/50 text-muted-foreground">{getIcon(s.key)}</div>
            <CardTitle className="text-xs font-black uppercase tracking-widest">{settingNames[s.key] || s.key.replace(/_/g, ' ')}</CardTitle>
          </div>
          {isBoolean && <Switch checked={s.value === 'true'} onCheckedChange={(checked) => onUpdate(s.key, checked.toString())} />}
        </div>
      </CardHeader>
      <CardContent>
        {!isBoolean && (
          <Input value={s.value} onChange={(e) => onUpdate(s.key, e.target.value)} className="border-border bg-secondary/20 text-foreground text-sm" />
        )}
        <p className="text-[10px] text-muted-foreground mt-2 italic">{s.description}</p>
      </CardContent>
    </Card>
  );
}