import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MysteryBox as MysteryBoxType } from "@/hooks/useData";
import { toast } from "sonner";

interface MysteryBoxProps {
  boxes: MysteryBoxType[];
}

const MysteryBox = ({ boxes }: MysteryBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBox, setSelectedBox] = useState<MysteryBoxType | null>(null);

  const handleOpen = () => {
    if (boxes.length === 0) return;
    const randomBox = boxes[Math.floor(Math.random() * boxes.length)];
    setSelectedBox(randomBox);
    setIsOpen(true);
    toast.success(`Parabéns! Você abriu uma Caixa Misteriosa!`);
  };

  return (
    <div className="flex flex-col items-center gap-6 py-10 bg-gradient-to-b from-secondary/30 to-background rounded-3xl border border-border/50">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
          <Sparkles className="h-3 w-3" />
          Caixa Misteriosa
        </div>
        <h2 className="text-2xl font-black italic uppercase tracking-tight">Prêmios Instantâneos</h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Ao comprar seus bilhetes, você pode desbloquear caixas com prêmios surpresa!
        </p>
      </div>

      <div className="relative h-48 w-48 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="closed"
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ 
                scale: [0.8, 1, 0.8],
                rotate: [-5, 5, -5],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative cursor-pointer"
              onClick={handleOpen}
            >
              <Box className="h-32 w-32 text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Gift className="h-10 w-10 text-primary-foreground animate-bounce" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-32 w-32 rounded-2xl bg-primary/20 border-2 border-primary/50 flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]"
              >
                <Gift className="h-16 w-16 text-primary" />
              </motion.div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-primary">{selectedBox?.title}</h3>
                <p className="text-xs text-muted-foreground">{selectedBox?.description}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Fechar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isOpen && (
        <Button 
          size="lg" 
          onClick={handleOpen}
          className="px-8 font-black uppercase tracking-tighter italic glow-primary"
        >
          Tentar Sorte
        </Button>
      )}
    </div>
  );
};

export default MysteryBox;

*** Add File: src/components/UserRanking.tsx
import { Trophy, Medal, Star } from "lucide-react";
import { useRanking } from "@/hooks/useData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const UserRanking = () => {
  const { data: ranking, isLoading } = useRanking(5);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-4 bg-primary/10 border-b border-border flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-sm uppercase tracking-wider">Top Compradores</h3>
      </div>
      <div className="divide-y divide-border">
        {ranking?.map((user, index) => (
          <div key={user.name} className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors">
            <div className="w-8 text-center font-display font-black text-lg text-muted-foreground">
              {index === 0 && <Medal className="h-6 w-6 text-yellow-500 mx-auto" />}
              {index === 1 && <Medal className="h-6 w-6 text-slate-400 mx-auto" />}
              {index === 2 && <Medal className="h-6 w-6 text-amber-700 mx-auto" />}
              {index > 2 && index + 1}
            </div>
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={user.avatar_url || ""} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                  <Star className="h-3 w-3 text-primary fill-current" />
                  {user.points} pts
                </span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                  Nível {Math.floor((user.xp || 0) / 100) + 1}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserRanking;