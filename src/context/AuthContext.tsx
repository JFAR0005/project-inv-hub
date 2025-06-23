
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, cleanupAuthState } from '@/integrations/supabase/client';
import { AuthUser, UserRole } from './auth/authTypes';
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

// Simple user data creation from auth user
const createAuthUserFromSession = (user: User): AuthUser => {
  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || user.email || '',
    role: 'admin' as UserRole, // Default role
    companyId: null,
    avatarUrl: user.user_metadata?.avatar_url,
  };
};

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
          const userData = createAuthUserFromSession(session.user);
          if (mounted) {
            setUser(userData);
            setError(null);
            setIsLoading(false);
          }
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
          const userData = createAuthUserFromSession(existingSession.user);
          if (mounted) {
            setUser(userData);
            setError(null);
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
