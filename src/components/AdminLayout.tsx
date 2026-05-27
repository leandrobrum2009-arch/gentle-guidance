import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin, useFeatureAccess, useRole } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, Megaphone, ShoppingCart, Trophy, Dices, ArrowLeft, Loader2, ShieldAlert, LogOut,
  Users, CreditCard, Percent, Image as ImageIcon, Bell, Gift, Star, UsersRound, Settings, Menu, Zap, Ticket, Activity, History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSiteSettings } from "@/hooks/useData";

 const navItems = [
   { category: "Início", items: [
     { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
     { title: "Preview Site", url: "/preview", icon: ImageIcon },
   ]},
   { category: "Vendas", items: [
     { title: "Campanhas", url: "/admin/campanhas", icon: Megaphone },
      { title: "Pedidos", url: "/admin/pedidos", icon: ShoppingCart },
      { title: "Logs de Pagamento", url: "/admin/pagamentos/logs", icon: History },
     { title: "Cupons", url: "/admin/cupons", icon: Percent },
     { title: "Ganhadores", url: "/admin/ganhadores", icon: Trophy },
   ]},
   { category: "Prêmios & Jogos", items: [
     { title: "Roletas", url: "/admin/roletas", icon: Dices },
     { title: "Caixas Misteriosas", url: "/admin/caixas", icon: Gift },
     { title: "Raspadinhas", url: "/admin/raspadinhas", icon: Zap },
     { title: "Federal", url: "/admin/federal", icon: Star },
   ]},
   { category: "Comunidade", items: [
     { title: "Usuários", url: "/admin/usuarios", icon: Users },
     { title: "Afiliados", url: "/admin/afiliados", icon: UsersRound },
     { title: "Notificações", url: "/admin/notificacoes", icon: Bell },
   ]},
    { category: "Configurações", items: [
      { title: "Banners", url: "/admin/banners", icon: ImageIcon },
      { title: "Sistema", url: "/admin/configuracoes", icon: Settings },
      { title: "Logs de Segurança", url: "/admin/audit-logs", icon: ShieldAlert },
      { title: "Diagnóstico", url: "/admin/diagnostico", icon: Activity },
    ]},
  ];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin();
  const { data: userRole, isLoading: userRoleLoading } = useRole();
  const { data: features } = useFeatureAccess();
  const { data: siteSettings } = useSiteSettings();
  const [profile, setProfile] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
        setProfile(data);
      };
      fetchProfile();
    }
  }, [user]);

  if (authLoading || roleLoading || userRoleLoading) {
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

  // Filter navigation based on features and roles
  const filteredNavItems = navItems.map(group => ({
    ...group,
    items: group.items.filter(item => {
      // Feature-based restrictions
      if (item.title === "Roletas" && features && !features.roulette_enabled) return false;
      if (item.title === "Raspadinhas" && features && !features.scratch_cards_enabled) return false;
      if (item.title === "Banners" && features && !features.page_editing_enabled) return false;
      if (item.title === "Federal" && features && !features.lucky_numbers_enabled) return false; // Prized quotas
      if (item.title === "Caixas Misteriosas" && features && !features.sales_page_models_enabled) return false;
      
      // Role-based restrictions
      if (item.title === "Sistema" && userRole !== 'master' && userRole !== 'client_admin') return false; 
      if (item.title === "Usuários" && userRole !== 'master' && userRole !== 'client_admin') return false;
      if (item.title === "Diagnóstico" && userRole !== 'master') return false;
      
      return true;
    })
  })).filter(group => group.items.length > 0);

  const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => {
    return (
      <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground relative overflow-hidden">
        {/* Header / Logo Section */}
        <div className="flex items-center gap-3 border-b border-sidebar-border p-6 shrink-0 bg-sidebar z-20">
          {siteSettings?.site_logo_url ? (
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5 shadow-sm border border-sidebar-border/50">
              <img src={siteSettings.site_logo_url} alt="Logo" className="h-full w-full object-contain" />
            </div>
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
              <Ticket className="h-6 w-6 text-primary-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-col">
              <span className="block font-display text-sm font-bold tracking-tight truncate">
                {profile?.name || user.user_metadata?.name?.split(' ')[0] || "Administrador"}
              </span>
              {userRole && (
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/80 italic mt-0.5">
                  {userRole === 'master' ? 'Master Access' : userRole === 'client_admin' ? 'Client Admin' : 'Admin'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items Section */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar py-6 px-4 space-y-8 z-10 pointer-events-auto overscroll-behavior-contain">
          {filteredNavItems.map((group) => (
            <div key={group.category} className="space-y-3">
              <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.25em] text-sidebar-foreground/30 mb-2">
                {group.category}
              </h3>
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const active = pathname === item.url;
                  return (
                    <Link
                      key={item.url}
                      to={item.url}
                      onClick={onItemClick}
                      className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 relative pointer-events-auto ${
                        active
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 z-10"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      <item.icon className={`h-5 w-5 shrink-0 ${active ? "text-primary-foreground" : "text-sidebar-foreground/40 group-hover:text-primary"}`} />
                      <span className={active ? "font-bold" : "font-medium"}>{item.title}</span>
                      {active && (
                        <div className="absolute inset-y-2 left-0 w-1 bg-white/30 rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="mt-auto border-t border-sidebar-border p-5 space-y-2 bg-sidebar shrink-0 z-20">
          <Link
            to="/"
            onClick={onItemClick}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200 group pointer-events-auto"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-semibold">Voltar ao site</span>
          </Link>
          <button
            onClick={() => {
              if (onItemClick) onItemClick();
              signOut();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-sidebar-foreground/60 hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-200 text-left group pointer-events-auto"
          >
            <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            <span className="font-semibold">Sair do Sistema</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-[100] hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex shadow-2xl overflow-hidden pointer-events-auto">
        <SidebarContent />
      </aside>

      <div className="flex flex-1 flex-col lg:pl-64 min-h-screen relative z-10">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 lg:hidden shadow-sm">
          <div className="flex items-center gap-3">
             {siteSettings?.site_logo_url ? (
               <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white p-1">
                 <img src={siteSettings.site_logo_url} alt="Logo" className="h-full w-full object-contain" />
               </div>
             ) : (
               <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600">
                 <Ticket className="h-5 w-5 text-primary-foreground" />
               </div>
             )}
              <span className="font-display text-sm font-bold tracking-tight truncate max-w-[150px]">
                {profile?.name || user.user_metadata?.name?.split(' ')[0] || "Admin"}
              </span>
          </div>
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-sidebar-foreground hover:bg-sidebar-accent">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-r border-sidebar-border bg-sidebar p-0 flex flex-col h-full overflow-hidden">
              <SidebarContent onItemClick={() => setIsMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main */}
        <main className="flex-1 bg-background p-3 sm:p-4 lg:p-8 overflow-x-hidden">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
