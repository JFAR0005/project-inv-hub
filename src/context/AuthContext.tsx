import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, cleanupAuthState } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Define user roles as per specification
export type UserRole = 'admin' | 'partner' | 'founder' | 'lp' | 'capital_team';

// Extend user interface to include company_id for founders
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team?: string; // For admin role, could be 'People & Culture', 'Partners', etc.
  companyId?: string; // For founders to link to their company
}

// Define permissions for the CRM system
type Permission = 
  | 'view:all'
  | 'edit:all'
  | 'delete:all'
  | 'create:notes'
  | 'edit:notes'
  | 'delete:notes'
  | 'view:sensitive'
  | 'manage:users'
  | 'vote:investments'
  | 'view:portfolio:limited'
  | 'view:notes:shared'
  | 'book:meetings'
  | 'view:own:company'
  | 'edit:own:company'
  | 'view:notes:founder'
  | 'view:team'
  | 'submit:updates'
  | 'view:portfolio';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  originalRole: UserRole | null;
  setTemporaryRole: (role: UserRole) => void;
  clearTemporaryRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo - aligned with Black Nova roles
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@blacknova.vc',
    role: 'admin',
    team: 'Investment Committee',
  },
  {
    id: '2',
    name: 'Venture Partner',
    email: 'partner@example.com',
    role: 'partner',
  },
  {
    id: '3',
    name: 'Founder User',
    email: 'founder@startup.com',
    role: 'founder',
    companyId: '101', // Links to their company
  },
  {
    id: '4',
    name: 'Limited Partner',
    email: 'lp@example.com',
    role: 'lp',
  },
];

// Permission mapping based on Black Nova roles
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'view:all',
    'edit:all',
    'delete:all',
    'create:notes',
    'edit:notes',
    'delete:notes',
    'view:sensitive',
    'manage:users',
    'vote:investments',
    'book:meetings',
    'view:team',
    'view:portfolio',
  ],
  partner: [
    'view:portfolio:limited',
    'create:notes',
    'view:notes:shared',
    'book:meetings',
    'view:team',
    'view:portfolio',
  ],
  founder: [
    'view:own:company',
    'edit:own:company',
    'book:meetings',
    'view:notes:founder',
    'view:team',
    'submit:updates',
  ],
  lp: [
    'view:portfolio',
    'view:portfolio:limited',
    'view:notes:shared',
  ],
  capital_team: [
    'view:all',
    'edit:all',
    'delete:all',
    'create:notes',
    'edit:notes',
    'delete:notes',
    'view:sensitive',
    'manage:users',
    'vote:investments',
    'book:meetings',
    'view:team',
    'view:portfolio',
  ],
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [originalRole, setOriginalRole] = useState<UserRole | null>(null);
  const { toast } = useToast();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth session:', error);
          return;
        }

        if (data.session) {
          // Fetch user data from our users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (userError) {
            console.error('Error fetching user data:', userError);
            return;
          }

          if (userData) {
            setUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role as UserRole, // Cast to UserRole type
              team: userData.team,
              companyId: userData.company_id,
            });
          }
        } else {
          // For development, if no Supabase session exists, check localStorage
          const storedUser = localStorage.getItem('blacknova_user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              // Ensure role is a valid UserRole
              if (parsedUser && typeof parsedUser.role === 'string') {
                parsedUser.role = parsedUser.role as UserRole;
              }
              setUser(parsedUser);
            } catch (error) {
              console.error('Failed to parse stored user data', error);
              localStorage.removeItem('blacknova_user');
            }
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Set temporary role for admin users
  const setTemporaryRole = (role: UserRole) => {
    if (!user || user.role !== 'admin') return;
    
    // Store the original role if this is the first role change
    if (!originalRole) {
      setOriginalRole(user.role);
    }
    
    // Create a new user object with the temporary role
    const tempUser: User = {
      ...user,
      role: role,
    };
    
    setUser(tempUser);
  };
  
  // Reset back to original role
  const clearTemporaryRole = () => {
    if (!originalRole || !user) return;
    
    const resetUser: User = {
      ...user,
      role: originalRole as UserRole,
    };
    
    setUser(resetUser);
    setOriginalRole(null);
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Clean up auth state first to prevent issues
      cleanupAuthState();
      
      // Try to authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Fetch user details from our custom users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError) {
          // If we can't find the user in our table, fallback to mock data for demo
          console.warn('Falling back to mock data');
          const mockUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
          
          if (!mockUser || password !== 'demo') {
            throw new Error('Invalid credentials');
          }
          
          setUser(mockUser);
          localStorage.setItem('blacknova_user', JSON.stringify(mockUser));
          return;
        }

        // Convert from DB schema to our User type
        const authUser: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role as UserRole, // Cast to UserRole type
          team: userData.team,
          companyId: userData.company_id,
        };

        setUser(authUser);
      }
    } catch (error) {
      console.error('Login failed', error);
      
      // For demo, fall back to mock users if Supabase fails
      const mockUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!mockUser || password !== 'demo') {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. For demo, use the sample accounts with password 'demo'.",
          variant: "destructive",
        });
        throw new Error('Invalid credentials');
      }
      
      setUser(mockUser);
      localStorage.setItem('blacknova_user', JSON.stringify(mockUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      // Clear local state
      setUser(null);
      localStorage.removeItem('blacknova_user');
      
      // Force page reload for a clean state
      window.location.href = '/login';
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role].includes(permission as any);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasPermission,
    originalRole,
    setTemporaryRole,
    clearTemporaryRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
