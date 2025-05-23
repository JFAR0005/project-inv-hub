
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useToast } from '@/hooks/use-toast';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useNotificationTrigger } from '@/hooks/useNotificationTrigger';

// Create schema for form validation
const updateFormSchema = z.object({
  arr: z.string().min(1, 'ARR is required').transform(val => parseFloat(val)),
  mrr: z.string().min(1, 'MRR is required').transform(val => parseFloat(val)),
  burn_rate: z.string().min(1, 'Burn rate is required').transform(val => parseFloat(val)),
  runway: z.string().min(1, 'Runway is required').transform(val => parseFloat(val)),
  headcount: z.string().min(1, 'Headcount is required').transform(val => parseInt(val, 10)),
  churn: z.string().nullable().transform(val => val ? parseFloat(val) : null),
  raise_status: z.string().nullable(),
  raise_target_amount: z.string().nullable().transform(val => val ? parseFloat(val) : null),
  deck_url: z.string().nullable().url('Please enter a valid URL').or(z.literal('')),
  requested_intros: z.string().nullable(),
  comments: z.string().nullable(),
});

type UpdateFormValues = z.infer<typeof updateFormSchema>;

export default function SubmitUpdate() {
  const { user } = useAuth();
  const { canSubmitUpdate, userCompanyId } = useRoleAccess();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notifyUpdateSubmitted } = useNotificationTrigger();
  
  const form = useForm<UpdateFormValues>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      arr: '',
      mrr: '',
      burn_rate: '',
      runway: '',
      headcount: '',
      churn: '',
      raise_status: '',
      raise_target_amount: '',
      deck_url: '',
      requested_intros: '',
      comments: '',
    },
  });

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        if (!userCompanyId) return;
        
        setCompanyId(userCompanyId);
        
        // Get latest update data to pre-fill the form
        const { data: updates, error: updatesError } = await supabase
          .from('founder_updates')
          .select('*')
          .eq('company_id', userCompanyId)
          .order('submitted_at', { ascending: false })
          .limit(1);
        
        if (updatesError) throw updatesError;
        
        // Get company details
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('name, arr, mrr, burn_rate, runway, headcount, churn_rate')
          .eq('id', userCompanyId)
          .single();
        
        if (companyError) throw companyError;
        
        if (company) {
          setCompanyName(company.name);
        }
        
        // Pre-fill form with latest update data or company data
        if (updates && updates.length > 0) {
          const latestUpdate = updates[0];
          form.reset({
            arr: latestUpdate.arr?.toString() || '',
            mrr: latestUpdate.mrr?.toString() || '',
            burn_rate: latestUpdate.burn_rate?.toString() || '',
            runway: latestUpdate.runway?.toString() || '',
            headcount: latestUpdate.headcount?.toString() || '',
            churn: latestUpdate.churn?.toString() || '',
            raise_status: latestUpdate.raise_status || '',
            raise_target_amount: latestUpdate.raise_target_amount?.toString() || '',
            deck_url: latestUpdate.deck_url || '',
            requested_intros: latestUpdate.requested_intros || '',
            comments: '',
          });
        } else if (company) {
          // Fall back to company data if no updates
          form.reset({
            arr: company.arr?.toString() || '',
            mrr: company.mrr?.toString() || '',
            burn_rate: company.burn_rate?.toString() || '',
            runway: company.runway?.toString() || '',
            headcount: company.headcount?.toString() || '',
            churn: company.churn_rate?.toString() || '',
            raise_status: '',
            raise_target_amount: '',
            deck_url: '',
            requested_intros: '',
            comments: '',
          });
        }
      } catch (err) {
        console.error('Error fetching company data:', err);
        setError('Failed to load company data. Please try again.');
      }
    };

    fetchCompanyDetails();
  }, [userCompanyId, form]);

  const onSubmit = async (data: UpdateFormValues) => {
    if (!user || !companyId) {
      setError('User or company information is missing.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Insert update into founder_updates table
      const { data: newUpdate, error: insertError } = await supabase
        .from('founder_updates')
        .insert({
          company_id: companyId,
          submitted_by: user.id,
          arr: data.arr,
          mrr: data.mrr,
          burn_rate: data.burn_rate,
          runway: data.runway,
          headcount: data.headcount,
          churn: data.churn,
          raise_status: data.raise_status || null,
          raise_target_amount: data.raise_target_amount || null,
          deck_url: data.deck_url || null,
          requested_intros: data.requested_intros || null,
          comments: data.comments || null,
        })
        .select('id')
        .single();
        
      if (insertError) throw insertError;
      
      // Update the company with new metrics
      const { error: updateError } = await supabase
        .from('companies')
        .update({
          arr: data.arr,
          mrr: data.mrr,
          burn_rate: data.burn_rate,
          runway: data.runway,
          headcount: data.headcount,
          churn_rate: data.churn,
          updated_at: new Date().toISOString(),
        })
        .eq('id', companyId);
        
      if (updateError) throw updateError;
      
      // Send notification to partners
      await notifyUpdateSubmitted(companyId, companyName, newUpdate.id);
      
      toast({
        title: 'Update submitted successfully',
        description: 'Your company update has been recorded.',
      });
      
      // Redirect to the company page
      navigate(`/company/${companyId}`);
    } catch (err) {
      console.error('Error submitting update:', err);
      setError('Failed to submit update. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canSubmitUpdate()) {
    return (
      <ProtectedRoute requiredRoles={['founder']}>
        <div className="container mx-auto py-12">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to submit updates.
            </AlertDescription>
          </Alert>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['founder']} requiresOwnership={true} resourceOwnerId={userCompanyId}>
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Submit Company Update</CardTitle>
            <CardDescription>
              Provide the latest metrics and information about your company.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
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
    </ProtectedRoute>
  );
}
