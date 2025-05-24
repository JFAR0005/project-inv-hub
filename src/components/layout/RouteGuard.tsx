
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useAuth } from '@/context/AuthContext';
import AccessDenied from './AccessDenied';
import { UserRole } from '@/context/auth/authTypes';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiresOwnership?: boolean;
  resourceOwnerId?: string;
  fallbackPath?: string;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  allowedRoles = [],
  requiresOwnership = false,
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

  // Additional role-based checks if specific roles are required
  if (allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.includes(user.role!);
    if (!hasRequiredRole && !hasAccess) {
      return (
        <AccessDenied 
          userRole={user.role}
          requiredRoles={allowedRoles}
          message={`Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${user.role}.`}
        />
      );
    }
  }

  // Check ownership requirements for founders
  if (requiresOwnership && user.role === 'founder' && resourceOwnerId) {
    const hasOwnership = user.companyId === resourceOwnerId;
    if (!hasOwnership) {
      return (
        <AccessDenied 
          userRole={user.role}
          requiredRoles={allowedRoles}
          message="You can only access resources that belong to your company."
        />
      );
    }
  }

  // Final check using useRoleAccess logic
  if (!hasAccess && allowedRoles.length > 0) {
    return (
      <AccessDenied 
        userRole={user.role}
        requiredRoles={allowedRoles}
        message="You don't have permission to access this page."
      />
    );
  }

  return <>{children}</>;
};

export default RouteGuard;
