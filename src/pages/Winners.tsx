import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WinnerCard from "@/components/WinnerCard";
import { mockWinners } from "@/data/mockData";

const Winners = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2"
        >
          <Trophy className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold">Ganhadores</h1>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {mockWinners.map((winner, i) => (
            <WinnerCard key={winner.id} winner={winner} index={i} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Winners;
