import { useState } from "react";
import { useLuckyHours, LuckyHour } from "@/hooks/useData";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Clock, Trophy, User } from "lucide-react";
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

  if (!campaignId) return <div className="p-4 text-center text-muted-foreground">Salve a campanha primeiro para gerenciar as Horas Premiadas.</div>;

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle className="text-xl font-bold">Gerenciar Hora Premiada</CardTitle>
            <CardDescription>Crie mini sorteios para ocorrerem durante a campanha.</CardDescription>
          </div>
          <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "outline" : "default"} className="gap-2">
            {isAdding ? "Cancelar" : <><Plus className="h-4 w-4" /> Novo Sorteio</>}
          </Button>
        </CardHeader>
        <CardContent>
          {isAdding && (
            <div className="mb-8 p-6 bg-secondary/30 rounded-2xl border border-border space-y-4 animate-in fade-in slide-in-from-top-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título do Sorteio</Label>
                  <Input 
                    placeholder="Ex: Sorteio Relâmpago" 
                    value={newDraw.title} 
                    onChange={e => setNewDraw(p => ({ ...p, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prêmio</Label>
                  <Input 
                    placeholder="Ex: R$ 100,00 no PIX" 
                    value={newDraw.prize_description} 
                    onChange={e => setNewDraw(p => ({ ...p, prize_description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data e Hora</Label>
                  <Input 
                    type="datetime-local" 
                    value={newDraw.draw_time} 
                    onChange={e => setNewDraw(p => ({ ...p, draw_time: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={handleAdd} disabled={saving} className="w-full md:w-auto">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Agendar Sorteio
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
          ) : (
            <div className="space-y-4">
              {luckyHours?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground italic border-2 border-dashed border-border rounded-2xl">
                  Nenhum sorteio agendado para esta campanha.
                </div>
              ) : (
                <div className="grid gap-4">
                  {luckyHours?.map((draw) => (
                    <div key={draw.id} className="p-5 bg-card border border-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${draw.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          <Clock className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-lg">{draw.title}</h4>
                            <Badge variant={draw.status === 'completed' ? 'default' : 'secondary'} className="text-[10px] uppercase font-black tracking-tighter">
                              {draw.status === 'completed' ? 'Realizado' : 'Agendado'}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Trophy className="h-3 w-3" /> {draw.prize_description}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {format(new Date(draw.draw_time), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                          </div>
                          {draw.status === 'completed' && draw.winner_name && (
                            <div className="mt-2 p-2 px-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10 inline-flex items-center gap-2">
                              <User className="h-3 w-3 text-emerald-500" />
                              <span className="text-xs font-bold text-emerald-700 uppercase">Ganhador: {draw.winner_name} ({draw.winning_number})</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {draw.status === 'scheduled' ? (
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 border-emerald-500/20" onClick={() => {
                              const name = prompt("Nome do Ganhador:");
                              const number = prompt("Número Sorteado:");
                              if (name && number) handleUpdateStatus(draw.id, 'completed', name, number);
                            }}>
                              Concluir Sorteio
                            </Button>
                          </div>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(draw.id, 'scheduled')}>
                            Reverter para Agendado
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(draw.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}