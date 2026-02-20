import { Menu, X, User, Ticket, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

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

        <div className="flex items-center gap-2">
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
