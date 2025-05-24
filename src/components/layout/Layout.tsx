
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import LoadingSpinner from './LoadingSpinner';
import AuthRedirect from '../auth/AuthRedirect';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, requireAuth = true }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Show loading state while checking authentication
  if (requireAuth && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-blacknova">
        <LoadingSpinner size="lg" className="text-white" />
      </div>
    );
  }

  return (
    <>
      {requireAuth && <AuthRedirect />}
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
    </>
  );
};

export default Layout;
