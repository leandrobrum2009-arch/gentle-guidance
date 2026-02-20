import { motion } from "framer-motion";
import { Megaphone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const announcements = [
  {
    id: "1",
    title: "Sorteio da 8ª Edição acontece hoje!",
    content:
      "Não perca! O sorteio da 8ª Edição acontece hoje às 18h. Garanta seus bilhetes antes que acabem!",
    date: "21/02/2026",
  },
  {
    id: "2",
    title: "Resultado da 7ª Edição",
    content:
      "Parabéns ao ganhador Thiago Rafael Lemes! Confira o vídeo do sorteio em nossas redes sociais.",
    date: "17/12/2025",
  },
  {
    id: "3",
    title: "Nova forma de pagamento disponível",
    content:
      "Agora você pode pagar seus bilhetes via PIX com confirmação instantânea. Mais praticidade para participar!",
    date: "01/12/2025",
  },
];

const Announcements = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2"
        >
          <Megaphone className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold">Comunicados</h1>
        </motion.div>

        <div className="space-y-4">
          {announcements.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border/50 bg-card p-5 card-hover"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-display text-base font-bold">{item.title}</h2>
                <span className="flex-shrink-0 text-xs text-muted-foreground">
                  {item.date}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{item.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Announcements;
