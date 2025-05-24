
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/context/AuthContext';
import AccessDenied from './AccessDenied';

interface EnhancedProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiresOwnership?: boolean;
  resourceOwnerId?: string;
  fallbackPath?: string;
}

const EnhancedProtectedRoute: React.FC<EnhancedProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [], 
  requiresOwnership = false,
  resourceOwnerId,
  fallbackPath = '/login'
}) => {
  const { user, isAuthenticated, isLoading, originalRole } = useAuth();
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

  // Check if user is actually an admin (either current role or original role)
  const isActualAdmin = (originalRole || user.role) === 'admin';

  // Admins can always access everything when viewing as their original role
  if (isActualAdmin && !originalRole) {
    return <>{children}</>;
  }

  // Check if user has required role
  const hasRequiredRole = allowedRoles.length === 0 || allowedRoles.includes(user.role);

  // Check ownership requirements for founders
  const hasOwnership = !requiresOwnership || 
    user.role !== 'founder' || 
    !resourceOwnerId || 
    user.companyId === resourceOwnerId;

  // If role or ownership requirements aren't met, display access denied
  if (!hasRequiredRole || !hasOwnership) {
    const message = !hasRequiredRole 
      ? `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${user.role}.`
      : "You can only access resources that belong to your company.";

    return (
      <AccessDenied 
        userRole={user.role}
        requiredRoles={allowedRoles}
        message={message}
      />
    );
  }

  return <>{children}</>;
};

export default EnhancedProtectedRoute;
