
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
import CompanyProfile from '@/pages/CompanyProfile';
import Analytics from '@/pages/Analytics';
import Deals from '@/pages/Deals';
import Fundraising from '@/pages/Fundraising';
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
                  <ProtectedRoute allowedRoles={['admin', 'partner', 'founder']}>
                    <Layout>
                      <Routes>
                        <Route path="/portfolio" element={
                          <ProtectedRoute allowedRoles={['admin', 'partner']}>
                            <Portfolio />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/company/:id" element={
                          <ProtectedRoute 
                            allowedRoles={['admin', 'partner', 'founder']} 
                            requiresCompanyAccess={true}
                          >
                            <CompanyProfile />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/analytics" element={
                          <ProtectedRoute allowedRoles={['admin', 'partner']}>
                            <Analytics />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/deals" element={
                          <ProtectedRoute allowedRoles={['admin', 'partner']}>
                            <Deals />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/fundraising" element={
                          <ProtectedRoute allowedRoles={['admin', 'partner']}>
                            <Fundraising />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/notes" element={
                          <ProtectedRoute allowedRoles={['admin', 'partner', 'founder']}>
                            <Notes />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/meetings" element={
                          <ProtectedRoute allowedRoles={['admin', 'partner', 'founder']}>
                            <Meetings />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/search" element={
                          <ProtectedRoute allowedRoles={['admin', 'partner']}>
                            <Search />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/team" element={
                          <ProtectedRoute requiresRole="admin">
                            <Team />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/integrations" element={
                          <ProtectedRoute allowedRoles={['admin', 'partner']}>
                            <Integrations />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/submit-update" element={
                          <ProtectedRoute requiresRole="founder">
                            <SubmitUpdate />
                          </ProtectedRoute>
                        } />
                        
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
