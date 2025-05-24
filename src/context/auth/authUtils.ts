
import { User } from '@supabase/supabase-js';
import { supabase, cleanupAuthState } from '@/integrations/supabase/client';
import { AuthUser, UserRole } from './authTypes';

export const fetchUserData = async (authUser: User): Promise<{
  user: AuthUser;
  error: string | null;
}> => {
  try {
    console.log('Fetching user data for:', authUser.email);
    
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user data:', error);
      return {
        user: {
          ...authUser,
          role: undefined,
          name: undefined,
          companyId: undefined
        } as AuthUser,
        error: 'Failed to load user profile. Please try refreshing the page.'
      };
    }

    if (!userData) {
      console.log('User not found in users table, creating profile...');
      
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          role: 'founder'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        return {
          user: {
            ...authUser,
            role: 'founder' as UserRole,
            name: authUser.email?.split('@')[0],
            companyId: undefined
          } as AuthUser,
          error: 'Failed to create user profile. Please try refreshing the page.'
        };
      }

      console.log('User profile created successfully:', newUser);
      return {
        user: {
          ...authUser,
          role: newUser.role as UserRole,
          name: newUser.name,
          companyId: newUser.company_id
        } as AuthUser,
        error: null
      };
    } else {
      console.log('User data fetched successfully:', userData);
      return {
        user: {
          ...authUser,
          role: userData.role as UserRole,
          name: userData.name,
          companyId: userData.company_id
        } as AuthUser,
        error: null
      };
    }
  } catch (error) {
    console.error('Error in fetchUserData:', error);
    return {
      user: {
        ...authUser,
        role: undefined,
        name: undefined,
        companyId: undefined
      } as AuthUser,
      error: 'An unexpected error occurred while loading your profile.'
    };
  }
};

export const performLogin = async (email: string, password: string): Promise<void> => {
  console.log('Attempting login for:', email);
  
  // Clean up any existing auth state first
  try {
    cleanupAuthState();
    await supabase.auth.signOut();
  } catch (error) {
    // Ignore sign out errors during login
    console.log('Previous session cleanup:', error);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login error:', error);
    throw error;
  }

  console.log('Login successful:', data.user?.email);
};

export const performLogout = async (): Promise<string | null> => {
  try {
    console.log('Performing logout...');
    cleanupAuthState();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      return 'Failed to log out completely. Please clear your browser cache.';
    }
    console.log('Logout successful');
    return null;
  } catch (error) {
    console.error('Logout error:', error);
    return 'An error occurred while logging out.';
  }
};
