
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { 
  Building2, 
  FileText, 
  Calendar, 
  TrendingUp, 
  Users, 
  Settings,
  Search,
  SearchCheck,
  BarChart3,
  DollarSign,
  Upload,
  Zap
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    {
      name: 'Portfolio',
      href: '/enhanced-portfolio',
      icon: Building2,
      roles: ['admin', 'partner', 'analyst', 'lp']
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      roles: ['admin', 'partner', 'lp']
    },
    {
      name: 'Search',
      href: '/search',
      icon: Search,
      roles: ['admin', 'partner', 'analyst', 'lp']
    },
    {
      name: 'Advanced Search',
      href: '/advanced-search',
      icon: SearchCheck,
      roles: ['admin', 'partner', 'analyst', 'lp']
    },
    {
      name: 'Notes',
      href: '/notes',
      icon: FileText,
      roles: ['admin', 'partner', 'founder']
    },
    {
      name: 'Meetings',
      href: '/meetings',
      icon: Calendar,
      roles: ['admin', 'partner', 'founder']
    },
    {
      name: 'Deals',
      href: '/deals',
      icon: DollarSign,
      roles: ['admin', 'partner']
    },
    {
      name: 'Dealflow',
      href: '/dealflow',
      icon: TrendingUp,
      roles: ['admin', 'partner']
    },
    {
      name: 'Submit Update',
      href: '/submit-update',
      icon: Upload,
      roles: ['founder']
    },
    {
      name: 'Integrations',
      href: '/integrations',
      icon: Zap,
      roles: ['admin']
    }
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-6">
        <Building2 className="h-8 w-8 text-blue-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">VC Portal</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col p-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-2">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    'group flex gap-x-3 rounded-md p-3 text-sm font-medium leading-6 transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                    )}
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Users className="h-8 w-8 rounded-full bg-gray-200 p-1" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user?.name || user?.email}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
