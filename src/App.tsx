import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Calculator from "./pages/Calculator";
import Login from "./pages/Login";
import Register from "./pages/Register";
import InvestorDashboard from "./pages/dashboard/InvestorDashboard";
import CorporateDashboard from "./pages/dashboard/CorporateDashboard";
import NBFCDashboard from "./pages/dashboard/NBFCDashboard";
import ImplementerDashboard from "./pages/dashboard/ImplementerDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard/investor" element={<InvestorDashboard />} />
          <Route path="/dashboard/investor/*" element={<InvestorDashboard />} />
          <Route path="/dashboard/corporate" element={<CorporateDashboard />} />
          <Route path="/dashboard/corporate/*" element={<CorporateDashboard />} />
          <Route path="/dashboard/nbfc" element={<NBFCDashboard />} />
          <Route path="/dashboard/nbfc/*" element={<NBFCDashboard />} />
          <Route path="/dashboard/implementer" element={<ImplementerDashboard />} />
          <Route path="/dashboard/implementer/*" element={<ImplementerDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/admin/*" element={<AdminDashboard />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
