
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
  const [initialized, setInitialized] = useState(false);

  const authOperations = useAuthOperations(
    user,
    setUser,
    setError,
    setIsLoading,
    setOriginalRole
  );

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          if (mounted) {
            setError('Failed to restore session. Please log in again.');
            setIsLoading(false);
            setInitialized(true);
          }
          return;
        }
        
        if (session?.user && mounted) {
          console.log('Found existing session for:', session.user.email);
          await handleFetchUserData(session.user);
        } else if (mounted) {
          console.log('No existing session found');
          setIsLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setError('Failed to initialize authentication.');
          setIsLoading(false);
          setInitialized(true);
        }
      }
    };

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

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
            role: prevUser.role,
            name: prevUser.name,
            companyId: prevUser.companyId
          } as AuthUser;
        });
        return;
      }
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in:', session.user.email);
        await handleFetchUserData(session.user);
      } else if (!session?.user) {
        setUser(null);
        setOriginalRole(null);
        setIsLoading(false);
      }
    });

    // Initialize after setting up listener
    if (!initialized) {
      initializeAuth();
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]);

  const handleFetchUserData = async (authUser: User) => {
    setError(null);
    setIsLoading(true);
    try {
      console.log('Fetching user data for:', authUser.email);
      
      const { user: userData, error: fetchError } = await fetchUserData(authUser);
      
      if (fetchError) {
        setError(fetchError);
      }
      
      console.log('Setting user data:', userData);
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user profile.');
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
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
