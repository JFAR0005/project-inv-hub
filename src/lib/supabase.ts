
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Custom types for database tables
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'admin' | 'partner' | 'founder';
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
    };
  };
};
