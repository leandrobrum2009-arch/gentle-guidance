import { useEffect } from "react";
import { runContrastAudit } from "@/lib/accessibility";
import LiveNotifications from "./components/LiveNotifications";
import Roulette from "./pages/Roulette";
import MysteryBox from "./pages/MysteryBox";
import Ranking from "./pages/Ranking";
import Affiliates from "./pages/Affiliates";
import FederalResults from "./pages/FederalResults";
import AdminFederal from "./pages/admin/Federal";
import AdminUsers from "./pages/admin/Users";
import AdminAffiliates from "./pages/admin/Affiliates";
import AdminRoulette from "./pages/admin/Roulette";
import AdminMysteryBoxes from "./pages/admin/MysteryBoxes";
import AdminBanners from "./pages/admin/Banners";
import AdminCoupons from "./pages/admin/Coupons";
import AdminNotifications from "./pages/admin/Notifications";
import AdminSettings from "./pages/admin/Settings";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider";
import Index from "./pages/Index";
import CampaignDetail from "./pages/CampaignDetail";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Winners from "./pages/Winners";
import Announcements from "./pages/Announcements";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCampaigns from "./pages/admin/Campaigns";
import AdminCampaignEdit from "./pages/admin/CampaignEdit";
import AdminOrders from "./pages/admin/Orders";
import AdminWinners from "./pages/admin/Winners";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    runContrastAudit();
    
    // Add small delay to catch dynamic content
    const timeout = setTimeout(runContrastAudit, 2000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="rifas-pro-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <LiveNotifications />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/campanhas" element={<Index />} />
                <Route path="/campanha/:id" element={<CampaignDetail />} />
                <Route path="/cadastrar" element={<Register />} />
                <Route path="/entrar" element={<Login />} />
                <Route path="/ganhadores" element={<Winners />} />
                <Route path="/federal" element={<FederalResults />} />
                <Route path="/comunicados" element={<Announcements />} />
                <Route path="/contato" element={<Support />} />
                <Route path="/roleta" element={<Roulette />} />
                <Route path="/caixa-misteriosa" element={<MysteryBox />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/afiliados" element={<Affiliates />} />
                <Route path="/checkout/:orderId" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                
                {/* Protected Routes */}
                <Route path="/conta" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/campanhas" element={<ProtectedRoute adminOnly><AdminCampaigns /></ProtectedRoute>} />
                <Route path="/admin/campanhas/nova" element={<ProtectedRoute adminOnly><AdminCampaignEdit /></ProtectedRoute>} />
                <Route path="/admin/campanhas/editar/:id" element={<ProtectedRoute adminOnly><AdminCampaignEdit /></ProtectedRoute>} />
                <Route path="/admin/pedidos" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
                <Route path="/admin/ganhadores" element={<ProtectedRoute adminOnly><AdminWinners /></ProtectedRoute>} />
                <Route path="/admin/federal" element={<ProtectedRoute adminOnly><AdminFederal /></ProtectedRoute>} />
                <Route path="/admin/usuarios" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/afiliados" element={<ProtectedRoute adminOnly><AdminAffiliates /></ProtectedRoute>} />
                <Route path="/admin/roletas" element={<ProtectedRoute adminOnly><AdminRoulette /></ProtectedRoute>} />
                <Route path="/admin/caixas" element={<ProtectedRoute adminOnly><AdminMysteryBoxes /></ProtectedRoute>} />
                <Route path="/admin/banners" element={<ProtectedRoute adminOnly><AdminBanners /></ProtectedRoute>} />
                <Route path="/admin/cupons" element={<ProtectedRoute adminOnly><AdminCoupons /></ProtectedRoute>} />
                <Route path="/admin/notificacoes" element={<ProtectedRoute adminOnly><AdminNotifications /></ProtectedRoute>} />
                <Route path="/admin/configuracoes" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
    
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
