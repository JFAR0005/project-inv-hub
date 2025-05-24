
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'partner' | 'founder' | 'capital_team';

export interface AuthUser extends User {
  role?: UserRole;
  name?: string;
  companyId?: string;
}

interface AuthContextType {
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

const ROLE_PERMISSIONS = {
  admin: [
    'view:portfolio:full',
    'edit:companies',
    'view:deals',
    'manage:deals',
    'view:fundraising',
    'manage:fundraising',
    'view:meetings',
    'manage:meetings',
    'view:notes',
    'edit:notes',
    'manage:users'
  ],
  capital_team: [
    'view:portfolio:full',
    'view:deals',
    'manage:deals',
    'view:fundraising',
    'manage:fundraising',
    'view:meetings',
    'manage:meetings',
    'view:notes',
    'edit:notes'
  ],
  partner: [
    'view:portfolio:limited',
    'view:deals',
    'manage:deals',
    'view:meetings',
    'manage:meetings',
    'view:notes',
    'edit:notes'
  ],
  founder: [
    'view:portfolio:own',
    'submit:updates',
    'view:meetings',
    'view:notes'
  ]
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [originalRole, setOriginalRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setError('Failed to restore session. Please log in again.');
        setIsLoading(false);
        return;
      }
      
      if (session?.user) {
        fetchUserData(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setOriginalRole(null);
        setError(null);
        setIsLoading(false);
        return;
      }
      
      if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Don't refetch user data on token refresh, just update the user object
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            ...session.user,
            role: prevUser.role, // Preserve the existing role
            name: prevUser.name, // Preserve the existing name
            companyId: prevUser.companyId // Preserve the existing companyId
          } as AuthUser;
        });
        return;
      }
      
      if (session?.user) {
        await fetchUserData(session.user);
      } else {
        setUser(null);
        setOriginalRole(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (authUser: User) => {
    try {
      setError(null);
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        
        // If user doesn't exist in users table, create a basic user object
        if (error.code === 'PGRST116') {
          setUser({
            ...authUser,
            role: 'founder' as UserRole, // Default role
            name: authUser.email?.split('@')[0],
            companyId: undefined
          } as AuthUser);
          setError('User profile not found. Some features may be limited.');
        } else {
          setUser({
            ...authUser,
            role: undefined,
            name: undefined,
            companyId: undefined
          } as AuthUser);
          setError('Failed to load user profile. Please try refreshing the page.');
        }
      } else {
        setUser({
          ...authUser,
          role: userData.role as UserRole,
          name: userData.name,
          companyId: userData.company_id
        } as AuthUser);
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      setUser({
        ...authUser,
        role: undefined,
        name: undefined,
        companyId: undefined
      } as AuthUser);
      setError('An unexpected error occurred while loading your profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      setIsLoading(false);
      throw error; // Re-throw to let the component handle the specific error
    }
  };

  const logout = async () => {
    setError(null);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        setError('Failed to log out completely. Please clear your browser cache.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      setError('An error occurred while logging out.');
    } finally {
      // Always clear local state
      setUser(null);
      setOriginalRole(null);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user?.role) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
  };

  const switchRole = (role: UserRole) => {
    if (!user) return;
    
    // Store original role if not already stored
    if (!originalRole) {
      setOriginalRole(user.role || null);
    }
    
    // Only allow admins and capital_team to switch roles
    if (user.role === 'admin' || user.role === 'capital_team') {
      setUser({ ...user, role });
    }
  };

  const resetRole = () => {
    if (!user || !originalRole) return;
    setUser({ ...user, role: originalRole });
    setOriginalRole(null);
  };

  const setTemporaryRole = (role: UserRole) => {
    switchRole(role);
  };

  const clearTemporaryRole = () => {
    resetRole();
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    originalRole,
    error,
    login,
    logout,
    hasPermission,
    switchRole,
    resetRole,
    setTemporaryRole,
    clearTemporaryRole,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
