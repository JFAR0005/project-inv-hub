
import React from 'react';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'react-router-dom';
import AccessDenied from './AccessDenied';
import { UserRole } from '@/context/auth/authTypes';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  resourceOwnerId?: string;
  fallbackPath?: string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles = [],
  resourceOwnerId,
  fallbackPath = '/' 
}) => {
  const { user } = useAuth();
  const { canAccessRoute } = useRoleAccess();
  const location = useLocation();

  // Use the standardized access control from useRoleAccess
  const hasAccess = canAccessRoute(location.pathname, resourceOwnerId);

  if (!hasAccess) {
    return (
      <AccessDenied 
        userRole={user?.role}
        requiredRoles={allowedRoles}
        message="You don't have permission to access this page."
      />
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
