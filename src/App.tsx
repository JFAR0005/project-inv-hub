
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from './context/AuthContext';
import RoleBasedRoute from './components/layout/RoleBasedRoute';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import LoginForm from './components/auth/LoginForm';
import AuthRedirect from './components/auth/AuthRedirect';
import CompanyProfile from './components/company/CompanyProfile';
import SubmitUpdateForm from './components/company/SubmitUpdateForm';
import NotesView from './components/notes/NotesView';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import MeetingsCalendar from './components/meetings/MeetingsCalendar';
import EnhancedPortfolioView from './components/portfolio/EnhancedPortfolioView';
import DealTracker from './components/deals/DealTracker';
import FundraisingDashboard from './components/fundraising/FundraisingDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Layout><Outlet /></Layout>}>
                  <Route index element={<Dashboard />} />
                  
                  {/* Portfolio Routes */}
                  <Route path="/portfolio" element={
                    <RoleBasedRoute roles={['admin', 'partner', 'capital_team']}>
                      <EnhancedPortfolioView />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Company Routes */}
                  <Route path="/companies/:id" element={
                    <RoleBasedRoute roles={['admin', 'partner', 'capital_team', 'founder']}>
                      <CompanyProfile />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Updates Routes */}
                  <Route path="/updates" element={
                    <RoleBasedRoute roles={['admin', 'partner', 'capital_team', 'founder']}>
                      <SubmitUpdateForm />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Notes Routes */}
                  <Route path="/notes" element={
                    <RoleBasedRoute roles={['admin', 'partner', 'capital_team', 'founder']}>
                      <NotesView 
                        onCreateNote={() => {}} 
                        onEditNote={() => {}} 
                      />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Analytics Routes */}
                  <Route path="/analytics" element={
                    <RoleBasedRoute roles={['admin', 'partner', 'capital_team']}>
                      <AnalyticsDashboard />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Meetings Routes */}
                  <Route path="/meetings" element={
                    <RoleBasedRoute roles={['admin', 'partner', 'capital_team', 'founder']}>
                      <MeetingsCalendar 
                        view="month"
                        meetings={[]}
                        isLoading={false}
                        onEditMeeting={() => {}}
                      />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <RoleBasedRoute roles={['admin']}>
                      <AdminDashboard />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Deal Tracker Routes */}
                  <Route path="/deals" element={
                    <RoleBasedRoute roles={['admin', 'partner', 'capital_team']}>
                      <DealTracker 
                        deal={null}
                        onEditDeal={() => {}}
                        onOpenDD={() => {}}
                      />
                    </RoleBasedRoute>
                  } />
                  
                  {/* Fundraising Routes */}
                  <Route path="/fundraising" element={
                    <RoleBasedRoute roles={['admin', 'partner', 'capital_team']}>
                      <FundraisingDashboard lpLeads={[]} />
                    </RoleBasedRoute>
                  } />
                </Route>
                
                {/* Auth Routes */}
                <Route path="/login" element={<LoginForm />} />
                <Route path="/auth" element={<AuthRedirect />} />
              </Routes>
            </div>
          </Router>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
