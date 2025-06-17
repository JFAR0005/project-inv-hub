
export const getSupabaseErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred';
  
  // Handle Supabase specific errors
  if (error.code) {
    switch (error.code) {
      case '23505':
        return 'This record already exists';
      case '23503':
        return 'Cannot delete this record as it is referenced by other data';
      case '42501':
        return 'You do not have permission to perform this action';
      case 'PGRST116':
        return 'No data found matching your request';
      default:
        return error.message || 'Database error occurred';
    }
  }
  
  // Handle auth errors
  if (error.message) {
    if (error.message.includes('Invalid login credentials')) {
      return 'Invalid email or password';
    }
    if (error.message.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link';
    }
    if (error.message.includes('User already registered')) {
      return 'An account with this email already exists';
    }
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const getNetworkErrorMessage = (): string => {
  return 'Network error. Please check your internet connection and try again.';
};

export const getGenericErrorMessage = (): string => {
  return 'Something went wrong. Please try again later.';
};
