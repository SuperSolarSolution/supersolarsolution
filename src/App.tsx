import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Dashboard Routes */}
            <Route
              path="/dashboard/investor/*"
              element={
                <ProtectedRoute allowedRoles={['investor']}>
                  <InvestorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/corporate/*"
              element={
                <ProtectedRoute allowedRoles={['corporate']}>
                  <CorporateDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/nbfc/*"
              element={
                <ProtectedRoute allowedRoles={['nbfc']}>
                  <NBFCDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/implementer/*"
              element={
                <ProtectedRoute allowedRoles={['implementer']}>
                  <ImplementerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Redirect /dashboard to appropriate role dashboard */}
            <Route path="/dashboard" element={<Navigate to="/login" replace />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
