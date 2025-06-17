
-- Drop all policies that depend on the function first
DROP POLICY IF EXISTS "Users can view their own profile and admin can view all" ON public.users;
DROP POLICY IF EXISTS "Admin and capital team can view all companies" ON public.companies;
DROP POLICY IF EXISTS "Admin and partners can manage companies" ON public.companies;
DROP POLICY IF EXISTS "Users can view notes based on visibility" ON public.notes;

-- Now we can safely drop the function
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Drop remaining policies
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can insert their profile" ON public.users;
DROP POLICY IF EXISTS "Founders can view their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can create their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;

-- Create simplified, non-recursive RLS policies for users table
CREATE POLICY "Users can view their own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert their profile" 
  ON public.users FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create simplified RLS policies for companies table
CREATE POLICY "All authenticated users can view companies" 
  ON public.companies FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage companies" 
  ON public.companies FOR ALL 
  USING (auth.role() = 'authenticated');

-- Create simplified RLS policies for notes table
CREATE POLICY "Users can view all notes" 
  ON public.notes FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create their own notes" 
  ON public.notes FOR INSERT 
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update their own notes" 
  ON public.notes FOR UPDATE 
  USING (author_id = auth.uid());

CREATE POLICY "Users can delete their own notes" 
  ON public.notes FOR DELETE 
  USING (author_id = auth.uid());
