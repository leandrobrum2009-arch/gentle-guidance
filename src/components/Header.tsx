import { Menu, X, User, Ticket, LogOut, Bell, Wallet, Search, Zap, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const navLinks = [
  { label: "Início", href: "/" },
  { label: "Campanhas", href: "/campanhas" },
  { label: "Ganhadores", href: "/ganhadores" },
  { label: "Federal", href: "/federal" },
  { label: "Comunicados", href: "/comunicados" },
  { label: "Suporte", href: "/contato" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const [profile, setProfile] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      localStorage.setItem('referred_by', ref);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
        setProfile(data);
      };
      const fetchUnread = async () => {
        const { count } = await supabase.from("notifications").select("*", { count: 'exact', head: true }).eq("user_id", user.id).eq("is_read", false);
        setUnreadCount(count || 0);
      };
      fetchProfile();
      fetchUnread();

      // Realtime subscription for notifications
   const channel = supabase.channel(`notifications-${user.id}`)
     .on('postgres_changes', { 
       event: 'INSERT', 
       schema: 'public', 
       table: 'notifications', 
       filter: `user_id=eq.${user.id}` 
     }, (payload: any) => {
       setUnreadCount(prev => prev + 1);
       toast.info(payload.new.title, {
         description: payload.new.message,
         action: {
           label: "Ver",
           onClick: () => navigate("/conta#notificacoes")
         }
       });
     })
     .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'border-b bg-white/90 backdrop-blur-md py-2 shadow-sm' : 'bg-transparent py-4'}`}>
       <div className="container flex items-center justify-between">
         <div className="flex items-center gap-8">
           <Link to="/" className="flex items-center gap-2">
             <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
               <Ticket className="h-5 w-5 text-primary-foreground" />
             </div>
              <span className={`font-display text-lg font-black uppercase tracking-tighter ${scrolled ? 'text-foreground' : 'text-foreground'}`}>
               Rifas<span className="text-primary">Pro</span>
             </span>
           </Link>
 
           <nav className="hidden items-center gap-6 lg:flex">
             {navLinks.map((link) => (
               <Link
                 key={link.href}
                 to={link.href}
                  className={`text-[11px] font-bold uppercase tracking-wider transition-all hover:text-primary ${scrolled ? 'text-slate-500' : 'text-slate-600'}`}
               >
                 {link.label}
               </Link>
             ))}
           </nav>
         </div>

         <div className="flex items-center gap-4">
           <Link to="/contato" className="hidden sm:block">
             <Button variant="ghost" size="sm" className="gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
               <Activity className="h-4 w-4 text-primary" />
               Suporte
             </Button>
           </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="hidden items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 md:flex"
              >
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black italic text-primary">R$ {Number(profile?.balance || 0).toFixed(2)}</span>
              </motion.div>
              
               <button
                  onClick={() => navigate("/conta")}
                  className="relative rounded-full bg-slate-50 p-2 text-slate-500 hover:bg-slate-100 hover:text-primary transition-all border border-slate-100 shadow-sm"
               >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-4 ring-background animate-pulse" />
                )}
              </button>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link to="/admin">
                    <Button size="sm" variant="outline" className="h-10 rounded-full gap-2 border-primary/50 bg-primary/5 hover:bg-primary/10 font-black uppercase tracking-widest text-[10px] px-4 italic hidden lg:flex">
                      <Zap className="h-4 w-4 text-primary" />
                      Admin
                    </Button>
                  </Link>
                )}
                 <Link to="/conta">
                   <Button size="sm" variant="outline" className="h-10 rounded-full gap-2 border-slate-100 bg-white hover:bg-slate-50 font-black uppercase tracking-widest text-[10px] px-4 italic text-foreground shadow-sm">
                     <User className="h-4 w-4 text-primary" />
                     <span className="hidden lg:inline">{user.user_metadata?.name?.split(' ')[0] || "Perfil"}</span>
                   </Button>
                 </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/entrar">
                <Button size="sm" variant="ghost" className="h-10 rounded-full font-black uppercase tracking-widest text-[10px] px-6">
                  Entrar
                </Button>
              </Link>
              <Link to="/cadastrar">
                <Button size="sm" className="h-10 rounded-full font-black uppercase tracking-widest text-[10px] px-8 glow-primary shadow-lg shadow-primary/20">
                  Participar <Zap className="ml-1 h-3 w-3 fill-current" />
                </Button>
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 lg:hidden border border-slate-100 shadow-sm"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100 bg-white shadow-xl md:hidden"
          >
            <nav className="container flex flex-col gap-1 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link
                  to="/meus-numeros"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  Meus Bilhetes
                </Link>
              )}
              <div className="mt-2 flex gap-2 border-t border-slate-100 pt-3">
                {user ? (
                  <Button size="sm" variant="ghost" className="flex-1" onClick={handleSignOut}>
                    <LogOut className="mr-1.5 h-4 w-4" /> Sair
                  </Button>
                ) : (
                  <>
                    <Link to="/entrar" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button size="sm" variant="ghost" className="w-full">Entrar</Button>
                    </Link>
                    <Link to="/cadastrar" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button size="sm" className="w-full">Cadastrar</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
