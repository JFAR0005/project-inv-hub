
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/context/auth/authTypes';

export const useRolePermissions = () => {
  const { user } = useAuth();

  const canAccessAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  const canAccessFundraising = (): boolean => {
    return user?.role === 'admin' || user?.role === 'capital_team';
  };

  const canAccessDeals = (): boolean => {
    return user?.role === 'admin' || user?.role === 'capital_team' || user?.role === 'partner';
  };

  const canAccessPortfolio = (): boolean => {
    return user?.role === 'admin' || user?.role === 'capital_team' || user?.role === 'partner';
  };

  const canSubmitUpdates = (): boolean => {
    return user?.role === 'founder';
  };

  const canViewCompany = (companyId: string): boolean => {
    if (!user) return false;
    
    // Admin and capital team can view all companies
    if (user.role === 'admin' || user.role === 'capital_team') return true;
    
    // Partners can view assigned companies (simplified - assume all for now)
    if (user.role === 'partner') return true;
    
    // Founders can only view their own company
    if (user.role === 'founder') return user.companyId === companyId;
    
    return false;
  };

  const canEditCompany = (companyId: string): boolean => {
    if (!user) return false;
    
    // Admin and capital team can edit all companies
    if (user.role === 'admin' || user.role === 'capital_team') return true;
    
    // Founders can only edit their own company
    if (user.role === 'founder') return user.companyId === companyId;
    
    return false;
  };

  const canManageUsers = (): boolean => {
    return user?.role === 'admin';
  };

  const canViewAnalytics = (): boolean => {
    return user?.role === 'admin' || user?.role === 'capital_team' || user?.role === 'partner';
  };

  return {
    canAccessAdmin,
    canAccessFundraising,
    canAccessDeals,
    canAccessPortfolio,
    canSubmitUpdates,
    canViewCompany,
    canEditCompany,
    canManageUsers,
    canViewAnalytics,
    userRole: user?.role,
    isAuthenticated: !!user,
  };
};
