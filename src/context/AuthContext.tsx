import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, AuthUser } from './auth/authTypes';
import { UserRole, hasPermission } from './auth/rolePermissions';
import { fetchUserData } from './auth/authUtils';
import { useAuthOperations } from './auth/useAuthOperations';

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

  const authOperations = useAuthOperations(
    user,
    setUser,
    setError,
    setIsLoading,
    setOriginalRole
  );

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
        handleFetchUserData(session.user);
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
        await handleFetchUserData(session.user);
      } else {
        setUser(null);
        setOriginalRole(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleFetchUserData = async (authUser: User) => {
    setError(null);
    const { user: userData, error: fetchError } = await fetchUserData(authUser);
    setUser(userData);
    if (fetchError) {
      setError(fetchError);
    }
    setIsLoading(false);
  };

  const hasUserPermission = (permission: string): boolean => {
    return hasPermission(user?.role, permission);
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    originalRole,
    error,
    hasPermission: hasUserPermission,
    ...authOperations,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
