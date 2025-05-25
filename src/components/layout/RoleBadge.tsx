
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/context/auth/authTypes';
import { Shield, Users, Building2, User } from 'lucide-react';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  variant?: 'default' | 'secondary' | 'outline';
}

const roleConfig: Record<UserRole, {
  label: string;
  icon: React.ComponentType<any>;
  color: string;
}> = {
  admin: {
    label: 'Administrator',
    icon: Shield,
    color: 'bg-red-500 text-white'
  },
  capital_team: {
    label: 'Capital Team',
    icon: Building2,
    color: 'bg-blue-500 text-white'
  },
  partner: {
    label: 'Partner',
    icon: Users,
    color: 'bg-green-500 text-white'
  },
  founder: {
    label: 'Founder',
    icon: User,
    color: 'bg-purple-500 text-white'
  }
};

const RoleBadge: React.FC<RoleBadgeProps> = ({ 
  role, 
  size = 'md', 
  showIcon = true, 
  variant = 'default' 
}) => {
  const config = roleConfig[role];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <Badge 
      variant={variant}
      className={`
        ${sizeClasses[size]} 
        ${variant === 'default' ? config.color : ''} 
        gap-1 font-medium
      `}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
};

export default RoleBadge;
