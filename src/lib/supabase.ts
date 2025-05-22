
import { createClient } from '@supabase/supabase-js';

// Use the constants from the Supabase client file
const supabaseUrl = "https://guikdtwcpagcpyqieftm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1aWtkdHdjcGFnY3B5cWllZnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTg1MjcsImV4cCI6MjA2MzQ5NDUyN30.SdbUc0LaE4CBuWi-J_-AvdT4RD9E2m7_SRkewfd5s2E";

// Initialize Supabase client
export const supabase = createClient(
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

// Custom types for database tables
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'partner' | 'founder' | 'lp';
          team?: string;
          company_id?: string;
          created_at: string;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          logo_url?: string;
          website?: string;
          stage: string;
          location?: string;
          description?: string;
          sector?: string;
          arr?: number;
          mrr?: number;
          burn_rate?: number;
          runway?: number;
          churn_rate?: number;
          headcount?: number;
          created_at: string;
          updated_at: string;
        };
      };
      deals: {
        Row: {
          id: string;
          company_id: string;
          stage: 'Discovery' | 'DD' | 'IC' | 'Funded' | 'Rejected';
          status: string;
          source?: string;
          valuation_expectation?: number;
          lead_partner?: string;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
      };
      founder_updates: {
        Row: {
          id: string;
          company_id: string;
          submitted_by: string;
          arr: number | null;
          mrr: number | null;
          burn_rate: number | null;
          runway: number | null;
          headcount: number | null;
          churn: number | null;
          raise_status: string | null;
          raise_target_amount: number | null;
          requested_intros: string | null;
          comments: string | null;
          deck_url: string | null;
          submitted_at: string;
        };
      };
      metrics: {
        Row: {
          id: string;
          company_id: string;
          metric_name: string;
          value: number;
          date: string;
        };
      };
      company_files: {
        Row: {
          id: string;
          company_id: string;
          uploader_id: string;
          file_name: string;
          file_url: string;
          uploaded_at: string;
        };
      };
    };
  };
};
