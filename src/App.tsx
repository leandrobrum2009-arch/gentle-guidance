import { useEffect } from "react";
import { runContrastAudit, initContrastShortcut } from "@/lib/accessibility";
import LiveNotifications from "./components/LiveNotifications";
import { SiteSettingsInjector } from "./components/SiteSettingsInjector";
import Roulette from "./pages/Roulette";
import ScratchCard from "./pages/ScratchCard";
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
import AdminDiagnostics from "./pages/admin/Diagnostics";
import AdminScratchCards from "./pages/admin/ScratchCards";
import AdminPaymentLogs from "./pages/admin/PaymentLogs";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import SalesPage from "./pages/SalesPage";
import CampaignDetail from "./pages/CampaignDetail";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Winners from "./pages/Winners";
import Preview from "./pages/Preview";
import Announcements from "./pages/Announcements";
import Support from "./pages/Support";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCampaigns from "./pages/admin/Campaigns";
import AdminCampaignEdit from "./pages/admin/CampaignEdit";
import AdminOrders from "./pages/admin/Orders";
import AdminWinners from "./pages/admin/Winners";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const AppContent = () => {
  const { data: settings } = useQuery({
    queryKey: ["site-settings-app"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      return data;
    },
  });

  const showSalesPage = settings?.find(s => s.key === "show_sales_page")?.value === "true";

  useEffect(() => {
    runContrastAudit();
    initContrastShortcut();
    
    const timeout = setTimeout(runContrastAudit, 2000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={showSalesPage ? <SalesPage /> : <Index />} />
          <Route path="/demonstracao" element={<Index />} />
          <Route path="/campanhas" element={<Navigate to={showSalesPage ? "/demonstracao" : "/"} replace />} />
          <Route path="/rifa/:id" element={<CampaignDetail />} />
          <Route path="/rifas/:id" element={<Navigate to="/rifa/:id" replace />} />
          <Route path="/cadastrar" element={<Register />} />
          <Route path="/entrar" element={<Login />} />
          <Route path="/ganhadores" element={<Winners />} />
          <Route path="/resultado-federal" element={<FederalResults />} />
          <Route path="/federal" element={<Navigate to="/resultado-federal" replace />} />
          <Route path="/comunicados" element={<Announcements />} />
          <Route path="/contato" element={<Support />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/roleta-premiada" element={<Roulette />} />
          <Route path="/roleta" element={<Navigate to="/roleta-premiada" replace />} />
          <Route path="/caixa-misteriosa-de-premios" element={<MysteryBox />} />
          <Route path="/caixa-misteriosa" element={<Navigate to="/caixa-misteriosa-de-premios" replace />} />
          <Route path="/raspadinha-da-sorte" element={<ScratchCard />} />
          <Route path="/raspadinha" element={<Navigate to="/raspadinha-da-sorte" replace />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/afiliados" element={<Affiliates />} />
          <Route path="/termos-de-uso" element={<Terms />} />
          <Route path="/checkout/:orderId" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          
          {/* Protected Routes */}
          <Route path="/minha-conta" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/conta" element={<Navigate to="/minha-conta" replace />} />
          
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
          <Route path="/admin/raspadinhas" element={<ProtectedRoute adminOnly><AdminScratchCards /></ProtectedRoute>} />
          <Route path="/admin/caixas" element={<ProtectedRoute adminOnly><AdminMysteryBoxes /></ProtectedRoute>} />
          <Route path="/admin/banners" element={<ProtectedRoute adminOnly><AdminBanners /></ProtectedRoute>} />
          <Route path="/admin/cupons" element={<ProtectedRoute adminOnly><AdminCoupons /></ProtectedRoute>} />
          <Route path="/admin/notificacoes" element={<ProtectedRoute adminOnly><AdminNotifications /></ProtectedRoute>} />
          <Route path="/admin/configuracoes" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
          <Route path="/admin/diagnostico" element={<ProtectedRoute adminOnly><AdminDiagnostics /></ProtectedRoute>} />
          <Route path="/admin/pagamentos/logs" element={<ProtectedRoute adminOnly><AdminPaymentLogs /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider defaultTheme="light" storageKey="rifas-pro-theme">
          <TooltipProvider>
            <SiteSettingsInjector />
            <Toaster />
            <Sonner />
            <LiveNotifications />
            <AppContent />
          </TooltipProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;