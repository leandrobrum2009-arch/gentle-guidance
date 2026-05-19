import { Trophy, Medal, Star, Crown, Zap, TrendingUp, Users } from "lucide-react";
import { useRanking } from "@/hooks/useData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UserRanking = () => {
  const [category, setCategory] = useState<'points' | 'xp'>('points');
  const { data: ranking, isLoading } = useRanking(15, category);

  const podium = ranking?.slice(0, 3) || [];
  const rest = ranking?.slice(3) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 h-64 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-full w-full rounded-3xl" />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header with Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Elite da Plataforma</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Compita com os melhores e ganhe destaque</p>
          </div>
        </div>

        <Tabs value={category} onValueChange={(v: any) => setCategory(v)} className="w-full md:w-auto">
          <TabsList className="bg-white/5 border border-white/10 h-12 p-1 rounded-2xl">
            <TabsTrigger value="points" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white uppercase font-black text-[10px] tracking-widest gap-2">
              <Star className="h-3 w-3" /> Pontos
            </TabsTrigger>
            <TabsTrigger value="xp" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white uppercase font-black text-[10px] tracking-widest gap-2">
              <Zap className="h-3 w-3" /> Experiência
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Podium View */}
      <div className="grid grid-cols-3 gap-2 md:gap-6 items-end pt-10 pb-4">
        {/* Second Place */}
        <PodiumPlace 
          user={podium[1]} 
          rank={2} 
          category={category}
          className="order-1"
        />
        
        {/* First Place */}
        <PodiumPlace 
          user={podium[0]} 
          rank={1} 
          category={category}
          className="order-2"
        />

        {/* Third Place */}
        <PodiumPlace 
          user={podium[2]} 
          rank={3} 
          category={category}
          className="order-3"
        />
      </div>

      {/* List View */}
      <div className="grid gap-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            {rest.map((user, index) => (
              <motion.div
                key={user.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group flex items-center justify-between p-4 bg-[#0d0d0f]/50 border border-white/5 rounded-3xl hover:bg-white/5 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <span className="w-6 text-sm font-black italic text-foreground group-hover:text-primary transition-colors">
                    #{index + 4}
                  </span>
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-white/5 group-hover:border-primary/30 transition-all">
                      <AvatarImage src={user.avatar_url || ""} />
                      <AvatarFallback className="bg-white/5 text-white font-black uppercase text-xs">
                        {user.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center">
                      <span className="text-[8px] font-black text-primary">{user.vip_level || 1}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tighter text-white">{user.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <Badge variant="outline" className="text-[8px] border-white/10 text-muted-foreground uppercase font-black px-2 py-0 h-4">
                        {user.xp} XP
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-black italic text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]">
                    {category === 'points' ? user.points : user.xp}
                    <span className="text-[10px] uppercase ml-1 opacity-50">{category === 'points' ? 'pts' : 'xp'}</span>
                  </p>
                </div>
              </motion.div>
            ))}
            
            {rest.length === 0 && (
              <div className="text-center py-10 opacity-20 italic uppercase font-black text-xs tracking-widest">
                Fim da lista
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

const PodiumPlace = ({ user, rank, category, className }: { user: any, rank: number, category: string, className?: string }) => {
  if (!user) return <div className={cn("flex-1", className)} />;

  const isFirst = rank === 1;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.2, type: "spring", stiffness: 100 }}
      className={cn(
        "flex-1 flex flex-col items-center relative",
        isFirst ? "z-10" : "z-0",
        className
      )}
    >
      <div className="relative mb-4 group">
        {/* Glow behind avatar */}
        <div className={cn(
          "absolute inset-0 blur-2xl opacity-40 rounded-full",
          rank === 1 ? "bg-yellow-500" : rank === 2 ? "bg-slate-300" : "bg-amber-700"
        )} />
        
        <div className={cn(
          "relative h-20 w-20 md:h-28 md:w-28 rounded-3xl p-1 bg-gradient-to-tr transition-transform duration-500 group-hover:scale-110",
          rank === 1 ? "from-yellow-400 to-amber-600 rotate-3" : 
          rank === 2 ? "from-slate-300 to-slate-500 -rotate-3" : 
          "from-amber-600 to-amber-900 rotate-6"
        )}>
          <div className="h-full w-full rounded-[1.4rem] bg-[#0d0d0f] p-1">
            <Avatar className="h-full w-full rounded-2xl border-none">
              <AvatarImage src={user.avatar_url || ""} />
              <AvatarFallback className="bg-zinc-800 text-white font-black text-xl">
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Crown / Rank Icon */}
        <div className={cn(
          "absolute -top-6 left-1/2 -translate-x-1/2 z-20 transition-transform duration-500 group-hover:-translate-y-2",
          rank === 1 ? "scale-125" : "scale-100"
        )}>
          {rank === 1 ? (
            <Crown className="h-10 w-10 text-yellow-400 fill-yellow-400 filter drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
          ) : (
            <div className={cn(
              "h-8 w-8 rounded-full border-2 flex items-center justify-center font-black italic text-sm",
              rank === 2 ? "bg-slate-300 border-slate-400 text-slate-800" : "bg-amber-700 border-amber-800 text-amber-100"
            )}>
              {rank}
            </div>
          )}
        </div>
      </div>

      <div className="text-center space-y-1">
        <h3 className="text-xs md:text-sm font-black uppercase tracking-tighter truncate max-w-[100px] md:max-w-none">
          {user.name}
        </h3>
        <div className="flex flex-col items-center">
          <p className={cn(
            "font-black italic tracking-tighter",
            isFirst ? "text-xl md:text-2xl text-yellow-400" : "text-lg md:text-xl text-white/80"
          )}>
            {category === 'points' ? user.points : user.xp}
            <span className="text-[8px] md:text-[10px] uppercase ml-1 opacity-50 font-black">{category === 'points' ? 'pts' : 'xp'}</span>
          </p>
          <Badge variant="outline" className="text-[7px] md:text-[8px] border-white/10 text-muted-foreground uppercase font-black px-2 py-0 h-3 md:h-4">
            NÍVEL {user.vip_level || 1} VIP
          </Badge>
        </div>
      </div>

      {/* Podium Block */}
      <div className={cn(
        "mt-4 w-full rounded-t-3xl border-t border-x border-white/5 bg-gradient-to-b from-white/5 to-transparent",
        rank === 1 ? "h-24 md:h-32 shadow-[0_0_40px_rgba(250,204,21,0.05)]" : 
        rank === 2 ? "h-16 md:h-24" : 
        "h-12 md:h-20"
      )} />
    </motion.div>
  );
};

export default UserRanking;