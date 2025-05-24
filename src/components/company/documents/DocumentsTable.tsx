
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, Eye, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { FileObject } from './types';
import FileIcon from './FileIcon';
import { formatFileSize, getFileExtension } from './utils';

interface DocumentsTableProps {
  files: FileObject[];
  companyId: string;
  canUploadFiles: boolean;
  onDeleteComplete: () => void;
}

const DocumentsTable: React.FC<DocumentsTableProps> = ({ 
  files, 
  companyId, 
  canUploadFiles, 
  onDeleteComplete 
}) => {
  const { toast } = useToast();

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
      
      onDeleteComplete();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete file",
        variant: "destructive"
      });
    }
  };

  const handleView = (file: FileObject) => {
    if (file.url) {
      window.open(file.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No documents found</h3>
        <p>No documents have been uploaded for this company yet.</p>
      </div>
    );
  }

  return (
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
                <FileIcon fileName={file.name} />
                <span className="font-medium">{file.name}</span>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {getFileExtension(file.name).toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatFileSize(file.size || 0)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {file.uploader || 'Unknown'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(file.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleView(file)}
                    title="View file"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDownload(file.name)}
                    title="Download file"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {canUploadFiles && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(file.name)}
                      title="Delete file"
                      className="text-destructive hover:text-destructive"
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
  );
};

export default DocumentsTable;
