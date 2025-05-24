
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/context/auth/authTypes';

interface RouteAccess {
  path: string;
  allowedRoles: UserRole[];
  requiresOwnership?: boolean;
  requiresAssignment?: boolean;
}

const ROUTE_ACCESS_RULES: RouteAccess[] = [
  { path: '/submit-update', allowedRoles: ['founder'], requiresOwnership: true },
  { path: '/portfolio', allowedRoles: ['admin', 'capital_team'] }, 
  { path: '/companies', allowedRoles: ['admin', 'partner', 'founder'], requiresOwnership: true },
  { path: '/company-profile', allowedRoles: ['admin', 'partner', 'founder'], requiresOwnership: true },
  { path: '/notes', allowedRoles: ['admin', 'partner', 'founder', 'capital_team'] },
  { path: '/deals', allowedRoles: ['admin', 'partner', 'capital_team'] }, 
  { path: '/dealflow', allowedRoles: ['admin', 'partner', 'capital_team'] }, 
  { path: '/meetings', allowedRoles: ['admin', 'partner', 'founder', 'capital_team'] },
  { path: '/fundraising', allowedRoles: ['admin', 'capital_team'] }, 
];

export const useRoleAccess = () => {
  const { user, hasPermission, originalRole } = useAuth();

  // Check if user is actually an admin or capital_team (either current role or original role)
  const isActualAdmin = (originalRole || user?.role) === 'admin';
  const isCapitalTeam = (originalRole || user?.role) === 'capital_team';

  const canAccessRoute = (path: string, resourceOwnerId?: string): boolean => {
    if (!user) return false;

    // Admins and capital_team can always access everything, regardless of current view role
    if (isActualAdmin || isCapitalTeam) return true;

    const rule = ROUTE_ACCESS_RULES.find(r => path.startsWith(r.path));
    if (!rule) return true; // Allow access to unprotected routes

    // Check if user's role is allowed
    const hasRoleAccess = rule.allowedRoles.includes(user.role);
    if (!hasRoleAccess) return false;

    // For founders, check ownership when required
    if (rule.requiresOwnership && user.role === 'founder') {
      return resourceOwnerId ? user.companyId === resourceOwnerId : true;
    }

    // For partners, check assignment when required (simplified - in real app would check assignments table)
    if (rule.requiresAssignment && user.role === 'partner') {
      return true; // Simplified - assume partners have access to assigned companies
    }

    return true;
  };

  const canViewCompany = (companyId: string): boolean => {
    if (!user) return false;

    // Admins and capital_team can always view everything
    if (isActualAdmin || isCapitalTeam) return true;

    switch (user.role) {
      case 'partner':
        return hasPermission('view:portfolio:limited');
      case 'founder':
        return user.companyId === companyId;
      default:
        return false;
    }
  };

  const canEditCompany = (companyId: string): boolean => {
    if (!user) return false;

    // Admins and capital_team can always edit everything
    if (isActualAdmin || isCapitalTeam) return true;

    switch (user.role) {
      case 'founder':
        return user.companyId === companyId;
      default:
        return false;
    }
  };

  const canViewNotes = (noteAuthorId: string, companyId?: string): boolean => {
    if (!user) return false;

    // Admins and capital_team can always view everything
    if (isActualAdmin || isCapitalTeam) return true;

    switch (user.role) {
      case 'partner':
        return true; // Partners can view shared notes
      case 'founder':
        return companyId ? user.companyId === companyId : noteAuthorId === user.id;
      default:
        return false;
    }
  };

  const canSubmitUpdate = (): boolean => {
    // Admins and capital_team can always submit updates when viewing as founder
    if (isActualAdmin || isCapitalTeam) return true;
    return user?.role === 'founder';
  };

  const canViewPortfolio = (): boolean => {
    // Admins and capital_team can view portfolio
    if (isActualAdmin || isCapitalTeam) return true;
    return user?.role === 'admin' || user?.role === 'capital_team';
  };

  const canViewDeals = (): boolean => {
    // Admins, partners, and capital_team can view deals
    if (isActualAdmin || isCapitalTeam) return true;
    return user?.role === 'admin' || user?.role === 'partner' || user?.role === 'capital_team';
  };

  return {
    canAccessRoute,
    canViewCompany,
    canEditCompany,
    canViewNotes,
    canSubmitUpdate,
    canViewPortfolio,
    canViewDeals,
    userRole: user?.role,
    userId: user?.id,
    userCompanyId: user?.companyId,
  };
};
