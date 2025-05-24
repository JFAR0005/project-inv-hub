
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { UploadCloud } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FileUploadDialogProps {
  companyId: string;
  onUploadComplete: () => void;
}

const FileUploadDialog: React.FC<FileUploadDialogProps> = ({ companyId, onUploadComplete }) => {
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

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
      onUploadComplete();
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

  return (
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
  );
};

export default FileUploadDialog;
