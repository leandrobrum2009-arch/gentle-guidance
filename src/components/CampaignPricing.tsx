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
  { quantity: 10, price: 9.90, label: "Econômico" },
  { quantity: 50, price: 45.00, label: "Mais Popular", is_popular: true },
  { quantity: 100, price: 80.00, label: "Melhor Valor" },
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
                 ? "border-primary bg-primary/5 ring-1 ring-primary"
                 : "border-slate-200 bg-white hover:border-primary/50"
             )}
           >
             <span className="text-xl font-black text-slate-900">+{bundle.quantity}</span>
             <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Títulos</span>
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
 
       <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
         <div className="flex items-center justify-between mb-6">
           <div className="space-y-1">
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total a pagar</p>
             <div className="flex items-baseline gap-2">
               <span className="text-3xl font-black text-slate-900">
                 R$ {totalPrice.toFixed(2).replace(".", ",")}
               </span>
             </div>
           </div>
           <div className="text-right">
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Títulos</p>
             <p className="text-xl font-black text-slate-900">{quantity || 0}</p>
           </div>
         </div>
 
         <Button
           size="lg"
           className="w-full h-14 gap-3 text-lg font-black uppercase rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
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
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Pague com PIX</p>
            <div className="h-[1px] flex-1 bg-slate-200" />
         </div>
       </div>
     </div>
   );
};

export default CampaignPricing;