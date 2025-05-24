
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/context/AuthContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Eye, UserCheck, Shield, Building, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RoleViewSwitcher = () => {
  const { user, originalRole, setTemporaryRole, clearTemporaryRole } = useAuth();
  const [currentViewRole, setCurrentViewRole] = useState<UserRole | null>(null);
  const { toast } = useToast();
  const isImpersonating = originalRole !== null;

  // Only show for actual admin users (either viewing as admin or impersonating)
  if (!user || (originalRole || user.role) !== 'admin') {
    return null;
  }

  // Update local state when role changes
  useEffect(() => {
    if (user) {
      setCurrentViewRole(user.role);
    }
  }, [user?.role]);

  const handleRoleChange = (role: UserRole) => {
    setCurrentViewRole(role);
    setTemporaryRole(role);
    toast({
      title: "View mode changed",
      description: `You are now viewing the application as a ${role}`,
    });
  };

  const handleReset = () => {
    clearTemporaryRole();
    setCurrentViewRole('admin');
    toast({
      title: "View mode reset",
      description: "You are now viewing the application with your original role",
    });
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'partner':
        return <Briefcase className="h-4 w-4" />;
      case 'founder':
        return <UserCheck className="h-4 w-4" />;
      case 'capital_team':
        return <Building className="h-4 w-4" />;
      default:
        return <UserCheck className="h-4 w-4" />;
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Full system access';
      case 'partner':
        return 'Portfolio management';
      case 'founder':
        return 'Company updates';
      case 'capital_team':
        return 'Fundraising & analytics';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={isImpersonating ? "border-orange-400 text-orange-600 bg-orange-50" : ""}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isImpersonating ? `Viewing as: ${user.role}` : "Switch View"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm">Role View Switcher</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Switch perspectives to see how different user roles experience the platform
              </p>
            </div>
            
            <RadioGroup 
              value={currentViewRole || user.role}
              onValueChange={(value) => handleRoleChange(value as UserRole)}
            >
              <div className="space-y-3">
                {(['admin', 'partner', 'founder', 'capital_team'] as UserRole[]).map((role) => (
                  <div key={role} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value={role} id={role} />
                    <Label htmlFor={role} className="flex items-center space-x-2 cursor-pointer flex-1">
                      {getRoleIcon(role)}
                      <div className="flex-1">
                        <div className="font-medium capitalize">{role.replace('_', ' ')}</div>
                        <div className="text-xs text-muted-foreground">{getRoleDescription(role)}</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
            
            {isImpersonating && (
              <div className="pt-3 border-t">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full"
                  onClick={handleReset}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Reset to Admin View
                </Button>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
              <strong>Note:</strong> This only changes your view perspective. You retain admin privileges.
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default RoleViewSwitcher;
