import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { useAdminCampaigns } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Trophy, Search, Filter, MoreHorizontal, ExternalLink, Copy, CheckCircle2, Ticket, Zap, CheckSquare, Square } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DrawCeremony } from "@/components/DrawCeremony";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const blinkingStyle = `
  @keyframes blink {
    0% { opacity: 1; transform: scale(1); box-shadow: 0 0 0px rgba(245, 158, 11, 0); }
    50% { opacity: 0.7; transform: scale(1.1); box-shadow: 0 0 15px rgba(245, 158, 11, 0.5); }
    100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0px rgba(245, 158, 11, 0); }
  }
  .animate-blink {
    animation: blink 1.5s infinite ease-in-out;
  }
`;

export default function AdminCampaigns() {
  const navigate = useNavigate();
  const { data: campaigns, isLoading } = useAdminCampaigns();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Draw Ceremony States
  const [isCeremonyOpen, setIsCeremonyOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [isManualDrawDialogOpen, setIsManualDrawDialogOpen] = useState(false);
  const [manualTicketNumber, setManualTicketNumber] = useState("");

  const remove = async (id: string) => {
    if (!confirm("Excluir esta campanha?")) return;
    const { error } = await supabase.from("campaigns").delete().eq("id", id);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Campanha excluída" });
    queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
  };

  const duplicate = async (id: string) => {
    setSaving(true);
    const { data, error } = await supabase.rpc("duplicate_campaign", { p_campaign_id: id });
    setSaving(false);
    if (error) { toast({ title: "Erro ao duplicar", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Campanha duplicada com sucesso", description: "A nova campanha foi criada como rascunho." });
    queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
  };

  const bulkDuplicate = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Deseja duplicar as ${selectedIds.length} campanhas selecionadas?`)) return;
    
    setSaving(true);
    let successCount = 0;
    let failCount = 0;

    for (const id of selectedIds) {
      const { error } = await supabase.rpc("duplicate_campaign", { p_campaign_id: id });
      if (error) {
        console.error(`Erro ao duplicar ${id}:`, error);
        failCount++;
      } else {
        successCount++;
      }
    }

    setSaving(false);
    toast({ 
      title: "Duplicação concluída", 
      description: `${successCount} sucesso(s), ${failCount} falha(s).` 
    });
    setSelectedIds([]);
    queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCampaigns.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCampaigns.map(c => c.id));
    }
  };

  const statusInfo = (s: string) => {
    switch(s) {
      case "active": return { label: "Ativa", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
      case "paused": return { label: "Pausada", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" };
      case "completed": return { label: "Finalizada", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
      case "audit": return { label: "Em Auditoria", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" };
      case "draft": return { label: "Rascunho", color: "bg-slate-500/10 text-muted-foreground border-slate-500/20" };
      default: return { label: s, color: "bg-slate-500/10 text-muted-foreground border-slate-500/20" };
    }
  };

  const startAutoDraw = (campaign: any) => {
    setSelectedCampaign(campaign);
    setManualTicketNumber("");
    setIsCeremonyOpen(true);
  };

  const openManualDrawDialog = (campaign: any) => {
    setSelectedCampaign(campaign);
    setManualTicketNumber("");
    setIsManualDrawDialogOpen(true);
  };

  const startManualDraw = () => {
    if (!manualTicketNumber) {
      toast({ title: "Erro", description: "Informe o número do bilhete.", variant: "destructive" });
      return;
    }
    setIsManualDrawDialogOpen(false);
    setIsCeremonyOpen(true);
  };

  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    return campaigns.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                           c.slug.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "all" || c.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [campaigns, search, filter]);

  return (
    <AdminLayout>
      <style>{blinkingStyle}</style>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">Campanhas</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas rifas, sorteios e prêmios.</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <Button 
              variant="outline" 
              onClick={bulkDuplicate}
              disabled={saving}
              className="border-primary/50 text-primary hover:bg-primary/10 font-bold h-12 px-6 rounded-xl"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
              Duplicar Selecionadas ({selectedIds.length})
            </Button>
          )}
          <Button 
            onClick={() => navigate("/admin/campanhas/nova")}
            className="bg-primary hover:bg-primary/90 text-foreground font-bold h-12 px-6 rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] border-none"
          >
            <Plus className="mr-2 h-5 w-5" /> Nova Campanha
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-xl overflow-hidden">
        <CardHeader className="border-b border-border bg-secondary/20 pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Buscar por título ou slug..." 
                className="pl-10 border-border bg-secondary/20 text-foreground focus:border-primary/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`cursor-pointer px-3 py-1 rounded-full transition-colors ${filter === "all" ? "bg-primary/20 border-primary/50 text-primary" : "border-border text-muted-foreground hover:bg-secondary/20"}`}
                onClick={() => setFilter("all")}
              >
                Todos
              </Badge>
              <Badge 
                variant="outline" 
                className={`cursor-pointer px-3 py-1 rounded-full transition-colors ${filter === "active" ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500" : "border-border text-muted-foreground hover:bg-secondary/20"}`}
                onClick={() => setFilter("active")}
              >
                Ativos
              </Badge>
              <Badge 
                variant="outline" 
                className={`cursor-pointer px-3 py-1 rounded-full transition-colors ${filter === "paused" ? "bg-amber-500/20 border-amber-500/50 text-amber-500" : "border-border text-muted-foreground hover:bg-secondary/20"}`}
                onClick={() => setFilter("paused")}
              >
                Pausados
              </Badge>
              <Badge 
                variant="outline" 
                className={`cursor-pointer px-3 py-1 rounded-full transition-colors ${filter === "audit" ? "bg-purple-500/20 border-purple-500/50 text-purple-500" : "border-border text-muted-foreground hover:bg-secondary/20"}`}
                onClick={() => setFilter("audit")}
              >
                Em Auditoria
              </Badge>
              <Badge 
                variant="outline" 
                className={`cursor-pointer px-3 py-1 rounded-full transition-colors ${filter === "completed" ? "bg-blue-500/20 border-blue-500/50 text-blue-500" : "border-border text-muted-foreground hover:bg-secondary/20"}`}
                onClick={() => setFilter("completed")}
              >
                Finalizados
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
               <Loader2 className="h-10 w-10 animate-spin text-primary" />
               <p className="text-muted-foreground text-sm font-medium animate-pulse">Carregando campanhas...</p>
             </div>
          ) : (
            <Table className="min-w-[800px]">
               <TableHeader className="bg-card/[0.02]">
                 <TableRow className="hover:bg-transparent border-border">
                   <TableHead className="w-12 pl-6">
                     <Checkbox 
                       checked={selectedIds.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                       onCheckedChange={toggleSelectAll}
                     />
                   </TableHead>
                   <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest py-4">Campanha</TableHead>
                   <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest py-4 text-center">Status</TableHead>
                   <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest py-4">Valores</TableHead>
                   <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest py-4">Progresso</TableHead>
                   <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest py-4 text-center">Resultado</TableHead>
                   <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest py-4 text-right pr-6">Ações</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {filteredCampaigns.map((c) => {
                   const info = statusInfo(c.status);
                    const rawProgress = (c.sold_tickets / c.total_tickets) * 100;
                    const progress = Math.min(Math.round(rawProgress), 100);
                    const progressDisplay = rawProgress > 0 && rawProgress < 1 ? rawProgress.toFixed(2) : progress;
                   
                   // Check if draw is needed
                   const now = new Date();
                   const endDate = c.timer_end_date ? new Date(c.timer_end_date) : null;
                   const needsDraw = (endDate && endDate < now && !c.draw_number) || (c.status === 'completed' && !c.draw_number);
                   const winner = c.winners?.[0];

                   return (
                    <TableRow key={c.id} className="border-border hover:bg-card/[0.02] transition-colors group">
                      <TableCell className="pl-6">
                        <Checkbox 
                          checked={selectedIds.includes(c.id)}
                          onCheckedChange={() => toggleSelect(c.id)}
                        />
                      </TableCell>
                      <TableCell className="py-4">
                       <div className="flex items-center gap-4">
                         <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20 border border-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
                           {c.image_url ? <img src={c.image_url} className="h-full w-full object-cover" /> : c.title.substring(0, 1)}
                         </div>
                         <div className="flex flex-col">
                           <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{c.title}</span>
                           <span className="text-[10px] text-muted-foreground font-medium font-mono">/{c.slug}</span>
                         <div className="flex items-center gap-1.5 mt-1">
                           {c.ticket_generation_type === 'auto' ? (
                             <Badge variant="outline" className="text-[8px] py-0 h-4 border-blue-500/30 text-blue-600 bg-blue-500/5 uppercase tracking-tighter">Aleatória</Badge>
                           ) : (
                             <Badge variant="outline" className="text-[8px] py-0 h-4 border-amber-500/30 text-amber-400 bg-amber-500/5 uppercase tracking-tighter">Manual</Badge>
                           )}
                           {c.federal_lottery_draw && (
                                 <Badge variant="outline" className="text-[8px] py-0 h-4 border-primary/30 text-primary bg-primary/5 uppercase tracking-tighter">Federal</Badge>
                           )}
                         </div>
                         </div>
                      </div>
                    </TableCell>
                     <TableCell className="text-center py-4">
                       <Badge className={`rounded-full px-3 font-bold text-[10px] uppercase tracking-wider ${info.color}`}>
                         {info.label}
                       </Badge>
                     </TableCell>
                     <TableCell className="py-4">
                       <div className="flex flex-col">
                         <span className="text-sm font-bold text-foreground">R$ {Number(c.ticket_price).toFixed(2)}</span>
                         <span className="text-[10px] text-muted-foreground font-medium">Preço Unitário</span>
                       </div>
                     </TableCell>
                     <TableCell className="py-4 min-w-[150px]">
                       <div className="flex flex-col gap-1.5">
                         <div className="flex justify-between items-center text-[10px] font-bold">
                           <span className="text-muted-foreground uppercase tracking-tighter">{c.sold_tickets.toLocaleString()} VENDIDOS</span>
                           <span className="text-primary">{progressDisplay}%</span>
                         </div>
                         <Progress value={progress} className="h-1.5 bg-secondary/20" />
                       </div>
                     </TableCell>
                     <TableCell className="py-4 text-center">
                       {c.draw_number ? (
                         <div className="flex flex-col items-center">
                           <Badge className="bg-primary/20 text-primary border-primary/30 font-black mb-1">{c.draw_number}</Badge>
                           {winner && <span className="text-[9px] text-muted-foreground uppercase font-bold truncate max-w-[80px]">{winner.winner_name}</span>}
                         </div>
                       ) : (
                         <span className="text-[10px] text-muted-foreground uppercase font-bold italic">Aguardando</span>
                       )}
                     </TableCell>
                     <TableCell className="text-right pr-6 py-4">
                       <div className="flex items-center justify-end gap-1">
                           {(c.status === "active" || needsDraw) && (
                             <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                 <Button 
                                   variant="ghost" 
                                   size="icon" 
                                   className={cn(
                                     "text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all",
                                     needsDraw && "animate-blink bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-500/30 h-10 w-10"
                                   )}
                                   title={needsDraw ? "AÇÃO NECESSÁRIA: REALIZAR SORTEIO" : "Realizar Sorteio"}
                                 >
                                   <Trophy className={cn("h-4.5 w-4.5", needsDraw && "h-5 w-5")} />
                                 </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                                 <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Escolha o Modo</DropdownMenuLabel>
                                 <DropdownMenuItem onClick={() => startAutoDraw(c)} className="gap-2 cursor-pointer font-bold text-xs py-3">
                                   <Zap className="h-4 w-4 text-primary" /> Sorteio Aleatório
                                 </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => openManualDrawDialog(c)} className="gap-2 cursor-pointer font-bold text-xs py-3">
                                   <Ticket className="h-4 w-4 text-amber-500" /> Escolher Ganhador
                                 </DropdownMenuItem>
                               </DropdownMenuContent>
                             </DropdownMenu>
                           )}
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           className="text-muted-foreground hover:text-foreground hover:bg-secondary/20 rounded-lg"
                           onClick={() => navigate(`/admin/campanhas/editar/${c.id}`)}
                           title="Editar"
                         >
                           <Pencil className="h-4.5 w-4.5" />
                         </Button>
                         
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-secondary/20 rounded-lg">
                               <MoreHorizontal className="h-4.5 w-4.5" />
                             </Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="w-56 border-border bg-card text-foreground">
                             <DropdownMenuLabel>Ações Avançadas</DropdownMenuLabel>
                             <DropdownMenuSeparator className="bg-secondary/20" />
                             <DropdownMenuItem onClick={() => window.open(`/campanha/${c.slug || c.id}`, '_blank')} className="gap-2 cursor-pointer">
                               <ExternalLink className="h-4 w-4 text-muted-foreground" /> Ver no Site
                             </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => duplicate(c.id)} className="gap-2 cursor-pointer">
                                <Copy className="h-4 w-4 text-muted-foreground" /> Duplicar Rifa
                              </DropdownMenuItem>
                             <DropdownMenuSeparator className="bg-secondary/20" />
                             <DropdownMenuItem onClick={() => remove(c.id)} className="gap-2 cursor-pointer text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
                               <Trash2 className="h-4 w-4" /> Excluir Definitivamente
                             </DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
                       </div>
                    </TableCell>
                  </TableRow>
                   );
                 })}
                 {filteredCampaigns.length === 0 && (
                   <TableRow>
                     <TableCell colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-16 w-16 rounded-full bg-secondary/20 flex items-center justify-center text-muted-foreground">
                            <Search className="h-8 w-8" />
                          </div>
                          <p className="text-muted-foreground font-medium">Nenhuma campanha encontrada com os filtros atuais.</p>
                          <Button variant="outline" onClick={() => { setSearch(""); setFilter("all"); }} className="border-border text-muted-foreground">Limpar Filtros</Button>
                        </div>
                     </TableCell>
                   </TableRow>
                 )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isManualDrawDialogOpen} onOpenChange={setIsManualDrawDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border-border rounded-3xl p-0 overflow-hidden">
          <div className="bg-amber-500/10 p-6 flex flex-col items-center text-center gap-2 border-b border-amber-500/10">
            <div className="h-12 w-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-2">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-xl font-black uppercase italic tracking-tighter text-foreground">
              Sorteio <span className="text-amber-500">Manual</span>
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Defina o bilhete vencedor da campanha
            </DialogDescription>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Número do Bilhete Premiado</Label>
              <Input
                placeholder="Ex: 123456"
                value={manualTicketNumber}
                onChange={(e) => setManualTicketNumber(e.target.value)}
                className="h-14 rounded-xl bg-secondary/50 border-border focus:border-amber-500/50 font-mono text-center text-2xl font-black text-amber-500 tracking-tighter"
              />
              <p className="text-[10px] text-muted-foreground font-medium italic text-center">* O bilhete deve pertencer a uma compra confirmada.</p>
            </div>

            <Button 
              onClick={startManualDraw} 
              className="w-full h-14 rounded-2xl font-black uppercase italic tracking-widest gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
            >
              INICIAR CERIMÔNIA <Trophy className="h-5 w-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DrawCeremony 
        isOpen={isCeremonyOpen}
        onOpenChange={setIsCeremonyOpen}
        campaign={selectedCampaign}
        manualNumber={manualTicketNumber}
        onFinished={() => {
          queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
          queryClient.invalidateQueries({ queryKey: ["winners"] });
        }}
      />
    </AdminLayout>
  );
}
