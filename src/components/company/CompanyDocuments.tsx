import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Eye, FileText, Upload, AlertCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';

interface CompanyDocumentsProps {
  companyId: string;
}

interface DocumentFile {
  id: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  uploader: {
    name: string;
  } | null;
  size?: number;
}

const CompanyDocuments: React.FC<CompanyDocumentsProps> = ({ companyId }) => {
  const { user } = useAuth();
  const { canEditCompany } = useRoleAccess();
  const { toast } = useToast();
  const canUploadFiles = canEditCompany(companyId);

  // Fetch company files from both metadata table and storage
  const { data: files, isLoading, error, refetch } = useQuery({
    queryKey: ['company-documents', companyId],
    queryFn: async () => {
      console.log('Fetching documents for company:', companyId);
      
      // First get files from metadata table with uploader info
      const { data: metadataFiles, error: metadataError } = await supabase
        .from('company_files')
        .select(`
          id,
          file_name,
          file_url,
          uploaded_at,
          uploader:uploader_id(name)
        `)
        .eq('company_id', companyId)
        .order('uploaded_at', { ascending: false });

      if (metadataError) {
        console.error('Error fetching file metadata:', metadataError);
        throw metadataError;
      }

      // Also try to get files directly from storage as fallback
      const { data: storageFiles, error: storageError } = await supabase.storage
        .from('company_files')
        .list(companyId, {
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (storageError) {
        console.error('Error fetching from storage:', storageError);
      }

      const processedFiles: DocumentFile[] = [];

      // Process metadata files (preferred source)
      if (metadataFiles && metadataFiles.length > 0) {
        for (const file of metadataFiles) {
          // Get public URL for the file
          const { data: publicUrlData } = supabase.storage
            .from('company_files')
            .getPublicUrl(`${companyId}/${file.file_name}`);

          // Handle uploader data safely
          let uploaderData: { name: string; } | null = null;
          if (file.uploader && typeof file.uploader === 'object' && 'name' in file.uploader) {
            uploaderData = { name: file.uploader.name as string };
          }

          processedFiles.push({
            id: file.id,
            file_name: file.file_name || 'Unknown',
            file_url: publicUrlData.publicUrl,
            uploaded_at: file.uploaded_at,
            uploader: uploaderData,
            size: 0,
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
            file_name: file.name,
            file_url: publicUrlData.publicUrl,
            uploaded_at: file.created_at,
            uploader: null,
            size: file.metadata?.size || 0,
          });
        }
      }

      console.log('Processed files:', processedFiles);
      return processedFiles;
    },
    enabled: !!companyId,
  });

  const handleDownload = async (fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('company_files')
        .download(`${companyId}/${fileName}`);
      
      if (error) throw error;
      
      // Create a URL for the file and trigger download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: `Downloading ${fileName}`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download failed",
        description: "Failed to download file",
        variant: "destructive"
      });
    }
  };

  const handleView = (file: DocumentFile) => {
    if (file.file_url) {
      window.open(file.file_url, '_blank', 'noopener,noreferrer');
    }
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Unknown size';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const isViewableFile = (fileName: string) => {
    const ext = getFileExtension(fileName);
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'md'].includes(ext);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load company documents. Please try again.
        </AlertDescription>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-2">
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Company Documents</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Files and resources related to this company
            </p>
          </div>
          
          {canUploadFiles && (
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {files && files.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="font-medium">{file.file_name}</span>
                        {isViewableFile(file.file_name) && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            Viewable
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getFileExtension(file.file_name).toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatFileSize(file.size || 0)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {file.uploader?.name || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(file.uploaded_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {isViewableFile(file.file_name) && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleView(file)}
                            title="View file"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDownload(file.file_name)}
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No documents uploaded</h3>
            <p className="text-muted-foreground mb-4">
              No documents have been uploaded for this company yet.
            </p>
            {canUploadFiles && (
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload First Document
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyDocuments;
