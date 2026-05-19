import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { Zap, Star, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Campaign } from "@/hooks/useData";
import { Link } from "react-router-dom";
import CountdownTimer from "../CountdownTimer";

interface HeroModel2Props {
  campaigns: Campaign[];
}

const HeroModel2 = ({ campaigns }: HeroModel2Props) => {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 6000 })]);

  return (
    <section className="relative min-h-[500px] md:min-h-[600px] bg-zinc-950 flex items-center overflow-hidden" ref={emblaRef}>
      <div className="flex w-full h-full">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="relative min-w-full flex-[0_0_100%] flex items-center justify-center py-20">
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0">
               <img src={campaign.image_url || "/placeholder.svg"} className="h-full w-full object-cover opacity-20 blur-xl scale-110" alt="" />
               <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
            </div>

            <div className="container relative z-10 flex flex-col items-center text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="space-y-8 max-w-4xl"
              >
                <div className="space-y-4">
                  <Badge className="bg-primary/20 text-primary border-primary/20 px-6 py-1.5 text-xs font-black uppercase tracking-[0.3em] italic">
                    ⭐ OFERTA ESPECIAL ⭐
                  </Badge>
                  <h1 className="text-4xl md:text-7xl lg:text-8xl font-black uppercase italic leading-none tracking-tighter text-white filter drop-shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">
                    <span className="text-animate-gradient">{campaign.title}</span>
                  </h1>
                </div>

                <div className="flex flex-col items-center gap-6">
                  {campaign.draw_date && (
                    <div className="p-1 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                      <CountdownTimer targetDate={campaign.draw_date} className="scale-125 md:scale-150 p-8" />
                    </div>
                  )}
                  
                  <p className="text-lg md:text-2xl text-white/60 font-bold max-w-2xl italic">
                    "{campaign.subtitle || 'Sua chance de mudar de vida com apenas um clique.'}"
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 pt-8">
                  <Link to={`/campanha/${campaign.id}`}>
                    <Button size="lg" className="h-20 rounded-[2rem] px-12 gap-4 text-xl font-black uppercase italic tracking-widest glow-primary hover:scale-105 transition-transform shadow-[0_0_50px_rgba(var(--primary-rgb),0.4)] border-light-path border-[#22c55e]/30">
                      RESGATAR MEU PRÊMIO <ArrowRight className="h-6 w-6" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
      </div>
    </section>
  );
};

export default HeroModel2;