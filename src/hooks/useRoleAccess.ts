
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/context/AuthContext';

interface RouteAccess {
  path: string;
  allowedRoles: UserRole[];
  requiresOwnership?: boolean;
  requiresAssignment?: boolean;
}

const ROUTE_ACCESS_RULES: RouteAccess[] = [
  { path: '/submit-update', allowedRoles: ['founder'], requiresOwnership: true },
  { path: '/portfolio', allowedRoles: ['admin'] },
  { path: '/companies', allowedRoles: ['admin', 'partner', 'founder'], requiresOwnership: true },
  { path: '/notes', allowedRoles: ['admin', 'partner', 'founder'], requiresAssignment: true },
  { path: '/deals', allowedRoles: ['admin', 'partner'], requiresAssignment: true },
  { path: '/dealflow', allowedRoles: ['admin', 'partner'], requiresAssignment: true },
  { path: '/meetings', allowedRoles: ['admin', 'partner', 'founder'] }, // Special handling for invitations
];

export const useRoleAccess = () => {
  const { user, hasPermission } = useAuth();

  const canAccessRoute = (path: string, resourceOwnerId?: string): boolean => {
    if (!user) return false;

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

    switch (user.role) {
      case 'admin':
        return true;
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

    switch (user.role) {
      case 'admin':
        return true;
      case 'founder':
        return user.companyId === companyId;
      default:
        return false;
    }
  };

  const canViewNotes = (noteAuthorId: string, companyId?: string): boolean => {
    if (!user) return false;

    switch (user.role) {
      case 'admin':
        return true;
      case 'partner':
        return true; // Partners can view shared notes
      case 'founder':
        return companyId ? user.companyId === companyId : noteAuthorId === user.id;
      default:
        return false;
    }
  };

  const canSubmitUpdate = (): boolean => {
    return user?.role === 'founder';
  };

  const canViewPortfolio = (): boolean => {
    return user?.role === 'admin';
  };

  const canViewDeals = (): boolean => {
    return user?.role === 'admin' || user?.role === 'partner';
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
