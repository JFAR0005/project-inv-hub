
import React, { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { Navigate, useParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiresRole?: 'admin' | 'partner' | 'founder';
  allowedRoles?: string[];
  requiresCompanyAccess?: boolean;
  requireOwnership?: boolean;
  resourceId?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresRole,
  allowedRoles,
  requiresCompanyAccess = false,
  requireOwnership = false,
  resourceId
}) => {
  const { user, isLoading } = useAuth();
  const { canViewCompany } = useRoleAccess();
  const { id: companyId } = useParams();

  // Show loading while auth is being determined
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check specific role requirement
  if (requiresRole && user.role !== requiresRole) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. This page requires {requiresRole} privileges.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check allowed roles - simplified logic
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.includes(user.role || '');
    if (!hasRequiredRole) {
      return (
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Access denied. You don't have permission to view this page.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  }

  // Check company-specific access
  if (requiresCompanyAccess && companyId && !canViewCompany(companyId)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. You don't have permission to view this company.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check ownership requirements for founders
  if (requireOwnership && user.role === 'founder' && (resourceId || companyId)) {
    const targetId = resourceId || companyId;
    if (user.companyId !== targetId) {
      return (
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You can only access resources that belong to your company.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
