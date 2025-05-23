
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Use the constants from the Supabase client file
const supabaseUrl = "https://guikdtwcpagcpyqieftm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1aWtkdHdjcGFnY3B5cWllZnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTg1MjcsImV4cCI6MjA2MzQ5NDUyN30.SdbUc0LaE4CBuWi-J_-AvdT4RD9E2m7_SRkewfd5s2E";

// Initialize Supabase client with typed Database
export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// Helper function to get proper public URL for storage files
export const getStoragePublicUrl = (bucket: string, path: string) => {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
};

// Custom types for database tables are now imported from @/integrations/supabase/types
