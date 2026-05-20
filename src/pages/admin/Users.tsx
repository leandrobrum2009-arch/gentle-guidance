import AdminLayout from "@/components/AdminLayout";
import { useAdminUsers } from "@/hooks/useAdmin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Mail, User as UserIcon, Pencil, DollarSign, Save, X, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminUsers() {
  const { data: users, isLoading } = useAdminUsers();
  const [search, setSearch] = useState("");

   const filtered = users?.filter(u => 
     u.name?.toLowerCase().includes(search.toLowerCase()) || 
     u.phone?.includes(search)
   );

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Gestão de Usuários</h1>
        <p className="text-muted-foreground">Gerencie todos os membros registrados na plataforma.</p>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome, email ou telefone..." 
            className="pl-10 border-border bg-card/50 text-foreground focus:border-primary/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-xl">
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                   <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Usuário / ID</TableHead>
                   <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Telefone</TableHead>
                   <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Saldo</TableHead>
                   <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Membro desde</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered?.map((u) => (
                  <TableRow key={u.id} className="border-border hover:bg-secondary/20 transition-colors group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                          <AvatarImage src={u.avatar_url} />
                         <AvatarFallback className="bg-primary/10 text-primary font-bold uppercase">
                           {u.name?.substring(0, 2) || "U"}
                         </AvatarFallback>
                        </Avatar>
                        <div>
                           <p className="font-bold text-foreground tracking-tight">{u.name || "Sem Nome"}</p>
                           <p className="text-[10px] text-muted-foreground font-mono">{(u.user_id || u.id).substring(0, 8)}</p>
                        </div>
                      </div>
                    </TableCell>
                     <TableCell className="text-foreground font-medium">{u.phone || "-"}</TableCell>
                     <TableCell className="text-emerald-500 font-bold font-mono text-xs">
                       R$ {Number(u.balance || 0).toFixed(2)}
                     </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(u.created_at), 'dd MMM yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground font-medium italic">
                      Nenhum usuário encontrado.
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
