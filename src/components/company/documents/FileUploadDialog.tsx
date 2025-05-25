
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, FileText, X } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);
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
      
      // Check for allowed file types
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "File type not allowed",
          description: "Please upload PDF, Word, Excel, or image files only",
          variant: "destructive"
        });
        return;
      }
      
      setUploadingFile(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      
      setUploadProgress(75);
      
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
      
      setUploadProgress(100);
      
      toast({
        title: "File uploaded",
        description: `${uploadingFile.name} has been uploaded successfully`
      });
      
      setUploadingFile(null);
      setIsOpen(false);
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
      setUploadProgress(0);
    }
  };

  const clearFile = () => {
    setUploadingFile(null);
    setUploadProgress(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex gap-2">
          <UploadCloud className="h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
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
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, Word, Excel, Images, Text
            </p>
          </div>
          
          {uploadingFile && (
            <div className="border rounded-lg p-3 bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">{uploadingFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(uploadingFile.size)}
                    </p>
                  </div>
                </div>
                {!isUploading && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={clearFile}
                    className="h-6 w-6"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={handleFileUpload}
              disabled={!uploadingFile || isUploading}
              className="flex-1"
            >
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadDialog;
