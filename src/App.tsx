import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { SearchProvider } from "@/context/SearchContext";
import Layout from "@/components/layout/Layout";
import RouteGuard from "@/components/layout/RouteGuard";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import QueryErrorBoundary from "@/components/error/QueryErrorBoundary";
import DataLoadingState from "@/components/data/DataLoadingState";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const AdvancedAnalytics = lazy(() => import("./pages/AdvancedAnalytics"));
const CompanyDetails = lazy(() => import("./pages/CompanyDetails"));
const Deals = lazy(() => import("./pages/Deals"));
const Fundraising = lazy(() => import("./pages/Fundraising"));
const LPLeadDetail = lazy(() => import("./pages/LPLeadDetail"));
const Meetings = lazy(() => import("./pages/Meetings"));
const Notes = lazy(() => import("./pages/Notes"));
const Notifications = lazy(() => import("./pages/Notifications"));
const SubmitUpdate = lazy(() => import("./pages/SubmitUpdate"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PortfolioDashboard = lazy(() => import("./pages/PortfolioDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors
        if (error?.code === 401 || error?.code === 403) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <QueryErrorBoundary>
          <TooltipProvider>
            <AuthProvider>
              <SearchProvider>
                <Toaster />
                <BrowserRouter>
                  <Routes>
                    <Route 
                      path="/login" 
                      element={
                        <Layout requireAuth={false}>
                          <Suspense fallback={<DataLoadingState />}>
                            <Login />
                          </Suspense>
                        </Layout>
                      } 
                    />
                    <Route 
                      path="/" 
                      element={
                        <Layout>
                          <RouteGuard>
                            <Suspense fallback={<DataLoadingState />}>
                              <Index />
                            </Suspense>
                          </RouteGuard>
                        </Layout>
                      } 
                    />
                    <Route 
                      path="/admin" 
                      element={
                        <Layout>
                          <RouteGuard allowedRoles={['admin']}>
                            <Suspense fallback={<DataLoadingState />}>
                              <AdminDashboard />
                            </Suspense>
                          </RouteGuard>
                        </Layout>
                      } 
                    />
                    <Route 
                      path="/portfolio-dashboard" 
                      element={
                        <Layout>
                          <RouteGuard allowedRoles={['admin', 'partner', 'capital_team']}>
                            <Suspense fallback={<DataLoadingState />}>
                              <PortfolioDashboard />
                            </Suspense>
                          </RouteGuard>
                        </Layout>
                      } 
                    />
                    <Route 
                      path="/portfolio" 
                      element={
                        <Layout>
                          <RouteGuard allowedRoles={['admin', 'partner', 'capital_team']}>
                            <Suspense fallback={<DataLoadingState />}>
                              <Portfolio />
                            </Suspense>
                          </RouteGuard>
                        </Layout>
                      } 
                    />
                    <Route 
                      path="/analytics" 
                      element={
                        <Layout>
                          <RouteGuard allowedRoles={['admin', 'partner', 'capital_team']}>
                            <Suspense fallback={<DataLoadingState />}>
                              <AdvancedAnalytics />
                            </Suspense>
                          </RouteGuard>
                        </Layout>
                      } 
                    />
                    <Route 
                      path="/company/:id" 
                      element={
                        <Layout>
                          <RouteGuard>
                            <Suspense fallback={<DataLoadingState />}>
                              <CompanyDetails />
                            </Suspense>
                          </RouteGuard>
                        </Layout>
                      } 
                    />
                    <Route 
                      path="/deals" 
                      element={
                        <Layout>
                          <RouteGuard allowedRoles={['admin', 'partner', 'capital_team']}>
                            <Suspense fallback={<DataLoadingState />}>
                              <Deals />
                            </Suspense>
                          </RouteGuard>
                        </Layout>
                      } 
                    />
                    <Route 
                      path="/fundraising" 
                      element={
                        <Layout>
                          <RouteGuard allowedRoles={['admin', 'partner', 'capital_team']}>
                            <Suspense fallback={<DataLoadingState />}>
                              <Fundraising />
                            </Suspense>
                          </RouteGuard>
                        </Layout>
                      } 
                    />
                    <Route 
                      path="/fundraising/leads/:id" 
                      element={
                        <Layout>
                          <RouteGuard allowedRoles={['admin', 'partner', 'capital_team']}>
                            <Suspense fallback={<DataLoadingState />}>
                              <LPLeadDetail />
                            </Suspense>
                          </RouteGuard>
                        </Layout>
                      } 
                    />
                    <Route 
                      path="/meetings" 
                      element={
                        <Layout>
                          <RouteGuard>
                            <Suspense fallback={<DataLoadingState />}>
                              <Meetings />
                            </Suspense>
                          </RouteGuard>
                        </Layout>
                      } 
                    />
                    <Route 
                      path="/notes" 
                      element={
                        <Layout>
                          <RouteGuard>
                            <Suspense fallback={<DataLoadingState />}>
                              <Notes />
                            </Suspense>
                          </RouteGuard>
                        </Layout>
                      } 
                    />
                    <Route 
                      path="/notifications" 
                      element={
                        <Layout>
                          <RouteGuard>
                            <Suspense fallback={<DataLoadingState />}>
                              <Notifications />
                            </Suspense>
                          </RouteGuard>
                        </Layout>
                      } 
                    />
                    <Route 
                      path="/submit-update/:companyId" 
                      element={
                        <Layout>
                          <RouteGuard allowedRoles={['founder']}>
                            <Suspense fallback={<DataLoadingState />}>
                              <SubmitUpdate />
                            </Suspense>
                          </RouteGuard>
                        </Layout>
                      } 
                    />
                    <Route 
                      path="*" 
                      element={
                        <Layout requireAuth={false}>
                          <Suspense fallback={<DataLoadingState />}>
                            <NotFound />
                          </Suspense>
                        </Layout>
                      } 
                    />
                  </Routes>
                </BrowserRouter>
              </SearchProvider>
            </AuthProvider>
          </TooltipProvider>
        </QueryErrorBoundary>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
