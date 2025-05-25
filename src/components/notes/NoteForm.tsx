
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Loader2, X } from 'lucide-react';

// Define form validation schema
const formSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  content: z.string().min(1, { message: 'Content is required' }),
  company_id: z.string().optional(),
  visibility: z.string({ required_error: 'Please select a visibility level' }),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Note {
  id: string;
  title: string;
  content: string;
  company_id?: string;
  visibility: 'private' | 'team' | 'public';
  author_id: string;
  created_at: string;
  updated_at: string;
}

interface NoteFormProps {
  note?: Note | null;
  companies?: Array<{ id: string; name: string }>;
  onClose?: () => void;
  onSuccess?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
}

const NoteForm: React.FC<NoteFormProps> = ({ 
  note, 
  companies = [], 
  onClose, 
  onSuccess, 
  onSave, 
  onCancel 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Setup form with default values, using note data if editing
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: note?.title || '',
      content: note?.content || '',
      company_id: note?.company_id || undefined,
      visibility: note?.visibility || 'private',
      tags: '',
    },
  });

  // Reset form when note changes
  useEffect(() => {
    if (note) {
      form.reset({
        title: note.title,
        content: note.content,
        company_id: note.company_id || undefined,
        visibility: note.visibility,
        tags: '',
      });
    }
  }, [note, form]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  // Clear selected file
  const clearSelectedFile = () => {
    setSelectedFile(null);
    // Also clear the file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Form submission handler - updated to handle both create and update
  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create notes.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let fileUrl = null;
      
      // Upload file if selected
      if (selectedFile && values.company_id) {
        setIsUploading(true);
        const fileName = `${Date.now()}_${selectedFile.name}`;
        const filePath = `${values.company_id}/notes/${fileName}`;
        
        const { data: fileData, error: fileError } = await supabase
          .storage
          .from('company_files')
          .upload(filePath, selectedFile);
          
        if (fileError) throw fileError;
        
        fileUrl = supabase
          .storage
          .from('company_files')
          .getPublicUrl(filePath).data.publicUrl;
          
        setIsUploading(false);
      }
      
      // Process tags
      const tagsList = values.tags 
        ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [];
      
      const noteData = {
        title: values.title,
        content: values.content,
        company_id: values.company_id || null,
        author_id: user.id,
        visibility: values.visibility,
        file_url: fileUrl,
        tags: tagsList.length > 0 ? tagsList : null,
      };

      if (note?.id) {
        // Update existing note
        const { error } = await supabase
          .from('notes')
          .update(noteData)
          .eq('id', note.id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Note updated successfully.",
        });
      } else {
        // Insert new note
        const { data, error } = await supabase
          .from('notes')
          .insert([noteData]);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Note created successfully.",
        });
      }
      
      // Reset form
      form.reset();
      setSelectedFile(null);
      
      // Call appropriate callback
      if (onClose) onClose();
      if (onSave) onSave();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "Error",
        description: `Failed to ${note ? 'update' : 'create'} note. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (onClose) onClose();
    if (onCancel) onCancel();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {note ? 'Edit Note' : 'Create Note'}
          </h1>
          <p className="text-muted-foreground">
            {note ? 'Update your note details' : 'Add a new note to your collection'}
          </p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Note title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="company_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related Company</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No company</SelectItem>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Optionally associate this note with a company
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Write your note here..."
                    className="min-h-[200px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input placeholder="Enter tags separated by commas" {...field} />
                </FormControl>
                <FormDescription>
                  Optional. Add tags to help organize your notes (e.g., meeting, funding, product)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="private">Private (Only you)</SelectItem>
                    <SelectItem value="team">Team (Partners & Admins)</SelectItem>
                    <SelectItem value="public">Public (All users)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Controls who can view this note
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-2">
            <FormLabel htmlFor="file-upload">Attachment</FormLabel>
            <div className="flex items-center space-x-2">
              <Input 
                id="file-upload"
                type="file" 
                onChange={handleFileChange}
                className={selectedFile ? "rounded-r-none" : ""}
              />
              {selectedFile && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="h-10 rounded-l-none"
                  onClick={clearSelectedFile}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear file</span>
                </Button>
              )}
            </div>
            <FormDescription>
              Optional. Upload a file to attach to this note.
            </FormDescription>
            {selectedFile && (
              <div className="flex items-center space-x-1 p-2 bg-blue-50 text-blue-700 rounded border border-blue-200">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{selectedFile.name}</span>
                <span className="text-xs text-blue-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
            {isUploading && (
              <div className="flex items-center space-x-2 text-amber-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Uploading file...</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {note ? 'Updating...' : 'Creating...'}
                </>
              ) : (note ? 'Update Note' : 'Create Note')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NoteForm;
