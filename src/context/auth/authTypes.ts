
import { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'partner' | 'founder' | 'capital_team';

export interface AuthUser extends User {
  role: UserRole;
  name: string;
  companyId?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company_id?: string;
  team?: string;
  is_active: boolean;
  last_seen_at?: string;
  created_at: string;
}
