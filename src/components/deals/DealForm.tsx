
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import CompanyForm from '@/components/companies/CompanyForm';
import { Plus } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Deal = Database['public']['Tables']['deals']['Row'] & {
  companies?: Database['public']['Tables']['companies']['Row'];
  users?: Database['public']['Tables']['users']['Row'];
};

// Define the form schema with proper string-to-number transformation
const formSchema = z.object({
  company_id: z.string().uuid({ message: "Please select a company" }),
  stage: z.enum(['Discovery', 'DD', 'IC', 'Funded', 'Rejected'], { required_error: "Please select a stage" }),
  status: z.string().min(1, { message: "Status is required" }),
  source: z.string().optional(),
  valuation_expectation: z.string()
    .optional()
    .transform(val => val === '' ? null : Number(val))
    .refine(val => val === null || !isNaN(val as number), {
      message: "Valuation must be a number"
    }),
  lead_partner: z.string().optional(),
  notes: z.string().optional(),
});

// Define the form values before transformation
type FormValues = {
  company_id: string;
  stage: 'Discovery' | 'DD' | 'IC' | 'Funded' | 'Rejected';
  status: string;
  source: string;
  valuation_expectation: string;
  lead_partner: string;
  notes: string;
};

interface DealFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDealCreated: () => void;
  editingDeal?: Deal | null;
}

export default function DealForm({ open, onOpenChange, onDealCreated, editingDeal }: DealFormProps) {
  const { toast } = useToast();
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stage: 'Discovery',
      status: 'Active',
      source: '',
      valuation_expectation: '',
      lead_partner: '',
      notes: '',
    },
  });

  // Reset form when editing deal changes
  useEffect(() => {
    if (editingDeal) {
      form.reset({
        company_id: editingDeal.company_id || '',
        stage: editingDeal.stage,
        status: editingDeal.status || 'Active',
        source: editingDeal.source || '',
        valuation_expectation: editingDeal.valuation_expectation?.toString() || '',
        lead_partner: editingDeal.lead_partner || '',
        notes: editingDeal.notes || '',
      });
    } else {
      form.reset({
        stage: 'Discovery',
        status: 'Active',
        source: '',
        valuation_expectation: '',
        lead_partner: '',
        notes: '',
      });
    }
  }, [editingDeal, form]);

  // Fetch companies for the dropdown
  const { data: companies = [], isLoading: isLoadingCompanies, refetch: refetchCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch users for lead partner selection
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      return data || [];
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const dealData = {
        company_id: values.company_id,
        stage: values.stage,
        status: values.status,
        source: values.source || null,
        valuation_expectation: values.valuation_expectation ? Number(values.valuation_expectation) : null,
        lead_partner: values.lead_partner || null,
        notes: values.notes || null,
      };

      if (editingDeal) {
        // Update existing deal
        const { error } = await supabase
          .from('deals')
          .update({
            ...dealData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingDeal.id);

        if (error) throw error;

        toast({
          title: "Deal updated",
          description: "The deal has been updated successfully.",
        });
      } else {
        // Create new deal
        const { error } = await supabase
          .from('deals')
          .insert(dealData);

        if (error) throw error;

        toast({
          title: "Deal created",
          description: "The deal has been created successfully.",
        });
      }

      form.reset();
      onOpenChange(false);
      onDealCreated();
    } catch (error) {
      console.error('Error saving deal:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingDeal ? 'update' : 'create'} deal. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleCompanyCreated = (company: { id: string, name: string }) => {
    // Set the newly created company as the selected company
    form.setValue('company_id', company.id);
    
    // Refresh the companies list
    refetchCompanies();
    
    toast({
      title: "Company selected",
      description: `${company.name} has been selected for this deal.`,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingDeal ? 'Edit Deal' : 'Create New Deal'}</DialogTitle>
            <DialogDescription>
              {editingDeal ? 'Update the deal information below.' : 'Add a new deal to the pipeline. Fill out the details below.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="company_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a company" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingCompanies ? (
                              <SelectItem value="loading" disabled>Loading companies...</SelectItem>
                            ) : companies.length === 0 ? (
                              <SelectItem value="empty" disabled>No companies available</SelectItem>
                            ) : (
                              companies.map((company) => (
                                <SelectItem key={company.id} value={company.id}>
                                  {company.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      {!editingDeal && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setCompanyFormOpen(true)}
                          title="Create new company"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stage</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Discovery">Discovery</SelectItem>
                          <SelectItem value="DD">Due Diligence</SelectItem>
                          <SelectItem value="IC">Investment Committee</SelectItem>
                          <SelectItem value="Funded">Funded</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="On Hold">On Hold</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Referral, Conference" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="valuation_expectation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valuation Expectation ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 1000000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="lead_partner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Partner</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a lead partner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No lead partner</SelectItem>
                        {isLoadingUsers ? (
                          <SelectItem value="loading" disabled>Loading users...</SelectItem>
                        ) : (
                          users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add any additional notes or context" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDeal ? 'Update Deal' : 'Create Deal'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {!editingDeal && (
        <CompanyForm 
          open={companyFormOpen} 
          onOpenChange={setCompanyFormOpen}
          onCompanyCreated={handleCompanyCreated}
        />
      )}
    </>
  );
}
