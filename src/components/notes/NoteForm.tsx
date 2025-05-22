
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, X, Upload, Paperclip } from "lucide-react";

// Form validation schema
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  visibility: z.enum(["internal", "partner", "founder"]),
  companyId: z.string().optional(),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Company {
  id: string;
  name: string;
}

interface NoteFormProps {
  onSuccess: () => void;
  initialData?: {
    id: string;
    title: string;
    content: string;
    visibility: "internal" | "partner" | "founder";
    companyId?: string;
    tags?: string;
  };
}

export function NoteForm({ onSuccess, initialData }: NoteFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      content: "",
      visibility: "internal",
      companyId: "",
      tags: "",
    },
  });

  // Fetch available companies
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!user) return;

      try {
        let query = supabase.from("companies").select("id, name");
        
        // If user is a founder, only show their company
        if (user.role === "founder" && user.companyId) {
          query = query.eq("id", user.companyId);
        }
        
        const { data, error } = await query.order("name");
        
        if (error) throw error;
        setCompanies(data || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
        toast("Error loading companies", {
          description: "Could not load companies. Please try again later.",
        });
      }
    };

    fetchCompanies();
  }, [user]);

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast("Authentication error", {
        description: "You must be logged in to create notes.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse tags from comma-separated string
      const tagsList = values.tags 
        ? values.tags.split(",").map(tag => tag.trim()).filter(Boolean) 
        : [];

      // Prepare note data
      const noteData = {
        title: values.title,
        content: values.content,
        visibility: values.visibility,
        company_id: values.companyId || null,
        author_id: user.id,
        tags: tagsList,
      };

      let result;
      
      // Update or create note
      if (initialData?.id) {
        result = await supabase
          .from("notes")
          .update({ 
            ...noteData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", initialData.id);
      } else {
        result = await supabase
          .from("notes")
          .insert({
            ...noteData,
            created_at: new Date().toISOString(),
          });
      }

      if (result.error) throw result.error;

      // Handle file uploads if there are any
      if (attachments.length > 0) {
        // Implementation for file uploads would go here
        // This would likely use the Supabase storage API
      }

      toast(initialData ? "Note updated" : "Note created", {
        description: initialData 
          ? "Your note has been updated successfully." 
          : "Your note has been created successfully.",
      });

      // Reset form and call success callback
      if (!initialData) {
        form.reset({
          title: "",
          content: "",
          visibility: "internal",
          companyId: "",
          tags: "",
        });
        setAttachments([]);
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error saving note:", error);
      toast("Error saving note", {
        description: "There was a problem saving your note. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="internal">Internal Only</SelectItem>
                    <SelectItem value="partner">Partners & Admins</SelectItem>
                    <SelectItem value="founder">All (Founders, Partners, Admins)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company (Optional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (comma separated)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. important, follow-up, research" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Attachments</FormLabel>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Add File
            </Button>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              multiple
            />
          </div>

          {attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm truncate max-w-xs">{file.name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              setAttachments([]);
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Update Note" : "Create Note"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default NoteForm;
