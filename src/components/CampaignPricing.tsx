import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Zap, Check, Loader2, Minus, Plus, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Campaign, PriceBundle } from "@/hooks/useData";
import { cn } from "@/lib/utils";

interface CampaignPricingProps {
  campaign: Campaign;
  onBuy: (quantity: number | string[]) => void;
  isPurchasing?: boolean;
}

const DEFAULT_BUNDLES: PriceBundle[] = [
  { quantity: 50, price: 45.00, label: "ECONÔMICO" },
  { quantity: 100, price: 80.00, label: "MAIS VENDIDO 🔥", is_popular: true },
  { quantity: 500, price: 350.00, label: "VALOR VIP 👑" },
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

  const unitPrice = Number(campaign.ticket_price);

  const handleManualChange = (val: string) => {
    const num = parseInt(val) || 0;
    setQuantity(Math.min(num, campaign.total_tickets - campaign.sold_tickets));
  };

  const increment = () => setQuantity(prev => Math.min(prev + 1, campaign.total_tickets - campaign.sold_tickets));
  const decrement = () => setQuantity(prev => Math.max(0, prev - 1));

  return (
    <div className="space-y-6">
      {/* Unit Price Header */}
      <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-secondary/30 border border-border/50">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Valor por Cota</p>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-black italic tracking-tighter text-foreground">
            R$ {unitPrice.toFixed(2).replace(".", ",")}
          </span>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase">
            Promoção
          </Badge>
        </div>
      </div>

      {/* Discount Bundles Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {bundles.map((bundle) => {
          const isSelected = quantity === bundle.quantity;
          const discountPercent = Math.round((1 - (bundle.price / (bundle.quantity * unitPrice))) * 100);
          
          return (
            <motion.button
              key={bundle.quantity}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setQuantity(bundle.quantity)}
              className={cn(
                "relative flex flex-col items-center rounded-2xl border p-4 transition-all duration-300 overflow-hidden shimmer-effect",
                isSelected
                  ? "border-primary bg-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] text-white"
                  : "border-primary/20 bg-primary/5 hover:border-primary/50 text-foreground"
              )}
            >
              {bundle.is_popular && !isSelected && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg bg-amber-500 text-white border-none text-[8px] font-black uppercase px-1.5 py-0.5">
                    POPULAR
                  </Badge>
                </div>
              )}
              
              {discountPercent > 0 && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "absolute top-1 left-1 text-[8px] font-black px-1.5 py-0 h-4 border-none",
                    isSelected ? "bg-white/20 text-white" : "bg-green-500/10 text-green-500"
                  )}
                >
                  -{discountPercent}%
                </Badge>
              )}

              <span className="text-2xl font-black italic tracking-tighter mt-1">+{bundle.quantity}</span>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Cotas</span>
              
              <div className={cn(
                "mt-2 text-sm font-black italic",
                isSelected ? "text-white" : "text-primary"
              )}>
                R$ {bundle.price.toFixed(2).replace(".", ",")}
              </div>

              {isSelected && (
                <div className="absolute bottom-1 right-1">
                  <Check className="h-3 w-3 text-white/50" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Manual Selection and Summary */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-3 w-3" /> Quantidade Personalizada
            </p>
            {quantity > 0 && (
              <button 
                onClick={() => setQuantity(0)} 
                className="text-[9px] font-black text-primary uppercase hover:underline"
              >
                Limpar
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={decrement}
              className="h-12 w-12 rounded-xl border-border hover:bg-secondary"
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <div className="relative flex-1">
              <Input 
                type="number" 
                value={quantity || ""} 
                onChange={(e) => handleManualChange(e.target.value)}
                className="h-12 text-center font-black text-xl rounded-xl border-border bg-secondary/20 focus-visible:ring-primary"
                placeholder="Ex: 50"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="text-[10px] font-black text-muted-foreground uppercase">Cotas</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              size="icon" 
              onClick={increment}
              className="h-12 w-12 rounded-xl border-border hover:bg-secondary"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="pt-6 border-t border-dashed border-border flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Valor Total</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black italic tracking-tighter text-foreground">
                R$ {totalPrice.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Selecionadas</p>
            <p className="text-xl font-black italic text-primary">{quantity || 0}</p>
          </div>
        </div>

        <Button
          size="lg"
          className={cn(
            "w-full h-14 gap-3 text-base font-black uppercase tracking-widest rounded-2xl bg-primary hover:bg-primary/90 shadow-[0_10px_20px_rgba(var(--primary-rgb),0.2)] transition-all active:scale-[0.98] border-light-path",
            quantity > 0 && campaign.status === "active" && !isPurchasing && "animate-button-flash border-light-always"
          )}
          disabled={quantity === 0 || campaign.status !== "active" || isPurchasing}
          onClick={() => onBuy(quantity)}
        >
          {isPurchasing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              PROCESSANDO...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 fill-current" />
              QUERO PARTICIPAR
            </>
          )}
        </Button>
        
        <p className="text-[9px] text-center font-bold text-muted-foreground uppercase tracking-widest">
          🔒 Pagamento Seguro via PIX
        </p>
      </div>
    </div>
  );
};

export default CampaignPricing;