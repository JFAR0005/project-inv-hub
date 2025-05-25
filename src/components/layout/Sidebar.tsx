
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
import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: 'Portfolio', href: '/portfolio', icon: Building2, roles: ['admin', 'capital_team', 'partner'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['admin', 'capital_team', 'partner'] },
    { name: 'Deals', href: '/deals', icon: TrendingUp, roles: ['admin', 'capital_team', 'partner'] },
    { name: 'Fundraising', href: '/fundraising', icon: DollarSign, roles: ['admin', 'capital_team', 'partner'] },
    { name: 'Notes', href: '/notes', icon: FileText, roles: ['admin', 'capital_team', 'partner', 'founder'] },
    { name: 'Meetings', href: '/meetings', icon: Calendar, roles: ['admin', 'capital_team', 'partner', 'founder'] },
    { name: 'Search', href: '/search', icon: Search, roles: ['admin', 'capital_team', 'partner'] },
    { name: 'Team', href: '/team', icon: Users, roles: ['admin'] },
    { name: 'Integrations', href: '/integrations', icon: Zap, roles: ['admin', 'capital_team', 'partner'] },
    { name: 'Submit Update', href: '/submit-update', icon: FileText, roles: ['founder'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    !item.roles || item.roles.includes(user?.role || '')
  );

  return (
    <div className="pb-12 w-64">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            VC Platform
          </h2>
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
