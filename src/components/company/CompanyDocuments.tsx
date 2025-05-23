
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Upload, Trash2, ExternalLink, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface CompanyDocumentsProps {
  company: any;
  isEditing: boolean;
}

interface CompanyFile {
  id: string;
  company_id: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  uploader_id: string | null;
  uploader_name?: string;
  file_size?: number;
}

const CompanyDocuments: React.FC<CompanyDocumentsProps> = ({ company, isEditing }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<CompanyFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [company.id]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      
      // Fetch files from company_files table
      const { data, error } = await supabase
        .from('company_files')
        .select('*')
        .eq('company_id', company.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      // Get uploader names for each file
      const filesWithUploaderNames = await Promise.all((data || []).map(async (file) => {
        if (file.uploader_id) {
          const { data: userData } = await supabase
            .from('users')
            .select('name, email')
            .eq('id', file.uploader_id)
            .single();
          
          return {
            ...file,
            uploader_name: userData?.name || userData?.email || 'Unknown User'
          };
        }
        return {
          ...file,
          uploader_name: 'Unknown User'
        };
      }));

      setFiles(filesWithUploaderNames);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: "Failed to load company files",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${company.id}/${fileName}`;

    setUploading(true);
    
    try {
      // Upload file to storage bucket
      const { error: uploadError } = await supabase.storage
        .from('company_files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('company_files')
        .getPublicUrl(filePath);

      // Save file metadata to company_files table
      const { error: dbError } = await supabase
        .from('company_files')
        .insert({
          company_id: company.id,
          file_name: file.name,
          file_url: publicUrlData.publicUrl,
          uploader_id: user?.id
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
      
      // Refresh the file list
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset the file input
      e.target.value = '';
    }
  };

  const handleFileDelete = async (fileId: string, filePath: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      // Extract the storage path from the URL
      const urlParts = filePath.split('/');
      const path = urlParts.slice(-2).join('/'); // company_id/filename
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('company_files')
        .remove([path]);

      if (storageError) {
        console.warn('Storage deletion error:', storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('company_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "File deleted successfully",
      });
      
      // Update the file list
      setFiles(files.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const handleViewFile = (fileUrl: string) => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Company Documents
            </CardTitle>
            <CardDescription>Files and documents for {company.name}</CardDescription>
          </div>
          {isEditing && (
            <div className="flex items-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg,.gif"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer" disabled={uploading} asChild>
                  <div>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </div>
                </Button>
              </label>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {files.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map(file => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate max-w-[200px]" title={file.file_name}>
                            {file.file_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {file.uploader_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(file.uploaded_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewFile(file.file_url)}
                            title="View file"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            asChild
                            title="Download file"
                          >
                            <a href={file.file_url} download={file.file_name}>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(file.file_url, '_blank')}
                            title="Open in new tab"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          {isEditing && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleFileDelete(file.id, file.file_url)}
                              title="Delete file"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No documents uploaded</h3>
              <p className="text-sm">
                {isEditing 
                  ? "Upload your first document using the button above." 
                  : "This company hasn't uploaded any documents yet."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyDocuments;
