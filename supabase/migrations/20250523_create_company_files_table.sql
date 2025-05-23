
-- Create the company_files table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.company_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploader_id UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS to company_files table
ALTER TABLE public.company_files ENABLE ROW LEVEL SECURITY;

-- Admins can view all files
CREATE POLICY IF NOT EXISTS "Admins can view all company files"
ON public.company_files
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Partners can view files
CREATE POLICY IF NOT EXISTS "Partners can view company files"
ON public.company_files
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'partner')
);

-- Founders can only view their own company's files
CREATE POLICY IF NOT EXISTS "Founders can view their own company files"
ON public.company_files
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'founder' 
    AND company_id = company_files.company_id
  )
);

-- Admins can insert files
CREATE POLICY IF NOT EXISTS "Admins can insert company files"
ON public.company_files
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Partners can insert files
CREATE POLICY IF NOT EXISTS "Partners can insert company files"
ON public.company_files
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'partner')
);

-- Founders can only insert files for their own company
CREATE POLICY IF NOT EXISTS "Founders can insert their own company files"
ON public.company_files
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'founder' 
    AND company_id = company_files.company_id
  )
);

-- Admins can delete files
CREATE POLICY IF NOT EXISTS "Admins can delete company files"
ON public.company_files
FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Partners can delete files
CREATE POLICY IF NOT EXISTS "Partners can delete company files"
ON public.company_files
FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'partner')
);

-- Founders can only delete files for their own company
CREATE POLICY IF NOT EXISTS "Founders can delete their own company files"
ON public.company_files
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'founder' 
    AND company_id = company_files.company_id
  )
);
