
-- Check if companies table exists and create if not
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'companies') THEN
        CREATE TABLE public.companies (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT,
          website TEXT,
          logo_url TEXT,
          stage TEXT,
          sector TEXT,
          location TEXT,
          arr NUMERIC,
          mrr NUMERIC,
          burn_rate NUMERIC,
          runway NUMERIC,
          churn_rate NUMERIC,
          headcount INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Check if notes table exists and create if not
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notes') THEN
        CREATE TABLE public.notes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
          visibility TEXT NOT NULL CHECK (visibility IN ('private', 'team', 'public')),
          tags TEXT[],
          file_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Add missing columns to users table if they don't exist
DO $$ 
BEGIN
    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE public.users ADD COLUMN role TEXT CHECK (role IN ('admin', 'partner', 'capital_team', 'founder'));
    END IF;
    
    -- Add company_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'company_id') THEN
        ALTER TABLE public.users ADD COLUMN company_id UUID;
    END IF;
    
    -- Add team column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'team') THEN
        ALTER TABLE public.users ADD COLUMN team TEXT;
    END IF;
END $$;

-- Enable RLS on users table if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile and admin can view all" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can insert their profile" ON public.users;

DROP POLICY IF EXISTS "Admin and capital team can view all companies" ON public.companies;
DROP POLICY IF EXISTS "Founders can view their own company" ON public.companies;
DROP POLICY IF EXISTS "Admin and partners can manage companies" ON public.companies;

DROP POLICY IF EXISTS "Users can view notes based on visibility" ON public.notes;
DROP POLICY IF EXISTS "Users can create their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;

-- Create security definer function to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile and admin can view all" 
  ON public.users FOR SELECT 
  USING (
    auth.uid() = id OR 
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Users can update their own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert their profile" 
  ON public.users FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- RLS Policies for companies table
CREATE POLICY "Admin and capital team can view all companies" 
  ON public.companies FOR SELECT 
  USING (
    public.get_current_user_role() IN ('admin', 'partner', 'capital_team')
  );

CREATE POLICY "Founders can view their own company" 
  ON public.companies FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'founder' 
      AND company_id = companies.id
    )
  );

CREATE POLICY "Admin and partners can manage companies" 
  ON public.companies FOR ALL 
  USING (
    public.get_current_user_role() IN ('admin', 'partner')
  );

-- RLS Policies for notes table
CREATE POLICY "Users can view notes based on visibility" 
  ON public.notes FOR SELECT 
  USING (
    -- Own notes
    author_id = auth.uid() OR
    -- Public notes
    visibility = 'public' OR
    -- Team notes for team members
    (visibility = 'team' AND EXISTS (
      SELECT 1 FROM public.users u1, public.users u2 
      WHERE u1.id = auth.uid() AND u2.id = author_id AND u1.team = u2.team
    )) OR
    -- Admin can see all
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Users can create their own notes" 
  ON public.notes FOR INSERT 
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update their own notes" 
  ON public.notes FOR UPDATE 
  USING (author_id = auth.uid());

CREATE POLICY "Users can delete their own notes" 
  ON public.notes FOR DELETE 
  USING (author_id = auth.uid());

-- Create function to handle new user signup (if not exists)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'founder')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger to ensure it works
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert demo companies only if they don't exist
INSERT INTO public.companies (name, description, stage, sector, location, arr, mrr, headcount) 
SELECT * FROM (VALUES
  ('TechCorp AI', 'AI-powered customer service platform', 'Series A', 'AI/ML', 'San Francisco', 1200000, 100000, 25),
  ('GreenEnergy Solutions', 'Renewable energy management software', 'Seed', 'CleanTech', 'Austin', 300000, 25000, 12),
  ('HealthTech Innovations', 'Digital health monitoring platform', 'Series B', 'HealthTech', 'Boston', 5000000, 416000, 45),
  ('FinanceFlow', 'B2B payment processing solution', 'Series A', 'FinTech', 'New York', 2400000, 200000, 32)
) AS v(name, description, stage, sector, location, arr, mrr, headcount)
WHERE NOT EXISTS (SELECT 1 FROM public.companies WHERE companies.name = v.name);

-- Create or replace updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at 
  BEFORE UPDATE ON public.companies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;
CREATE TRIGGER update_notes_updated_at 
  BEFORE UPDATE ON public.notes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
