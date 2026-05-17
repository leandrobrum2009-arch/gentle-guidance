import { Menu, X, User, Ticket, LogOut, Bell, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const navLinks = [
  { label: "Início", href: "/" },
  { label: "Campanhas", href: "/campanhas" },
  { label: "Ganhadores", href: "/ganhadores" },
  { label: "Comunicados", href: "/comunicados" },
  { label: "Suporte", href: "/contato" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

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
      const channel = supabase.channel('schema-db-changes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
          setUnreadCount(prev => prev + 1);
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
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Ticket className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Rifas<span className="text-primary">Pro</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              to="/meus-numeros"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Meus Bilhetes
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden items-center gap-3 md:flex">
              <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 border border-border/50">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold">R$ {Number(profile?.balance || 0).toFixed(2)}</span>
              </div>
              <button className="relative p-2 text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -right-0 -top-0 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary p-0 text-[8px] font-bold text-primary-foreground border-2 border-background">
                    {unreadCount}
                  </Badge>
                )}
              </button>
            </div>
          )}
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground md:block">
                {user.user_metadata?.name || user.email}
              </span>
              <Button size="sm" variant="ghost" onClick={handleSignOut} className="hidden md:flex">
                <LogOut className="mr-1.5 h-4 w-4" />
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link to="/entrar">
                <Button size="sm" variant="ghost" className="hidden md:flex">
                  <User className="mr-1.5 h-4 w-4" />
                  Entrar
                </Button>
              </Link>
              <Link to="/cadastrar">
                <Button size="sm" className="hidden md:flex">
                  Cadastrar
                </Button>
              </Link>
            </>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-md p-2 text-muted-foreground md:hidden"
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
            className="overflow-hidden border-t border-border/50 md:hidden"
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
              <div className="mt-2 flex gap-2 border-t border-border/50 pt-3">
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
