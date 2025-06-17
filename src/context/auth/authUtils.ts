
import { User } from '@supabase/supabase-js';
import { supabase, cleanupAuthState } from '@/integrations/supabase/client';
import { AuthUser, UserRole } from './authTypes';

export const fetchUserData = async (authUser: User): Promise<{
  user: AuthUser;
  error: string | null;
}> => {
  try {
    console.log('Fetching user data for:', authUser.email);
    
    // For demo purposes, map email to role
    let role: UserRole = 'founder'; // default role
    let name = authUser.email?.split('@')[0] || 'User';
    
    if (authUser.email === 'admin@blacknova.vc') {
      role = 'admin';
      name = 'Admin User';
    } else if (authUser.email === 'capital@blacknova.vc') {
      role = 'capital_team';
      name = 'Capital Team Member';
    } else if (authUser.email === 'partner@blacknova.vc') {
      role = 'partner';
      name = 'Partner';
    } else if (authUser.email === 'founder@blacknova.vc') {
      role = 'founder';
      name = 'Founder';
    }

    // Try to fetch from users table first
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user data:', error);
      return {
        user: {
          ...authUser,
          role,
          name,
          companyId: undefined
        } as AuthUser,
        error: 'Failed to load user profile. Using demo data.'
      };
    }

    if (!userData) {
      // Create user profile if it doesn't exist
      try {
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            name: name,
            role: role
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating user profile:', insertError);
        } else {
          console.log('User profile created successfully:', newUser);
        }
      } catch (insertError) {
        console.error('Failed to create user profile:', insertError);
      }
    }

    return {
      user: {
        ...authUser,
        role: userData?.role as UserRole || role,
        name: userData?.name || name,
        companyId: userData?.company_id
      } as AuthUser,
      error: null
    };
  } catch (error) {
    console.error('Error in fetchUserData:', error);
    return {
      user: {
        ...authUser,
        role: 'founder' as UserRole,
        name: authUser.email?.split('@')[0] || 'User',
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
