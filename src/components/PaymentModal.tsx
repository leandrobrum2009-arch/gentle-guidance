import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, QrCode, Copy, Clock, CheckCircle2, XCircle, ShieldCheck, Landmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentModalProps {
  orderId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess: () => void;
}

export const PaymentModal = ({ orderId, isOpen, onOpenChange, onPaymentSuccess }: PaymentModalProps) => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(120); 
  const [status, setStatus] = useState<'pending' | 'paid' | 'expired'>('pending');
  const [isPayingWithBalance, setIsPayingWithBalance] = useState(false);
  const [userBalance, setUserBalance] = useState(0);

  const fetchOrder = useCallback(async (retryCount = 0) => {
    if (!orderId) return;
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: profile } = await supabase.from('profiles').select('balance').eq('user_id', userData.user.id).single();
        if (profile) setUserBalance(Number(profile.balance));
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*, campaigns(title)")
        .eq("id", orderId)
        .maybeSingle();
      
      if (error || !data) {
        if (retryCount < 3) {
          console.log(`Order not found, retrying... (${retryCount + 1})`);
          setTimeout(() => fetchOrder(retryCount + 1), 1000);
          return;
        }
        toast.error("Pedido não encontrado");
        onOpenChange(false);
        return;
      }
      
      setOrder(data);
      setLoading(false);

    if (data.payment_status === 'pending' && !data.pix_code) {
      try {
        const { data: pixData, error: pixError } = await supabase.functions.invoke('pix-payment', {
          body: { orderId, path: 'create' },
          method: 'POST'
        });
        
        if (!pixError && pixData) {
          setOrder((prev: any) => ({ 
            ...prev, 
            pix_code: pixData.pix_code, 
            pix_qr_code_base64: pixData.pix_qr_code_base64 
          }));
        }
      } catch (err) {
        console.error('Error generating PIX:', err);
      }
    }
  }, [orderId, onOpenChange]);

  useEffect(() => {
    if (isOpen && orderId) {
      setLoading(true);
      setTimeLeft(120);
      setStatus('pending');
      fetchOrder();

      const channel = supabase.channel(`payment-${orderId}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders', 
          filter: `id=eq.${orderId}` 
        }, (payload) => {
          if (payload.new.payment_status === 'paid') {
            setStatus('paid');
            setTimeout(() => {
              onPaymentSuccess();
              onOpenChange(false);
            }, 3000);
          }
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, orderId, fetchOrder, onPaymentSuccess, onOpenChange]);

  useEffect(() => {
    if (status !== 'pending' || !isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('expired');
          supabase.rpc('release_expired_tickets').then(() => {
             toast.error("Tempo esgotado! Os números foram liberados.");
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, isOpen]);

  const copyPix = () => {
    if (order?.pix_code) {
      navigator.clipboard.writeText(order.pix_code);
      toast.success("Código PIX copiado!");
    }
  };

  const handlePayWithBalance = async () => {
    if (!orderId || !order) return;
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    setIsPayingWithBalance(true);
    try {
      const { data: response, error } = await supabase.rpc('pay_with_balance', {
        p_order_id: orderId,
        p_user_id: userData.user.id
      });

      const data = response as any;

      if (error) throw error;

      if (data.success) {
        toast.success(data.message);
        setStatus('paid');
        setTimeout(() => {
          onPaymentSuccess();
          onOpenChange(false);
        }, 3000);
      } else {
        toast.error(data.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar pagamento com saldo");
    } finally {
      setIsPayingWithBalance(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-card border-border rounded-3xl p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="p-12 flex flex-col items-center justify-center gap-4"
            >
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Gerando seu PIX...</p>
            </motion.div>
          ) : status === 'paid' ? (
            <motion.div 
              key="paid"
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="p-10 text-center space-y-6"
            >
              <div className="mx-auto h-24 w-24 rounded-full bg-emerald-500/20 flex items-center justify-center border-4 border-emerald-500/30">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">PAGAMENTO CONFIRMADO!</h2>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Seus números já foram reservados. Boa sorte!</p>
              </div>
              <p className="text-xs text-primary font-bold animate-pulse">Redirecionando para seus títulos...</p>
            </motion.div>
          ) : status === 'expired' ? (
            <motion.div 
              key="expired"
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="p-10 text-center space-y-6"
            >
              <div className="mx-auto h-20 w-20 rounded-full bg-rose-500/20 flex items-center justify-center border-2 border-rose-500/30">
                <XCircle className="h-10 w-10 text-rose-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">TEMPO ESGOTADO</h2>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Infelizmente o tempo para pagamento expirou e seus números foram liberados para outros usuários.</p>
              </div>
              <Button variant="outline" className="w-full h-12 rounded-xl" onClick={() => onOpenChange(false)}>TENTAR NOVAMENTE</Button>
            </motion.div>
          ) : (
            <motion.div 
              key="payment"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <div className="bg-primary/10 p-6 flex flex-col items-center text-center gap-2 border-b border-primary/10 relative">
                 <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border border-primary/20 shadow-sm">
                   <Clock className={`h-3 w-3 ${timeLeft < 30 ? 'text-rose-500 animate-pulse' : 'text-primary'}`} />
                   <span className={`text-xs font-black font-mono ${timeLeft < 30 ? 'text-rose-500' : 'text-foreground'}`}>{formatTime(timeLeft)}</span>
                 </div>

                <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-2">
                  <QrCode className="h-6 w-6 text-primary-foreground" />
                </div>
                <DialogTitle className="text-xl font-black uppercase italic tracking-tighter text-foreground">
                  Finalize seu <span className="text-primary">Pagamento</span>
                </DialogTitle>
                <DialogDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Escaneie o QR Code ou copie o código PIX abaixo
                </DialogDescription>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex flex-col items-center gap-6">
                  {order?.pix_qr_code_base64 ? (
                    <div className="relative p-4 bg-white rounded-2xl shadow-xl ring-1 ring-black/5">
                      <img src={`data:image/png;base64,${order.pix_qr_code_base64}`} alt="QR Code PIX" className="h-44 w-44" />
                    </div>
                  ) : order?.is_manual ? (
                    <div className="relative p-12 bg-primary/5 rounded-3xl border-4 border-dashed border-primary/20 flex flex-col items-center gap-3">
                      <Landmark className="h-16 w-16 text-primary" />
                      <p className="text-xs font-black uppercase tracking-widest text-primary">Pagamento Manual</p>
                    </div>
                  ) : (
                    <div className="h-52 w-52 rounded-2xl bg-secondary animate-pulse flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )}

                  <div className="text-center space-y-1 w-full bg-secondary/50 p-4 rounded-2xl border border-border">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Valor do Pedido</p>
                    <p className="text-3xl font-black text-primary">R$ {Number(order?.total_amount || 0).toFixed(2).replace('.', ',')}</p>
                  </div>

                  <div className="w-full space-y-3">
                    <Button 
                      className="w-full h-14 rounded-2xl gap-2 font-black uppercase italic tracking-widest glow-primary shadow-lg shadow-primary/20 border-none" 
                      onClick={copyPix}
                    >
                      <Copy className="h-5 w-5" /> COPIAR CÓDIGO PIX
                    </Button>

                    {userBalance >= Number(order?.total_amount) && (
                      <Button 
                        variant="outline"
                        className="w-full h-14 rounded-2xl gap-2 font-black uppercase italic tracking-widest border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10" 
                        onClick={handlePayWithBalance}
                        disabled={isPayingWithBalance}
                      >
                        {isPayingWithBalance ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                        PAGAR COM MEU SALDO (R$ {userBalance.toFixed(2)})
                      </Button>
                    )}
                    
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Transação 100% segura e criptografada
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <p className="text-[10px] font-bold text-amber-600 text-center leading-relaxed">
                    PAGUE VIA PIX OU USE SEU SALDO PARA APROVAÇÃO IMEDIATA.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};