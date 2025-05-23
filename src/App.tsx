import React, { useEffect, useState } from 'react';
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

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

// Define routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/portfolio",
    element: <Portfolio />,
  },
  {
    path: "/enhanced-portfolio",
    element: <EnhancedPortfolio />,
  },
  {
    path: "/portfolio-search",
    element: <PortfolioSearch />,
  },
  {
    path: "/company/:id",
    element: <CompanyDetails />,
  },
  {
    path: "/company-profile/:id",
    element: <CompanyProfile />,
  },
  {
    path: "/notes",
    element: <Notes />,
  },
  {
    path: "/meetings",
    element: <Meetings />,
  },
  {
    path: "/deals",
    element: <Deals />,
  },
  {
    path: "/dealflow",
    element: <Dealflow />,
  },
  {
    path: "/analytics",
    element: <Analytics />,
  },
  {
    path: "/submit-update",
    element: <SubmitUpdate />,
  },
  {
    path: "/integrations",
    element: <Integrations />,
  },
  {
    path: "/integration-hub",
    element: <IntegrationHub />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default App;
