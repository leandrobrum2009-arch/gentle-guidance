import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Settings, Save, ShieldCheck, Percent, DollarSign, MessageSquare, Layout, Globe, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function AdminSettings() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("site_settings").select("*");
    if (!error) setSettings(data);
    setLoading(false);
  };

  const handleUpdate = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
  };

  const saveSettings = async () => {
    setSaving(true);
    for (const s of settings) {
      await supabase.from("site_settings").update({ value: s.value }).eq("key", s.key);
    }
    setSaving(false);
    toast.success("Configurações salvas com sucesso!");
  };

  const getIcon = (key: string) => {
    if (key.includes('cashback') || key.includes('percent')) return <Percent className="h-4 w-4" />;
    if (key.includes('amount') || key.includes('withdrawal')) return <DollarSign className="h-4 w-4" />;
    if (key.includes('whatsapp') || key.includes('support')) return <MessageSquare className="h-4 w-4" />;
    if (key.includes('hero_style')) return <Layout className="h-4 w-4" />;
    return <Settings className="h-4 w-4" />;
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">Configurações do Sistema</h1>
          <p className="text-muted-foreground mt-1">Ajuste taxas, limites e informações de contato.</p>
        </div>
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="bg-primary hover:bg-primary/90 text-foreground font-bold shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] border-none"
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salvar Alterações
        </Button>
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
                ) : (
                  <Input 
                    value={s.value} 
                    onChange={(e) => handleUpdate(s.key, e.target.value)}
                    className="border-border bg-secondary/20 text-foreground focus:border-primary/50 font-bold"
                  />
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
