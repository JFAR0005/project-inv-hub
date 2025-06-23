
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
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
  FileSliders,
  Zap
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['admin', 'partner', 'capital_team', 'founder']
  },
  {
    name: 'Portfolio',
    href: '/portfolio',
    icon: Home,
    roles: ['admin', 'partner', 'capital_team']
  },
  {
    name: 'Companies',
    href: '/companies',
    icon: Building,
    roles: ['admin', 'partner', 'capital_team', 'founder']
  },
  {
    name: 'Updates',
    href: '/updates',
    icon: ListChecks,
    roles: ['admin', 'partner', 'capital_team', 'founder']
  },
  {
    name: 'Notes',
    href: '/notes',
    icon: Notebook,
    roles: ['admin', 'partner', 'capital_team', 'founder']
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart,
    roles: ['admin', 'partner', 'capital_team']
  },
  {
    name: 'Meetings',
    href: '/meetings',
    icon: Calendar,
    roles: ['admin', 'partner', 'capital_team', 'founder']
  },
  {
    name: 'Deals',
    href: '/deals',
    icon: FileSliders,
    roles: ['admin', 'partner', 'capital_team']
  },
  {
    name: 'Fundraising',
    href: '/fundraising',
    icon: TrendingUp,
    roles: ['admin', 'partner', 'capital_team']
  },
  {
    name: 'Integrations',
    href: '/integrations',
    icon: Zap,
    roles: ['admin', 'partner', 'capital_team']
  }
];

const adminNavigation = [
  {
    name: 'Admin',
    href: '/admin',
    icon: Shield,
    roles: ['admin']
  }
];

export function AppSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || '')
  );

  const filteredAdminNavigation = adminNavigation.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredAdminNavigation.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdminNavigation.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive(item.href)}>
                      <Link to={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
