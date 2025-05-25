
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Building2, 
  FileText, 
  Calendar, 
  Search, 
  Users,
  Bell,
  Settings,
  LogOut,
  PlusCircle,
  TrendingUp,
  MessageSquare,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const adminNavItems = [
    { 
      path: '/admin', 
      label: 'Admin Dashboard', 
      icon: Shield,
      description: 'System administration'
    },
    { 
      path: '/portfolio', 
      label: 'Portfolio', 
      icon: BarChart3,
      description: 'Portfolio overview & analytics'
    },
    { 
      path: '/deals', 
      label: 'Deals', 
      icon: TrendingUp,
      description: 'Deal pipeline & tracking'
    },
    { 
      path: '/dealflow', 
      label: 'Dealflow', 
      icon: Building2,
      description: 'Manage deal flow'
    },
    { 
      path: '/fundraising', 
      label: 'Fundraising', 
      icon: TrendingUp,
      description: 'LP tracker & fundraising dashboard'
    },
  ];

  const capitalTeamNavItems = [
    { 
      path: '/fundraising', 
      label: 'Fundraising', 
      icon: TrendingUp,
      description: 'LP tracker & fundraising dashboard'
    },
    { 
      path: '/portfolio', 
      label: 'Portfolio', 
      icon: BarChart3,
      description: 'Portfolio overview & analytics'
    },
    { 
      path: '/deals', 
      label: 'Deals', 
      icon: TrendingUp,
      description: 'Deal pipeline & tracking'
    },
  ];

  const partnerNavItems = [
    { 
      path: '/portfolio', 
      label: 'Portfolio', 
      icon: BarChart3,
      description: 'Portfolio overview',
      roles: ['admin']
    },
    { 
      path: '/deals', 
      label: 'Deals', 
      icon: TrendingUp,
      description: 'Deal pipeline'
    },
    { 
      path: '/dealflow', 
      label: 'Dealflow', 
      icon: Building2,
      description: 'Manage deal flow'
    },
  ];

  const commonNavItems = [
    { 
      path: '/search', 
      label: 'Search', 
      icon: Search,
      description: 'Search companies & notes'
    },
    { 
      path: '/notes', 
      label: 'Notes', 
      icon: FileText,
      description: 'Company notes & updates'
    },
    { 
      path: '/meetings', 
      label: 'Meetings', 
      icon: Calendar,
      description: 'Schedule & manage meetings'
    },
    { 
      path: '/team', 
      label: 'Team', 
      icon: Users,
      description: 'Team collaboration'
    },
  ];

  const adminOnlyItems = [
    { 
      path: '/notifications', 
      label: 'Notifications', 
      icon: Bell,
      description: 'Notification settings',
      roles: ['admin', 'partner']
    },
    { 
      path: '/integrations', 
      label: 'Integrations', 
      icon: Settings,
      description: 'Third-party integrations',
      roles: ['admin']
    },
  ];

  const getNavItems = () => {
    let items = [...commonNavItems];
    
    if (user?.role === 'admin') {
      items = [...adminNavItems, ...items, ...adminOnlyItems];
    } else if (user?.role === 'capital_team') {
      items = [...capitalTeamNavItems, ...items, ...adminOnlyItems.filter(item => 
        !item.roles || item.roles.includes('capital_team')
      )];
    } else if (user?.role === 'partner') {
      items = [...partnerNavItems, ...items, ...adminOnlyItems.filter(item => 
        !item.roles || item.roles.includes('partner')
      )];
    } else if (user?.role === 'founder') {
      items = [
        { 
          path: `/company/${user.companyId}`, 
          label: 'My Company', 
          icon: Building2,
          description: 'Company profile & updates'
        },
        { 
          path: '/submit-update', 
          label: 'Submit Update', 
          icon: PlusCircle,
          description: 'Submit company update'
        },
        ...items.filter(item => 
          ['notes', 'meetings', 'team'].includes(item.path.split('/')[1])
        )
      ];
    }
    
    return items;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-r">
      {/* Header */}
      <div className="p-6 border-b">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Black Nova</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {getNavItems().map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive(item.path)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <item.icon className="w-5 h-5" />
            <div className="flex-1">
              <div>{item.label}</div>
              <div className="text-xs opacity-70">{item.description}</div>
            </div>
          </Link>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.name || user?.email}</div>
            <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
          </div>
        </div>
        
        <Separator className="my-3" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
