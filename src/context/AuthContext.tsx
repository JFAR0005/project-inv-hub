
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define user roles as per specification
export type UserRole = 'admin' | 'partner' | 'founder';

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
  | 'view:team';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
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
  ],
  partner: [
    'view:portfolio:limited',
    'create:notes',
    'view:notes:shared',
    'book:meetings',
    'view:team',
  ],
  founder: [
    'view:own:company',
    'edit:own:company',
    'book:meetings',
    'view:notes:founder',
    'view:team',
  ],
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('blacknova_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user data', error);
        localStorage.removeItem('blacknova_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // In a real app with Supabase, this would use Supabase auth
      // For demo we'll use mock data
      const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser || password !== 'demo') {
        throw new Error('Invalid credentials');
      }
      
      setUser(foundUser);
      localStorage.setItem('blacknova_user', JSON.stringify(foundUser));
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('blacknova_user');
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
