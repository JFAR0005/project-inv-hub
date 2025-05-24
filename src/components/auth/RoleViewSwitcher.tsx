
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
import { Eye } from 'lucide-react';
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

  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={isImpersonating ? "border-orange-400 text-orange-600" : ""}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isImpersonating ? `Viewing as: ${user.role}` : "View as"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56">
          <div className="space-y-4">
            <h4 className="font-medium text-sm">View application as:</h4>
            <RadioGroup 
              value={currentViewRole || user.role}
              onValueChange={(value) => handleRoleChange(value as UserRole)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="admin" />
                <Label htmlFor="admin">Admin</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="partner" id="partner" />
                <Label htmlFor="partner">Partner</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="founder" id="founder" />
                <Label htmlFor="founder">Founder</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="capital_team" id="capital_team" />
                <Label htmlFor="capital_team">Capital Team</Label>
              </div>
            </RadioGroup>
            
            {isImpersonating && (
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full"
                onClick={handleReset}
              >
                Reset to Admin View
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default RoleViewSwitcher;
