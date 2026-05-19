import AdminLayout from "@/components/AdminLayout";
import { useAdminNotifications } from "@/hooks/useAdmin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Bell, Send, Trash2, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AdminNotifications() {
  const { data: notifications, isLoading } = useAdminNotifications();

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">Notificações Push</h1>
          <p className="text-muted-foreground mt-1">Envie mensagens instantâneas para seus usuários.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-foreground font-bold shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] border-none">
          <Send className="mr-2 h-4 w-4" /> Nova Mensagem
        </Button>
      </div>

      <Card className="border-border bg-card/50 backdrop-blur-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Mensagem</TableHead>
                  <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Alvo</TableHead>
                  <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Data Envio</TableHead>
                  <TableHead className="text-right text-muted-foreground font-bold uppercase text-[10px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications?.map((n) => (
                  <TableRow key={n.id} className="border-border hover:bg-secondary/20 transition-colors group">
                    <TableCell>
                      <div className="flex flex-col max-w-md">
                        <span className="font-bold text-foreground tracking-tight">{n.title}</span>
                        <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.body}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {n.target_type === 'all' ? <Users className="h-3.5 w-3.5 text-blue-600" /> : <User className="h-3.5 w-3.5 text-purple-400" />}
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest border-border text-foreground">
                          {n.target_type === 'all' ? 'Todos os Usuários' : 'Usuário Específico'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {format(new Date(n.sent_at), 'dd MMM, HH:mm')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {notifications?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground font-medium italic">
                      Nenhuma notificação enviada ainda.
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
