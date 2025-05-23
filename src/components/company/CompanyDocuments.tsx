
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Download, Upload, Trash2, ExternalLink } from 'lucide-react';
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
      const { data, error } = await supabase
        .from('company_files')
        .select('*')
        .eq('company_id', company.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      // Get uploader names
      const filesWithUploaderNames = await Promise.all((data || []).map(async (file) => {
        if (file.uploader_id) {
          const { data: userData } = await supabase
            .from('users')
            .select('name')
            .eq('id', file.uploader_id)
            .single();
          
          return {
            ...file,
            uploader_name: userData?.name || 'Unknown User'
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
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${company.id}/${fileName}`;

    setUploading(true);
    
    try {
      // Upload file to storage
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
    try {
      // Extract the path from the URL
      const path = filePath.split('/').slice(-2).join('/');
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('company_files')
        .remove([path]);

      if (storageError) throw storageError;

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
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
            <CardTitle>Company Documents</CardTitle>
            <CardDescription>Files and documents related to {company.name}</CardDescription>
          </div>
          {isEditing && (
            <div className="flex items-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
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
            <div className="space-y-4">
              {files.map(file => (
                <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="h-8 w-8 text-primary/70" />
                    <div className="overflow-hidden">
                      <h4 className="font-medium text-sm truncate">{file.file_name}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Uploaded: {format(new Date(file.uploaded_at), 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span>By: {file.uploader_name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={file.file_url} download={file.file_name}>
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </a>
                    </Button>
                    {isEditing && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleFileDelete(file.id, file.file_url)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No documents yet</h3>
              <p>
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
