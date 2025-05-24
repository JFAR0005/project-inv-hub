
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

const AuthRedirect: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && location.pathname === '/login') {
        // Redirect authenticated users away from login page
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else if (!isAuthenticated && location.pathname !== '/login') {
        // Redirect unauthenticated users to login
        navigate('/login', { 
          replace: true,
          state: { from: location }
        });
      }
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-blacknova">
        <LoadingSpinner size="lg" className="text-white" />
      </div>
    );
  }

  return null;
};

export default AuthRedirect;
