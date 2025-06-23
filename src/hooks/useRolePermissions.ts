
import { useAuth } from '@/context/AuthContext';
import { useMemo } from 'react';

export function useRolePermissions() {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    const role = user?.role || 'founder';

    return {
      canViewCompany: (companyId: string) => {
        if (role === 'admin' || role === 'partner') return true;
        if (role === 'founder') return user?.company_id === companyId;
        return false;
      },
      canEditCompany: (companyId: string) => {
        if (role === 'admin') return true;
        if (role === 'founder') return user?.company_id === companyId;
        return false;
      },
      canViewAllCompanies: role === 'admin' || role === 'partner',
      canManageUsers: role === 'admin',
      canViewFinancials: role === 'admin' || role === 'partner',
    };
  }, [user]);

  return permissions;
}
