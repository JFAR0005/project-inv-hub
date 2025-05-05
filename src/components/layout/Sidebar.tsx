
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Calendar,
  FileText,
  FolderOpen,
  Users,
  BarChart2,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  adminOnly?: boolean;
  partnerAccess?: boolean;
  founderAccess?: boolean;
}

export function Sidebar({ className }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: <BarChart2 size={20} />,
      href: "/",
      partnerAccess: true,
      founderAccess: true,
    },
    {
      label: "Portfolio",
      icon: <Briefcase size={20} />,
      href: "/portfolio",
      partnerAccess: true,
      founderAccess: true,
    },
    {
      label: "Notes",
      icon: <FileText size={20} />,
      href: "/notes",
      partnerAccess: true,
    },
    {
      label: "Deals",
      icon: <FolderOpen size={20} />,
      href: "/deals",
    },
    {
      label: "Meetings",
      icon: <Calendar size={20} />,
      href: "/meetings",
      partnerAccess: true,
      founderAccess: true,
    },
    {
      label: "Voting",
      icon: <Check size={20} />,
      href: "/voting",
      adminOnly: true,
    },
    {
      label: "Team",
      icon: <Users size={20} />,
      href: "/team",
      partnerAccess: true,
      founderAccess: true,
    },
    {
      label: "Knowledge Base",
      icon: <BookOpen size={20} />,
      href: "/knowledge",
      partnerAccess: true,
    },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (!user) return false;
    
    if (user.role === 'admin') return true;
    if (user.role === 'partner' && (item.partnerAccess || !item.adminOnly)) return true;
    if (user.role === 'founder' && item.founderAccess) return true;
    
    return false;
  });

  return (
    <div
      className={cn(
        "bg-gradient-blacknova text-white h-screen flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">Black Nova</span>
          </Link>
        )}
        {collapsed && (
          <div className="mx-auto">
            <span className="text-xl font-bold text-white">BN</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-blacknova-dark/50"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      <Separator className="bg-blacknova-dark/50 my-2" />

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  isActive
                    ? "bg-blacknova-blue text-white"
                    : "text-white/80 hover:bg-blacknova-dark/50 hover:text-white"
                )}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {!collapsed && (
        <div className="p-4">
          <div className="rounded-md bg-blacknova-dark/50 p-3">
            <div className="text-sm font-medium mb-1">Logged in as:</div>
            <div className="text-xs opacity-80">{user?.name}</div>
            <div className="text-xs opacity-80">{user?.role}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
