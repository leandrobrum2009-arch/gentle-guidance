import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageSquare, Layout, Shield, Zap, TrendingUp, Users, Smartphone, Globe, ArrowRight, Play, Server, Palette, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";

export default function SalesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("admin");

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      return data;
    },
  });

  const getSetting = (key: string) => settings?.find((s) => s.key === key)?.value || "";

  const siteName = getSetting("site_name") || "Plataforma de Rifas";
  const primaryColor = getSetting("primary_color") || "#000000";
  const supportWhatsapp = getSetting("sales_page_whatsapp") || getSetting("support_whatsapp") || "";
  const keywordsStr = getSetting("sales_page_keywords") || "sistema para rifas online, script para rifas online, tenha a sua rifa, site para fazer rifas";
  const keywords = keywordsStr.split(",").map(k => k.trim());
  const platformType = getSetting("sales_page_type") || "rifas";

  const mainKeyword = keywords[0] || "sistema para rifas online";

  const handleWhatsApp = () => {
    if (supportWhatsapp) {
      window.open(`https://wa.me/${supportWhatsapp.replace(/\D/g, '')}?text=Olá! Gostaria de saber mais sobre os planos do ${mainKeyword}.`, '_blank');
    }
  };

  const KeywordLink = ({ text }: { text: string }) => (
    <a href="https://ncbrasil.com.br" target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-primary/30 hover:decoration-primary transition-all">
      {text}
    </a>
  );

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Helmet>
        <title>{`O Melhor ${mainKeyword} - Lucrativo e Completo`}</title>
        <meta name="description" content={`Tenha agora o seu próprio ${mainKeyword}. Script completo com painel administrativo, integração de pagamentos e sistema de afiliados.`} />
        <meta name="keywords" content={keywordsStr} />
      </Helmet>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="text-primary-foreground h-5 w-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">{siteName}</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm">
            <a href="#features" className="hover:text-primary transition-colors">Funcionalidades</a>
            <a href="#panel" className="hover:text-primary transition-colors">Painel Admin</a>
            <a href="#plans" className="hover:text-primary transition-colors">Planos</a>
            <Button variant="ghost" size="sm" onClick={() => navigate("/campanhas")} className="font-bold">
              Ver Demonstração
            </Button>
            <Button size="sm" onClick={handleWhatsApp} className="bg-primary text-primary-foreground font-bold rounded-full px-6">
              Falar com Consultor
            </Button>
          </nav>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={handleWhatsApp}>
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>
      </header>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span>A plataforma nº 1 do Brasil</span>
          </div>
          <h1 className="font-display text-4xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1]">
            Lance agora o seu próprio <br />
            <span className="text-primary italic">
              <KeywordLink text={mainKeyword} />
            </span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
            Não compre apenas um <KeywordLink text={keywords[1] || "script"} />. Tenha um negócio completo, validado e altamente lucrativo com suporte profissional.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={handleWhatsApp} className="w-full md:w-auto bg-primary text-primary-foreground font-bold text-lg h-14 px-10 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">
              Quero Minha Plataforma
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/campanhas")} className="w-full md:w-auto font-bold text-lg h-14 px-10 rounded-2xl border-2">
              <Play className="mr-2 h-5 w-5 fill-current" />
              Ver Demonstração
            </Button>
          </div>
          
          {/* Hero Mockup */}
          <div className="mt-20 relative max-w-6xl mx-auto">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
            <div className="bg-card border-2 border-border/50 rounded-[2.5rem] p-3 shadow-2xl overflow-hidden backdrop-blur-sm">
              <div className="bg-background rounded-[2rem] overflow-hidden border border-border/50 aspect-video relative group">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" 
                  alt="Dashboard Preview" 
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent flex items-end p-8">
                  <div className="flex items-center gap-4 bg-background/50 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <TrendingUp className="text-green-500 h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-muted-foreground uppercase">Faturamento Hoje</div>
                      <div className="text-2xl font-black">R$ 12.450,00</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="bg-secondary/30 py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-5xl font-extrabold mb-4">
                Tudo o que o seu <br />
                <span className="text-primary italic">
                  <KeywordLink text={keywords[2] || "site para fazer rifas"} />
                </span> precisa
              </h2>
              <p className="text-muted-foreground font-medium">Funcionalidades pensadas para escala e segurança.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="h-6 w-6" />,
                  title: "PIX Automático",
                  desc: "Receba e aprove pedidos instantaneamente 24/7 com integração direta via Mercado Pago ou Paggue."
                },
                {
                  icon: <Users className="h-6 w-6" />,
                  title: "Sistema de Afiliados",
                  desc: "Transforme seus clientes em vendedores com comissionamento automático e painel exclusivo."
                },
                {
                  icon: <Smartphone className="h-6 w-6" />,
                  title: "Totalmente Mobile",
                  desc: "Interface ultra-rápida e otimizada para celulares, garantindo a melhor experiência de compra."
                },
                {
                  icon: <Shield className="h-6 w-6" />,
                  title: "Segurança Avançada",
                  desc: "Proteção contra bots, auditoria de pagamentos e criptografia de ponta a ponta para seus dados."
                },
                {
                  icon: <Palette className="h-6 w-6" />,
                  title: "Personalização Total",
                  desc: "Mude cores, banners, logos e estilos em segundos através do painel administrativo intuitivo."
                },
                {
                  icon: <Globe className="h-6 w-6" />,
                  title: "Otimizado para SEO",
                  desc: "Ranqueie no topo do Google e IAs com sitemap automático e meta tags dinâmicas."
                }
              ].map((feature, i) => (
                <div key={i} className="bg-card p-8 rounded-3xl border-2 border-border/50 hover:border-primary/40 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Admin Panel Deep Dive */}
        <section id="panel" className="py-24 container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="font-display text-3xl md:text-5xl font-extrabold mb-8">
                Controle total com o <br />
                <span className="text-primary italic">Painel Administrativo</span>
              </h2>
              <div className="space-y-4">
                {[
                  { id: "admin", label: "Gestão de Campanhas", desc: "Crie rifas ilimitadas, gerencie números, cotas e prêmios com facilidade." },
                  { id: "finance", label: "Controle Financeiro", desc: "Acompanhe vendas, lucro líquido, comissões e saques em tempo real." },
                  { id: "seo", label: "Marketing & SEO", desc: "Gerencie banners, cupons de desconto e otimize seu ranqueamento." }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${
                      activeTab === item.id 
                        ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" 
                        : "bg-transparent border-border/50 hover:border-border"
                    }`}
                  >
                    <h4 className="font-bold text-lg mb-1 flex items-center justify-between">
                      {item.label}
                      {activeTab === item.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    </h4>
                    <p className="text-muted-foreground text-sm font-medium">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 w-full">
              <div className="bg-card border-2 border-border/50 rounded-3xl p-4 shadow-2xl aspect-square overflow-hidden flex items-center justify-center relative">
                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                <Layout className="h-40 w-40 text-primary/20" />
                <p className="absolute bottom-12 text-center text-sm font-bold text-muted-foreground uppercase tracking-widest">Visualização em Tempo Real</p>
                {/* Here we could put real screenshots if available */}
              </div>
            </div>
          </div>
        </section>

        {/* Plans / Pricing */}
        <section id="plans" className="bg-secondary/30 py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-5xl font-extrabold mb-4">
                Planos flexíveis para o seu <br />
                <span className="text-primary italic">
                  <KeywordLink text={keywords[3] || "tenha a sua rifa"} />
                </span>
              </h2>
              <p className="text-muted-foreground font-medium">Escolha o modelo que melhor se adapta ao seu bolso.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Rental Plan */}
              <div className="bg-card border-2 border-border/50 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group hover:border-primary/40 transition-all">
                <div className="absolute top-6 right-6 px-4 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-black uppercase">Mais Procurado</div>
                <h3 className="text-2xl font-black mb-2">Plano Aluguel Mensal</h3>
                <p className="text-muted-foreground font-medium mb-8">Ideal para quem quer começar com baixo investimento.</p>
                <div className="space-y-4 mb-10">
                  {[
                    "Hospedagem de alta performance inclusa",
                    "Suporte técnico prioritário",
                    "Treinamento completo da equipe",
                    "Atualizações automáticas semanais",
                    "Personalização de Logo e Identidade",
                    "Backups diários automáticos"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                      <span className="font-bold text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={handleWhatsApp} className="w-full h-14 rounded-2xl font-bold text-lg bg-primary text-primary-foreground shadow-xl shadow-primary/20">
                  Consultar Valor Mensal
                </Button>
              </div>

              {/* Ownership Plan */}
              <div className="bg-card border-2 border-border/50 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group hover:border-primary/40 transition-all">
                <h3 className="text-2xl font-black mb-2">Adquirir Plataforma (Licença)</h3>
                <p className="text-muted-foreground font-medium mb-8">Para quem deseja ter o controle total e independência.</p>
                <div className="space-y-4 mb-10">
                  {[
                    "Licença vitalícia sem mensalidades",
                    "Instalação no seu servidor próprio",
                    "Acesso completo ao banco de dados",
                    "Código fonte otimizado (Script)",
                    "Manual de uso detalhado",
                    "Suporte inicial para instalação"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                      <span className="font-bold text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={handleWhatsApp} variant="outline" className="w-full h-14 rounded-2xl font-bold text-lg border-2">
                  Consultar Valor de Compra
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 container mx-auto px-4 text-center">
          <div className="bg-primary rounded-[3rem] p-12 md:p-24 text-primary-foreground relative overflow-hidden shadow-2xl shadow-primary/40">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap className="h-64 w-64" />
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-black mb-8 relative z-10 leading-tight">
              Pronto para faturar com o seu <br /> 
              <span className="underline decoration-white/30 italic">{mainKeyword}</span>?
            </h2>
            <p className="text-primary-foreground/80 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12 relative z-10">
              Junte-se a centenas de empreendedores que já mudaram de vida com a nossa tecnologia. Comece hoje mesmo!
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 relative z-10">
              <Button size="lg" onClick={handleWhatsApp} className="bg-white text-primary hover:bg-white/90 font-black text-xl h-16 px-12 rounded-2xl shadow-2xl">
                <MessageSquare className="mr-3 h-6 w-6" />
                Chamar no WhatsApp
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <Zap className="text-primary h-6 w-6" />
              <span className="font-display font-bold text-xl tracking-tight">{siteName}</span>
            </div>
            <div className="flex gap-8 text-sm font-bold text-muted-foreground">
              <a href="https://ncbrasil.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">NC BRASIL</a>
              <a href="#" className="hover:text-primary transition-colors">Termos</a>
              <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              © {new Date().getFullYear()} {siteName}. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}