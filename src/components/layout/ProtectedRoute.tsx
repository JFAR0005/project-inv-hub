
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/context/auth/authTypes';
import AccessDenied from './AccessDenied';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallbackPath?: string;
  requiresOwnership?: boolean;
  resourceOwnerId?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [], 
  fallbackPath = '/login',
  requiresOwnership = false,
  resourceOwnerId
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
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

  // Check if user has required role
  const hasRequiredRole = requiredRoles.length === 0 || requiredRoles.includes(user.role);

  // Check ownership requirements for founders
  const hasOwnership = !requiresOwnership || 
    user.role !== 'founder' || 
    !resourceOwnerId || 
    user.companyId === resourceOwnerId;

  // If role or ownership requirements aren't met, display access denied
  if (!hasRequiredRole || !hasOwnership) {
    return (
      <AccessDenied 
        userRole={user.role}
        requiredRoles={requiredRoles}
        message={!hasRequiredRole 
          ? "You don't have permission to access this page." 
          : "You can only access resources that belong to your company."
        }
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
