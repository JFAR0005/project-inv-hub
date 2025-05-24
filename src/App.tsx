
import React, { useEffect, useState } from 'react';
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import RouteGuard from '@/components/layout/RouteGuard';

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
import AdvancedSearch from './pages/AdvancedSearch';
import Team from './pages/Team';
import Fundraising from './pages/Fundraising';
import LPLeadDetail from './pages/LPLeadDetail';

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

// Define routes with proper role-based protection
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <RouteGuard>
          <Index />
        </RouteGuard>
      </Layout>
    ),
  },
  {
    path: "/login",
    element: <Layout requireAuth={false}><Login /></Layout>,
  },
  {
    path: "/portfolio",
    element: (
      <Layout>
        <RouteGuard allowedRoles={['admin', 'capital_team']}>
          <Portfolio />
        </RouteGuard>
      </Layout>
    ),
  },
  {
    path: "/enhanced-portfolio",
    element: (
      <Layout>
        <RouteGuard allowedRoles={['admin', 'capital_team']}>
          <EnhancedPortfolio />
        </RouteGuard>
      </Layout>
    ),
  },
  {
    path: "/portfolio-search",
    element: (
      <Layout>
        <RouteGuard allowedRoles={['admin', 'partner', 'capital_team']}>
          <PortfolioSearch />
        </RouteGuard>
      </Layout>
    ),
  },
  {
    path: "/search",
    element: (
      <Layout>
        <RouteGuard allowedRoles={['admin', 'partner', 'founder', 'capital_team']}>
          <Search />
        </RouteGuard>
      </Layout>
    ),
  },
  {
    path: "/advanced-search",
    element: (
      <Layout>
        <RouteGuard allowedRoles={['admin', 'partner', 'capital_team']}>
          <AdvancedSearch />
        </RouteGuard>
      </Layout>
    ),
  },
  {
    path: "/company/:id",
    element: (
      <Layout>
        <RouteGuard allowedRoles={['admin', 'partner', 'founder', 'capital_team']} requiresOwnership={true}>
          <CompanyDetails />
        </RouteGuard>
      </Layout>
    ),
  },
  {
    path: "/company-profile/:id",
    element: (
      <Layout>
        <RouteGuard allowedRoles={['admin', 'partner', 'founder', 'capital_team']} requiresOwnership={true}>
          <CompanyProfile />
        </RouteGuard>
      </Layout>
    ),
  },
  {
    path: "/notes",
    element: (
      <Layout>
        <RouteGuard allowedRoles={['admin', 'partner', 'founder', 'capital_team']}>
          <Notes />
        </RouteGuard>
      </Layout>
    ),
  },
  {
    path: "/meetings",
    element: (
      <Layout>
        <RouteGuard allowedRoles={['admin', 'partner', 'founder', 'capital_team']}>
          <Meetings />
        </RouteGuard>
      </Layout>
    ),
  },
  {
    path: "/deals",
    element: (
      <Layout>
        <RouteGuard allowedRoles={['admin', 'partner', 'capital_team']}>
          <Deals />
        </RouteGuard>
      </Layout>
    ),
  },
  {
    path: "/dealflow",
    element: (
      <Layout>
        <RouteGuard allowedRoles={['admin', 'partner', 'capital_team']}>
          <Dealflow />
        </RouteGuard>
      </Layout>
    ),
  },
  {
    path: "/analytics",
    element: (
      <Layout>
        <RouteGuard allowedRoles={['admin', 'partner', 'capital_team']}>
          <Analytics />
        </RouteGuard>
      </Layout>
    ),
  },
  {
    path: "/submit-update",
    element: (
      <Layout>
        <RouteGuard allowedRoles={['founder']} requiresOwnership={true}>
          <SubmitUpdate />
        </RouteGuard>
      </Layout>
    ),
  },
  {
    path: "/integrations",
    element: (
      <Layout>
        <RouteGuard allowedRoles={['admin', 'capital_team']}>
          <Integrations />
        </RouteGuard>
      </Layout>
    ),
  },
  {
    path: "/integration-hub",
    element: (
      <Layout>
        <RouteGuard allowedRoles={['admin', 'capital_team']}>
          <IntegrationHub />
        </RouteGuard>
      </Layout>
    ),
  },
  {
    path: "/team",
    element: (
      <Layout>
        <RouteGuard allowedRoles={['admin', 'capital_team']}>
          <Team />
        </RouteGuard>
      </Layout>
    ),
  },
  {
    path: "/fundraising",
    element: (
      <Layout>
        <RouteGuard allowedRoles={['admin', 'capital_team']}>
          <Fundraising />
        </RouteGuard>
      </Layout>
    ),
  },
  {
    path: "/fundraising/leads/:id",
    element: (
      <Layout>
        <RouteGuard allowedRoles={['admin', 'capital_team']}>
          <LPLeadDetail />
        </RouteGuard>
      </Layout>
    ),
  },
  {
    path: "*",
    element: <Layout requireAuth={false}><NotFound /></Layout>,
  },
]);

export default App;
