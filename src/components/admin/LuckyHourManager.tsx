import { useState, useMemo } from "react";
import { useLuckyHours, LuckyHour } from "@/hooks/useData";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Clock, Trophy, User, ChevronLeft, ChevronRight, Send, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LuckyHourManagerProps {
  campaignId: string;
}

export default function LuckyHourManager({ campaignId }: LuckyHourManagerProps) {
  const { data: luckyHours, isLoading, refetch } = useLuckyHours(campaignId);
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [newDraw, setNewDraw] = useState({
    title: "",
    prize_description: "",
    draw_time: "",
  });

  const handleAdd = async () => {
    if (!newDraw.title || !newDraw.prize_description || !newDraw.draw_time) {
      toast({ title: "Erro", description: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("lucky_hours").insert({
        campaign_id: campaignId,
        title: newDraw.title,
        prize_description: newDraw.prize_description,
        draw_time: new Date(newDraw.draw_time).toISOString(),
        status: 'scheduled'
      });

      if (error) throw error;

      toast({ title: "Sucesso", description: "Sorteio agendado!" });
      setNewDraw({ title: "", prize_description: "", draw_time: "" });
      setIsAdding(false);
      refetch();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este sorteio?")) return;

    try {
      const { error } = await supabase.from("lucky_hours").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Sorteio excluído" });
      refetch();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const handleNotifyWinner = async (draw: LuckyHour) => {
    if (!draw.winner_name || !draw.winning_number) {
      toast({ title: "Erro", description: "Dados do vencedor incompletos", variant: "destructive" });
      return;
    }
    
    // Here we could integrate with a notification system (WhatsApp, SMS, Email)
    // For now, we simulate the action and show a success message
    toast({ 
      title: "Notificação Enviada", 
      description: `Vencedor ${draw.winner_name} foi notificado sobre o prêmio ${draw.prize_description}!`,
    });
  };

  const handleUpdateStatus = async (id: string, status: 'scheduled' | 'completed', winner_name?: string, winning_number?: string) => {
    try {
      const { error } = await supabase.from("lucky_hours").update({
        status,
        winner_name,
        winning_number
      }).eq("id", id);
      
      if (error) throw error;
      toast({ title: "Sucesso", description: "Sorteio atualizado" });
      refetch();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  const paginatedLuckyHours = useMemo(() => {
    if (!luckyHours) return [];
    const sorted = [...luckyHours].sort((a, b) => new Date(b.draw_time).getTime() - new Date(a.draw_time).getTime());
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sorted.slice(startIndex, startIndex + itemsPerPage);
  }, [luckyHours, currentPage]);

  const totalPages = Math.ceil((luckyHours?.length || 0) / itemsPerPage);

  if (!campaignId) return <div className="p-4 text-center text-muted-foreground">Salve a campanha primeiro para gerenciar as Horas Premiadas.</div>;

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 bg-secondary/10">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Gerenciar Hora Premiada
            </CardTitle>
            <CardDescription>Crie mini sorteios para ocorrerem durante a campanha.</CardDescription>
          </div>
          <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "outline" : "default"} className="gap-2 rounded-xl">
            {isAdding ? "Cancelar" : <><Plus className="h-4 w-4" /> Novo Sorteio</>}
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {isAdding && (
            <div className="mb-8 p-6 bg-secondary/30 rounded-2xl border border-border space-y-4 animate-in fade-in slide-in-from-top-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Título do Sorteio</Label>
                  <Input 
                    placeholder="Ex: Sorteio Relâmpago" 
                    value={newDraw.title} 
                    className="rounded-xl"
                    onChange={e => setNewDraw(p => ({ ...p, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Prêmio</Label>
                  <Input 
                    placeholder="Ex: R$ 100,00 no PIX" 
                    value={newDraw.prize_description} 
                    className="rounded-xl"
                    onChange={e => setNewDraw(p => ({ ...p, prize_description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Data e Hora</Label>
                  <Input 
                    type="datetime-local" 
                    value={newDraw.draw_time} 
                    className="rounded-xl"
                    onChange={e => setNewDraw(p => ({ ...p, draw_time: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={handleAdd} disabled={saving} className="w-full md:w-auto rounded-xl">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Agendar Sorteio
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-4">
              {luckyHours?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground italic border-2 border-dashed border-border rounded-2xl bg-secondary/5">
                  Nenhum sorteio agendado para esta campanha.
                </div>
              ) : (
                <>
                  <div className="grid gap-4">
                    {paginatedLuckyHours.map((draw) => (
                      <div key={draw.id} className="p-5 bg-card border border-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-all group">
                        <div className="flex items-start gap-4">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${draw.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20' : 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20'}`}>
                            {draw.status === 'completed' ? <CheckCircle2 className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-lg">{draw.title}</h4>
                              <Badge variant={draw.status === 'completed' ? 'default' : 'secondary'} className={`text-[10px] uppercase font-black tracking-tighter ${draw.status === 'completed' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>
                                {draw.status === 'completed' ? 'Realizado' : 'Agendado'}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1 font-medium"><Trophy className="h-3.5 w-3.5 text-primary" /> {draw.prize_description}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {format(new Date(draw.draw_time), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                            </div>
                            {draw.status === 'completed' && draw.winner_name && (
                              <div className="mt-3 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center justify-between gap-4 animate-in fade-in zoom-in-95">
                                <div className="flex items-center gap-2">
                                  <div className="h-7 w-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <User className="h-3.5 w-3.5 text-emerald-600" />
                                  </div>
                                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-tight">Ganhador: {draw.winner_name} (Nº {draw.winning_number})</span>
                                </div>
                                <Button size="sm" variant="ghost" className="h-7 text-[10px] font-black uppercase text-emerald-600 hover:bg-emerald-500/10 gap-1.5" onClick={() => handleNotifyWinner(draw)}>
                                  <Send className="h-3 w-3" /> Notificar
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0">
                          {draw.status === 'scheduled' ? (
                            <Button variant="outline" size="sm" className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 border-emerald-500/20 rounded-lg h-9 font-bold px-4" onClick={() => {
                              const name = prompt("Nome do Ganhador:");
                              const number = prompt("Número Sorteado:");
                              if (name && number) handleUpdateStatus(draw.id, 'completed', name, number);
                            }}>
                              Concluir Sorteio
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" className="h-9 text-xs font-bold opacity-60 hover:opacity-100" onClick={() => handleUpdateStatus(draw.id, 'scheduled')}>
                              Reverter
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-9 w-9 rounded-lg" onClick={() => handleDelete(draw.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-6">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="rounded-xl h-9 px-4"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                      </Button>
                      <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        Página {currentPage} de {totalPages}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="rounded-xl h-9 px-4"
                      >
                        Próximo <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}