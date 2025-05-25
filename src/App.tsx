
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
const Meetings = lazy(() => import("./pages/Meetings"));
const Notes = lazy(() => import("./pages/Notes"));
const SubmitUpdate = lazy(() => import("./pages/SubmitUpdate"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
                        <Suspense fallback={<DataLoadingState />}>
                          <Login />
                        </Suspense>
                      } 
                    />
                    <Route path="/" element={<Layout />}>
                      <Route 
                        index 
                        element={
                          <RouteGuard>
                            <Suspense fallback={<DataLoadingState />}>
                              <Index />
                            </Suspense>
                          </RouteGuard>
                        } 
                      />
                      <Route 
                        path="portfolio" 
                        element={
                          <RouteGuard allowedRoles={['admin', 'partner', 'capital_team']}>
                            <Suspense fallback={<DataLoadingState />}>
                              <Portfolio />
                            </Suspense>
                          </RouteGuard>
                        } 
                      />
                      <Route 
                        path="analytics" 
                        element={
                          <RouteGuard allowedRoles={['admin', 'partner', 'capital_team']}>
                            <Suspense fallback={<DataLoadingState />}>
                              <AdvancedAnalytics />
                            </Suspense>
                          </RouteGuard>
                        } 
                      />
                      <Route 
                        path="company/:id" 
                        element={
                          <RouteGuard>
                            <Suspense fallback={<DataLoadingState />}>
                              <CompanyDetails />
                            </Suspense>
                          </RouteGuard>
                        } 
                      />
                      <Route 
                        path="deals" 
                        element={
                          <RouteGuard allowedRoles={['admin', 'partner', 'capital_team']}>
                            <Suspense fallback={<DataLoadingState />}>
                              <Deals />
                            </Suspense>
                          </RouteGuard>
                        } 
                      />
                      <Route 
                        path="fundraising" 
                        element={
                          <RouteGuard allowedRoles={['admin', 'partner', 'capital_team']}>
                            <Suspense fallback={<DataLoadingState />}>
                              <Fundraising />
                            </Suspense>
                          </RouteGuard>
                        } 
                      />
                      <Route 
                        path="meetings" 
                        element={
                          <RouteGuard>
                            <Suspense fallback={<DataLoadingState />}>
                              <Meetings />
                            </Suspense>
                          </RouteGuard>
                        } 
                      />
                      <Route 
                        path="notes" 
                        element={
                          <RouteGuard>
                            <Suspense fallback={<DataLoadingState />}>
                              <Notes />
                            </Suspense>
                          </RouteGuard>
                        } 
                      />
                      <Route 
                        path="submit-update/:companyId" 
                        element={
                          <RouteGuard allowedRoles={['founder']}>
                            <Suspense fallback={<DataLoadingState />}>
                              <SubmitUpdate />
                            </Suspense>
                          </RouteGuard>
                        } 
                      />
                    </Route>
                    <Route 
                      path="*" 
                      element={
                        <Suspense fallback={<DataLoadingState />}>
                          <NotFound />
                        </Suspense>
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
