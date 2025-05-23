import React, { useEffect, useState } from 'react';
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/layout/Layout';

// Import pages
import Index from './pages/Index';
import Login from './pages/Login';
import Portfolio from './pages/Portfolio';
import EnhancedPortfolio from './pages/EnhancedPortfolio';
import PortfolioSearch from './pages/PortfolioSearch';
import CompanyDetails from './pages/CompanyDetails';
import CompanyProfile from './pages/CompanyProfile';
import Notes from './pages/Notes';
import Meetings from './pages/Meetings';
import Deals from './pages/Deals';
import Dealflow from './pages/Dealflow';
import Analytics from './pages/Analytics';
import SubmitUpdate from './pages/SubmitUpdate';
import Integrations from './pages/Integrations';
import IntegrationHub from './pages/IntegrationHub';
import NotFound from './pages/NotFound';
import Search from './pages/Search';

const queryClient = new QueryClient();

function App() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <ThemeProvider
      defaultTheme="system"
      storageKey="supabase-dashboard-theme"
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SearchProvider>
            {isMounted ? (
              <RouterProvider router={router} />
            ) : (
              <div>Loading...</div>
            )}
            <Toaster />
          </SearchProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

// Define routes - wrap most routes with Layout
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout><Index /></Layout>,
  },
  {
    path: "/login",
    element: <Layout requireAuth={false}><Login /></Layout>,
  },
  {
    path: "/portfolio",
    element: <Layout><Portfolio /></Layout>,
  },
  {
    path: "/enhanced-portfolio",
    element: <Layout><EnhancedPortfolio /></Layout>,
  },
  {
    path: "/portfolio-search",
    element: <Layout><PortfolioSearch /></Layout>,
  },
  {
    path: "/search",
    element: <Layout><Search /></Layout>,
  },
  {
    path: "/company/:id",
    element: <Layout><CompanyDetails /></Layout>,
  },
  {
    path: "/company-profile/:id",
    element: <Layout><CompanyProfile /></Layout>,
  },
  {
    path: "/notes",
    element: <Layout><Notes /></Layout>,
  },
  {
    path: "/meetings",
    element: <Layout><Meetings /></Layout>,
  },
  {
    path: "/deals",
    element: <Layout><Deals /></Layout>,
  },
  {
    path: "/dealflow",
    element: <Layout><Dealflow /></Layout>,
  },
  {
    path: "/analytics",
    element: <Layout><Analytics /></Layout>,
  },
  {
    path: "/submit-update",
    element: <Layout><SubmitUpdate /></Layout>,
  },
  {
    path: "/integrations",
    element: <Layout><Integrations /></Layout>,
  },
  {
    path: "/integration-hub",
    element: <Layout><IntegrationHub /></Layout>,
  },
  {
    path: "*",
    element: <Layout requireAuth={false}><NotFound /></Layout>,
  },
]);

export default App;
