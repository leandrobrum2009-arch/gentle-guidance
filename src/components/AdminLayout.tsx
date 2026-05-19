import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdmin";
import { 
  LayoutDashboard, Megaphone, ShoppingCart, Trophy, Dices, ArrowLeft, Loader2, ShieldAlert, LogOut,
  Users, CreditCard, Percent, Image as ImageIcon, Bell, Gift, Star, UsersRound, Settings, Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

 const navItems = [
   { category: "Dashboard", items: [
     { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
   ]},
   { category: "Gestão", items: [
     { title: "Campanhas", url: "/admin/campanhas", icon: Megaphone },
     { title: "Usuários", url: "/admin/usuarios", icon: Users },
     { title: "Pedidos", url: "/admin/pedidos", icon: ShoppingCart },
     { title: "Ganhadores", url: "/admin/ganhadores", icon: Trophy },
     { title: "Afiliados", url: "/admin/afiliados", icon: UsersRound },
   ]},
   { category: "Jogos", items: [
     { title: "Roletas", url: "/admin/roletas", icon: Dices },
     { title: "Caixas Misteriosas", url: "/admin/caixas", icon: Gift },
     { title: "Federal", url: "/admin/federal", icon: Star },
   ]},
   { category: "Marketing", items: [
     { title: "Banners", url: "/admin/banners", icon: ImageIcon },
     { title: "Cupons", url: "/admin/cupons", icon: Percent },
     { title: "Notificações", url: "/admin/notificacoes", icon: Bell },
   ]},
    { category: "Sistema", items: [
      { title: "Preview UI", url: "/preview", icon: ImageIcon },
      { title: "Configurações", url: "/admin/configuracoes", icon: Settings },
    ]},
 ];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin();

  if (authLoading || roleLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/entrar");
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <h1 className="font-display text-2xl font-bold">Acesso Negado</h1>
        <p className="text-muted-foreground">Você não tem permissão de administrador.</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao site
        </Button>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 border-b border-sidebar-border p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
          <ShieldAlert className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <span className="block font-display text-base font-bold tracking-tight">Admin Panel</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Premium</span>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4 custom-scrollbar">
        {navItems.map((group) => (
          <div key={group.category} className="space-y-2">
            <h3 className="px-3 text-[10px] font-black uppercase tracking-wider text-sidebar-foreground/80">
              {group.category}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.url;
                return (
                  <Link
                    key={item.url}
                    to={item.url}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <item.icon className={`h-4.5 w-4.5 transition-colors ${active ? "text-sidebar-primary" : "text-sidebar-foreground/80 group-hover:text-sidebar-primary"}`} />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-sidebar-border p-4">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao site
        </Link>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-rose-500 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair do Sistema
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Trigger */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" className="h-14 w-14 rounded-full bg-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] active:scale-95">
              <Menu className="h-6 w-6 text-primary-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-r border-sidebar-border bg-sidebar p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8 custom-scrollbar">
        <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
