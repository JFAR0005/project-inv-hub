import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, FileText, AlertCircle, RefreshCw, Trash2, Eye, UploadCloud } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CompanyDocumentsProps {
  companyId: string;
}

type FileObject = {
  name: string;
  id: string;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
  url?: string;
  size?: number;
  uploader?: string;
};

const CompanyDocuments: React.FC<CompanyDocumentsProps> = ({ companyId }) => {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const { canEditCompany } = useRoleAccess();
  const { toast } = useToast();
  const canUploadFiles = canEditCompany(companyId);

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
          
          // Fix: More explicit null checking for uploader data
          if (!metaError && metaData) {
            const uploader = metaData.uploader;
            if (uploader && uploader !== null && typeof uploader === 'object' && 'name' in uploader) {
              uploaderName = (uploader.name as string) || 'Unknown';
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive"
        });
        return;
      }
      setUploadingFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadingFile || !companyId || !user) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Upload file to storage
      const filePath = `${companyId}/${uploadingFile.name}`;
      
      const { data, error } = await supabase.storage
        .from('company_files')
        .upload(filePath, uploadingFile, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (error) throw error;
      
      // Get the public URL
      const { data: urlData } = await supabase.storage
        .from('company_files')
        .getPublicUrl(filePath);
      
      // Store metadata in company_files table
      const { error: metaError } = await supabase
        .from('company_files')
        .insert({
          company_id: companyId,
          file_name: uploadingFile.name,
          file_url: urlData.publicUrl,
          uploader_id: user.id
        });
      
      if (metaError) throw metaError;
      
      toast({
        title: "File uploaded",
        description: "File has been uploaded successfully"
      });
      
      setUploadingFile(null);
      fetchCompanyFiles();
    } catch (err) {
      console.error('Error uploading file:', err);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

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
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download failed",
        description: "Failed to download file",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!canUploadFiles) return;
    
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('company_files')
        .remove([`${companyId}/${fileName}`]);
      
      if (storageError) throw storageError;
      
      // Delete from metadata table
      const { error: dbError } = await supabase
        .from('company_files')
        .delete()
        .eq('company_id', companyId)
        .eq('file_name', fileName);
      
      if (dbError) throw dbError;
      
      toast({
        title: "File deleted",
        description: "File has been deleted successfully"
      });
      
      fetchCompanyFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete file",
        variant: "destructive"
      });
    }
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

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch(extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  if (loading) {
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
        <AlertDescription>{error}</AlertDescription>
        <Button variant="outline" size="sm" onClick={fetchCompanyFiles} className="ml-2">
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Company Documents</h3>
        
        {canUploadFiles && (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="flex gap-2">
                <UploadCloud className="h-4 w-4" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Select file (max 10MB)</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                  />
                </div>
                
                {isUploading && (
                  <div className="space-y-2">
                    <p className="text-sm text-center">Uploading...</p>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                
                <Button 
                  onClick={handleFileUpload}
                  disabled={!uploadingFile || isUploading}
                  className="w-full"
                >
                  Upload
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {files.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Documents Found</h3>
            <p className="text-muted-foreground mb-4">
              There are no documents uploaded for this company yet.
            </p>
          </CardContent>
        </Card>
      ) : (
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
                  {getFileIcon(file.name)}
                  <span>{file.name}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getFileExtension(file.name).toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>{formatFileSize(file.size || 0)}</TableCell>
                <TableCell>{file.uploader || 'Unknown'}</TableCell>
                <TableCell>{format(new Date(file.created_at), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {file.url && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDownload(file.name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {canUploadFiles && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(file.name)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default CompanyDocuments;
