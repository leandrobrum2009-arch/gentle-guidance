 import { useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { ChevronLeft, ChevronRight, Play } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { cn } from "@/lib/utils";
 
 interface RaffleGalleryProps {
   images: string[];
   videoUrl?: string;
 }
 
 const RaffleGallery = ({ images, videoUrl }: RaffleGalleryProps) => {
   const [currentIndex, setCurrentIndex] = useState(0);
   const [isVideoOpen, setIsVideoOpen] = useState(false);
 
   const allMedia = [...images];
   
   const next = () => setCurrentIndex((prev) => (prev + 1) % allMedia.length);
   const prev = () => setCurrentIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
 
   return (
     <div className="space-y-4">
        <div className="group relative w-full h-full overflow-hidden rounded-2xl border border-border/50 bg-black flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={allMedia[currentIndex]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-h-full max-w-full object-contain"
            />
          </AnimatePresence>
 
         {videoUrl && (
           <Button
             size="icon"
             className="absolute bottom-4 right-4 h-12 w-12 rounded-full bg-primary/80 backdrop-blur-sm hover:bg-primary shadow-lg"
             onClick={() => setIsVideoOpen(true)}
           >
             <Play className="h-6 w-6 fill-current" />
           </Button>
         )}
 
         {allMedia.length > 1 && (
           <>
             <Button
               size="icon"
               variant="ghost"
               className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/20 opacity-0 transition-opacity group-hover:opacity-100"
               onClick={prev}
             >
               <ChevronLeft className="h-6 w-6" />
             </Button>
             <Button
               size="icon"
               variant="ghost"
               className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/20 opacity-0 transition-opacity group-hover:opacity-100"
               onClick={next}
             >
               <ChevronRight className="h-6 w-6" />
             </Button>
           </>
         )}
       </div>
 
       <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
         {allMedia.map((img, i) => (
           <button
             key={i}
             onClick={() => setCurrentIndex(i)}
             className={cn(
               "relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
               currentIndex === i ? "border-primary scale-95" : "border-transparent opacity-50 hover:opacity-100"
             )}
           >
             <img src={img} className="h-full w-full object-cover" />
           </button>
         ))}
       </div>
 
       {isVideoOpen && videoUrl && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
           <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl">
             <iframe
               src={videoUrl.replace("watch?v=", "embed/")}
               className="h-full w-full"
               allowFullScreen
             />
             <Button
               variant="ghost"
               className="absolute top-4 right-4 text-white hover:bg-white/20"
               onClick={() => setIsVideoOpen(false)}
             >
               Fechar
             </Button>
           </div>
         </div>
       )}
     </div>
   );
 };
 
 export default RaffleGallery;