
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Calendar, FileText, User } from 'lucide-react';

// Define the form schema
const ddFormSchema = z.object({
  risk_assessment: z.string().min(1, { message: "Risk assessment is required" }),
  market_analysis: z.string().min(1, { message: "Market analysis is required" }),
  financial_review: z.string().min(1, { message: "Financial review is required" }),
  team_assessment: z.string().min(1, { message: "Team assessment is required" }),
  investment_thesis: z.string().min(1, { message: "Investment thesis is required" }),
  due_diligence_status: z.enum(['Pending', 'In Progress', 'Complete'], { 
    required_error: "Please select a status" 
  }),
  target_completion_date: z.string().min(1, { message: "Target completion date is required" }),
  assigned_analyst: z.string().min(1, { message: "Assigned analyst is required" }),
});

type DDFormValues = z.infer<typeof ddFormSchema>;

interface DDFormProps {
  dealId: string;
  companyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDDDataUpdated: () => void;
}

export default function DDForm({ dealId, companyName, open, onOpenChange, onDDDataUpdated }: DDFormProps) {
  const { toast } = useToast();
  
  const form = useForm<DDFormValues>({
    resolver: zodResolver(ddFormSchema),
    defaultValues: {
      risk_assessment: '',
      market_analysis: '',
      financial_review: '',
      team_assessment: '',
      investment_thesis: '',
      due_diligence_status: 'Pending',
      target_completion_date: new Date().toISOString().split('T')[0],
      assigned_analyst: '',
    },
  });

  // Load existing DD data if available
  React.useEffect(() => {
    if (open && dealId) {
      const fetchDDData = async () => {
        const { data, error } = await supabase
          .from('deal_due_diligence')
          .select('*')
          .eq('deal_id', dealId)
          .single();
          
        if (data && !error) {
          // Format the date for the input
          const formattedDate = data.target_completion_date 
            ? new Date(data.target_completion_date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

          form.reset({
            risk_assessment: data.risk_assessment || '',
            market_analysis: data.market_analysis || '',
            financial_review: data.financial_review || '',
            team_assessment: data.team_assessment || '',
            investment_thesis: data.investment_thesis || '',
            due_diligence_status: data.due_diligence_status || 'Pending',
            target_completion_date: formattedDate,
            assigned_analyst: data.assigned_analyst || '',
          });
        }
      };

      fetchDDData();
    }
  }, [dealId, open, form]);

  const onSubmit = async (values: DDFormValues) => {
    try {
      // Check if DD record already exists for this deal
      const { data: existingRecord, error: fetchError } = await supabase
        .from('deal_due_diligence')
        .select('id')
        .eq('deal_id', dealId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') { // Code for no rows returned
        throw fetchError;
      }

      let error;
      if (existingRecord?.id) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('deal_due_diligence')
          .update({
            risk_assessment: values.risk_assessment,
            market_analysis: values.market_analysis,
            financial_review: values.financial_review,
            team_assessment: values.team_assessment,
            investment_thesis: values.investment_thesis,
            due_diligence_status: values.due_diligence_status,
            target_completion_date: values.target_completion_date,
            assigned_analyst: values.assigned_analyst,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingRecord.id);
          
        error = updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('deal_due_diligence')
          .insert({
            deal_id: dealId,
            risk_assessment: values.risk_assessment,
            market_analysis: values.market_analysis,
            financial_review: values.financial_review,
            team_assessment: values.team_assessment,
            investment_thesis: values.investment_thesis,
            due_diligence_status: values.due_diligence_status,
            target_completion_date: values.target_completion_date,
            assigned_analyst: values.assigned_analyst,
          });
          
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Due Diligence data saved",
        description: "The due diligence information has been successfully saved.",
      });

      onOpenChange(false);
      onDDDataUpdated();
    } catch (error) {
      console.error('Error saving due diligence data:', error);
      toast({
        title: "Error",
        description: "Failed to save due diligence information. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Due Diligence: {companyName}</DialogTitle>
          <DialogDescription>
            Complete the due diligence form for this investment opportunity.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="due_diligence_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DD Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Complete">Complete</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="target_completion_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Completion Date</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Input type="date" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assigned_analyst"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Analyst</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Enter analyst name" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="risk_assessment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Risk Assessment</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Analyze key risks (market, financial, operational, etc.)"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="financial_review"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Financial Review</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Review of financial statements, projections, unit economics, etc."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="market_analysis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Market Analysis</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Market size, growth potential, competition, etc."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="team_assessment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Assessment</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Evaluate strengths/weaknesses of the founding team & key executives"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="investment_thesis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Thesis</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Why this is a good investment opportunity"
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Due Diligence</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
