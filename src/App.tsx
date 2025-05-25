
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/layout/Layout';
import RouteGuard from '@/components/layout/RouteGuard';
import Login from '@/pages/Login';
import Portfolio from '@/pages/Portfolio';
import EnhancedPortfolio from '@/pages/EnhancedPortfolio';
import CompanyProfile from '@/pages/CompanyProfile';
import Analytics from '@/pages/Analytics';
import AdvancedAnalytics from '@/pages/AdvancedAnalytics';
import Deals from '@/pages/Deals';
import Notes from '@/pages/Notes';
import Meetings from '@/pages/Meetings';
import Search from '@/pages/Search';
import Team from '@/pages/Team';
import Integrations from '@/pages/Integrations';
import SubmitUpdate from '@/pages/SubmitUpdate';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/portfolio" replace />} />
                
                <Route path="/*" element={
                  <RouteGuard allowedRoles={['admin', 'capital_team', 'partner', 'founder']}>
                    <Layout>
                      <Routes>
                        <Route path="/portfolio" element={
                          <RouteGuard allowedRoles={['admin', 'capital_team', 'partner']}>
                            <Portfolio />
                          </RouteGuard>
                        } />
                        <Route path="/enhanced-portfolio" element={
                          <RouteGuard allowedRoles={['admin', 'capital_team', 'partner']}>
                            <EnhancedPortfolio />
                          </RouteGuard>
                        } />
                        <Route path="/company/:id" element={
                          <RouteGuard allowedRoles={['admin', 'capital_team', 'partner', 'founder']} requiresOwnership>
                            <CompanyProfile />
                          </RouteGuard>
                        } />
                        <Route path="/analytics" element={
                          <RouteGuard allowedRoles={['admin', 'capital_team', 'partner']}>
                            <Analytics />
                          </RouteGuard>
                        } />
                        <Route path="/advanced-analytics" element={
                          <RouteGuard allowedRoles={['admin', 'capital_team', 'partner']}>
                            <AdvancedAnalytics />
                          </RouteGuard>
                        } />
                        <Route path="/deals" element={
                          <RouteGuard allowedRoles={['admin', 'capital_team', 'partner']}>
                            <Deals />
                          </RouteGuard>
                        } />
                        <Route path="/notes" element={
                          <RouteGuard allowedRoles={['admin', 'capital_team', 'partner']}>
                            <Notes />
                          </RouteGuard>
                        } />
                        <Route path="/meetings" element={
                          <RouteGuard allowedRoles={['admin', 'capital_team', 'partner', 'founder']}>
                            <Meetings />
                          </RouteGuard>
                        } />
                        <Route path="/search" element={
                          <RouteGuard allowedRoles={['admin', 'capital_team', 'partner']}>
                            <Search />
                          </RouteGuard>
                        } />
                        <Route path="/team" element={
                          <RouteGuard allowedRoles={['admin']}>
                            <Team />
                          </RouteGuard>
                        } />
                        <Route path="/integrations" element={
                          <RouteGuard allowedRoles={['admin', 'capital_team', 'partner']}>
                            <Integrations />
                          </RouteGuard>
                        } />
                        <Route path="/submit-update" element={
                          <RouteGuard allowedRoles={['founder']}>
                            <SubmitUpdate />
                          </RouteGuard>
                        } />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Layout>
                  </RouteGuard>
                } />
              </Routes>
            </div>
            <Toaster />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
