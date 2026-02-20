import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import CampaignDetail from "./pages/CampaignDetail";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Winners from "./pages/Winners";
import Announcements from "./pages/Announcements";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/campanhas" element={<Index />} />
            <Route path="/campanha/:id" element={<CampaignDetail />} />
            <Route path="/cadastrar" element={<Register />} />
            <Route path="/entrar" element={<Login />} />
            <Route path="/ganhadores" element={<Winners />} />
            <Route path="/comunicados" element={<Announcements />} />
            <Route path="/contato" element={<Support />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
