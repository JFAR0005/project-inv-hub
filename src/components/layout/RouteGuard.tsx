
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useAuth } from '@/context/AuthContext';
import AccessDenied from './AccessDenied';
import { UserRole } from '@/context/auth/authTypes';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  resourceOwnerId?: string;
  fallbackPath?: string;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  allowedRoles = [],
  resourceOwnerId,
  fallbackPath = '/' 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { canAccessRoute } = useRoleAccess();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Use the standardized access control from useRoleAccess
  const hasAccess = canAccessRoute(location.pathname, resourceOwnerId);

  if (!hasAccess) {
    return (
      <AccessDenied 
        userRole={user.role}
        requiredRoles={allowedRoles}
      />
    );
  }

  return <>{children}</>;
};

export default RouteGuard;
