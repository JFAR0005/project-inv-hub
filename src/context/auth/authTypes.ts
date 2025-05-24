
import { User } from '@supabase/supabase-js';
import { UserRole } from './rolePermissions';

export interface AuthUser extends User {
  role?: UserRole;
  name?: string;
  companyId?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  originalRole: UserRole | null;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  switchRole: (role: UserRole) => void;
  resetRole: () => void;
  setTemporaryRole: (role: UserRole) => void;
  clearTemporaryRole: () => void;
  clearError: () => void;
}

// Re-export UserRole for convenience
export { UserRole };
