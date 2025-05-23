
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Building2, 
  BarChart3,
  StickyNote, 
  Calendar, 
  Briefcase, 
  TrendingUp,
  Upload,
  Settings,
  Search
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { 
      to: '/', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      roles: ['admin', 'partner', 'analyst', 'founder', 'lp']
    },
    { 
      to: '/portfolio', 
      icon: Building2, 
      label: 'Portfolio',
      roles: ['admin', 'partner', 'analyst', 'lp']
    },
    { 
      to: '/enhanced-portfolio', 
      icon: Search, 
      label: 'Advanced Portfolio',
      roles: ['admin', 'partner', 'analyst', 'lp']
    },
    { 
      to: '/analytics', 
      icon: BarChart3, 
      label: 'Analytics',
      roles: ['admin', 'partner', 'lp']
    },
    { 
      to: '/notes', 
      icon: StickyNote, 
      label: 'Notes',
      roles: ['admin', 'partner', 'analyst']
    },
    { 
      to: '/meetings', 
      icon: Calendar, 
      label: 'Meetings',
      roles: ['admin', 'partner', 'analyst', 'founder']
    },
    { 
      to: '/deals', 
      icon: Briefcase, 
      label: 'Deals',
      roles: ['admin', 'partner', 'analyst']
    },
    { 
      to: '/dealflow', 
      icon: TrendingUp, 
      label: 'Deal Flow',
      roles: ['admin', 'partner', 'analyst']
    },
    { 
      to: '/submit-update', 
      icon: Upload, 
      label: 'Submit Update',
      roles: ['founder']
    },
    { 
      to: '/integrations', 
      icon: Settings, 
      label: 'Integrations',
      roles: ['admin', 'partner']
    }
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">VC Portal</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
