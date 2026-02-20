import { Ticket, Instagram, Youtube, MessageCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = [
  { label: "Início", href: "/" },
  { label: "Campanhas", href: "/campanhas" },
  { label: "Ganhadores", href: "/ganhadores" },
  { label: "Comunicados", href: "/comunicados" },
  { label: "Meus Bilhetes", href: "/meus-numeros" },
  { label: "Afiliados", href: "/afiliados" },
  { label: "Filantropia", href: "/filantropia" },
  { label: "Termos de Uso", href: "/termos-de-uso" },
  { label: "Suporte", href: "/contato" },
];

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/50 mt-12">
      <div className="container py-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <a href="/" className="mb-3 inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Ticket className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">
                Rifas<span className="text-primary">Pro</span>
              </span>
            </a>
            <p className="mt-2 max-w-xs text-xs text-muted-foreground">
              Plataforma profissional de rifas online. Participe e concorra a prêmios incríveis!
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex gap-3">
            <a href="#" className="rounded-lg bg-secondary p-2.5 text-muted-foreground transition-colors hover:text-foreground">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" className="rounded-lg bg-secondary p-2.5 text-muted-foreground transition-colors hover:text-foreground">
              <Youtube className="h-4 w-4" />
            </a>
            <a href="#" className="rounded-lg bg-secondary p-2.5 text-muted-foreground transition-colors hover:text-foreground">
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>

        <Separator className="my-6" />

        <p className="text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} RifasPro. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
