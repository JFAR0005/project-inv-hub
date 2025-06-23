
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider, useAuth } from './context/AuthContext';
import GlobalErrorBoundary from './components/error/GlobalErrorBoundary';
import RoleBasedRoute from './components/layout/RoleBasedRoute';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import Login from './pages/Login';
import CompanyProfile from './components/company/CompanyProfile';
import SubmitUpdateForm from './components/company/SubmitUpdateForm';
import NotesView from './components/notes/NotesView';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import MeetingsCalendar from './components/meetings/MeetingsCalendar';
import EnhancedPortfolioView from './components/portfolio/EnhancedPortfolioView';
import DealTracker from './components/deals/DealTracker';
import FundraisingTracker from './components/fundraising/FundraisingTracker';
import AdminDashboard from './components/admin/AdminDashboard';
import Integrations from './pages/Integrations';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Protected wrapper component
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <Router>
            <AuthProvider>
              <div className="min-h-screen bg-background">
                <Routes>
                  {/* Public login route */}
                  <Route path="/login" element={<Login />} />
                  
                  {/* Protected routes */}
                  <Route path="/" element={
                    <ProtectedLayout>
                      <Dashboard />
                    </ProtectedLayout>
                  } />
                  
                  <Route path="/portfolio" element={
                    <ProtectedLayout>
                      <RoleBasedRoute roles={['admin', 'partner', 'capital_team']}>
                        <EnhancedPortfolioView />
                      </RoleBasedRoute>
                    </ProtectedLayout>
                  } />
                  
                  <Route path="/companies" element={
                    <ProtectedLayout>
                      <RoleBasedRoute roles={['admin', 'partner', 'capital_team', 'founder']}>
                        <EnhancedPortfolioView />
                      </RoleBasedRoute>
                    </ProtectedLayout>
                  } />
                  
                  <Route path="/companies/:id" element={
                    <ProtectedLayout>
                      <RoleBasedRoute roles={['admin', 'partner', 'capital_team', 'founder']}>
                        <CompanyProfile />
                      </RoleBasedRoute>
                    </ProtectedLayout>
                  } />
                  
                  <Route path="/updates" element={
                    <ProtectedLayout>
                      <RoleBasedRoute roles={['admin', 'partner', 'capital_team', 'founder']}>
                        <SubmitUpdateForm />
                      </RoleBasedRoute>
                    </ProtectedLayout>
                  } />
                  
                  <Route path="/notes" element={
                    <ProtectedLayout>
                      <RoleBasedRoute roles={['admin', 'partner', 'capital_team', 'founder']}>
                        <NotesView />
                      </RoleBasedRoute>
                    </ProtectedLayout>
                  } />
                  
                  <Route path="/analytics" element={
                    <ProtectedLayout>
                      <RoleBasedRoute roles={['admin', 'partner', 'capital_team']}>
                        <AnalyticsDashboard />
                      </RoleBasedRoute>
                    </ProtectedLayout>
                  } />
                  
                  <Route path="/meetings" element={
                    <ProtectedLayout>
                      <RoleBasedRoute roles={['admin', 'partner', 'capital_team', 'founder']}>
                        <MeetingsCalendar />
                      </RoleBasedRoute>
                    </ProtectedLayout>
                  } />
                  
                  <Route path="/admin" element={
                    <ProtectedLayout>
                      <RoleBasedRoute roles={['admin']}>
                        <AdminDashboard />
                      </RoleBasedRoute>
                    </ProtectedLayout>
                  } />
                  
                  <Route path="/deals" element={
                    <ProtectedLayout>
                      <RoleBasedRoute roles={['admin', 'partner', 'capital_team']}>
                        <DealTracker />
                      </RoleBasedRoute>
                    </ProtectedLayout>
                  } />
                  
                  <Route path="/fundraising" element={
                    <ProtectedLayout>
                      <RoleBasedRoute roles={['admin', 'partner', 'capital_team']}>
                        <FundraisingTracker />
                      </RoleBasedRoute>
                    </ProtectedLayout>
                  } />
                  
                  <Route path="/integrations" element={
                    <ProtectedLayout>
                      <RoleBasedRoute roles={['admin', 'partner', 'capital_team']}>
                        <Integrations />
                      </RoleBasedRoute>
                    </ProtectedLayout>
                  } />

                  {/* Catch all - redirect to login if not authenticated, dashboard if authenticated */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </AuthProvider>
          </Router>
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
