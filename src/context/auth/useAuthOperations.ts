
import { useState } from 'react';
import { UserRole } from './authTypes';
import { AuthUser } from './authTypes';
import { performLogin, performLogout } from './authUtils';

export const useAuthOperations = (
  user: AuthUser | null,
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setOriginalRole: React.Dispatch<React.SetStateAction<UserRole | null>>
) => {
  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    
    try {
      await performLogin(email, password);
    } catch (error: any) {
      setIsLoading(false);
      throw error; // Re-throw to let the component handle the specific error
    }
  };

  const logout = async () => {
    setError(null);
    
    try {
      const errorMessage = await performLogout();
      if (errorMessage) {
        setError(errorMessage);
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

  const switchRole = (role: UserRole) => {
    if (!user) return;
    
    // Store original role if not already stored
    setOriginalRole(prevOriginalRole => {
      if (!prevOriginalRole) {
        return user.role || null;
      }
      return prevOriginalRole;
    });
    
    // Only allow admins and capital_team to switch roles
    if (user.role === 'admin' || user.role === 'capital_team') {
      setUser({ ...user, role });
    }
  };

  const resetRole = () => {
    if (!user) return;
    
    setOriginalRole(prevOriginalRole => {
      if (prevOriginalRole) {
        setUser({ ...user, role: prevOriginalRole });
        return null;
      }
      return prevOriginalRole;
    });
  };

  const setTemporaryRole = (role: UserRole) => {
    switchRole(role);
  };

  const clearTemporaryRole = () => {
    resetRole();
  };

  const clearError = () => {
    setError(null);
  };

  return {
    login,
    logout,
    switchRole,
    resetRole,
    setTemporaryRole,
    clearTemporaryRole,
    clearError,
  };
};
