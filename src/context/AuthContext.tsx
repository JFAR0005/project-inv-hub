
import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'partner' | 'founder';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team?: string; // For admin role, could be 'People & Culture', 'Partners', etc.
  companyId?: string; // For founders
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@blacknova.vc',
    role: 'admin',
    team: 'Partners',
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
    companyId: '101',
  },
];

// Permission mapping
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
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
  ],
  partner: [
    'view:portfolio:limited',
    'create:notes',
    'view:notes:shared',
    'book:meetings',
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
      // In a real app, this would be an API call
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

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role].includes(permission);
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
