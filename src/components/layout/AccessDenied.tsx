
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { UserRole } from '@/context/AuthContext';

interface AccessDeniedProps {
  userRole: UserRole | undefined;
  requiredRoles?: UserRole[];
  message?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ 
  userRole, 
  requiredRoles = [], 
  message = "You don't have permission to access this page." 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-3 rounded-md text-center">
            <p className="text-sm text-muted-foreground">
              Your role: <span className="font-medium capitalize">{userRole || 'Unknown'}</span>
            </p>
            {requiredRoles.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Required roles: {requiredRoles.join(', ')}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button 
              onClick={() => navigate('/')}
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
};

export default AccessDenied;
