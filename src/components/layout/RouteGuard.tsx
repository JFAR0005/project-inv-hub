
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RouteGuardProps {
  children: React.ReactNode;
  requiresRole?: string[];
  requiresOwnership?: boolean;
  resourceOwnerId?: string;
  fallbackPath?: string;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  requiresRole = [],
  requiresOwnership = false,
  resourceOwnerId,
  fallbackPath = '/' 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { canAccessRoute, userRole } = useRoleAccess();
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

  // Check route access
  const hasAccess = canAccessRoute(location.pathname, resourceOwnerId);

  // Check role requirements
  const hasRequiredRole = requiresRole.length === 0 || requiresRole.includes(user.role);

  // Check ownership requirements
  const hasOwnership = !requiresOwnership || !resourceOwnerId || user.companyId === resourceOwnerId;

  if (!hasAccess || !hasRequiredRole || !hasOwnership) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-3 rounded-md text-center">
              <p className="text-sm text-muted-foreground">
                Your role: <span className="font-medium capitalize">{userRole}</span>
              </p>
              {requiresRole.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Required roles: {requiresRole.join(', ')}
                </p>
              )}
              {requiresOwnership && (
                <p className="text-sm text-muted-foreground mt-1">
                  This resource requires ownership access
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => window.history.back()}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default RouteGuard;
