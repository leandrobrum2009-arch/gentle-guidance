import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Campaign, PriceBundle } from "@/hooks/useData";
import { cn } from "@/lib/utils";

interface CampaignPricingProps {
  campaign: Campaign;
  onBuy: (quantity: number) => void;
}

const DEFAULT_BUNDLES: PriceBundle[] = [
  { quantity: 10, price: 9.90, label: "Econômico" },
  { quantity: 50, price: 45.00, label: "Mais Popular", is_popular: true },
  { quantity: 100, price: 80.00, label: "Melhor Valor" },
];

const CampaignPricing = ({ campaign, onBuy }: CampaignPricingProps) => {
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {bundles.map((bundle) => (
          <motion.button
            key={bundle.quantity}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setQuantity(bundle.quantity)}
            className={cn(
              "relative flex flex-col items-center rounded-2xl border-2 p-4 transition-all",
              quantity === bundle.quantity
                ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            {bundle.is_popular && (
              <Badge className="absolute -top-3 bg-primary text-[10px] font-bold uppercase tracking-wider">
                Popular
              </Badge>
            )}
            <span className="text-2xl font-black text-foreground">
              {bundle.quantity}
            </span>
            <span className="text-[10px] font-medium uppercase text-muted-foreground">
              Bilhetes
            </span>
            <div className="mt-3 text-lg font-bold text-primary">
              R$ {bundle.price.toFixed(2).replace(".", ",")}
            </div>
            {quantity === bundle.quantity && (
              <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <Check className="h-4 w-4" />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total selecionado</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-primary">
                R$ {totalPrice.toFixed(2).replace(".", ",")}
              </span>
              {selectedBundle && (
                <span className="text-xs text-muted-foreground line-through">
                  R$ {(bundle.quantity * Number(campaign.ticket_price)).toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">Quantidade</p>
            <p className="text-2xl font-bold">{quantity || 0}</p>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full h-14 gap-3 text-lg font-black uppercase tracking-wide glow-primary"
          disabled={quantity === 0 || campaign.status !== "active"}
          onClick={() => onBuy(quantity)}
        >
          <ShoppingCart className="h-6 w-6" />
          Quero Participar
          <Zap className="h-5 w-5 fill-current" />
        </Button>
        
        <p className="mt-4 text-center text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
          ⚡ Confirmação instantânea via PIX ⚡
        </p>
      </div>
    </div>
  );
};

export default CampaignPricing;