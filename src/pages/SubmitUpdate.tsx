
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { RaiseStatus } from '@/types/reporting';
import { format } from 'date-fns';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  arr: z.number().optional().nullable(),
  mrr: z.number().optional().nullable(),
  burn_rate: z.number().optional().nullable(),
  runway: z.number().min(0).optional().nullable(),
  headcount: z.number().int().min(0).optional().nullable(),
  churn: z.number().optional().nullable(),
  raise_status: z.enum(['Not Raising', 'Planning', 'Raising', 'Closed']),
  raise_target_amount: z.number().optional().nullable(),
  requested_intros: z.string().optional().nullable(),
  comments: z.string().max(2000).optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SubmitUpdate() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasPreviousUpdate, setHasPreviousUpdate] = useState(false);
  const [previousUpdateDate, setPreviousUpdateDate] = useState<string | null>(null);

  // Redirect if not a founder
  React.useEffect(() => {
    if (user && user.role !== 'founder') {
      toast({
        title: "Access Denied",
        description: "Only founders can submit company updates",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [user, navigate, toast]);

  // Check for previous submissions in the current month
  useEffect(() => {
    if (user?.companyId) {
      const checkPreviousSubmissions = async () => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const { data, error } = await supabase
          .from('founder_updates')
          .select('submitted_at')
          .eq('company_id', user.companyId)
          .gte('submitted_at', firstDayOfMonth.toISOString())
          .order('submitted_at', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error('Error checking previous submissions:', error);
        } else if (data && data.length > 0) {
          setHasPreviousUpdate(true);
          setPreviousUpdateDate(format(new Date(data[0].submitted_at), 'MMMM d, yyyy'));
        }
      };
      
      checkPreviousSubmissions();
    }
  }, [user]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      arr: null,
      mrr: null,
      burn_rate: null,
      runway: null,
      headcount: null,
      churn: null,
      raise_status: 'Not Raising',
      raise_target_amount: null,
      requested_intros: '',
      comments: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const onSubmit = async (values: FormValues) => {
    if (!user || !user.companyId) {
      toast({
        title: "Error",
        description: "You must be associated with a company to submit an update.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First upload the file if there is one
      let fileUrl = null;
      if (selectedFile) {
        const fileName = `${Date.now()}_${selectedFile.name}`;
        const filePath = `${user.companyId}/${fileName}`;
        
        // Upload file to storage
        const { data: fileData, error: fileError } = await supabase
          .storage
          .from('company_files')
          .upload(filePath, selectedFile);
        
        if (fileError) throw fileError;
        
        // Get the public URL
        const { data: publicUrlData } = supabase
          .storage
          .from('company_files')
          .getPublicUrl(filePath);
          
        fileUrl = publicUrlData.publicUrl;

        // Add the file to the company_files table
        const { error: fileRecordError } = await supabase
          .from('company_files')
          .insert({
            company_id: user.companyId,
            uploader_id: user.id,
            file_name: selectedFile.name,
            file_url: fileUrl,
          });
          
        if (fileRecordError) throw fileRecordError;
      }

      // Save the update to the founder_updates table
      const { error: updateError } = await supabase
        .from('founder_updates')
        .insert({
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
          deck_url: fileUrl,
        });
        
      if (updateError) throw updateError;

      // Save individual metrics for charting
      const metricsToSave = [
        { name: 'ARR', value: values.arr },
        { name: 'MRR', value: values.mrr },
        { name: 'Burn Rate', value: values.burn_rate },
        { name: 'Runway', value: values.runway },
        { name: 'Headcount', value: values.headcount },
        { name: 'Churn Rate', value: values.churn },
      ];

      const currentDate = new Date().toISOString().split('T')[0];
      
      // Filter out null values and prepare for insertion
      const validMetrics = metricsToSave
        .filter(m => m.value !== null && m.value !== undefined)
        .map(m => ({
          company_id: user.companyId!,
          metric_name: m.name,
          value: m.value as number,
          date: currentDate,
        }));
      
      if (validMetrics.length > 0) {
        const { error: metricsError } = await supabase
          .from('metrics')
          .insert(validMetrics);
          
        if (metricsError) {
          console.error('Error saving metrics:', metricsError);
          // Continue anyway as this is not critical
        }
      }

      // Attempt to get partner information to send notification
      const { data: companyData } = await supabase
        .from('companies')
        .select('name')
        .eq('id', user.companyId)
        .single();

      // Update the company's metrics in the companies table
      if (values.arr !== null || values.mrr !== null || values.burn_rate !== null || 
          values.runway !== null || values.headcount !== null || values.churn !== null) {
        
        const updateData: Record<string, any> = {};
        if (values.arr !== null) updateData.arr = values.arr;
        if (values.mrr !== null) updateData.mrr = values.mrr;
        if (values.burn_rate !== null) updateData.burn_rate = values.burn_rate;
        if (values.runway !== null) updateData.runway = values.runway;
        if (values.headcount !== null) updateData.headcount = values.headcount;
        if (values.churn !== null) updateData.churn_rate = values.churn;
        updateData.updated_at = new Date().toISOString();
        
        const { error: companyUpdateError } = await supabase
          .from('companies')
          .update(updateData)
          .eq('id', user.companyId);
          
        if (companyUpdateError) {
          console.error('Error updating company metrics:', companyUpdateError);
        }
      }

      toast({
        title: "Update Submitted",
        description: "Your company update has been submitted successfully.",
      });

      // Redirect to company profile
      navigate(`/companies/${user.companyId}`);
    } catch (error) {
      console.error('Error submitting update:', error);
      toast({
        title: "Error",
        description: "Failed to submit update. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || !user.companyId) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You must be a founder with an associated company to submit updates.
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
            <CardTitle>Submit Company Update</CardTitle>
            <CardDescription>
              Share your latest metrics and progress with your investors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasPreviousUpdate && (
              <Alert className="mb-6 bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertTitle className="text-amber-700">Previous update detected</AlertTitle>
                <AlertDescription className="text-amber-600">
                  You have already submitted an update this month ({previousUpdateDate}). 
                  Submitting another update will overwrite some of your previously reported metrics.
                </AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Financial Metrics</h3>
                    
                    <FormField
                      control={form.control}
                      name="arr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Recurring Revenue (ARR)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0"
                              {...field} 
                              value={field.value === null ? '' : field.value}
                              onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                            />
                          </FormControl>
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
                            <Input 
                              type="number" 
                              placeholder="0"
                              {...field} 
                              value={field.value === null ? '' : field.value}
                              onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                            />
                          </FormControl>
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
                            <Input 
                              type="number" 
                              placeholder="0"
                              {...field} 
                              value={field.value === null ? '' : field.value}
                              onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="runway"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Runway (months)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0"
                              {...field} 
                              value={field.value === null ? '' : field.value}
                              onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Company Metrics</h3>
                    
                    <FormField
                      control={form.control}
                      name="headcount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Headcount</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0"
                              {...field} 
                              value={field.value === null ? '' : field.value}
                              onChange={(e) => field.onChange(e.target.value === '' ? null : parseInt(e.target.value, 10))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="churn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Churn Rate (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0"
                              {...field} 
                              value={field.value === null ? '' : field.value}
                              onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                              <SelectItem value="Raising">Actively Raising</SelectItem>
                              <SelectItem value="Closed">Recently Closed</SelectItem>
                            </SelectContent>
                          </Select>
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
                            <Input 
                              type="number" 
                              placeholder="0"
                              {...field} 
                              value={field.value === null ? '' : field.value}
                              onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Only applicable if you're planning to raise or actively raising
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Additional Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="requested_intros"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requested Introductions</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Let us know if you need introductions to potential customers, partners, or talent"
                            className="min-h-[100px]"
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Update Summary / Commentary</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Share any additional context, progress, or challenges"
                            className="min-h-[150px]"
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <FormLabel>Upload Pitch Deck or Other Document</FormLabel>
                    <Input 
                      type="file" 
                      accept=".pdf,.pptx,.ppt,.docx,.doc" 
                      onChange={handleFileChange}
                    />
                    <FormDescription>
                      Upload your latest pitch deck or other relevant documents (PDF or Office formats)
                    </FormDescription>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Update'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
