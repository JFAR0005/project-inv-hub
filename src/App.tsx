import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Index from './pages/Index';
import Portfolio from './pages/Portfolio';
import EnhancedPortfolio from './pages/EnhancedPortfolio';
import CompanyProfile from './pages/CompanyProfile';
import SubmitUpdate from './pages/SubmitUpdate';
import Meetings from './pages/Meetings';
import Analytics from './pages/Analytics';
import Notes from './pages/Notes';
import Deals from './pages/Deals';
import Dealflow from './pages/Dealflow';
import Integrations from './pages/Integrations';
import NotFound from './pages/NotFound';
import { SearchProvider } from './context/SearchContext';

function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SearchProvider>
          <ThemeProvider defaultTheme="light" storageKey="ui-theme">
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/enhanced-portfolio" element={<EnhancedPortfolio />} />
                <Route path="/companies/:id" element={<CompanyProfile />} />
                <Route path="/submit-update" element={<SubmitUpdate />} />
                <Route path="/meetings" element={<Meetings />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/deals" element={<Deals />} />
                <Route path="/dealflow" element={<Dealflow />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            <Toaster />
          </ThemeProvider>
        </SearchProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
