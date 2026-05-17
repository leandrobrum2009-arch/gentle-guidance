 import React, { useCallback } from "react";
 import useEmblaCarousel from "embla-carousel-react";
 import Autoplay from "embla-carousel-autoplay";
 import { motion } from "framer-motion";
 import { ChevronLeft, ChevronRight, Zap, Trophy, Users } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Campaign } from "@/hooks/useData";
 import { Link } from "react-router-dom";
 
 interface RaffleCarouselProps {
   campaigns: Campaign[];
 }
 
 const RaffleCarousel = ({ campaigns }: RaffleCarouselProps) => {
   const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);
 
   const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
   const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
 
   return (
     <section className="relative overflow-hidden group">
       <div className="overflow-hidden" ref={emblaRef}>
         <div className="flex">
           {campaigns.map((campaign) => (
             <div key={campaign.id} className="relative min-w-full flex-[0_0_100%] h-[500px] md:h-[650px]">
               {/* Background with parallax-like effect */}
               <div className="absolute inset-0">
                 <img src={campaign.image_url || ""} className="h-full w-full object-cover" alt={campaign.title} />
                 <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
                 <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
               </div>
 
                <div className="container relative h-full flex items-center pt-20 md:pt-0">
                 <motion.div 
                   initial={{ opacity: 0, x: -50 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   transition={{ duration: 0.8 }}
                   className="max-w-2xl space-y-6"
                 >
                   <div className="flex items-center gap-2">
                     <Badge className="bg-primary text-primary-foreground font-black italic px-3 py-1">
                       🔥 DESTAQUE DA SEMANA
                     </Badge>
                     {campaign.urgency_tag && (
                       <Badge variant="outline" className="border-primary/50 text-primary uppercase font-bold text-[10px]">
                         {campaign.urgency_tag}
                       </Badge>
                     )}
                   </div>
 
                    <h1 className="text-4xl md:text-6xl lg:text-8xl font-black uppercase italic leading-[0.9] tracking-tighter">
                     {campaign.title.split(' ')[0]} <br />
                     <span className="text-primary neon-text-primary">
                       {campaign.title.split(' ').slice(1).join(' ')}
                     </span>
                   </h1>
 
                   <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-lg leading-tight">
                     {campaign.subtitle || campaign.description?.slice(0, 100) + '...'}
                   </p>
 
                   <div className="flex flex-wrap items-center gap-8 py-4">
                     <div className="flex flex-col gap-1">
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Prêmio Estimado</span>
                       <span className="text-2xl font-black text-white">R$ 50.000,00</span>
                     </div>
                     <div className="flex flex-col gap-1">
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Participantes</span>
                       <span className="text-2xl font-black text-white">1.240+</span>
                     </div>
                     <div className="flex flex-col gap-1">
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sorteio em</span>
                       <span className="text-2xl font-black text-primary">12 dias</span>
                     </div>
                   </div>
 
                   <div className="flex items-center gap-4 pt-4">
                     <Link to={`/campaign/${campaign.id}`}>
                       <Button size="lg" className="h-16 rounded-2xl px-10 font-black uppercase italic tracking-widest gap-2 glow-primary text-lg">
                         Participar Agora <Zap className="h-5 w-5 fill-current" />
                       </Button>
                     </Link>
                     <Button variant="outline" size="lg" className="h-16 rounded-2xl px-8 border-white/10 hover:bg-white/5 font-black uppercase italic tracking-widest text-white backdrop-blur-md">
                       Ver Detalhes
                     </Button>
                   </div>
                 </motion.div>
               </div>
             </div>
           ))}
         </div>
       </div>
 
       {/* Navigation Buttons */}
       <Button 
         variant="ghost" 
         size="icon" 
         className="absolute left-4 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-background/20 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
         onClick={scrollPrev}
       >
         <ChevronLeft className="h-8 w-8 text-white" />
       </Button>
       <Button 
         variant="ghost" 
         size="icon" 
         className="absolute right-4 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-background/20 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
         onClick={scrollNext}
       >
         <ChevronRight className="h-8 w-8 text-white" />
       </Button>
 
       {/* Progress Bar (Simulated for each slide) */}
       <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/5 overflow-hidden">
         <motion.div 
           animate={{ x: ["-100%", "0%"] }}
           transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
           className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]"
         />
       </div>
     </section>
   );
 };
 
 export default RaffleCarousel;