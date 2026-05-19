import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Settings, Save, ShieldCheck, Percent, DollarSign, MessageSquare, Layout, Globe, Image, Zap, Sparkles, MousePointer2, Palette, Sliders, RotateCcw, Box, Plus, Trash2, Eye, X, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [customPresets, setCustomPresets] = useState<any[]>([]);
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [presetToPreview, setPresetToPreview] = useState<any>(null);

  const presets = [
    {
      name: "Clássico Verde",
      icon: <Box className="h-4 w-4" />,
      colors: ["#16a34a", "#22c55e", "#ffffff"],
      values: {
        primary_color: "#16a34a",
        title_shimmer_primary: "#22c55e",
        title_shimmer_secondary: "#ffffff",
        title_shimmer_secondary_light: "#000000",
        border_shimmer_color: "#22c55e"
      }
    },
    {
      name: "Ouro Premium",
      icon: <Palette className="h-4 w-4 text-amber-500" />,
      colors: ["#d4af37", "#ffd700", "#ffffff"],
      values: {
        primary_color: "#d4af37",
        title_shimmer_primary: "#ffd700",
        title_shimmer_secondary: "#ffffff",
        title_shimmer_secondary_light: "#1a1a1a",
        border_shimmer_color: "#ffd700"
      }
    },
    {
      name: "Prata Elegante",
      icon: <Palette className="h-4 w-4 text-gray-400" />,
      colors: ["#94a3b8", "#f8fafc", "#ffffff"],
      values: {
        primary_color: "#94a3b8",
        title_shimmer_primary: "#f8fafc",
        title_shimmer_secondary: "#ffffff",
        title_shimmer_secondary_light: "#334155",
        border_shimmer_color: "#cbd5e1"
      }
    },
    {
      name: "Pink Neon",
      icon: <Palette className="h-4 w-4 text-pink-500" />,
      colors: ["#db2777", "#f472b6", "#ffffff"],
      values: {
        primary_color: "#db2777",
        title_shimmer_primary: "#f472b6",
        title_shimmer_secondary: "#ffffff",
        title_shimmer_secondary_light: "#000000",
        border_shimmer_color: "#f472b6"
      }
    },
    {
      name: "Azul Profundo",
      icon: <Palette className="h-4 w-4 text-blue-600" />,
      colors: ["#2563eb", "#60a5fa", "#ffffff"],
      values: {
        primary_color: "#2563eb",
        title_shimmer_primary: "#60a5fa",
        title_shimmer_secondary: "#ffffff",
        title_shimmer_secondary_light: "#000000",
        border_shimmer_color: "#60a5fa"
      }
    }
  ];

  const defaultValues = {
    hero_transition_speed: "5000",
    button_glow_speed: "4",
    title_shimmer_speed: "10",
    button_hover_effect: "true",
    border_shimmer_opacity: "0.8",
    animation_easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    button_glow_intensity: "0.2",
    primary_color: "#16a34a",
    title_shimmer_primary: "#22c55e",
    title_shimmer_secondary: "#ffffff",
    title_shimmer_secondary_light: "#000000",
    home_hero_style: "1",
    hero_transition_type: "slide"
  };

  useEffect(() => {
    fetchSettings();
    fetchCustomPresets();
  }, []);

  const fetchCustomPresets = async () => {
    const { data, error } = await supabase.from("custom_presets").select("*").order("created_at", { ascending: false });
    if (!error) setCustomPresets(data);
  };

  const saveCustomPreset = async () => {
    if (!newPresetName.trim()) {
      toast.error("Por favor, insira um nome para o preset.");
      return;
    }

    const presetValues: Record<string, string> = {};
    settings.forEach(s => {
      // Only save keys that are part of the visual identity
      if (s.key.includes('color') || s.key.includes('shimmer') || s.key.includes('glow') || s.key.includes('transition') || s.key.includes('easing') || s.key.includes('hero_style')) {
        presetValues[s.key] = s.value;
      }
    });

    const { error } = await supabase.from("custom_presets").insert({
      name: newPresetName,
      values: presetValues
    });

    if (!error) {
      toast.success("Preset personalizado salvo!");
      setNewPresetName("");
      setIsSavingPreset(false);
      fetchCustomPresets();
    } else {
      toast.error("Erro ao salvar preset.");
    }
  };

  const deleteCustomPreset = async (id: string) => {
    const { error } = await supabase.from("custom_presets").delete().eq("id", id);
    if (!error) {
      toast.success("Preset removido.");
      fetchCustomPresets();
    } else {
      toast.error("Erro ao remover preset.");
    }
  };

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

  const applyPreset = (presetValues: any) => {
    setSettings(prev => prev.map(s => {
      if (presetValues[s.key]) {
        return { ...s, value: presetValues[s.key] };
      }
      return s;
    }));
    toast.success("Preset aplicado! Lembre-se de salvar as alterações.");
  };

  const restoreDefaults = () => {
    setSettings(prev => prev.map(s => {
      if (defaultValues[s.key as keyof typeof defaultValues]) {
        return { ...s, value: defaultValues[s.key as keyof typeof defaultValues] };
      }
      return s;
    }));
    toast.info("Configurações restauradas para o padrão. Clique em salvar para confirmar.");
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      for (const s of settings) {
        // Only update if value changed
        const initial = initialSettings.find(i => i.key === s.key);
        if (initial && initial.value !== s.value) {
          await supabase.from("site_settings").update({ value: s.value }).eq("key", s.key);
        }
      }
      setInitialSettings(JSON.parse(JSON.stringify(settings)));
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    setSettings(JSON.parse(JSON.stringify(initialSettings)));
    toast.info("Alterações descartadas.");
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings);

  const getIcon = (key: string) => {
    if (key.includes('cashback') || key.includes('percent')) return <Percent className="h-4 w-4" />;
    if (key.includes('amount') || key.includes('withdrawal')) return <DollarSign className="h-4 w-4" />;
    if (key.includes('whatsapp') || key.includes('support')) return <MessageSquare className="h-4 w-4" />;
    if (key.includes('hero_style')) return <Layout className="h-4 w-4" />;
    if (key.includes('site_name')) return <Globe className="h-4 w-4" />;
    if (key.includes('logo')) return <Image className="h-4 w-4" />;
    if (key.includes('transition') || key.includes('speed')) return <Zap className="h-4 w-4" />;
    if (key.includes('shimmer') || key.includes('glow')) return <Sparkles className="h-4 w-4" />;
    if (key.includes('hover')) return <MousePointer2 className="h-4 w-4" />;
    if (key.includes('color')) return <Palette className="h-4 w-4" />;
    if (key.includes('opacity')) return <Sliders className="h-4 w-4" />;
    return <Settings className="h-4 w-4" />;
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">Configurações do Sistema</h1>
          <p className="text-muted-foreground mt-1">Personalize a identidade visual e comportamento do site.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline"
            onClick={restoreDefaults}
            className="border-border hover:bg-secondary/20 font-bold"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restaurar Padrão
          </Button>
          <Button 
            onClick={saveSettings} 
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-foreground font-bold shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] border-none"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Presets Section */}
      <div className="mb-8 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Presets Visuais Sugeridos</h2>
            <Dialog open={isSavingPreset} onOpenChange={setIsSavingPreset}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">
                  <Plus className="mr-1 h-3 w-3" />
                  Salvar Preset Atual
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Salvar Preset Personalizado</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Dê um nome para as configurações visuais atuais para poder reutilizá-las depois.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="name" className="text-foreground">Nome do Preset</Label>
                  <Input
                    id="name"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Ex: Minimalista Azul, Neon 2026..."
                    className="mt-2 border-border bg-secondary/20 text-foreground"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSavingPreset(false)} className="border-border text-foreground hover:bg-secondary/20 font-bold">Cancelar</Button>
                  <Button onClick={saveCustomPreset} className="bg-primary hover:bg-primary/90 text-foreground font-bold">Salvar Preset</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(preset.values)}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-card/50 border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group text-left"
              >
                <div className="w-full flex justify-between items-center">
                  <div className="p-2 rounded-lg bg-secondary/50 group-hover:text-primary transition-colors">
                    {preset.icon}
                  </div>
                  <div className="flex -space-x-1">
                    {preset.colors.map((c, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border border-card shadow-sm" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <span className="w-full text-xs font-black uppercase tracking-widest">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {customPresets.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">Meus Presets Personalizados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {customPresets.map((preset) => (
                <div key={preset.id} className="relative group">
                  <button
                    onClick={() => applyPreset(preset.values)}
                    className="w-full flex flex-col items-center gap-3 p-4 rounded-2xl bg-card/50 border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group text-left"
                  >
                    <div className="w-full flex justify-between items-center">
                      <div className="p-2 rounded-lg bg-secondary/50 group-hover:text-primary transition-colors">
                        <Box className="h-4 w-4" />
                      </div>
                      <div className="flex -space-x-1">
                        {/* Try to extract some colors for the preview */}
                        {[
                          preset.values.primary_color || "#888",
                          preset.values.title_shimmer_primary || "#999",
                          preset.values.border_shimmer_color || "#aaa"
                        ].map((c, i) => (
                          <div key={i} className="w-4 h-4 rounded-full border border-card shadow-sm" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>
                    <span className="w-full text-xs font-black uppercase tracking-widest truncate pr-6">{preset.name}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCustomPreset(preset.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {loading ? (
          <div className="col-span-full flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
        ) : settings.map((s) => (
          <Card key={s.id} className="border-border bg-card/50 backdrop-blur-xl group hover:border-primary/20 transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-secondary/20 text-muted-foreground group-hover:text-primary transition-colors">
                  {getIcon(s.key)}
                </div>
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-foreground">
                  {s.key.replace(/_/g, ' ')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {s.key === 'home_hero_style' ? (
                  <Select 
                    value={s.value} 
                    onValueChange={(val) => handleUpdate(s.key, val)}
                  >
                    <SelectTrigger className="border-border bg-secondary/20 text-foreground focus:border-primary/50 font-bold">
                      <SelectValue placeholder="Selecione o estilo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Modelo 1 (Clássico Premium)</SelectItem>
                      <SelectItem value="2">Modelo 2 (Impacto Centralizado)</SelectItem>
                      <SelectItem value="3">Modelo 3 (Interativo Moderno)</SelectItem>
                      <SelectItem value="4">Modelo 4 (Visual Limpo - Sem Texto)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : s.key === 'hero_transition_type' ? (
                  <Select 
                    value={s.value} 
                    onValueChange={(val) => handleUpdate(s.key, val)}
                  >
                    <SelectTrigger className="border-border bg-secondary/20 text-foreground focus:border-primary/50 font-bold">
                      <SelectValue placeholder="Selecione a transição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slide">Deslizar (Slide)</SelectItem>
                      <SelectItem value="fade">Esmaecer (Fade)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : s.key === 'animation_easing' ? (
                  <Select 
                    value={s.value} 
                    onValueChange={(val) => handleUpdate(s.key, val)}
                  >
                    <SelectTrigger className="border-border bg-secondary/20 text-foreground focus:border-primary/50 font-bold">
                      <SelectValue placeholder="Selecione a suavização" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cubic-bezier(0.4, 0, 0.2, 1)">Elegante (Material Design)</SelectItem>
                      <SelectItem value="ease">Suave (Padrão)</SelectItem>
                      <SelectItem value="linear">Linear (Rígido)</SelectItem>
                      <SelectItem value="ease-in">Entrada Suave</SelectItem>
                      <SelectItem value="ease-out">Saída Suave</SelectItem>
                      <SelectItem value="ease-in-out">Entrada e Saída</SelectItem>
                      <SelectItem value="cubic-bezier(0.34, 1.56, 0.64, 1)">Elástico (Divertido)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (s.key.includes('color') || s.key.includes('shimmer_primary') || s.key.includes('shimmer_secondary')) ? (
                  <div className="flex gap-2">
                    <Input 
                      type="color"
                      value={s.value} 
                      onChange={(e) => handleUpdate(s.key, e.target.value)}
                      className="h-10 w-12 p-1 border-border bg-secondary/20"
                    />
                    <Input 
                      value={s.value} 
                      onChange={(e) => handleUpdate(s.key, e.target.value)}
                      className="flex-1 border-border bg-secondary/20 text-foreground focus:border-primary/50 font-bold"
                    />
                  </div>
                ) : s.key === 'button_hover_effect' ? (
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={s.value === 'true'} 
                      onCheckedChange={(checked) => handleUpdate(s.key, checked.toString())}
                    />
                    <span className="text-sm font-medium">{s.value === 'true' ? 'Ativado' : 'Desativado'}</span>
                  </div>
                ) : s.key === 'border_shimmer_opacity' || s.key === 'button_glow_intensity' ? (
                  <div className="space-y-4 pt-2">
                    <Slider 
                      min={0} 
                      max={1} 
                      step={0.1} 
                      value={[parseFloat(s.value)]} 
                      onValueChange={(val) => handleUpdate(s.key, val[0].toString())}
                    />
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <span>{s.key.includes('opacity') ? 'Invisível' : 'Sutil'}</span>
                      <span>{Math.round(parseFloat(s.value) * 100)}% de {s.key.includes('opacity') ? 'Opacidade' : 'Intensidade'}</span>
                      <span>{s.key.includes('opacity') ? 'Visível' : 'Forte'}</span>
                    </div>
                  </div>
                ) : (
                  <Input 
                    value={s.value} 
                    onChange={(e) => handleUpdate(s.key, e.target.value)}
                    className="border-border bg-secondary/20 text-foreground focus:border-primary/50 font-bold"
                  />
                )}
                {s.key === 'site_logo_url' && s.value && (
                  <div className="mt-2 p-2 rounded-lg bg-secondary/10 border border-border inline-block">
                    <img src={s.value} alt="Logo Preview" className="h-8 w-auto object-contain" />
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {s.description || "Sem descrição disponível."}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-8 rounded-3xl border border-border bg-gradient-to-br from-primary/5 to-purple-500/5 backdrop-blur-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Segurança do Sistema
            </h3>
            <p className="text-muted-foreground mt-1 max-w-md">
              Todas as alterações realizadas no painel administrativo são registradas para fins de auditoria. 
              Certifique-se de validar os valores antes de salvar.
            </p>
          </div>
          <Button variant="outline" className="border-border text-foreground hover:bg-secondary/20 h-12 px-8 rounded-xl font-bold">
            Ver Logs de Auditoria
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
