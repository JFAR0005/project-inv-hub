
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/context/auth/authTypes';

interface RouteAccess {
  [key: string]: {
    allowedRoles: UserRole[];
    requiresOwnership?: boolean;
  };
}

const ROUTE_ACCESS: RouteAccess = {
  '/portfolio': { allowedRoles: ['admin', 'capital_team', 'partner'] },
  '/enhanced-portfolio': { allowedRoles: ['admin', 'capital_team', 'partner'] },
  '/company': { allowedRoles: ['admin', 'capital_team', 'partner', 'founder'], requiresOwnership: true },
  '/analytics': { allowedRoles: ['admin', 'capital_team', 'partner'] },
  '/advanced-analytics': { allowedRoles: ['admin', 'capital_team', 'partner'] },
  '/deals': { allowedRoles: ['admin', 'capital_team', 'partner'] },
  '/notes': { allowedRoles: ['admin', 'capital_team', 'partner'] },
  '/meetings': { allowedRoles: ['admin', 'capital_team', 'partner', 'founder'] },
  '/search': { allowedRoles: ['admin', 'capital_team', 'partner'] },
  '/team': { allowedRoles: ['admin'] },
  '/submit-update': { allowedRoles: ['founder'] }
};

export const useRoleAccess = () => {
  const { user } = useAuth();

  const canAccessRoute = (path: string, resourceOwnerId?: string): boolean => {
    if (!user?.role) return false;

    // Find matching route configuration
    const routeKey = Object.keys(ROUTE_ACCESS).find(route => path.startsWith(route));
    if (!routeKey) return true; // Allow access to unprotected routes

    const routeConfig = ROUTE_ACCESS[routeKey];
    const hasRoleAccess = routeConfig.allowedRoles.includes(user.role);

    if (!hasRoleAccess) return false;

    // Check ownership for founders
    if (routeConfig.requiresOwnership && user.role === 'founder' && resourceOwnerId) {
      return user.companyId === resourceOwnerId;
    }

    return true;
  };

  const canAccessAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  const canAccessCapitalFeatures = (): boolean => {
    return user?.role === 'admin' || user?.role === 'capital_team' || user?.role === 'partner';
  };

  const canAccessPartnerFeatures = (): boolean => {
    return user?.role === 'admin' || user?.role === 'capital_team' || user?.role === 'partner';
  };

  const canSubmitUpdates = (): boolean => {
    return user?.role === 'founder';
  };

  const canManageUsers = (): boolean => {
    return user?.role === 'admin';
  };

  const canViewCompany = (companyId: string): boolean => {
    if (!user) return false;
    
    // Admin and capital team can view all companies
    if (user.role === 'admin' || user.role === 'capital_team') return true;
    
    // Partners can view assigned companies
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

  const getAccessibleRoutes = (): string[] => {
    if (!user?.role) return [];
    
    return Object.entries(ROUTE_ACCESS)
      .filter(([_, config]) => config.allowedRoles.includes(user.role!))
      .map(([route]) => route);
  };

  return {
    canAccessRoute,
    canAccessAdmin,
    canAccessCapitalFeatures,
    canAccessPartnerFeatures,
    canSubmitUpdates,
    canManageUsers,
    canViewCompany,
    canEditCompany,
    getAccessibleRoutes,
    userRole: user?.role,
    isAuthenticated: !!user,
  };
};
