import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Calculator from "./pages/Calculator";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { lazy, Suspense } from "react";
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
import InvestorDashboard from "./pages/dashboard/InvestorDashboard";
import InvestorInvestments from "./pages/dashboard/investor/InvestorInvestments";
import InvestorAssets from "./pages/dashboard/investor/InvestorAssets";
import InvestorReturns from "./pages/dashboard/investor/InvestorReturns";
import InvestorWallet from "./pages/dashboard/investor/InvestorWallet";
import InvestorSettings from "./pages/dashboard/investor/InvestorSettings";
import InvestorSIPs from "./pages/dashboard/investor/InvestorSIPs";
import InvestorP2P from "./pages/dashboard/investor/InvestorP2P";
import CorporateDashboard from "./pages/dashboard/CorporateDashboard";
import NBFCDashboard from "./pages/dashboard/NBFCDashboard";
import ProjectDiscovery from "./pages/dashboard/nbfc/ProjectDiscovery";
import FundAllocation from "./pages/dashboard/nbfc/FundAllocation";
import Disbursements from "./pages/dashboard/nbfc/Disbursements";
import AssetPortfolio from "./pages/dashboard/nbfc/AssetPortfolio";
import RiskAlerts from "./pages/dashboard/nbfc/RiskAlerts";
import Reports from "./pages/dashboard/nbfc/Reports";
import NBFCSettings from "./pages/dashboard/nbfc/NBFCSettings";
import ImplementerDashboard from "./pages/dashboard/ImplementerDashboard";
import AdminOverview from "./pages/dashboard/admin/AdminOverview";
import AdminUsers from "./pages/dashboard/admin/AdminUsers";
import AdminAssets from "./pages/dashboard/admin/AdminAssets";
import AdminTransactions from "./pages/dashboard/admin/AdminTransactions";
import AdminSettings from "./pages/dashboard/admin/AdminSettings";
import AdminWithdrawals from "./pages/dashboard/admin/AdminWithdrawals";
import ProjectList from "./pages/dashboard/corporate/projects/ProjectList";
import ProjectCreate from "./pages/dashboard/corporate/projects/ProjectCreate";
import PowerGeneration from "./pages/dashboard/corporate/PowerGeneration";
import BillingPayments from "./pages/dashboard/corporate/BillingPayments";
import Contracts from "./pages/dashboard/corporate/Contracts";
import AssetStatus from "./pages/dashboard/corporate/AssetStatus";
import Sustainability from "./pages/dashboard/corporate/Sustainability";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
    <HelmetProvider>
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/calculator" element={<Calculator />} />
                        <Route path="/blog" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}><Blog /></Suspense>} />
                        <Route path="/blog/:slug" element={<Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}><BlogPost /></Suspense>} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected Dashboard Routes */}
                        <Route
                            path="/dashboard/investor"
                            element={
                                <ProtectedRoute allowedRoles={['investor']}>
                                    <InvestorDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/investor/investments"
                            element={
                                <ProtectedRoute allowedRoles={['investor']}>
                                    <InvestorInvestments />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/investor/assets"
                            element={
                                <ProtectedRoute allowedRoles={['investor']}>
                                    <InvestorAssets />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/investor/returns"
                            element={
                                <ProtectedRoute allowedRoles={['investor']}>
                                    <InvestorReturns />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/investor/wallet"
                            element={
                                <ProtectedRoute allowedRoles={['investor']}>
                                    <InvestorWallet />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/investor/sips"
                            element={
                                <ProtectedRoute allowedRoles={['investor']}>
                                    <InvestorSIPs />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/investor/settings"
                            element={
                                <ProtectedRoute allowedRoles={['investor']}>
                                    <InvestorSettings />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/investor/p2p"
                            element={
                                <ProtectedRoute allowedRoles={['investor']}>
                                    <InvestorP2P />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/corporate/*"
                            element={
                                <ProtectedRoute allowedRoles={['corporate']}>
                                    <Routes>
                                        <Route index element={<CorporateDashboard />} />
                                        <Route path="projects" element={<ProjectList />} />
                                        <Route path="projects/new" element={<ProjectCreate />} />
                                        <Route path="power" element={<PowerGeneration />} />
                                        <Route path="billing" element={<BillingPayments />} />
                                        <Route path="contracts" element={<Contracts />} />
                                        <Route path="assets" element={<AssetStatus />} />
                                        <Route path="sustainability" element={<Sustainability />} />
                                    </Routes>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard/nbfc/*"
                            element={
                                <ProtectedRoute allowedRoles={['nbfc']}>
                                    <Routes>
                                        <Route index element={<NBFCDashboard />} />
                                        <Route path="projects" element={<ProjectDiscovery />} />
                                        <Route path="allocation" element={<FundAllocation />} />
                                        <Route path="disbursements" element={<Disbursements />} />
                                        <Route path="portfolio" element={<AssetPortfolio />} />
                                        <Route path="alerts" element={<RiskAlerts />} />
                                        <Route path="reports" element={<Reports />} />
                                        <Route path="settings" element={<NBFCSettings />} />
                                    </Routes>
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
                                    <Routes>
                                        <Route index element={<AdminOverview />} />
                                        <Route path="users" element={<AdminUsers />} />
                                        <Route path="assets" element={<AdminAssets />} />
                                         <Route path="withdrawals" element={<AdminWithdrawals />} />
                                         <Route path="transactions" element={<AdminTransactions />} />
                                         <Route path="settings" element={<AdminSettings />} />
                                        {/* Fallback for yet-to-be-created pages */}
                                        <Route path="*" element={<AdminOverview />} />
                                    </Routes>
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
    </HelmetProvider>
);

export default App;
