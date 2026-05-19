import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Zap, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Campaign, PriceBundle } from "@/hooks/useData";
import { cn } from "@/lib/utils";

interface CampaignPricingProps {
  campaign: Campaign;
  onBuy: (quantity: number | string[]) => void;
  isPurchasing?: boolean;
}

const DEFAULT_BUNDLES: PriceBundle[] = [
  { quantity: 50, price: 45.00, label: "Econômico" },
  { quantity: 100, price: 80.00, label: "Mais Popular", is_popular: true },
  { quantity: 500, price: 350.00, label: "Melhor Valor" },
];

const CampaignPricing = ({ campaign, onBuy, isPurchasing }: CampaignPricingProps) => {
  const [quantity, setQuantity] = useState<number>(0);
  const bundles = campaign.price_bundles || DEFAULT_BUNDLES;

  const selectedBundle = useMemo(() => {
    return bundles.find(b => b.quantity === quantity);
  }, [quantity, bundles]);

  const totalPrice = useMemo(() => {
    if (selectedBundle) return selectedBundle.price;
    return quantity * Number(campaign.ticket_price);
  }, [quantity, selectedBundle, campaign.ticket_price]);

   return (
     <div className="space-y-8">
       <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
         {bundles.map((bundle) => (
           <motion.button
             key={bundle.quantity}
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             onClick={() => setQuantity(bundle.quantity)}
             className={cn(
               "relative flex flex-col items-center rounded-2xl border p-4 transition-all",
               quantity === bundle.quantity
                  ? "border-primary bg-primary/10 ring-1 ring-primary"
                  : "border-border bg-card hover:border-primary/50"
             )}
            >
              {bundle.label && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0 text-[8px] font-black uppercase tracking-wider rounded-full border border-primary/20",
                    bundle.is_popular ? "bg-primary text-white" : "bg-card text-muted-foreground"
                  )}
                >
                  {bundle.label}
                </Badge>
              )}
              <span className="text-xl font-black text-foreground">+{bundle.quantity}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-foreground/70 mt-0.5">Cotas</span>
              <div className="mt-2 text-sm font-black text-primary">
                R$ {bundle.price.toFixed(2).replace(".", ",")}
              </div>
             {quantity === bundle.quantity && (
               <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                 <Check className="h-3 w-3" />
               </div>
             )}
           </motion.button>
         ))}
       </div>
 
        <div className="bg-secondary/30 rounded-2xl p-6 border border-border">
         <div className="flex items-center justify-between mb-6">
           <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Total a pagar</p>
             <div className="flex items-baseline gap-2">
               <span className="text-3xl font-black text-foreground">
                 R$ {totalPrice.toFixed(2).replace(".", ",")}
               </span>
             </div>
           </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Cotas</p>
              <p className="text-xl font-black text-foreground">{quantity || 0}</p>
            </div>
         </div>
 
         <Button
           size="lg"
            className="w-full h-14 gap-3 text-lg font-black uppercase rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
           disabled={quantity === 0 || campaign.status !== "active" || isPurchasing}
           onClick={() => onBuy(quantity)}
         >
           {isPurchasing ? (
             <>
               <Loader2 className="h-5 w-5 animate-spin" />
               Reservando...
             </>
           ) : (
             <>
               <Zap className="h-5 w-5 fill-current" />
               Quero Participar
             </>
           )}
         </Button>
         
         <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-[1px] flex-1 bg-slate-200" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/70">Pague com PIX</p>
            <div className="h-[1px] flex-1 bg-slate-200" />
         </div>
       </div>
     </div>
   );
};

export default CampaignPricing;