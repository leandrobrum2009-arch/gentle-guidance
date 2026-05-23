 import { useEffect, useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import confetti from "canvas-confetti";
 import { CheckCircle2, Star, Zap } from "lucide-react";
 
 interface PurchaseAnimationProps {
   isVisible: boolean;
   onComplete: () => void;
   type?: "explosion" | "confirmation";
 }
 
 const PurchaseAnimation = ({ isVisible, onComplete, type = "explosion" }: PurchaseAnimationProps) => {
   useEffect(() => {
     if (isVisible && type === "explosion") {
       const duration = 1.5 * 1000;
       const animationEnd = Date.now() + duration;
       const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
 
       const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
 
       const interval: any = setInterval(function() {
         const timeLeft = animationEnd - Date.now();
 
         if (timeLeft <= 0) {
           return clearInterval(interval);
         }
 
         const particleCount = 50 * (timeLeft / duration);
         confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
         confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
       }, 250);
 
       const timer = setTimeout(() => {
         onComplete();
       }, duration + 500);
 
       return () => {
         clearInterval(interval);
         clearTimeout(timer);
       };
     }
   }, [isVisible, type, onComplete]);
 
   return (
     <AnimatePresence>
       {isVisible && (
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md"
         >
           <motion.div
             initial={{ scale: 0.5, y: 50 }}
             animate={{ scale: 1, y: 0 }}
             exit={{ scale: 1.5, opacity: 0 }}
             className="relative flex flex-col items-center gap-6 text-center"
           >
             <div className="relative">
               <motion.div
                 animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="h-24 w-24 rounded-full bg-primary flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary-rgb),0.8)]"
               >
                 <CheckCircle2 className="h-12 w-12 text-primary-foreground" />
               </motion.div>
               
               <motion.div
                 animate={{ opacity: [0, 1, 0], scale: [1, 2, 1] }}
                 transition={{ repeat: Infinity, duration: 1.5 }}
                 className="absolute inset-0 rounded-full border-2 border-primary"
               />
             </div>
 
             <div className="space-y-2">
               <h2 className="text-4xl font-black uppercase tracking-tighter text-white sm:text-6xl">
                 Sucesso!
               </h2>
               <p className="text-xl font-bold text-primary">Seus números foram reservados!</p>
             </div>
 
             <div className="flex gap-4">
               <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm">
                 <Star className="h-4 w-4 text-amber-400 fill-current" /> Sorte extra ativada
               </div>
               <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm">
                 <Zap className="h-4 w-4 text-primary fill-current" /> Processamento instantâneo
               </div>
             </div>
 
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={onComplete}
               className="mt-8 rounded-full bg-primary px-10 py-4 text-lg font-black uppercase tracking-widest text-primary-foreground shadow-xl hover:bg-primary/90"
             >
               Ir para Pagamento
             </motion.button>
           </motion.div>
         </motion.div>
       )}
     </AnimatePresence>
   );
 };
 
 export default PurchaseAnimation;