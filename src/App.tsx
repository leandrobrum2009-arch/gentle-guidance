 import FederalResults from "./pages/FederalResults";
 import AdminFederal from "./pages/admin/Federal";
 import Checkout from "./pages/Checkout";
             <Route path="/checkout/:orderId" element={<Checkout />} />
import Account from "./pages/Account";
import ProtectedRoute from "./components/ProtectedRoute";
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
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCampaigns from "./pages/admin/Campaigns";
import AdminOrders from "./pages/admin/Orders";
import AdminWinners from "./pages/admin/Winners";

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
             <Route path="/federal" element={<FederalResults />} />
            <Route path="/comunicados" element={<Announcements />} />
            <Route path="/contato" element={<Support />} />
            
            {/* Protected Routes */}
            <Route path="/conta" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/campanhas" element={<ProtectedRoute adminOnly><AdminCampaigns /></ProtectedRoute>} />
            <Route path="/admin/pedidos" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/ganhadores" element={<ProtectedRoute adminOnly><AdminWinners /></ProtectedRoute>} />
            <Route path="/admin/federal" element={<ProtectedRoute adminOnly><AdminFederal /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
