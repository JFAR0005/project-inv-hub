
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, requireAuth = true }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // If authentication is required but user is not authenticated, redirect to login
  if (requireAuth && !isLoading && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen">
      {isAuthenticated && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isAuthenticated && (
          <Header 
            mobile={true} 
            showMobileMenu={showMobileMenu} 
            setShowMobileMenu={setShowMobileMenu} 
          />
        )}
        <main className="flex-1 overflow-y-auto p-4 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
