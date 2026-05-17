 import { useState } from "react";
 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import AdminLayout from "@/components/AdminLayout";
 import { supabase } from "@/integrations/supabase/client";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
 import { useToast } from "@/hooks/use-toast";
 import { Loader2, RefreshCw, Trophy } from "lucide-react";
 import { format } from "date-fns";
 
 export default function AdminFederal() {
   const queryClient = useQueryClient();
   const { toast } = useToast();
   const [fetching, setFetching] = useState(false);
 
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
         <Button onClick={fetchLatest} disabled={fetching}>
           {fetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
           Sincronizar Último Resultado
         </Button>
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