
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unexpected error occurred';
};

export const getNetworkErrorMessage = (error: unknown): string => {
  const message = getErrorMessage(error);
  
  if (message.includes('fetch')) {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  
  if (message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  if (message.includes('CORS')) {
    return 'Cross-origin request blocked. Please contact support.';
  }
  
  return message;
};

export const getSupabaseErrorMessage = (error: unknown): string => {
  const message = getErrorMessage(error);
  
  if (message.includes('JWT')) {
    return 'Session expired. Please log in again.';
  }
  
  if (message.includes('Row Level Security')) {
    return 'Access denied. You may not have permission to view this data.';
  }
  
  if (message.includes('duplicate key')) {
    return 'This item already exists.';
  }
  
  if (message.includes('foreign key')) {
    return 'Unable to complete action due to data relationships.';
  }
  
  return message;
};
