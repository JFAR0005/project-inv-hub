
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, ArrowLeft, Users, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/context/auth/authTypes';

interface AccessDeniedProps {
  userRole?: UserRole;
  requiredRoles: UserRole[];
  message?: string;
}

const roleDisplayNames: Record<UserRole, string> = {
  admin: 'Administrator',
  capital_team: 'Capital Team',
  partner: 'Partner',
  founder: 'Founder'
};

const roleDescriptions: Record<UserRole, string> = {
  admin: 'Full system access and user management',
  capital_team: 'Portfolio management and deal oversight',
  partner: 'Investment review and portfolio insights',
  founder: 'Company updates and reporting'
};

const AccessDenied: React.FC<AccessDeniedProps> = ({ 
  userRole, 
  requiredRoles, 
  message 
}) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              {message || "You don't have permission to access this page."}
            </p>
            
            {userRole && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Your current role:</p>
                  <Badge variant="outline" className="gap-2">
                    <Users className="w-3 h-3" />
                    {roleDisplayNames[userRole]}
                  </Badge>
                  <p className="text-xs text-gray-400 mt-1">
                    {roleDescriptions[userRole]}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Required roles:</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {requiredRoles.map(role => (
                      <Badge key={role} className="gap-1 text-xs">
                        <Building2 className="w-3 h-3" />
                        {roleDisplayNames[role]}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleGoBack} 
              variant="outline" 
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button 
              onClick={handleGoHome} 
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              If you believe this is an error, please contact your administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDenied;
