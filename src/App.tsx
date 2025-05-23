
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import RouteGuard from "@/components/layout/RouteGuard";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Portfolio from "./pages/Portfolio";
import Notes from "./pages/Notes";
import Deals from "./pages/Deals";
import Meetings from "./pages/Meetings";
import NotFound from "./pages/NotFound";
import CompanyDetails from "./pages/CompanyDetails";
import CompanyProfile from "./pages/CompanyProfile";
import Dealflow from "./pages/Dealflow";
import SubmitUpdate from "./pages/SubmitUpdate";
import Integrations from "./pages/Integrations";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            
            {/* Portfolio - Admin only */}
            <Route path="/portfolio" element={
              <ProtectedRoute>
                <RouteGuard requiresRole={['admin']}>
                  <Portfolio />
                </RouteGuard>
              </ProtectedRoute>
            } />
            
            {/* Notes - Admin, Partner (assigned), Founder (own) */}
            <Route path="/notes" element={
              <ProtectedRoute>
                <RouteGuard requiresRole={['admin', 'partner', 'founder']}>
                  <Notes />
                </RouteGuard>
              </ProtectedRoute>
            } />
            
            {/* Deals - Admin, Partner (assigned) only */}
            <Route path="/deals" element={
              <ProtectedRoute>
                <RouteGuard requiresRole={['admin', 'partner']}>
                  <Deals />
                </RouteGuard>
              </ProtectedRoute>
            } />
            
            {/* Dealflow - Admin, Partner (assigned) only */}
            <Route path="/dealflow" element={
              <ProtectedRoute>
                <RouteGuard requiresRole={['admin', 'partner']}>
                  <Dealflow />
                </RouteGuard>
              </ProtectedRoute>
            } />
            
            {/* Meetings - Admin, Partner (invited), Founder (invited) */}
            <Route path="/meetings" element={
              <ProtectedRoute>
                <RouteGuard requiresRole={['admin', 'partner', 'founder']}>
                  <Meetings />
                </RouteGuard>
              </ProtectedRoute>
            } />
            
            {/* Integrations - Admin, Partner only */}
            <Route path="/integrations" element={
              <ProtectedRoute>
                <RouteGuard requiresRole={['admin', 'partner']}>
                  <Integrations />
                </RouteGuard>
              </ProtectedRoute>
            } />
            
            {/* Company Profile - Admin, Partner (assigned), Founder (own) */}
            <Route path="/companies/:id" element={
              <ProtectedRoute>
                <RouteGuard requiresRole={['admin', 'partner', 'founder']} requiresOwnership={true}>
                  <CompanyProfile />
                </RouteGuard>
              </ProtectedRoute>
            } />
            
            {/* Submit Update - Founder (own) only */}
            <Route path="/submit-update" element={
              <ProtectedRoute>
                <RouteGuard requiresRole={['founder']} requiresOwnership={true}>
                  <SubmitUpdate />
                </RouteGuard>
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
