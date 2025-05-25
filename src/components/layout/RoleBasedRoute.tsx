
import React from 'react';
import ProtectedRoute from './ProtectedRoute';
import { UserRole } from '@/context/auth/authTypes';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  roles: UserRole[];
  requireOwnership?: boolean;
  resourceId?: string;
}

// Pre-defined role combinations for common access patterns
export const ROLE_COMBINATIONS = {
  ADMIN_ONLY: ['admin'] as UserRole[],
  ADMIN_CAPITAL: ['admin', 'capital_team'] as UserRole[],
  ADMIN_CAPITAL_PARTNER: ['admin', 'capital_team', 'partner'] as UserRole[],
  FOUNDER_ONLY: ['founder'] as UserRole[],
  ALL_AUTHENTICATED: ['admin', 'capital_team', 'partner', 'founder'] as UserRole[],
};

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  roles, 
  requireOwnership = false,
  resourceId 
}) => {
  return (
    <ProtectedRoute 
      allowedRoles={roles} 
      requireOwnership={requireOwnership}
      resourceId={resourceId}
    >
      {children}
    </ProtectedRoute>
  );
};

export default RoleBasedRoute;
