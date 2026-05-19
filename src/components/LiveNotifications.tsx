import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingCart, Trophy, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type NotificationType = 'purchase' | 'winner';

interface LiveNotification {
  id: string;
  type: NotificationType;
  userName: string;
  avatarUrl: string | null;
  message: string;
  campaignTitle: string;
  timestamp: Date;
}

const LiveNotifications = () => {
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);

  const addNotification = (notif: Omit<LiveNotification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotif = { ...notif, id, timestamp: new Date() };
    setNotifications(prev => [...prev, newNotif]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const fetchInitialData = async () => {
    // Get last 3 paid orders
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*, profiles!user_id(name, avatar_url), campaigns!campaign_id(title)')
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false })
      .limit(3);

    // Get last 2 winners
    const { data: recentWinners } = await supabase
      .from('winners')
      .select('*, profiles!user_id(name, avatar_url), campaigns!campaign_id(title)')
      .order('created_at', { ascending: false })
      .limit(2);

    const allRecent = [
      ...(recentOrders?.map(o => ({ ...o, type: 'purchase' as const })) || []),
      ...(recentWinners?.map(w => ({ ...w, type: 'winner' as const })) || [])
    ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    allRecent.forEach((item, index) => {
      setTimeout(() => {
        addNotification({
          type: item.type,
          userName: (item as any).profiles?.name || 'Alguém',
          avatarUrl: (item as any).profiles?.avatar_url,
          message: item.type === 'purchase' 
            ? `acabou de comprar ${(item as any).quantity} cotas` 
            : `ganhou ${(item as any).prize_description} na cota ${(item as any).winning_ticket}`,
          campaignTitle: (item as any).campaigns?.title,
        });
      }, index * 3000);
    });
  };

  useEffect(() => {
    fetchInitialData();

    // Subscribe to new orders (purchases)
    const ordersChannel = supabase
      .channel('live-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders', filter: 'payment_status=eq.paid' },
        async (payload) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('user_id', payload.new.user_id)
            .single();
          
          const { data: campaign } = await supabase
            .from('campaigns')
            .select('title')
            .eq('id', payload.new.campaign_id)
            .single();

          if (profile && campaign) {
            addNotification({
              type: 'purchase',
              userName: profile.name || 'Alguém',
              avatarUrl: profile.avatar_url,
              message: `acabou de comprar ${payload.new.quantity} cotas`,
              campaignTitle: campaign.title,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to new winners
    const winnersChannel = supabase
      .channel('live-winners')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'winners' },
        async (payload) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('user_id', payload.new.user_id)
            .single();
          
          const { data: campaign } = await supabase
            .from('campaigns')
            .select('title')
            .eq('id', payload.new.campaign_id)
            .single();

          if (profile && campaign) {
            addNotification({
              type: 'winner',
              userName: profile.name || 'Alguém',
              avatarUrl: profile.avatar_url,
              message: `ganhou ${payload.new.prize_description} na cota ${payload.new.winning_ticket}`,
              campaignTitle: campaign.title,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(winnersChannel);
    };
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: -50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.8 }}
            className="pointer-events-auto flex items-center gap-3 p-3 rounded-2xl bg-card/90 backdrop-blur-xl border border-border shadow-2xl min-w-[300px] max-w-sm"
          >
            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'winner' ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'}`}>
              <Avatar className="h-full w-full border-2 border-background shadow-sm">
                <AvatarImage src={notif.avatarUrl || ""} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {notif.userName[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-foreground">
                <span className="text-primary">{notif.userName}</span> {notif.message}
              </p>
              <p className="text-[10px] text-muted-foreground truncate italic">
                ({notif.campaignTitle}) • {format(notif.timestamp, "HH:mm", { locale: ptBR })}
              </p>
            </div>

            <button 
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default LiveNotifications;
