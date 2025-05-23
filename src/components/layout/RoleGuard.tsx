
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  resourceOwnerId?: string;
  fallbackPath?: string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles,
  resourceOwnerId,
  fallbackPath = '/' 
}) => {
  const { canAccessRoute, userRole } = useRoleAccess();
  const location = useLocation();

  const hasAccess = canAccessRoute(location.pathname, resourceOwnerId);

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm text-muted-foreground">
                Your role: <span className="font-medium capitalize">{userRole}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Required roles: {allowedRoles?.join(', ') || 'Authorized users only'}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => window.history.back()}
                className="flex-1 px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
              >
                Go Back
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="flex-1 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Home
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
