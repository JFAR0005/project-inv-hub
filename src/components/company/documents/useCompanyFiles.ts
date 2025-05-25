
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FileObject } from './types';

export const useCompanyFiles = (companyId: string) => {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First, get files from the metadata table with uploader information
      const { data: metadataFiles, error: metadataError } = await supabase
        .from('company_files')
        .select(`
          *,
          uploader:uploader_id(name)
        `)
        .eq('company_id', companyId)
        .order('uploaded_at', { ascending: false });
      
      if (metadataError) {
        console.error('Error fetching metadata:', metadataError);
      }
      
      // Also list files directly from storage as backup
      const { data: storageFiles, error: storageError } = await supabase.storage
        .from('company_files')
        .list(companyId, {
          sortBy: { column: 'created_at', order: 'desc' }
        });
      
      if (storageError) {
        console.error('Error fetching from storage:', storageError);
      }
      
      const processedFiles: FileObject[] = [];
      
      // Process metadata files first (preferred source)
      if (metadataFiles && metadataFiles.length > 0) {
        for (const file of metadataFiles) {
          const { data: publicUrlData } = supabase.storage
            .from('company_files')
            .getPublicUrl(`${companyId}/${file.file_name}`);
          
          let uploaderName = 'Unknown';
          
          // Handle uploader name extraction with proper null safety
          const uploader = file.uploader;
          if (uploader !== null && 
              typeof uploader === 'object' && 
              'name' in uploader && 
              uploader.name &&
              typeof uploader.name === 'string' && 
              uploader.name.trim()) {
            uploaderName = uploader.name;
          }
          
          processedFiles.push({
            id: file.id,
            name: file.file_name || 'Unknown',
            created_at: file.uploaded_at,
            updated_at: file.uploaded_at,
            last_accessed_at: file.uploaded_at,
            metadata: {},
            url: publicUrlData.publicUrl,
            size: 0, // Will be updated if available from storage
            uploader: uploaderName,
          });
        }
      } else if (storageFiles && storageFiles.length > 0) {
        // Fallback to storage files if no metadata
        for (const file of storageFiles) {
          const { data: publicUrlData } = supabase.storage
            .from('company_files')
            .getPublicUrl(`${companyId}/${file.name}`);
          
          processedFiles.push({
            id: file.id || file.name,
            name: file.name,
            created_at: file.created_at,
            updated_at: file.updated_at,
            last_accessed_at: file.last_accessed_at,
            metadata: file.metadata || {},
            url: publicUrlData.publicUrl,
            size: file.metadata?.size || 0,
            uploader: 'Unknown',
          });
        }
      }
      
      setFiles(processedFiles);
    } catch (err) {
      console.error('Error fetching company files:', err);
      setError('Failed to load company documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchCompanyFiles();
    }
  }, [companyId]);

  return {
    files,
    loading,
    error,
    refetch: fetchCompanyFiles
  };
};
