import AdminLayout from "@/components/AdminLayout";
import { useAdminMysteryBoxes } from "@/hooks/useAdmin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Gift, Plus, Pencil, Trash2, Box, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminMysteryBoxes() {
  const { data: boxes, isLoading, refetch } = useAdminMysteryBoxes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    rarity: "Comum",
    cost_to_open: "10",
    prize_value: "50",
    is_active: true
  });

  const handleCreate = async () => {
    if (!formData.title) {
      toast.error("Insira o nome da caixa");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("mystery_boxes").insert({
        title: formData.title,
        rarity: formData.rarity,
        cost_to_open: parseFloat(formData.cost_to_open),
        prize_value: parseFloat(formData.prize_value),
        is_active: formData.is_active
      });

      if (error) throw error;

      toast.success("Caixa criada com sucesso!");
      setIsDialogOpen(false);
      refetch();
      setFormData({ title: "", rarity: "Comum", cost_to_open: "10", prize_value: "50", is_active: true });
    } catch (error: any) {
      toast.error("Erro ao criar caixa: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta caixa?")) return;
    
    try {
      const { error } = await supabase.from("mystery_boxes").delete().eq("id", id);
      if (error) throw error;
      toast.success("Caixa excluída!");
      refetch();
    } catch (error: any) {
      toast.error("Erro ao excluir: " + error.message);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">Caixas Misteriosas</h1>
          <p className="text-muted-foreground mt-1">Gerencie tipos de caixas, custos e prêmios.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-foreground font-bold shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] border-none">
              <Plus className="mr-2 h-4 w-4" /> Nova Caixa
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Nova Caixa Misteriosa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome da Caixa</Label>
                <Input 
                  placeholder="Ex: Caixa de Ouro" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Raridade</Label>
                  <Select 
                    value={formData.rarity}
                    onValueChange={v => setFormData({...formData, rarity: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Comum">Comum</SelectItem>
                      <SelectItem value="Raro">Raro</SelectItem>
                      <SelectItem value="Épico">Épico</SelectItem>
                      <SelectItem value="Lendário">Lendário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Custo para Abrir (R$)</Label>
                  <Input 
                    type="number"
                    value={formData.cost_to_open}
                    onChange={e => setFormData({...formData, cost_to_open: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Valor Máximo do Prêmio (R$)</Label>
                <Input 
                  type="number"
                  value={formData.prize_value}
                  onChange={e => setFormData({...formData, prize_value: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Criar Caixa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        {['Comum', 'Raro', 'Épico', 'Lendário'].map((rarity, i) => (
          <Card key={rarity} className="border-border bg-card/50 backdrop-blur-xl relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-full h-1 ${
              rarity === 'Comum' ? 'bg-slate-400' :
              rarity === 'Raro' ? 'bg-blue-400' :
              rarity === 'Épico' ? 'bg-purple-400' : 'bg-amber-400'
            }`} />
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{rarity}</p>
                <p className="text-xl font-bold text-foreground mt-1">
                  {boxes?.filter((b: any) => b.rarity === rarity).length || 0} Ativas
                </p>
              </div>
              <Box className={`h-8 w-8 ${
                rarity === 'Comum' ? 'text-muted-foreground' :
                rarity === 'Raro' ? 'text-blue-600' :
                rarity === 'Épico' ? 'text-purple-400' : 'text-amber-400'
              } opacity-20`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Caixa</TableHead>
                  <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Custo</TableHead>
                  <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Prêmio Máx</TableHead>
                  <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground font-bold uppercase text-[10px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(boxes as any[])?.map((b: any) => (
                  <TableRow key={b.id} className="border-border hover:bg-secondary/20 transition-colors group">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground tracking-tight">{b.title}</span>
                        <span className="text-[10px] text-muted-foreground">{(b as any).rarity || 'Geral'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground font-bold font-mono text-xs">
                      R$ {Number(b.cost_to_open || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-emerald-500 font-bold font-mono text-xs">
                      R$ {Number(b.prize_value || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] font-bold tracking-widest ${b.is_active ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/20' : 'bg-secondary/500/20 text-muted-foreground border-slate-500/20'}`}>
                        {b.is_active ? 'ATIVA' : 'INATIVA'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-card/10">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                        onClick={() => handleDelete(b.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {boxes?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground font-medium italic">
                      Nenhuma caixa misteriosa encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
