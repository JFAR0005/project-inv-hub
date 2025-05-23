
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Index from './pages/Index';
import Portfolio from './pages/Portfolio';
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
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/company/:id" element={
                <ProtectedRoute>
                  <CompanyProfile />
                </ProtectedRoute>
              } />
              <Route path="/companies/:id" element={
                <ProtectedRoute>
                  <CompanyDetails />
                </ProtectedRoute>
              } />
              <Route path="/notes" element={
                <ProtectedRoute>
                  <Notes />
                </ProtectedRoute>
              } />
              <Route path="/meetings" element={
                <ProtectedRoute>
                  <Meetings />
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
              <Route path="/submit-update" element={
                <ProtectedRoute>
                  <SubmitUpdate />
                </ProtectedRoute>
              } />
              <Route path="/integrations" element={
                <ProtectedRoute>
                  <Integrations />
                </ProtectedRoute>
              } />
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
