
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';
import Login from './pages/Login';
import Index from './pages/Index';
import Portfolio from './pages/Portfolio';
import EnhancedPortfolio from './pages/EnhancedPortfolio';
import Analytics from './pages/Analytics';
import CompanyProfile from './pages/CompanyProfile';
import CompanyDetails from './pages/CompanyDetails';
import Notes from './pages/Notes';
import Meetings from './pages/Meetings';
import Deals from './pages/Deals';
import Dealflow from './pages/Dealflow';
import SubmitUpdate from './pages/SubmitUpdate';
import Integrations from './pages/Integrations';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Index />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/enhanced-portfolio" element={<EnhancedPortfolio />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/company/:id" element={<CompanyProfile />} />
              <Route path="/companies/:id" element={<CompanyDetails />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/meetings" element={<Meetings />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/dealflow" element={<Dealflow />} />
              <Route path="/submit-update" element={<SubmitUpdate />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
