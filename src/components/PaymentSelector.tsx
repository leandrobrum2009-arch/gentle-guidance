 import { useState } from "react";
 import { motion } from "framer-motion";
 import { CreditCard, QrCode, Wallet, Landmark, Check } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { Button } from "@/components/ui/button";
 
 interface PaymentMethod {
   id: string;
   name: string;
   icon: any;
   description: string;
 }
 
 const METHODS: PaymentMethod[] = [
    { id: "pix", name: "PIX Real", icon: QrCode, description: "Aprovação imediata via Mercado Pago" },
   { id: "stripe", name: "Cartão de Crédito", icon: CreditCard, description: "Até 12x no cartão" },
   { id: "mercadopago", name: "Mercado Pago", icon: Wallet, description: "Saldo ou Cartão" },
   { id: "card", name: "Débito Online", icon: Landmark, description: "Aprovação rápida" },
 ];
 
 interface PaymentSelectorProps {
   onSelect: (id: string) => void;
   enabledMethods?: string[];
 }
 
 const PaymentSelector = ({ onSelect, enabledMethods = ["pix", "stripe", "mercadopago", "card"] }: PaymentSelectorProps) => {
   const [selected, setSelected] = useState<string>("pix");
 
   const filteredMethods = METHODS.filter(m => enabledMethods.includes(m.id));
 
   return (
     <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-600">Forma de Pagamento</h3>
       <div className="grid gap-3">
         {filteredMethods.map((method) => (
           <motion.button
             key={method.id}
             whileHover={{ scale: 1.01 }}
             whileTap={{ scale: 0.99 }}
             onClick={() => {
               setSelected(method.id);
               onSelect(method.id);
             }}
             className={cn(
               "relative flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
               selected === method.id
                 ? "border-primary bg-primary/5 shadow-lg"
                 : "border-border bg-card hover:border-primary/30"
             )}
           >
             <div className={cn(
               "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                selected === method.id ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-500"
             )}>
               <method.icon className="h-6 w-6" />
             </div>
             <div className="flex-1">
               <p className="font-bold">{method.name}</p>
                <p className="text-xs text-slate-500 font-medium">{method.description}</p>
             </div>
             {selected === method.id && (
               <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                 <Check className="h-4 w-4" />
               </div>
             )}
           </motion.button>
         ))}
       </div>
     </div>
   );
 };
 
 export default PaymentSelector;