 import { useState } from "react";
 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import AdminLayout from "@/components/AdminLayout";
 import { supabase } from "@/integrations/supabase/client";
 import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
 import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Trophy, Plus, Trash2, Pencil } from "lucide-react";
 import { format } from "date-fns";
 
 export default function AdminFederal() {
   const queryClient = useQueryClient();
   const { toast } = useToast();
    const [fetching, setFetching] = useState(false);
     const [open, setOpen] = useState(false);
     const [editingId, setEditingId] = useState<string | null>(null);
    const [manualResult, setManualResult] = useState({
      concurso: "",
      data_sorteio: "",
      p1: "", p2: "", p3: "", p4: "", p5: ""
    });
     const saveResult = async () => {
      setFetching(true);
      try {
        const premios = [
          { premio: "1", numero: manualResult.p1 },
          { premio: "2", numero: manualResult.p2 },
          { premio: "3", numero: manualResult.p3 },
          { premio: "4", numero: manualResult.p4 },
          { premio: "5", numero: manualResult.p5 },
        ];
  
         const payload = {
           concurso: manualResult.concurso,
           data_sorteio: manualResult.data_sorteio,
           premios
         };
 
         const { error } = editingId 
           ? await supabase.from("federal_lottery_results").update(payload).eq("id", editingId)
           : await supabase.from("federal_lottery_results").insert(payload);
  
        if (error) throw error;
         toast({ title: editingId ? "Resultado atualizado" : "Resultado adicionado" });
        setOpen(false);
        queryClient.invalidateQueries({ queryKey: ["federal-results"] });
      } catch (err: any) {
         toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
     const handleEdit = (r: any) => {
       setEditingId(r.id);
       setManualResult({
         concurso: r.concurso,
         data_sorteio: r.data_sorteio.split('T')[0],
         p1: r.premios.find((p: any) => p.premio === "1")?.numero || "",
         p2: r.premios.find((p: any) => p.premio === "2")?.numero || "",
         p3: r.premios.find((p: any) => p.premio === "3")?.numero || "",
         p4: r.premios.find((p: any) => p.premio === "4")?.numero || "",
         p5: r.premios.find((p: any) => p.premio === "5")?.numero || "",
       });
       setOpen(true);
     };
 
     const handleAdd = () => {
       setEditingId(null);
       setManualResult({ concurso: "", data_sorteio: "", p1: "", p2: "", p3: "", p4: "", p5: "" });
       setOpen(true);
     };
 
      } finally {
        setFetching(false);
      }
    };
  
    const deleteResult = async (id: string) => {
      if (!confirm("Excluir este resultado?")) return;
      const { error } = await supabase.from("federal_lottery_results").delete().eq("id", id);
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Resultado excluído" });
      queryClient.invalidateQueries({ queryKey: ["federal-results"] });
    };

 
   const { data: results, isLoading } = useQuery({
     queryKey: ["federal-results"],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("federal_lottery_results")
         .select("*")
         .order("concurso", { ascending: false });
       if (error) throw error;
       return data;
     },
   });
 
   const fetchLatest = async () => {
     setFetching(true);
     try {
       const { data, error } = await supabase.functions.invoke("federal-lottery");
       if (error) throw error;
       toast({ title: `Concurso ${data.concurso} importado com sucesso!` });
       queryClient.invalidateQueries({ queryKey: ["federal-results"] });
     } catch (err: any) {
       toast({ title: "Erro ao buscar resultado", description: err.message, variant: "destructive" });
     } finally {
       setFetching(false);
     }
   };
 
   return (
     <AdminLayout>
       <div className="mb-6 flex items-center justify-between">
         <h1 className="font-display text-2xl font-bold">Loteria Federal</h1>
          <div className="flex gap-2">
             <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditingId(null); }}>
               <Button variant="outline" onClick={handleAdd}><Plus className="mr-2 h-4 w-4" /> Adicionar Manual</Button>
               <DialogContent className="sm:max-w-md">
                 <DialogHeader><DialogTitle>{editingId ? "Editar Resultado" : "Novo Resultado Manual"}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Concurso</Label>
                      <Input value={manualResult.concurso} onChange={e => setManualResult(p => ({ ...p, concurso: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Data</Label>
                      <Input type="date" value={manualResult.data_sorteio} onChange={e => setManualResult(p => ({ ...p, data_sorteio: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <div key={n} className="space-y-1">
                        <Label className="text-[10px] uppercase">{n}º Prêmio</Label>
                        <Input className="h-8 px-2" value={(manualResult as any)[`p${n}`]} onChange={e => setManualResult(p => ({ ...p, [`p${n}`]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                   <Button onClick={saveResult} disabled={fetching || !manualResult.concurso || !manualResult.data_sorteio}>
                    {fetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar Resultado
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={fetchLatest} disabled={fetching}>
              {fetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Sincronizar API
            </Button>
          </div>
       </div>
 
       <Card>
         <CardHeader>
           <CardTitle>Resultados Recentes</CardTitle>
         </CardHeader>
         <CardContent>
           {isLoading ? (
             <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
           ) : (
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Concurso</TableHead>
                   <TableHead>Data</TableHead>
                   <TableHead>1º Prêmio</TableHead>
                   <TableHead>2º Prêmio</TableHead>
                   <TableHead>3º Prêmio</TableHead>
                   <TableHead>4º Prêmio</TableHead>
                    <TableHead>5º Prêmio</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {results?.map((r: any) => (
                   <TableRow key={r.id}>
                     <TableCell className="font-bold">{r.concurso}</TableCell>
                     <TableCell>{format(new Date(r.data_sorteio), "dd/MM/yyyy")}</TableCell>
                     {r.premios.map((p: any) => (
                       <TableCell key={p.premio} className={p.premio === "1" ? "font-black text-primary" : ""}>
                        {p.numero}
                      </TableCell>
                    ))}
                     <TableCell className="text-right flex justify-end gap-1">
                       <Button variant="ghost" size="icon" onClick={() => handleEdit(r)}>
                         <Pencil className="h-4 w-4 text-primary" />
                       </Button>
                       <Button variant="ghost" size="icon" onClick={() => deleteResult(r.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                       </Button>
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