
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  Home,
  LayoutDashboard,
  Building,
  ListChecks,
  Notebook,
  BarChart,
  Calendar,
  Shield,
  TrendingUp,
  LucideIcon,
  FileSliders,
  Zap
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  current: boolean;
  roles: string[];
}

const Sidebar: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      current: location.pathname === '/',
      roles: ['admin', 'partner', 'capital_team', 'founder']
    },
    {
      name: 'Portfolio',
      href: '/portfolio',
      icon: Home,
      current: location.pathname === '/portfolio',
      roles: ['admin', 'partner', 'capital_team']
    },
    {
      name: 'Companies',
      href: '/companies',
      icon: Building,
      current: location.pathname.startsWith('/companies'),
      roles: ['admin', 'partner', 'capital_team', 'founder']
    },
    {
      name: 'Updates',
      href: '/updates',
      icon: ListChecks,
      current: location.pathname === '/updates',
      roles: ['admin', 'partner', 'capital_team', 'founder']
    },
    {
      name: 'Notes',
      href: '/notes',
      icon: Notebook,
      current: location.pathname === '/notes',
      roles: ['admin', 'partner', 'capital_team', 'founder']
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart,
      current: location.pathname === '/analytics',
      roles: ['admin', 'partner', 'capital_team']
    },
    {
      name: 'Meetings',
      href: '/meetings',
      icon: Calendar,
      current: location.pathname === '/meetings',
      roles: ['admin', 'partner', 'capital_team', 'founder']
    },
    {
      name: 'Deals',
      href: '/deals',
      icon: FileSliders,
      current: location.pathname === '/deals',
      roles: ['admin', 'partner', 'capital_team']
    },
    {
      name: 'Fundraising',
      href: '/fundraising',
      icon: TrendingUp,
      current: location.pathname === '/fundraising',
      roles: ['admin', 'partner', 'capital_team']
    },
    {
      name: 'Integrations',
      href: '/integrations',
      icon: Zap,
      current: location.pathname === '/integrations',
      roles: ['admin', 'partner', 'capital_team']
    },
    
    // Admin section - only for admins
    ...(hasPermission('admin') ? [
      {
        name: 'Admin',
        href: '/admin',
        icon: Shield,
        current: location.pathname === '/admin',
        roles: ['admin']
      }
    ] : []),
  ];

  return (
    <div className="flex flex-col h-full py-4">
      <div className="px-3 space-y-2">
        {navigation.map((item) => {
          if (!item.roles.includes(user?.role || '')) {
            return null;
          }

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                item.current ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
