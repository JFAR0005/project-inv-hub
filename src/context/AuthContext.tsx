
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, cleanupAuthState } from '@/integrations/supabase/client';
import { AuthUser, UserRole } from './auth/authTypes';
import { fetchUserData, performLogin, performLogout } from './auth/authUtils';
import { useAuthOperations } from './auth/useAuthOperations';
import { hasPermission as checkPermission } from './auth/rolePermissions';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  originalRole: UserRole | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  setTemporaryRole: (role: UserRole) => void;
  clearTemporaryRole: () => void;
  switchRole: (role: UserRole) => void;
  resetRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalRole, setOriginalRole] = useState<UserRole | null>(null);

  const clearError = () => setError(null);

  const {
    login,
    logout,
    switchRole,
    resetRole,
    setTemporaryRole,
    clearTemporaryRole,
  } = useAuthOperations(user, setUser, setError, setIsLoading, setOriginalRole);

  const hasPermission = (permission: string): boolean => {
    if (!user?.role) return false;
    return checkPermission(user.role, permission);
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (!mounted) return;

        setSession(session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer user data fetching to prevent deadlocks
          setTimeout(async () => {
            if (!mounted) return;
            
            try {
              const { user: userData, error: userError } = await fetchUserData(session.user);
              if (mounted) {
                setUser(userData);
                if (userError) {
                  setError(userError);
                }
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
              if (mounted) {
                setError('Failed to load user profile');
              }
            } finally {
              if (mounted) {
                setIsLoading(false);
              }
            }
          }, 0);
        } else if (event === 'SIGNED_OUT' || !session) {
          if (mounted) {
            setUser(null);
            setOriginalRole(null);
            setIsLoading(false);
          }
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          cleanupAuthState();
        }
        
        if (!mounted) return;

        if (existingSession?.user) {
          setSession(existingSession);
          try {
            const { user: userData, error: userError } = await fetchUserData(existingSession.user);
            if (mounted) {
              setUser(userData);
              if (userError) {
                setError(userError);
              }
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            if (mounted) {
              setError('Failed to load user profile');
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setError('Authentication initialization failed');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user && !!session,
    isLoading,
    error,
    originalRole,
    login,
    logout,
    clearError,
    hasPermission,
    setTemporaryRole,
    clearTemporaryRole,
    switchRole,
    resetRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
