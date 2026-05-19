
import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const REVIEWS = [
  {
    id: 1,
    name: "Carlos Eduardo",
    date: "há 2 dias",
    rating: 5,
    text: "Plataforma sensacional! Participei da rifa do iPhone e ganhei com apenas 5 cotas. Transparência total e entrega super rápida. Recomendo a todos!",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop",
    verified: true
  },
  {
    id: 2,
    name: "Ana Beatriz Rocha",
    date: "há 1 semana",
    rating: 5,
    text: "No começo fiquei com receio, mas depois que vi os sorteios ao vivo pelo Instagram, ganhei confiança. Ganhei o pix de R$ 500 ontem!",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&h=256&auto=format&fit=crop",
    verified: true
  },
  {
    id: 3,
    name: "Marcos Oliveira",
    date: "há 3 dias",
    rating: 5,
    text: "O melhor site de rifas do Brasil. O sistema de roleta e as caixas misteriosas deixam tudo muito mais divertido. Parabéns pela organização.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop",
    verified: true
  },
  {
    id: 4,
    name: "Fernanda Lima",
    date: "há 5 dias",
    rating: 4,
    text: "Excelente atendimento ao suporte. Tive uma dúvida sobre o pagamento e me responderam em menos de 5 minutos. Muito satisfeito.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop",
    verified: true
  },
  {
    id: 5,
    name: "Ricardo Santos",
    date: "há 1 mês",
    rating: 5,
    text: "Já sou cliente fiel. O site é leve, fácil de usar e os prêmios são entregues de verdade. Podem confiar!",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=256&h=256&auto=format&fit=crop",
    verified: true
  }
];

const GoogleReviews = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "start",
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 2 },
      '(min-width: 1024px)': { slidesToScroll: 3 },
    }
  }, [Autoplay({ delay: 4000 })]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <section className="container py-20 relative overflow-hidden">
      <div className="flex flex-col items-center text-center gap-4 mb-12">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-sm">
          <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" alt="Google" className="h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avaliações 4.9/5.0</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>
        <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
          O que dizem os <span className="text-primary neon-text-primary">Ganhadores</span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl uppercase tracking-widest font-medium">
          Confira o depoimento de quem já participou e transformou a sorte em realidade na nossa plataforma
        </p>
      </div>

      <div className="relative">
        <div className="overflow-hidden px-4 py-8" ref={emblaRef}>
          <div className="flex gap-6">
            {REVIEWS.map((review) => (
              <div key={review.id} className="flex-[0_0_100%] md:flex-[0_0_45%] lg:flex-[0_0_31%] min-w-0">
                <motion.div 
                  whileHover={{ y: -8 }}
                  className="h-full bg-card border border-border rounded-3xl p-8 flex flex-col gap-6 shadow-xl relative group transition-all duration-300 hover:border-primary/50"
                >
                  <Quote className="absolute top-6 right-8 h-12 w-12 text-primary/5 group-hover:text-primary/10 transition-colors" />
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="relative h-14 w-14 flex-shrink-0">
                      <img src={review.avatar} alt={review.name} className="h-full w-full rounded-full object-cover border-2 border-primary/20" />
                      {review.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-0.5 border-2 border-card">
                          <CheckCircle2 className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-black uppercase italic tracking-tighter leading-none text-foreground">{review.name}</h4>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{review.date}</p>
                    </div>
                  </div>

                  <div className="flex gap-1 relative z-10">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                    ))}
                  </div>

                  <p className="text-sm font-medium leading-relaxed text-muted-foreground relative z-10 flex-grow">
                    "{review.text}"
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-12 w-12 rounded-full border-border bg-card hover:bg-secondary shadow-lg"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-12 w-12 rounded-full border-border bg-card hover:bg-secondary shadow-lg"
            onClick={scrollNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;
