
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

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
};

const CompanyDocuments: React.FC<CompanyDocumentsProps> = ({ companyId }) => {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

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
          
          return {
            ...file,
            url: fileData.publicUrl
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

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Documents Found</h3>
          <p className="text-muted-foreground mb-4">
            There are no documents uploaded for this company yet.
          </p>
          {(user?.role === 'admin' || user?.companyId === companyId) && (
            <Button variant="outline">Upload Document</Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">Company Documents</h3>
        {(user?.role === 'admin' || user?.companyId === companyId) && (
          <Button size="sm" variant="outline">Upload New</Button>
        )}
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell className="flex items-center">
                {getFileIcon(file.name)}
                <span className="ml-2">{file.name}</span>
              </TableCell>
              <TableCell>{file.metadata?.mimetype || 'Unknown'}</TableCell>
              <TableCell>{formatFileSize(file.metadata?.size || 0)}</TableCell>
              <TableCell>{format(new Date(file.created_at), 'MMM d, yyyy')}</TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDownload(file.name)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompanyDocuments;
