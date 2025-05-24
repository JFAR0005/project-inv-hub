import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import EnhancedProtectedRoute from '@/components/layout/EnhancedProtectedRoute';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, ArrowRight, CheckCircle2, CircleDollarSign, Loader2 } from 'lucide-react';
import { useNotificationTrigger } from '@/hooks/useNotificationTrigger';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

// Create schema for form validation
const updateFormSchema = z.object({
  arr: z.coerce.number().min(0, {
    message: "ARR must be a positive number",
  }).optional(),
  mrr: z.coerce.number().min(0, {
    message: "MRR must be a positive number",
  }).optional(),
  burn_rate: z.coerce.number().min(0, {
    message: "Burn rate must be a positive number",
  }).optional(),
  runway: z.coerce.number().min(0, {
    message: "Runway must be a positive number",
  }).optional(),
  headcount: z.coerce.number().int().min(0, {
    message: "Headcount must be a positive integer",
  }).optional(),
  churn: z.coerce.number().min(0).max(100, {
    message: "Churn must be between 0-100%",
  }).optional(),
  raise_status: z.string().optional(),
  raise_target_amount: z.coerce.number().min(0, {
    message: "Target amount must be a positive number",
  }).optional(),
  deck_url: z.string().nullable().optional(),
  requested_intros: z.string().optional(),
  comments: z.string().optional(),
});

type UpdateFormValues = z.infer<typeof updateFormSchema>;

export default function SubmitUpdate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { notifyUpdateSubmitted } = useNotificationTrigger();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<UpdateFormValues>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      arr: 0,
      mrr: 0,
      burn_rate: 0,
      runway: 0,
      headcount: 0,
      churn: 0,
      raise_status: '',
      raise_target_amount: 0,
      deck_url: '',
      requested_intros: '',
      comments: '',
    },
  });

  // Fetch company data and last update
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.companyId) {
        navigate('/');
        return;
      }

      try {
        // Get company data
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', user.companyId)
          .single();

        if (companyError) throw companyError;
        setCompany(companyData);

        // Get the most recent update
        const { data: updates, error: updatesError } = await supabase
          .from('founder_updates')
          .select('*')
          .eq('company_id', user.companyId)
          .order('submitted_at', { ascending: false })
          .limit(1);

        if (updatesError) throw updatesError;
        
        if (updates && updates.length > 0) {
          setLastUpdate(updates[0]);
          
          // Pre-fill form with last update data
          const lastUpdateData = updates[0];
          form.reset({
            arr: lastUpdateData.arr || 0,
            mrr: lastUpdateData.mrr || 0,
            burn_rate: lastUpdateData.burn_rate || 0,
            runway: lastUpdateData.runway || 0,
            headcount: lastUpdateData.headcount || 0,
            churn: lastUpdateData.churn || 0,
            raise_status: lastUpdateData.raise_status || '',
            raise_target_amount: lastUpdateData.raise_target_amount || 0,
            deck_url: lastUpdateData.deck_url || '',
            requested_intros: lastUpdateData.requested_intros || '',
            comments: '',
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load company data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, navigate, toast, form]);

  const onSubmit = async (values: UpdateFormValues) => {
    if (!user || !user.companyId || !company) {
      toast({
        title: 'Error',
        description: 'Missing company information',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = {
        ...values,
        company_id: user.companyId,
        submitted_by: user.id,
        submitted_at: new Date().toISOString(),
      };

      // Insert the update
      const { error } = await supabase
        .from('founder_updates')
        .insert(updateData);

      if (error) throw error;

      // Send notification
      await notifyUpdateSubmitted(
        user.companyId,
        company.name,
        'latest-update' // Using a placeholder since we don't have the specific update ID
      );

      toast({
        title: 'Update submitted',
        description: 'Your update has been successfully submitted',
      });

      // Update the company data with the latest metrics
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          arr: Number(values.arr),
          mrr: Number(values.mrr),
          burn_rate: Number(values.burn_rate),
          runway: Number(values.runway),
          headcount: Number(values.headcount),
          churn_rate: Number(values.churn),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.companyId);

      if (updateError) throw updateError;

      // Navigate to the company profile
      navigate(`/company/${user.companyId}`);
    } catch (error) {
      console.error('Error submitting update:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit update. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <EnhancedProtectedRoute allowedRoles={['founder']}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Submit Company Update</CardTitle>
            <CardDescription>
              Provide the latest metrics and information about your company.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="arr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Annual Recurring Revenue (ARR)</FormLabel>
                        <FormControl>
                          <Input placeholder="0" type="number" {...field} />
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
                          <Input placeholder="0" type="number" {...field} />
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
                          <Input placeholder="0" type="number" {...field} />
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
                          <Input placeholder="0" type="number" {...field} />
                        </FormControl>
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
                          <Input placeholder="0" type="number" {...field} />
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
                          <Input placeholder="0" type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="raise_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fundraising Status</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Not raising, Actively raising, Planning to raise" {...field} />
                        </FormControl>
                        <FormDescription>Indicate your current fundraising status</FormDescription>
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
                          <Input placeholder="e.g., 1000000" type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="deck_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pitch Deck URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="requested_intros"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requested Introductions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List any specific introductions you would like from us"
                            className="resize-none"
                            {...field}
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
                        <FormLabel>Additional Comments</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any other updates or comments about your company"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <CardFooter className="flex justify-between px-0">
                  <Button variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Update'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </EnhancedProtectedRoute>
  );
}
