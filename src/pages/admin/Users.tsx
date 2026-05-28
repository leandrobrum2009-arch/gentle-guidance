import AdminLayout from "@/components/AdminLayout";
import { useAdminUsers, useIsMaster } from "@/hooks/useAdmin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Mail, User as UserIcon, Pencil, DollarSign, Save, X, Phone, ShieldCheck, Settings2 } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function AdminUsers() {
  const { data: users, isLoading } = useAdminUsers();
  const isMaster = useIsMaster();
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleEdit = (user: any) => {
    setEditingUser({ 
      ...user,
      scratch_cards_enabled: user.features?.scratch_cards_enabled ?? true,
      lucky_numbers_enabled: user.features?.lucky_numbers_enabled ?? true,
      roulette_enabled: user.features?.roulette_enabled ?? true,
      page_editing_enabled: user.features?.page_editing_enabled ?? true,
      sales_page_models_enabled: user.features?.sales_page_models_enabled ?? true,
    });
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      // 1. Update Profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: editingUser.name,
          phone: editingUser.phone,
          balance: Number(editingUser.balance),
          cashback_balance: Number(editingUser.cashback_balance),
        })
        .eq("id", editingUser.id);

      if (profileError) throw profileError;

      if (isMaster) {
        // 2. Update Role (Master only)
        if (editingUser.role) {
          const { error: roleError } = await supabase
            .from("user_roles")
            .upsert({ 
              user_id: editingUser.user_id, 
              role: editingUser.role 
            }, { onConflict: 'user_id,role' });
          
          if (roleError) {
             // If unique constraint fails because they already have another role, we might need to handle it.
             // Usually user_roles has (user_id, role) unique.
             console.error("Role update error:", roleError);
          }
        }

        // 3. Update Feature Config (Master only)
        const { error: featureError } = await supabase
          .from("admin_features_config")
          .upsert({
            user_id: editingUser.user_id,
            scratch_cards_enabled: editingUser.scratch_cards_enabled,
            lucky_numbers_enabled: editingUser.lucky_numbers_enabled,
            roulette_enabled: editingUser.roulette_enabled,
            page_editing_enabled: editingUser.page_editing_enabled,
            sales_page_models_enabled: editingUser.sales_page_models_enabled,
          }, { onConflict: 'user_id' });

        if (featureError) throw featureError;
      }

      toast.success("Usuário atualizado com sucesso!");
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

   const filtered = (users as any[])?.filter(u => 
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
                   <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Role</TableHead>
                   <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Telefone</TableHead>
                   <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Saldo</TableHead>
                   <TableHead className="text-muted-foreground font-bold uppercase text-[10px]">Membro desde</TableHead>
                   <TableHead className="text-right text-muted-foreground font-bold uppercase text-[10px]">Ações</TableHead>
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
                     <TableCell>
                       {u.role === 'master' && <Badge className="bg-purple-500 text-[10px] font-black italic">MASTER (DONO)</Badge>}
                       {u.role === 'admin' && <Badge className="bg-blue-500 text-[10px] font-black italic">ADMIN TOTAL</Badge>}
                       {u.role === 'client_admin' && <Badge className="bg-orange-500 text-[10px] font-black italic">ADMIN RESTRITO</Badge>}
                       {(!u.role || u.role === 'user') && <Badge variant="outline" className="text-[10px] font-bold">USER</Badge>}
                     </TableCell>
                     <TableCell className="text-foreground font-medium">{u.phone || "-"}</TableCell>
                     <TableCell className="text-emerald-500 font-bold font-mono text-xs">
                       R$ {Number(u.balance || 0).toFixed(2)}
                     </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(u.created_at), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(u)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground font-medium italic">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[450px] bg-card border-border rounded-3xl p-0 overflow-hidden">
          <div className="bg-primary/10 p-6 flex flex-col items-center text-center gap-2 border-b border-primary/10">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-2">
              <UserIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <DialogTitle className="text-xl font-black uppercase italic tracking-tighter text-foreground">
              Editar <span className="text-primary">Usuário</span>
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Atualize as informações e o saldo do cliente
            </DialogDescription>
          </div>

          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {isMaster && (
              <div className="p-4 bg-secondary/30 rounded-2xl border border-border space-y-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Nível de Acesso Master</span>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Cargo / Role</Label>
                  <Select 
                    value={editingUser?.role || "user"} 
                    onValueChange={(val) => setEditingUser({ ...editingUser, role: val })}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-background border-border focus:ring-primary/20 font-bold">
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="user">Usuário Comum</SelectItem>
                      <SelectItem value="client_admin">Admin Restrito</SelectItem>
                      <SelectItem value="admin">Administrador Total</SelectItem>
                      <SelectItem value="master">Master (Dono)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(editingUser?.role === 'client_admin' || editingUser?.role === 'admin') && (
                  <div className="space-y-3 pt-2 border-t border-border mt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Permissões de Recursos</p>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                      <Label className="text-xs font-bold text-foreground">Raspadinhas</Label>
                      <Switch 
                        checked={editingUser?.scratch_cards_enabled} 
                        onCheckedChange={(val) => setEditingUser({ ...editingUser, scratch_cards_enabled: val })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                      <Label className="text-xs font-bold text-foreground">Roleta</Label>
                      <Switch 
                        checked={editingUser?.roulette_enabled} 
                        onCheckedChange={(val) => setEditingUser({ ...editingUser, roulette_enabled: val })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                      <Label className="text-xs font-bold text-foreground">Cotas Premiadas</Label>
                      <Switch 
                        checked={editingUser?.lucky_numbers_enabled} 
                        onCheckedChange={(val) => setEditingUser({ ...editingUser, lucky_numbers_enabled: val })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                      <Label className="text-xs font-bold text-foreground">Edição de Páginas</Label>
                      <Switch 
                        checked={editingUser?.page_editing_enabled} 
                        onCheckedChange={(val) => setEditingUser({ ...editingUser, page_editing_enabled: val })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-2 rounded-lg bg-background/50">
                      <Label className="text-xs font-bold text-foreground">Modelos de Venda</Label>
                      <Switch 
                        checked={editingUser?.sales_page_models_enabled} 
                        onCheckedChange={(val) => setEditingUser({ ...editingUser, sales_page_models_enabled: val })}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nome Completo</Label>
              <Input
                value={editingUser?.name || ""}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                className="h-12 rounded-xl bg-secondary/50 border-border focus:border-primary/50 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Telefone / WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={editingUser?.phone || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="h-12 pl-12 rounded-xl bg-secondary/50 border-border focus:border-primary/50 font-bold"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Saldo em Conta (R$)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <Input
                    type="number"
                    value={editingUser?.balance || 0}
                    onChange={(e) => setEditingUser({ ...editingUser, balance: e.target.value })}
                    className="h-12 pl-12 rounded-xl bg-secondary/50 border-border focus:border-primary/50 font-bold text-emerald-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Saldo Cashback (R$)</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input
                    type="number"
                    value={editingUser?.cashback_balance || 0}
                    onChange={(e) => setEditingUser({ ...editingUser, cashback_balance: e.target.value })}
                    className="h-12 pl-12 rounded-xl bg-secondary/50 border-border focus:border-primary/50 font-bold text-primary"
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSave} 
              className="w-full h-14 rounded-2xl font-black uppercase italic tracking-widest gap-2 glow-primary border-none shadow-lg shadow-primary/20 mt-4"
              disabled={saving}
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              SALVAR ALTERAÇÕES
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}