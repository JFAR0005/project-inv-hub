
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FileObject } from './types';

export const useCompanyFiles = (companyId: string) => {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // List all files in the company's folder
      const { data, error } = await supabase.storage
        .from('company_files')
        .list(`${companyId}`);
      
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        setFiles([]);
        return;
      }
      
      // Get more detailed info for each file including metadata
      const filesWithMetadata = await Promise.all(
        data.map(async (file) => {
          const { data: fileData } = await supabase.storage
            .from('company_files')
            .getPublicUrl(`${companyId}/${file.name}`);
          
          // Get file metadata from company_files table if available
          const { data: metaData, error: metaError } = await supabase
            .from('company_files')
            .select('*, uploader:uploader_id(*)')
            .eq('company_id', companyId)
            .eq('file_name', file.name)
            .single();
          
          let uploaderName = 'Unknown';
          
          // Check metadata and extract uploader name with comprehensive null checking
          if (!metaError && metaData?.uploader) {
            const uploader = metaData.uploader;
            // Check if uploader is not null and is an object with name property
            if (uploader !== null && typeof uploader === 'object' && 'name' in uploader) {
              const uploaderObj = uploader as Record<string, unknown>;
              const name = uploaderObj.name;
              if (typeof name === 'string' && name.trim()) {
                uploaderName = name.trim();
              }
            }
          }
          
          return {
            ...file,
            url: fileData.publicUrl,
            size: file.metadata?.size || 0,
            uploader: uploaderName,
          };
        })
      );
      
      setFiles(filesWithMetadata);
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
