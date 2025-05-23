
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Form schema with validation
const formSchema = z.object({
  arr: z.coerce.number().min(0, { message: 'ARR must be a positive number' }).optional(),
  mrr: z.coerce.number().min(0, { message: 'MRR must be a positive number' }).optional(),
  burn_rate: z.coerce.number().min(0, { message: 'Burn rate must be a positive number' }).optional(),
  runway: z.coerce.number().min(0, { message: 'Runway must be a positive number' }).optional(),
  headcount: z.coerce.number().int().min(0, { message: 'Headcount must be a positive integer' }).optional(),
  churn: z.coerce.number().min(0, { message: 'Churn rate must be a positive number' }).max(100, { message: 'Churn rate cannot exceed 100%' }).optional(),
  raise_status: z.enum(['Not Raising', 'Planning', 'Raising', 'Closed']),
  raise_target_amount: z.coerce.number().min(0, { message: 'Target amount must be a positive number' }).optional(),
  requested_intros: z.string().optional(),
  comments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const SubmitUpdate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Check if this founder has submitted an update this month
  const checkRecentSubmission = async () => {
    if (!user?.companyId) return false;
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('founder_updates')
      .select('*')
      .eq('company_id', user.companyId)
      .gte('submitted_at', startOfMonth.toISOString())
      .maybeSingle();
    
    if (error) {
      console.error('Error checking recent submissions:', error);
      return false;
    }
    
    return !!data;
  };

  // Form initialization
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      arr: undefined,
      mrr: undefined,
      burn_rate: undefined,
      runway: undefined,
      headcount: undefined,
      churn: undefined,
      raise_status: 'Not Raising',
      raise_target_amount: undefined,
      requested_intros: '',
      comments: '',
    },
  });

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    if (!user || !user.companyId) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in as a founder with a company to submit updates.",
        variant: "destructive",
      });
      return;
    }

    // Check for recent submission
    const hasRecentSubmission = await checkRecentSubmission();
    if (hasRecentSubmission) {
      toast({
        title: "Submission Limit Reached",
        description: "You've already submitted an update this month. Only one update per month is allowed.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    let deckUrl = null;

    try {
      // Handle file upload if a file is selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `deck_${Date.now()}.${fileExt}`;
        const filePath = `${user.companyId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('company_files')
          .upload(filePath, selectedFile);

        if (uploadError) {
          throw new Error(`Error uploading file: ${uploadError.message}`);
        }

        const { data } = supabase.storage
          .from('company_files')
          .getPublicUrl(filePath);
        
        deckUrl = data.publicUrl;
      }

      // Save the update to the database
      const { error } = await supabase.from('founder_updates').insert({
        company_id: user.companyId,
        submitted_by: user.id,
        arr: values.arr,
        mrr: values.mrr,
        burn_rate: values.burn_rate,
        runway: values.runway,
        headcount: values.headcount,
        churn: values.churn,
        raise_status: values.raise_status,
        raise_target_amount: values.raise_target_amount,
        requested_intros: values.requested_intros,
        comments: values.comments,
        deck_url: deckUrl,
      });

      if (error) throw new Error(`Error saving update: ${error.message}`);

      toast({
        title: "Update Submitted",
        description: "Your company update has been successfully submitted.",
      });

      // Redirect to company profile or dashboard
      navigate(`/companies/${user.companyId}`);
    } catch (error: any) {
      console.error('Error submitting update:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "An error occurred while submitting your update.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is a founder
  if (user && user.role !== 'founder') {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Restricted</CardTitle>
              <CardDescription>
                Only founders can submit company updates.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Submit Monthly Update</CardTitle>
            <CardDescription>
              Provide your latest company metrics and status for the month of {format(new Date(), 'MMMM yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="arr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Recurring Revenue (ARR)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormDescription>In USD</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="mrr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Recurring Revenue (MRR)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormDescription>In USD</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="burn_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Burn Rate</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormDescription>In USD</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="runway"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Runway</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormDescription>In months</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="headcount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Headcount</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormDescription>Number of employees</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="churn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Churn Rate</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormDescription>As a percentage (%)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="raise_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fundraising Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Not Raising">Not Raising</SelectItem>
                            <SelectItem value="Planning">Planning</SelectItem>
                            <SelectItem value="Raising">Raising</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Current fundraising status</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="raise_target_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Raise Amount</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormDescription>In USD (if applicable)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="requested_intros"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requested Introductions</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please list any introductions you'd like us to make..." 
                          {...field} 
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Specify any introductions to customers, investors, or partners you'd like us to facilitate
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commentary & Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional information, context, or notes..." 
                          {...field} 
                          className="min-h-[150px]"
                        />
                      </FormControl>
                      <FormDescription>
                        Share achievements, challenges, or any other relevant updates from the past month
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <FormLabel htmlFor="deck_file">Upload Latest Pitch Deck (Optional)</FormLabel>
                  <Input 
                    id="deck_file"
                    type="file" 
                    accept=".pdf,.pptx,.ppt,.key" 
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <FormDescription>
                    Upload your latest pitch deck or company presentation (PDF or PowerPoint)
                  </FormDescription>
                </div>
                
                <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Monthly Update'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SubmitUpdate;
