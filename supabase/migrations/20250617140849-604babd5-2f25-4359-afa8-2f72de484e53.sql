
-- Fix infinite recursion in users table policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.notes;
DROP POLICY IF EXISTS "Users can create their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;
DROP POLICY IF EXISTS "Enable read access for meetings" ON public.meetings;
DROP POLICY IF EXISTS "Enable read access for comments" ON public.comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;

-- Create a security definer function to get current user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create safe RLS policies for users table
CREATE POLICY "Users can view all profiles" 
  ON public.users 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Add RLS policies for other critical tables
CREATE POLICY "Enable read access for authenticated users" 
  ON public.notes 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create their own notes" 
  ON public.notes 
  FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own notes" 
  ON public.notes 
  FOR UPDATE 
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own notes" 
  ON public.notes 
  FOR DELETE 
  USING (auth.uid() = author_id);

CREATE POLICY "Enable read access for meetings" 
  ON public.meetings 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for comments" 
  ON public.comments 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create comments" 
  ON public.comments 
  FOR INSERT 
  WITH CHECK (auth.uid() = author_id);
