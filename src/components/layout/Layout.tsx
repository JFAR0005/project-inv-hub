
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import LoadingSpinner from './LoadingSpinner';

interface LayoutProps {
  children?: React.ReactNode;
  requireAuth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, requireAuth = true }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-blacknova">
        <LoadingSpinner size="lg" className="text-white" />
      </div>
    );
  }

  // Handle authentication redirects
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen">
      {isAuthenticated && (
        <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200">
          <Sidebar />
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isAuthenticated && (
          <Header 
            mobile={true} 
            showMobileMenu={showMobileMenu} 
            setShowMobileMenu={setShowMobileMenu} 
          />
        )}
        <main className="flex-1 overflow-y-auto p-4 bg-background">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout;
