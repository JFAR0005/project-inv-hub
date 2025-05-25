
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Login from '@/pages/Login';
import Portfolio from '@/pages/Portfolio';
import EnhancedPortfolio from '@/pages/EnhancedPortfolio';
import CompanyProfile from '@/pages/CompanyProfile';
import Analytics from '@/pages/Analytics';
import Deals from '@/pages/Deals';
import Notes from '@/pages/Notes';
import Meetings from '@/pages/Meetings';
import Search from '@/pages/Search';
import Team from '@/pages/Team';
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
                  <ProtectedRoute allowedRoles={['admin', 'capital_team', 'partner', 'founder']}>
                    <Layout>
                      <Routes>
                        <Route path="/portfolio" element={<Portfolio />} />
                        <Route path="/enhanced-portfolio" element={<EnhancedPortfolio />} />
                        <Route path="/company/:id" element={<CompanyProfile />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/deals" element={<Deals />} />
                        <Route path="/notes" element={<Notes />} />
                        <Route path="/meetings" element={<Meetings />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/team" element={<Team />} />
                        <Route path="/submit-update" element={<SubmitUpdate />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
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
