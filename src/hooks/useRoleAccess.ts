
import { useAuth } from '@/context/AuthContext';

export const useRoleAccess = () => {
  const { user } = useAuth();

  const canViewPortfolio = () => {
    return user?.role && ['admin', 'partner'].includes(user.role);
  };

  const canViewDeals = () => {
    return user?.role && ['admin', 'partner'].includes(user.role);
  };

  const canViewAnalytics = () => {
    return user?.role && ['admin', 'partner'].includes(user.role);
  };

  const canViewTeam = () => {
    return user?.role === 'admin';
  };

  const canViewCompany = (companyId: string) => {
    if (!user) return false;
    
    // Admins and partners can view all companies
    if (user.role === 'admin' || user.role === 'partner') {
      return true;
    }
    
    // Founders can only view their own company
    if (user.role === 'founder') {
      return user.company_id === companyId;
    }
    
    return false;
  };

  const canEditCompany = (companyId: string) => {
    if (!user) return false;
    
    // Admins can edit all companies
    if (user.role === 'admin') {
      return true;
    }
    
    // Partners can edit companies they're assigned to
    if (user.role === 'partner') {
      return true; // For now, partners can edit all companies
    }
    
    // Founders can edit their own company
    if (user.role === 'founder') {
      return user.company_id === companyId;
    }
    
    return false;
  };

  const canSubmitUpdates = () => {
    return user?.role === 'founder';
  };

  const canViewNotes = () => {
    return user?.role && ['admin', 'partner', 'founder'].includes(user.role);
  };

  const canCreateNotes = () => {
    return user?.role && ['admin', 'partner'].includes(user.role);
  };

  const canViewMeetings = () => {
    return user?.role && ['admin', 'partner', 'founder'].includes(user.role);
  };

  const canScheduleMeetings = () => {
    return user?.role && ['admin', 'partner'].includes(user.role);
  };

  const canViewSearch = () => {
    return user?.role && ['admin', 'partner'].includes(user.role);
  };

  return {
    canViewPortfolio,
    canViewDeals,
    canViewAnalytics,
    canViewTeam,
    canViewCompany,
    canEditCompany,
    canSubmitUpdates,
    canViewNotes,
    canCreateNotes,
    canViewMeetings,
    canScheduleMeetings,
    canViewSearch,
    userRole: user?.role,
    isFounder: user?.role === 'founder',
    isPartner: user?.role === 'partner',
    isAdmin: user?.role === 'admin'
  };
};
