import { Ticket, Instagram, Youtube, MessageCircle, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = [
  { label: "Início", href: "/" },
  { label: "Campanhas", href: "/campanhas" },
  { label: "Ganhadores", href: "/ganhadores" },
  { label: "Federal", href: "/federal" },
  { label: "Comunicados", href: "/comunicados" },
  { label: "Meus Títulos", href: "/conta#tickets" },
  { label: "Afiliados", href: "/afiliados" },
  { label: "Filantropia", href: "/filantropia" },
  { label: "Termos de Uso", href: "/termos-de-uso" },
  { label: "Suporte", href: "/contato" },
];

const Footer = () => {
  return (
    <footer className="relative border-t border-border bg-background pt-20 pb-10 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 h-64 w-[80%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container relative z-10">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-6">
            <a href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                <Ticket className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-black italic uppercase italic tracking-tighter">
                Rifas<span className="text-primary neon-text-primary">Pro</span>
              </span>
            </a>
            <p className="max-w-xs text-xs font-medium leading-relaxed text-slate-500 uppercase tracking-widest">
              A maior e mais segura plataforma de rifas online do Brasil. Prêmios cinematográficos toda semana.
            </p>
            <div className="flex gap-3">
              {[Instagram, Youtube, MessageCircle].map((Icon, idx) => (
                <a key={idx} href="#" className="h-10 w-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-sm">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary neon-text-primary">Navegação</h3>
            <div className="grid grid-cols-2 gap-4">
              {footerLinks.slice(0, 6).map((link) => (
                <a key={link.href} href={link.href} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-foreground transition-colors">{link.label}</a>
              ))}
            </div>
          </div>

          {/* Support Info */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary neon-text-primary">Suporte</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs">
                <div className="h-8 w-8 rounded-lg bg-secondary border border-border flex items-center justify-center"><Phone className="h-4 w-4 text-primary" /></div>
                <span className="font-bold text-muted-foreground">0800 123 4567</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="h-8 w-8 rounded-lg bg-secondary border border-border flex items-center justify-center"><Mail className="h-4 w-4 text-primary" /></div>
                <span className="font-bold text-muted-foreground">ajuda@rifaspro.com</span>
              </div>
            </div>
          </div>

          {/* Newsletter / App */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary neon-text-primary">Certificações</h3>
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-2xl border border-border bg-secondary flex items-center gap-4 shadow-sm">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Pagamento Seguro</p>
                  <p className="text-[9px] text-slate-500">Processamento via SSL 256 bits</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <img src="https://logodownload.org/wp-content/uploads/2014/10/google-play-badge.png" className="h-8 object-contain" alt="" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/1200px-Download_on_the_App_Store_Badge.svg.png" className="h-8 object-contain" alt="" />
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-10 bg-border" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            © {new Date().getFullYear()} RifasPro. Desenvolvido com <span className="text-primary">❤</span> para vencedores.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Privacidade</a>
            <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Termos</a>
            <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
