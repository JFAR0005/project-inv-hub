
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  BarChart3, 
  FileText, 
  Calendar,
  Search,
  Settings,
  Users,
  TrendingUp,
  DollarSign,
  Zap
} from 'lucide-react';
import { useRoleAccess } from '@/hooks/useRoleAccess';

const Sidebar = () => {
  const location = useLocation();
  const {
    canViewPortfolio,
    canViewDeals,
    canViewAnalytics,
    canViewTeam,
    canViewNotes,
    canViewMeetings,
    canViewSearch,
    canSubmitUpdates,
    userRole
  } = useRoleAccess();

  const navigation = [
    { 
      name: 'Portfolio', 
      href: '/portfolio', 
      icon: Building2, 
      show: canViewPortfolio() 
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: BarChart3, 
      show: canViewAnalytics() 
    },
    { 
      name: 'Deals', 
      href: '/deals', 
      icon: TrendingUp, 
      show: canViewDeals() 
    },
    { 
      name: 'Fundraising', 
      href: '/fundraising', 
      icon: DollarSign, 
      show: canViewDeals() 
    },
    { 
      name: 'Notes', 
      href: '/notes', 
      icon: FileText, 
      show: canViewNotes() 
    },
    { 
      name: 'Meetings', 
      href: '/meetings', 
      icon: Calendar, 
      show: canViewMeetings() 
    },
    { 
      name: 'Search', 
      href: '/search', 
      icon: Search, 
      show: canViewSearch() 
    },
    { 
      name: 'Team', 
      href: '/team', 
      icon: Users, 
      show: canViewTeam() 
    },
    { 
      name: 'Integrations', 
      href: '/integrations', 
      icon: Zap, 
      show: canViewAnalytics() 
    },
    { 
      name: 'Submit Update', 
      href: '/submit-update', 
      icon: FileText, 
      show: canSubmitUpdates() 
    },
  ];

  const filteredNavigation = navigation.filter(item => item.show);

  return (
    <div className="pb-12 w-64">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Black Nova
          </h2>
          {userRole && (
            <div className="mb-4 px-4">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                {userRole === 'admin' ? 'Administrator' : 
                 userRole === 'partner' ? 'Partner' : 
                 userRole === 'founder' ? 'Founder' : userRole}
              </span>
            </div>
          )}
          <div className="space-y-1">
            {filteredNavigation.map((item) => (
              <Button
                key={item.name}
                variant={location.pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  location.pathname === item.href && "bg-secondary"
                )}
                asChild
              >
                <Link to={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
