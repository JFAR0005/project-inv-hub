
-- Create company_files storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'company_files', 'Company Files', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'company_files'
);

-- Create RLS policies for the company_files bucket
CREATE POLICY IF NOT EXISTS "Public Access to company_files"
ON storage.objects
FOR SELECT
TO PUBLIC
USING (bucket_id = 'company_files');

-- Admins can upload files
CREATE POLICY IF NOT EXISTS "Admin users can upload to company_files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company_files' AND
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Founders can only upload to their own company folders
CREATE POLICY IF NOT EXISTS "Founders can upload to their own company files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company_files' AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'founder' 
    AND company_id = (SELECT split_part(name, '/', 1) FROM storage.objects WHERE id = objects.id)
  )
);

-- Partners can upload files to assigned companies
CREATE POLICY IF NOT EXISTS "Partners can upload to company_files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company_files' AND
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'partner')
);

-- Admins can delete files
CREATE POLICY IF NOT EXISTS "Admin users can delete from company_files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'company_files' AND
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Founders can only delete their own company files
CREATE POLICY IF NOT EXISTS "Founders can delete their own company files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'company_files' AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'founder' 
    AND company_id = (SELECT split_part(name, '/', 1) FROM storage.objects WHERE id = objects.id)
  )
);

-- Partners can delete files
CREATE POLICY IF NOT EXISTS "Partners can delete from company_files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'company_files' AND
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'partner')
);
