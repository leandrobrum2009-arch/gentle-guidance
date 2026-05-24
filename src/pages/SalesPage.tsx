import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, MessageSquare, Shield, Zap, TrendingUp, Users, Smartphone, Globe, ArrowRight, Play, Palette, Sparkles, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useData";
import { Helmet } from "react-helmet-async";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import GoogleReviews from "@/components/GoogleReviews";


const faqs = [
  { q: "Preciso de conhecimento técnico para usar o sistema?", a: "Absolutamente não. Nosso painel é extremamente intuitivo, permitindo que qualquer pessoa gerencie rifas, banners e financeiro com poucos cliques." },
  { q: "Como funciona a integração de pagamentos?", a: "Integramos automaticamente com os principais gateways de pagamento (Mercado Pago, Paggue, etc.). O sistema confirma o pagamento instantaneamente e libera os números para o cliente." },
  { q: "O sistema é responsivo para celular?", a: "Sim! Nosso design é 100% mobile-first, garantindo uma experiência fluida para seus clientes comprarem rifas pelo celular ou computador." },
  { q: "Posso personalizar as cores e logotipo?", a: "Com certeza. Você tem controle total da identidade visual através do painel administrativo, sem precisar editar código." },
  { q: "Existe suporte técnico?", a: "Sim, todos os nossos planos contam com suporte dedicado. Além disso, oferecemos treinamento e tutoriais em vídeo para você começar com o pé direito." },
  { q: "Como funciona o sistema de afiliados?", a: "Você pode ativar um programa de afiliados onde seus vendedores ganham comissões por vendas realizadas, aumentando exponencialmente sua divulgação." },
  { q: "O sistema é seguro contra fraudes?", a: "Sim, contamos com proteção contra bots, bloqueio de números falsos e auditoria completa de cada transação." },
  { q: "Posso ter domínios próprios?", a: "Sim, você pode conectar seu próprio domínio (ex: www.suarifaprofissional.com.br) na plataforma." },
  { q: "O sistema emite números aleatórios automaticamente?", a: "Sim, o sistema gerencia automaticamente a numeração e reserva, evitando qualquer conflito de números repetidos." },
  { q: "Qual o prazo para ativação após a compra?", a: "A ativação é extremamente rápida, geralmente em poucas horas sua plataforma já está pronta para receber os primeiros acessos." }
];

export default function SalesPage() {
  const navigate = useNavigate();

  const { data: settings } = useSiteSettings();
  const siteName = settings?.site_name || "Plataforma de Rifas";
  const mainKeyword = settings?.sales_page_keywords?.split(",")?.[0]?.trim() || "sistema para rifas online";
  const supportWhatsapp = settings?.sales_page_whatsapp || settings?.support_whatsapp || "";


  const handleWhatsApp = () => {
    if (supportWhatsapp) {
      window.open(`https://wa.me/${supportWhatsapp.replace(/\D/g, '')}?text=Olá! Gostaria de saber mais sobre os planos do ${mainKeyword}.`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased overflow-x-hidden">
      <Helmet>
        <title>{`O Melhor ${mainKeyword} - Lucrativo e Completo`}</title>
      </Helmet>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Zap className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter italic uppercase">{siteName}</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#funcionalidades" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Funcionalidades</a>
            <a href="#depoimentos" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Depoimentos</a>
            <a href="#faq" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">FAQ</a>
            <Button onClick={handleWhatsApp} className="rounded-full px-6 font-bold shadow-lg shadow-primary/20">
              Começar Agora
            </Button>
          </div>
        </div>
      </header>


      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto text-center relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6 border border-primary/20">
            <Sparkles className="h-4 w-4" />
            <span>A plataforma número 1 do Brasil</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8">
            Lance seu próprio <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-500 to-primary">
              {mainKeyword}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12">
            Transforme seus sonhos em realidade com uma plataforma profissional, segura e pronta para escalar suas vendas.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={handleWhatsApp} className="h-16 px-10 text-lg font-bold rounded-full bg-primary hover:bg-primary/90">
              Quero Minha Plataforma
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/campanhas")} className="h-16 px-10 text-lg font-bold rounded-full border-2">
              Ver Demonstração
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="py-20 px-4">

        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">Por que escolher nossa solução?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "PIX Automático", desc: "Aprovação instantânea de pedidos, 24 horas por dia." },
              { icon: Shield, title: "Segurança Total", desc: "Proteção contra fraudes e bots com auditoria completa." },
              { icon: TrendingUp, title: "Escalabilidade", desc: "Suporta milhares de acessos simultâneos sem lentidão." },
              { icon: Users, title: "Sistema de Afiliados", desc: "Transforme seus clientes em vendedores com comissão automática." },
              { icon: Smartphone, title: "Mobile Friendly", desc: "Design impecável em qualquer celular ou tablet." },
              { icon: Palette, title: "Personalização", desc: "Mude cores, banners e layout pelo painel admin." }
            ].map((f, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -10 }}
                className="bg-card border border-border p-8 rounded-3xl shadow-xl shadow-primary/5 hover:border-primary/50 transition-colors"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                  <f.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="bg-secondary/30 relative">

        <GoogleReviews />
      </section>


      {/* FAQ */}
      <section id="faq" className="py-20 px-4">

        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-black text-center mb-12">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-card px-6 rounded-2xl border border-border">
                <AccordionTrigger className="text-lg font-bold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-lg leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto bg-primary rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/30">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap className="h-40 w-40" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-8 relative z-10">Pronto para faturar?</h2>
          <Button size="lg" onClick={handleWhatsApp} className="h-16 px-12 text-xl font-black rounded-full bg-white text-primary hover:bg-gray-100 relative z-10 shadow-xl">
            Falar com Consultor no WhatsApp
          </Button>
          <div className="mt-12 pt-8 border-t border-white/20 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm font-bold opacity-70">© 2024 {siteName}. Todos os direitos reservados.</p>
            <a href="https://ncbrasil.com.br" target="_blank" rel="noopener noreferrer" className="text-sm font-black uppercase tracking-widest hover:underline">
              Desenvolvido por NC Brasil
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

