
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser, UserRole } from './authTypes';

export const fetchUserData = async (authUser: User): Promise<{
  user: AuthUser;
  error: string | null;
}> => {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error) {
      console.error('Error fetching user data:', error);
      
      // If user doesn't exist in users table, it should be created by the trigger
      // But let's handle the case where it might not exist yet
      if (error.code === 'PGRST116') {
        // Try to create the user profile if it doesn't exist
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            name: authUser.email?.split('@')[0] || 'User',
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
    } else {
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
  // Clean up any existing auth state first
  try {
    await supabase.auth.signOut();
  } catch (error) {
    // Ignore sign out errors
    console.log('Previous session cleanup:', error);
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }
};

export const performLogout = async (): Promise<string | null> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      return 'Failed to log out completely. Please clear your browser cache.';
    }
    return null;
  } catch (error) {
    console.error('Logout error:', error);
    return 'An error occurred while logging out.';
  }
};
