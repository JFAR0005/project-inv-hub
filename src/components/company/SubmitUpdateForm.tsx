
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useNotificationTrigger } from '@/hooks/useNotificationTrigger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface UpdateFormData {
  arr?: number;
  mrr?: number;
  burn_rate?: number;
  runway?: number;
  headcount?: number;
  churn?: number;
  raise_status?: string;
  raise_target_amount?: number;
  deck_url?: string;
  requested_intros?: string;
  comments?: string;
}

interface SubmitUpdateFormProps {
  companyId: string;
  companyName: string;
  onSuccess?: () => void;
}

const SubmitUpdateForm: React.FC<SubmitUpdateFormProps> = ({ 
  companyId, 
  companyName, 
  onSuccess 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { notifyUpdateSubmitted } = useNotificationTrigger();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<UpdateFormData>();

  const submitUpdateMutation = useMutation({
    mutationFn: async (data: UpdateFormData) => {
      const { data: result, error } = await supabase
        .from('founder_updates')
        .insert({
          company_id: companyId,
          submitted_by: user?.id,
          ...data
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: async (result) => {
      // Trigger notification after successful update submission
      try {
        await notifyUpdateSubmitted(companyId, companyName, result.id);
      } catch (error) {
        console.error('Failed to send notification:', error);
        // Don't fail the whole operation if notification fails
      }

      toast({
        title: "Update submitted successfully",
        description: "Your company update has been submitted and notifications have been sent.",
      });

      queryClient.invalidateQueries({ queryKey: ['founder-updates', companyId] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-health'] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting update",
        description: error.message || "There was an error submitting your update. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: UpdateFormData) => {
    submitUpdateMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Company Update</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="arr">ARR ($)</Label>
              <Input
                id="arr"
                type="number"
                step="0.01"
                placeholder="Annual Recurring Revenue"
                {...register('arr', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mrr">MRR ($)</Label>
              <Input
                id="mrr"
                type="number"
                step="0.01"
                placeholder="Monthly Recurring Revenue"
                {...register('mrr', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="burn_rate">Burn Rate ($)</Label>
              <Input
                id="burn_rate"
                type="number"
                step="0.01"
                placeholder="Monthly burn rate"
                {...register('burn_rate', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="runway">Runway (months)</Label>
              <Input
                id="runway"
                type="number"
                placeholder="Months of runway remaining"
                {...register('runway', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="headcount">Headcount</Label>
              <Input
                id="headcount"
                type="number"
                placeholder="Total employees"
                {...register('headcount', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="churn">Churn Rate (%)</Label>
              <Input
                id="churn"
                type="number"
                step="0.01"
                placeholder="Monthly churn rate"
                {...register('churn', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="raise_status">Fundraising Status</Label>
            <Select onValueChange={(value) => setValue('raise_status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select fundraising status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not raising">Not raising</SelectItem>
                <SelectItem value="Planning to raise">Planning to raise</SelectItem>
                <SelectItem value="Actively raising">Actively raising</SelectItem>
                <SelectItem value="Closed round">Closed round</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {watch('raise_status') && ['Planning to raise', 'Actively raising'].includes(watch('raise_status') || '') && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="raise_target_amount">Target Raise Amount ($)</Label>
                <Input
                  id="raise_target_amount"
                  type="number"
                  step="0.01"
                  placeholder="Target fundraising amount"
                  {...register('raise_target_amount', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deck_url">Pitch Deck URL</Label>
                <Input
                  id="deck_url"
                  type="url"
                  placeholder="https://..."
                  {...register('deck_url')}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="requested_intros">Requested Introductions</Label>
            <Textarea
              id="requested_intros"
              placeholder="Any specific introductions you'd like us to make..."
              {...register('requested_intros')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Additional Comments</Label>
            <Textarea
              id="comments"
              placeholder="Any additional updates, challenges, or wins to share..."
              {...register('comments')}
            />
          </div>

          <Button 
            type="submit" 
            disabled={submitUpdateMutation.isPending}
            className="w-full"
          >
            {submitUpdateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Update'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubmitUpdateForm;
