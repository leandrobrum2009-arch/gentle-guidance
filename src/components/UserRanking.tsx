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