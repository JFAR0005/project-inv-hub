
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import RoleViewSwitcher from '@/components/auth/RoleViewSwitcher';
import RoleBadge from '@/components/layout/RoleBadge';
import { User } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout, originalRole } = useAuth();
  const navigate = useNavigate();
  const isAdminOrImpersonating = user?.role === 'admin' || originalRole !== null;

  return (
    <header className="bg-background border-b border-border h-14 px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <RoleBadge />
      </div>

      <div className="flex items-center gap-4">
        {isAdminOrImpersonating && <RoleViewSwitcher />}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              <span>{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate('/profile')}
            >
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/settings')}
            >
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
