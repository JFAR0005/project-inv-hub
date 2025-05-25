
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import AccessDenied from './AccessDenied';
import { UserRole } from '@/context/auth/authTypes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  requireOwnership?: boolean;
  resourceId?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles, 
  requireOwnership = false,
  resourceId 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { canAccessRoute } = useRoleAccess();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.role) {
    return <AccessDenied userRole={undefined} requiredRoles={allowedRoles} />;
  }

  // Check if user's role is in allowed roles
  const hasRequiredRole = allowedRoles.includes(user.role);
  
  if (!hasRequiredRole) {
    return <AccessDenied userRole={user.role} requiredRoles={allowedRoles} />;
  }

  // For founders, check ownership if required
  if (requireOwnership && user.role === 'founder' && resourceId) {
    if (user.companyId !== resourceId) {
      return (
        <AccessDenied 
          userRole={user.role} 
          requiredRoles={allowedRoles}
          message="You can only access resources that belong to your company."
        />
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
