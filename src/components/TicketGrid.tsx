 import { useState, useMemo } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { Check, Info, Lock } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
 
 interface TicketGridProps {
   totalTickets: number;
   soldTickets: string[]; // Numbers already sold
   selectedTickets: string[];
   onSelect: (number: string) => void;
   maxSelection?: number;
   luckyNumbers?: string[];
 }
 
 const TicketGrid = ({
   totalTickets,
   soldTickets,
   selectedTickets,
   onSelect,
   maxSelection = 100,
   luckyNumbers = []
 }: TicketGridProps) => {
   const [viewRange, setViewRange] = useState({ start: 0, end: 100 });
 
   const tickets = useMemo(() => {
     const arr = [];
     for (let i = viewRange.start; i < Math.min(viewRange.end, totalTickets); i++) {
       const numStr = i.toString().padStart(totalTickets.toString().length, '0');
       arr.push({
         number: numStr,
         isSold: soldTickets.includes(numStr),
         isSelected: selectedTickets.includes(numStr),
         isLucky: luckyNumbers.includes(numStr)
       });
     }
     return arr;
   }, [viewRange, totalTickets, soldTickets, selectedTickets, luckyNumbers]);
 
   return (
     <div className="space-y-4">
       <div className="flex items-center justify-between">
         <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider">
           <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-secondary" /> Livre</div>
           <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-primary" /> Seu</div>
           <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-muted-foreground/30" /> Ocupado</div>
           <div className="flex items-center gap-1"><div className="h-3 w-3 rounded bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" /> Sorte</div>
         </div>
         
         <div className="flex items-center gap-2">
           <select 
             className="bg-background border border-border rounded px-2 py-1 text-xs"
             onChange={(e) => {
               const start = parseInt(e.target.value);
               setViewRange({ start, end: start + 100 });
             }}
           >
             {Array.from({ length: Math.ceil(totalTickets / 100) }).map((_, i) => (
               <option key={i} value={i * 100}>
                 {i * 100} - {Math.min((i + 1) * 100, totalTickets)}
               </option>
             ))}
           </select>
         </div>
       </div>
 
       <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
         <AnimatePresence mode="popLayout">
           {tickets.map((ticket) => (
             <motion.button
               key={ticket.number}
               layout
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.8 }}
               whileHover={!ticket.isSold ? { scale: 1.1, zIndex: 10 } : {}}
               whileTap={!ticket.isSold ? { scale: 0.95 } : {}}
               disabled={ticket.isSold}
               onClick={() => onSelect(ticket.number)}
               className={cn(
                 "relative aspect-square flex items-center justify-center rounded-lg text-[10px] font-bold transition-all",
                 ticket.isSold 
                   ? "bg-muted-foreground/10 text-muted-foreground/50 cursor-not-allowed" 
                   : ticket.isSelected 
                     ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] scale-110 z-10" 
                     : ticket.isLucky 
                       ? "bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)] border border-amber-300 animate-pulse"
                       : "bg-secondary/50 hover:bg-secondary border border-border/50 text-foreground"
               )}
             >
               {ticket.isSold ? <Lock className="h-3 w-3" /> : ticket.number}
               
               {ticket.isSelected && (
                 <motion.div 
                   initial={{ scale: 0 }} 
                   animate={{ scale: 1 }} 
                   className="absolute -top-1 -right-1 h-3 w-3 bg-white rounded-full flex items-center justify-center shadow-lg"
                 >
                   <Check className="h-2 w-2 text-primary" strokeWidth={4} />
                 </motion.div>
               )}
             </motion.button>
           ))}
         </AnimatePresence>
       </div>
 
       {selectedTickets.length > 0 && (
         <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
           <p className="text-[10px] font-bold uppercase text-primary mb-2 flex items-center gap-1">
             <Info className="h-3 w-3" /> Números Selecionados ({selectedTickets.length})
           </p>
           <div className="flex flex-wrap gap-1">
             {selectedTickets.map(num => (
               <Badge key={num} variant="secondary" className="text-[10px] bg-primary/10 border-primary/20">
                 #{num}
               </Badge>
             ))}
           </div>
         </div>
       )}
     </div>
   );
 };
 
 export default TicketGrid;