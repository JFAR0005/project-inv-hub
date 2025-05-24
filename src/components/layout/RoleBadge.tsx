
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Building, TrendingUp } from 'lucide-react';

const RoleBadge: React.FC = () => {
  const { user, originalRole } = useAuth();

  if (!user) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-3 w-3" />;
      case 'partner':
        return <TrendingUp className="h-3 w-3" />;
      case 'founder':
        return <Building className="h-3 w-3" />;
      case 'capital_team':
        return <Users className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'partner':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'founder':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'capital_team':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatRoleName = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${getRoleColor(user.role)}`}>
      {getRoleIcon(user.role)}
      <span>{formatRoleName(user.role)}</span>
      {originalRole && (
        <span className="text-xs opacity-75">(viewing)</span>
      )}
    </Badge>
  );
};

export default RoleBadge;
