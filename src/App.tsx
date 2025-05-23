
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import RoleGuard from "@/components/layout/RoleGuard";

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
            
            <Route path="/portfolio" element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            } />
            
            <Route path="/notes" element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin', 'partner', 'founder']}>
                  <Notes />
                </RoleGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/deals" element={
              <ProtectedRoute>
                <Deals />
              </ProtectedRoute>
            } />
            
            <Route path="/dealflow" element={
              <ProtectedRoute>
                <Dealflow />
              </ProtectedRoute>
            } />
            
            <Route path="/meetings" element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin', 'partner', 'founder']}>
                  <Meetings />
                </RoleGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/integrations" element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['admin', 'partner']}>
                  <Integrations />
                </RoleGuard>
              </ProtectedRoute>
            } />
            
            <Route path="/companies/:id" element={
              <ProtectedRoute>
                <CompanyProfile />
              </ProtectedRoute>
            } />
            
            <Route path="/submit-update" element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['founder']}>
                  <SubmitUpdate />
                </RoleGuard>
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
