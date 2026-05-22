import { useState, useEffect, useCallback } from "react";
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
  const [isPaused, setIsPaused] = useState(false);

  const allMedia = images;
  
  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % allMedia.length);
  }, [allMedia.length]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  }, [allMedia.length]);

  useEffect(() => {
    if (allMedia.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      next();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [allMedia.length, isPaused, next]);

  if (!allMedia || allMedia.length === 0) return null;

  return (
    <div className="w-full h-full flex flex-col items-center">
       <div 
        className="group relative w-full h-[300px] md:h-[450px] overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-border/50 bg-black flex items-center justify-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
         <AnimatePresence mode="wait">
           <motion.img
             key={currentIndex}
             src={allMedia[currentIndex]}
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             transition={{ duration: 0.5 }}
             className="h-full w-full object-cover"
           />
         </AnimatePresence>

        {videoUrl && (
          <Button
            size="icon"
            className="absolute bottom-4 right-4 h-12 w-12 rounded-full bg-primary/80 backdrop-blur-sm hover:bg-primary shadow-lg z-20"
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
              className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 z-10"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 z-10"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>

      {allMedia.length > 1 && (
        <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide max-w-full justify-center">
          {allMedia.map((img, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentIndex(i);
                setIsPaused(true);
              }}
              className={cn(
                "relative h-12 w-16 md:h-16 md:w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                currentIndex === i ? "border-primary scale-105 shadow-md shadow-primary/20" : "border-transparent opacity-50 hover:opacity-100"
              )}
            >
              <img src={img} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

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