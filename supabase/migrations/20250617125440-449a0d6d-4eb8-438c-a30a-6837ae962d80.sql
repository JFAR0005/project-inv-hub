
-- Drop existing problematic policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;

-- Create simple, non-recursive policies for users table
CREATE POLICY "Users can view all profiles" 
  ON public.users 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Add missing RLS policies for other tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" 
  ON public.companies 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

ALTER TABLE public.founder_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" 
  ON public.founder_updates 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Enable insert/update for companies based on user role
CREATE POLICY "Enable insert for admin and partner roles" 
  ON public.companies 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'partner', 'capital_team')
    )
  );

CREATE POLICY "Enable update for admin and partner roles" 
  ON public.companies 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'partner', 'capital_team')
    )
  );

-- Enable founder updates policies
CREATE POLICY "Enable insert for founders and admins" 
  ON public.founder_updates 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role IN ('admin', 'partner', 'capital_team') OR id = submitted_by)
    )
  );

CREATE POLICY "Enable update for founders and admins" 
  ON public.founder_updates 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role IN ('admin', 'partner', 'capital_team') OR id = submitted_by)
    )
  );
