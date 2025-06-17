
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, cleanupAuthState } from '@/integrations/supabase/client';
import { AuthUser } from './auth/authTypes';
import { fetchUserData, performLogin, performLogout } from './auth/authUtils';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
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

  const clearError = () => setError(null);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);
      await performLogin(email, password);
      // The auth state change will handle the rest
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      setIsLoading(true);
      const logoutError = await performLogout();
      if (logoutError) {
        setError(logoutError);
      }
      // Clear state immediately
      setUser(null);
      setSession(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(error.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
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
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
