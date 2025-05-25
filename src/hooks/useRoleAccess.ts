
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
      return user.companyId === companyId;
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
      return user.companyId === companyId;
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

  const canAccessCapitalFeatures = () => {
    return user?.role && ['admin', 'capital_team', 'partner'].includes(user.role);
  };

  const canAccessRoute = (pathname: string, resourceId?: string) => {
    if (!user) return false;

    // Route-based access control
    switch (true) {
      case pathname.startsWith('/portfolio'):
        return canViewPortfolio();
      case pathname.startsWith('/deals'):
        return canViewDeals();
      case pathname.startsWith('/analytics'):
        return canViewAnalytics();
      case pathname.startsWith('/team'):
        return canViewTeam();
      case pathname.startsWith('/search'):
        return canViewSearch();
      case pathname.startsWith('/company/'):
        const companyId = pathname.split('/')[2] || resourceId;
        return companyId ? canViewCompany(companyId) : false;
      case pathname.startsWith('/submit-update'):
        return canSubmitUpdates();
      case pathname.startsWith('/notes'):
        return canViewNotes();
      case pathname.startsWith('/meetings'):
        return canViewMeetings();
      default:
        return true; // Allow access to general pages
    }
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
    canAccessCapitalFeatures,
    canAccessRoute,
    userRole: user?.role,
    isFounder: user?.role === 'founder',
    isPartner: user?.role === 'partner',
    isAdmin: user?.role === 'admin'
  };
};
