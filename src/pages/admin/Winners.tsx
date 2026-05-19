import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { useAdminWinners, useAdminCampaigns } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Search, Trophy, ExternalLink, Calendar, User, Gift } from "lucide-react";
import { format } from "date-fns";

interface WinnerForm {
  campaign_id: string;
  winner_name: string;
  ticket_number: string;
  prize_description: string;
  phone_masked: string;
  video_url: string;
  draw_date: string;
  avatar_url: string;
}

const empty: WinnerForm = {
  campaign_id: "", winner_name: "", ticket_number: "",
  prize_description: "", phone_masked: "", video_url: "", draw_date: "",
  avatar_url: "",
};

export default function AdminWinners() {
  const { data: winners, isLoading } = useAdminWinners();
  const { data: campaigns } = useAdminCampaigns();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<WinnerForm>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");

  const set = (k: keyof WinnerForm, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    try {
      setUploading(true);

      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error("O arquivo não é uma imagem válida (JPG, PNG, WebP ou GIF).");
      }
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("O arquivo é muito grande. O tamanho máximo permitido é 5MB.");
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

      set("avatar_url", publicUrl);
      toast({ title: "Sucesso", description: "Foto enviada com sucesso!" });
    } catch (error: any) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("winners").insert({
      campaign_id: form.campaign_id,
      winner_name: form.winner_name,
      ticket_number: form.ticket_number,
      prize_description: form.prize_description,
      phone_masked: form.phone_masked || null,
      video_url: form.video_url || null,
      draw_date: form.draw_date,
    });
    setSaving(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Ganhador registrado!" });
    queryClient.invalidateQueries({ queryKey: ["admin-winners"] });
    queryClient.invalidateQueries({ queryKey: ["winners"] });
    setForm(empty);
    setOpen(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Remover este ganhador?")) return;
    const { error } = await supabase.from("winners").delete().eq("id", id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Ganhador removido" });
    queryClient.invalidateQueries({ queryKey: ["admin-winners"] });
    queryClient.invalidateQueries({ queryKey: ["winners"] });
  };

  const valid = form.campaign_id && form.winner_name && form.ticket_number && form.prize_description && form.draw_date;

  const filteredWinners = useMemo(() => {
    if (!winners) return [];
    return winners.filter(w => {
      const searchLower = search.toLowerCase();
      return (
        w.winner_name.toLowerCase().includes(searchLower) ||
        (w.campaigns?.title || "").toLowerCase().includes(searchLower) ||
        w.ticket_number.toLowerCase().includes(searchLower)
      );
    });
  }, [winners, search]);

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Ganhadores</h1>
          <p className="text-muted-foreground mt-1">Publique e gerencie os vencedores das campanhas.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Ganhadores</p>
            <p className="text-xl font-bold text-white leading-none">{winners?.length || 0}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome, rifa ou número..." 
            className="pl-10 border-white/5 bg-[#0d0d0f]/50 text-white focus:border-primary/50 h-12 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => { setForm(empty); setOpen(true); }}
                className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-6 rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] border-none"
              >
                <Plus className="mr-2 h-5 w-5" /> Registrar Ganhador
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-[#131316] border-white/10 text-white p-0 overflow-hidden rounded-3xl">
              <DialogHeader className="p-8 pb-0">
                <DialogTitle className="text-2xl font-bold tracking-tight">Novo Ganhador</DialogTitle>
                <DialogDescription className="text-muted-foreground">Preencha os dados do ganhador para exibir no site.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 p-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Campanha</Label>
                    <Select value={form.campaign_id} onValueChange={(v) => set("campaign_id", v)}>
                      <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-primary/50">
                        <SelectValue placeholder="Selecione a campanha *" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#131316] border-white/10 text-slate-200">
                        {campaigns?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nome do Ganhador</Label>
                      <Input placeholder="Nome completo *" className="bg-white/5 border-white/10 h-12 rounded-xl" value={form.winner_name} onChange={(e) => set("winner_name", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Número Bilhete</Label>
                      <Input placeholder="000000 *" className="bg-white/5 border-white/10 h-12 rounded-xl" value={form.ticket_number} onChange={(e) => set("ticket_number", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Descrição do Prêmio</Label>
                    <Input placeholder="Ex: iPhone 15 Pro Max *" className="bg-white/5 border-white/10 h-12 rounded-xl" value={form.prize_description} onChange={(e) => set("prize_description", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Telefone</Label>
                      <Input placeholder="(11) 9****-****" className="bg-white/5 border-white/10 h-12 rounded-xl" value={form.phone_masked} onChange={(e) => set("phone_masked", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Data do Sorteio</Label>
                      <Input type="date" className="bg-white/5 border-white/10 h-12 rounded-xl" value={form.draw_date} onChange={(e) => set("draw_date", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Link do Vídeo (Opcional)</Label>
                    <Input placeholder="https://youtube.com/..." className="bg-white/5 border-white/10 h-12 rounded-xl" value={form.video_url} onChange={(e) => set("video_url", e.target.value)} />
                  </div>
                </div>
                <Button 
                  onClick={save} 
                  disabled={saving || !valid}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 rounded-2xl text-base shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] border-none transition-all active:scale-[0.98]"
                >
                  {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Plus className="mr-2 h-5 w-5" />}
                  Registrar Vencedor
                </Button>
              </div>
            </DialogContent>
          </Dialog>
      </div>

      <Card className="border-white/5 bg-[#0d0d0f]/50 backdrop-blur-xl overflow-hidden shadow-2xl">
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm font-medium animate-pulse uppercase tracking-widest">Carregando lista de heróis...</p>
            </div>
          ) : !filteredWinners.length ? (
            <div className="py-32 text-center">
              <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-10 w-10 text-foreground" />
              </div>
              <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">Nenhum ganhador encontrado</p>
              <p className="text-muted-foreground text-xs mt-2">Os grandes vencedores aparecerão aqui.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-white/[0.02]">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest pl-8 py-5">Ganhador</TableHead>
                  <TableHead className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest py-5">Campanha</TableHead>
                  <TableHead className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest py-5">Bilhete</TableHead>
                  <TableHead className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest py-5">Prêmio</TableHead>
                  <TableHead className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest py-5">Data do Sorteio</TableHead>
                  <TableHead className="text-right text-muted-foreground font-bold uppercase text-[9px] tracking-widest pr-8 py-5">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWinners.map((w: any) => (
                  <TableRow key={w.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <TableCell className="pl-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center border border-primary/20">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-200 group-hover:text-primary transition-colors">{w.winner_name}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{w.phone_masked || "Telefone não informado"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/5 overflow-hidden">
                          {w.campaigns?.image_url && <img src={w.campaigns.image_url} className="h-full w-full object-cover" />}
                        </div>
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-tight">{w.campaigns?.title ?? "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-primary/20 text-primary border-primary/30 font-mono font-bold text-xs tracking-widest px-3 py-1">
                        {w.ticket_number}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Gift className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-sm font-bold text-white tracking-tight">{w.prize_description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{format(new Date(w.draw_date), "dd MMM, yyyy")}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex items-center justify-end gap-1">
                        {w.video_url && (
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl" onClick={() => window.open(w.video_url, '_blank')}>
                            <ExternalLink className="h-4.5 w-4.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-xl" onClick={() => remove(w.id)}>
                          <Trash2 className="h-4.5 w-4.5" />
                        </Button>
                      </div>
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
