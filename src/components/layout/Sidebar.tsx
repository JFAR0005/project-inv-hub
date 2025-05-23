
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Building2, 
  Calendar,
  FileText,
  Home,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Sidebar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      roles: ['admin', 'partner', 'founder', 'lp']
    },
    {
      name: 'Portfolio',
      href: '/portfolio',
      icon: Building2,
      roles: ['admin', 'partner', 'lp']
    },
    {
      name: 'Dealflow',
      href: '/dealflow',
      icon: TrendingUp,
      roles: ['admin', 'partner']
    },
    {
      name: 'Deals',
      href: '/deals',
      icon: Briefcase,
      roles: ['admin', 'partner']
    },
    {
      name: 'Meetings',
      href: '/meetings',
      icon: Calendar,
      roles: ['admin', 'partner', 'founder']
    },
    {
      name: 'Notes',
      href: '/notes',
      icon: FileText,
      roles: ['admin', 'partner', 'founder']
    },
    {
      name: 'Integrations',
      href: '/integrations',
      icon: Settings,
      roles: ['admin', 'partner']
    }
  ];

  // Filter navigation items based on user role
  const visibleItems = navigationItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex h-16 shrink-0 items-center px-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Black Nova
        </h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center">
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {user?.role}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="mt-3 w-full justify-start"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
