
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  switchRole: (role: UserRole) => void;
  resetRole: () => void;
  setTemporaryRole: (role: UserRole) => void;
  clearTemporaryRole: () => void;
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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserData(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        setUser({ 
          ...authUser,
          role: undefined,
          name: undefined,
          companyId: undefined
        } as AuthUser);
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
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setUser(null);
    setOriginalRole(null);
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
    login,
    logout,
    hasPermission,
    switchRole,
    resetRole,
    setTemporaryRole,
    clearTemporaryRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
