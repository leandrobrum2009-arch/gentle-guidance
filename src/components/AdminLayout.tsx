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

const SidebarContent = ({ 
  pathname, 
  user, 
  profile, 
  userRole, 
  siteSettings, 
  filteredNavItems, 
  onItemClick,
  signOut
}: { 
  pathname: string;
  user: any;
  profile: any;
  userRole: string | null;
  siteSettings: any;
  filteredNavItems: any[];
  onItemClick?: () => void;
  signOut: () => void;
}) => {
  return (
    <div className="flex flex-col bg-sidebar text-sidebar-foreground h-full overflow-hidden border-r border-sidebar-border shadow-xl">
      <div className="flex items-center gap-3 border-b border-sidebar-border p-6 shrink-0">
        {siteSettings?.site_logo_url ? (
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-sm">
            <img src={siteSettings.site_logo_url} alt="Logo" className="h-full w-full object-contain" />
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
            <Ticket className="h-6 w-6 text-primary-foreground" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col">
            <span className="block font-display text-sm font-bold tracking-tight truncate">
              {profile?.name || user.user_metadata?.name?.split(' ')[0] || "Administrador"}
            </span>
            {userRole && (
              <span className="text-[9px] font-black uppercase tracking-widest text-primary/70 italic leading-tight">
                {userRole === 'master' ? 'Master Access' : userRole === 'client_admin' ? 'Client Admin' : 'Admin'}
              </span>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-4 custom-scrollbar overscroll-contain">
        {filteredNavItems.map((group) => (
          <div key={group.category} className="space-y-1">
            <h3 className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-sidebar-foreground/40">
              {group.category}
            </h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.url;
                return (
                  <Link
                    key={item.url}
                    to={item.url}
                    onClick={onItemClick}
                    className={`group w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 text-left ${
                      active
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 transition-colors ${active ? "text-primary-foreground" : "text-sidebar-foreground/40 group-hover:text-primary"}`} />
                    <span className={active ? "font-bold" : "font-medium"}>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-sidebar-border p-4 shrink-0">
        <Link
          to="/"
          onClick={onItemClick}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors text-left"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao site
        </Link>
        <button
          onClick={() => {
            if (onItemClick) onItemClick();
            signOut();
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-rose-500 transition-colors text-left"
        >
          <LogOut className="h-4 w-4" />
          Sair do Sistema
        </button>
      </div>
    </div>
  );
};

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

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col lg:flex">
        <SidebarContent 
          pathname={pathname}
          user={user}
          profile={profile}
          userRole={userRole}
          siteSettings={siteSettings}
          filteredNavItems={filteredNavItems}
          signOut={signOut}
        />
      </aside>

      <div className="flex flex-1 flex-col lg:pl-64 min-h-screen w-full">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 lg:hidden shadow-sm">
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
              <SidebarContent 
                pathname={pathname}
                user={user}
                profile={profile}
                userRole={userRole}
                siteSettings={siteSettings}
                filteredNavItems={filteredNavItems}
                onItemClick={() => setIsMobileMenuOpen(false)}
                signOut={signOut}
              />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main */}
        <main className="flex-1 bg-background p-3 sm:p-4 lg:p-8 overflow-y-auto">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
