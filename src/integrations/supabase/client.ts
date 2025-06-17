
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://guikdtwcpagcpyqieftm.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1aWtkdHdjcGFnY3B5cWllZnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTg1MjcsImV4cCI6MjA2MzQ5NDUyN30.SdbUc0LaE4CBuWi-J_-AvdT4RD9E2m7_SRkewfd5s2E"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Cleanup utility to prevent authentication limbo states
export const cleanupAuthState = () => {
  console.log('Cleaning up auth state...');
  
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};
