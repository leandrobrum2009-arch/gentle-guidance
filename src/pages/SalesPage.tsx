import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, MessageSquare, Shield, Zap, TrendingUp, Users, Smartphone, Globe, ArrowRight, Play, Palette, Sparkles, Star, Lock, CreditCard, BarChart3, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useData";
import { SEO } from "@/components/SEO";
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
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans antialiased overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      <SEO 
        title={`O Melhor ${mainKeyword} - Lucrativo e Completo`}
        description={`Tenha agora o seu próprio ${mainKeyword}. Script completo com painel administrativo, integração de pagamentos e sistema de afiliados.`}
        keywords={settings?.sales_page_keywords}
      />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Zap className="h-6 w-6 text-black fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight">{siteName}</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#funcionalidades" className="text-sm font-medium hover:text-emerald-400 transition-colors">Funcionalidades</a>
            <a href="#depoimentos" className="text-sm font-medium hover:text-emerald-400 transition-colors">Depoimentos</a>
            <Button variant="ghost" className="text-sm font-medium" onClick={() => navigate("/campanhas")}>Demonstração</Button>
            <Button onClick={handleWhatsApp} className="rounded-full px-6 bg-emerald-500 hover:bg-emerald-600 text-black font-bold">Começar Agora</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#0A0A0A] to-[#0A0A0A]" />
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-8"
          >
            <Star className="w-4 h-4 fill-emerald-400" />
            <span className="text-sm font-semibold">Plataforma nº 1 em conversão</span>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1]">
            Lance seu próprio <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              {mainKeyword}
            </span>
          </h1>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
            Crie um site de rifas profissional, veloz e que converte visitantes em clientes em minutos. Pagamentos automáticos, gestão de cotas e sistema antifraude.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={handleWhatsApp} className="h-14 px-8 text-lg rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold">
              Criar meu site agora
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/campanhas")} className="h-14 px-8 text-lg rounded-full border-zinc-800 hover:bg-zinc-800">
              Ver demonstração <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          
          {/* Trust Badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-2"><Lock className="w-5 h-5" /> Ambiente Seguro</div>
            <div className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Pagamento Rápido</div>
            <div className="flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Gestão Inteligente</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Suporte 24/7</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="funcionalidades" className="py-24 px-6 bg-[#0F0F0F]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">Funcionalidades Poderosas</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "PIX Automático", desc: "Aprovação instantânea de pedidos, 24 horas por dia." },
              { icon: Shield, title: "Segurança Total", desc: "Proteção contra fraudes e bots com auditoria completa." },
              { icon: TrendingUp, title: "Alta Escalabilidade", desc: "Suporta milhões de números sem qualquer lentidão." },
              { icon: Users, title: "Programa de Afiliados", desc: "Seus vendedores vendem por você automaticamente." },
              { icon: Smartphone, title: "Mobile Otimizado", desc: "Experiência perfeita em qualquer dispositivo móvel." },
              { icon: Palette, title: "Design Personalizável", desc: "Controle total da marca pelo painel administrativo." }
            ].map((f, i) => (
              <div key={i} className="group p-8 bg-[#1A1A1A] rounded-3xl border border-white/5 hover:border-emerald-500/50 transition-all">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-24 px-6 bg-[#0A0A0A]">
        <div className="container mx-auto max-w-6xl">
          <GoogleReviews />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-[#0F0F0F]">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-black text-center mb-12">Dúvidas Frequentes</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-[#1A1A1A] border-none px-6 rounded-2xl">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-zinc-400 leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-5xl bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Zap className="w-64 h-64" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-8 text-white relative z-10">Pronto para escalar?</h2>
          <p className="text-emerald-100 text-xl mb-12 max-w-xl mx-auto relative z-10">Junte-se a mais de 500 organizadores de sucesso e comece a lucrar com sua plataforma hoje mesmo.</p>
          <Button size="lg" onClick={handleWhatsApp} className="h-16 px-12 text-xl font-bold rounded-full bg-white text-emerald-900 hover:bg-emerald-50 relative z-10 shadow-2xl">
            Falar com consultor agora
          </Button>
          <div className="mt-16 pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-6 opacity-80 text-sm">
            <p>© 2025 {siteName}. Todos os direitos reservados.</p>
            <a href="https://ncbrasil.com.br" target="_blank" rel="noopener noreferrer" className="hover:underline">
              Desenvolvido por NC Brasil
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
