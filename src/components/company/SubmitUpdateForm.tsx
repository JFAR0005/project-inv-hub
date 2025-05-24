import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Loader2, Send } from 'lucide-react';

interface SubmitUpdateFormProps {
  companyId: string;
  companyName: string;
}

interface UpdateFormData {
  mrr?: number;
  arr?: number;
  burn_rate?: number;
  runway?: number;
  headcount?: number;
  churn?: number;
  raise_status?: string;
  raise_target_amount?: number;
  requested_intros?: string;
  comments?: string;
  deck_url?: string;
}

const SubmitUpdateForm: React.FC<SubmitUpdateFormProps> = ({ companyId, companyName }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<UpdateFormData>({
    raise_status: 'Not Raising',
  });

  const submitUpdate = useMutation({
    mutationFn: async (data: UpdateFormData) => {
      const { error } = await supabase
        .from('founder_updates')
        .insert({
          company_id: companyId,
          submitted_by: user?.id,
          ...data,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Update Submitted",
        description: "Your company update has been submitted successfully.",
      });
      navigate('/');
    },
    onError: (error) => {
      console.error('Error submitting update:', error);
      toast({
        title: "Error",
        description: "Failed to submit update. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: keyof UpdateFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitUpdate.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Update</CardTitle>
        <CardDescription>
          Share your progress and key metrics with investors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Financial Metrics */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Financial Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mrr">Monthly Recurring Revenue ($)</Label>
                <Input
                  id="mrr"
                  type="number"
                  placeholder="0"
                  value={formData.mrr || ''}
                  onChange={(e) => handleInputChange('mrr', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arr">Annual Recurring Revenue ($)</Label>
                <Input
                  id="arr"
                  type="number"
                  placeholder="0"
                  value={formData.arr || ''}
                  onChange={(e) => handleInputChange('arr', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="burn_rate">Monthly Burn Rate ($)</Label>
                <Input
                  id="burn_rate"
                  type="number"
                  placeholder="0"
                  value={formData.burn_rate || ''}
                  onChange={(e) => handleInputChange('burn_rate', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="runway">Runway (months)</Label>
                <Input
                  id="runway"
                  type="number"
                  placeholder="0"
                  value={formData.runway || ''}
                  onChange={(e) => handleInputChange('runway', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Operational Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="headcount">Team Size</Label>
                <Input
                  id="headcount"
                  type="number"
                  placeholder="0"
                  value={formData.headcount || ''}
                  onChange={(e) => handleInputChange('headcount', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="churn">Churn Rate (%)</Label>
                <Input
                  id="churn"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.churn || ''}
                  onChange={(e) => handleInputChange('churn', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Fundraising */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Fundraising</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="raise_status">Fundraising Status</Label>
                <Select value={formData.raise_status} onValueChange={(value) => handleInputChange('raise_status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Raising">Not Raising</SelectItem>
                    <SelectItem value="Planning to Raise">Planning to Raise</SelectItem>
                    <SelectItem value="Actively Raising">Actively Raising</SelectItem>
                    <SelectItem value="Recently Closed">Recently Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="raise_target_amount">Target Amount ($)</Label>
                <Input
                  id="raise_target_amount"
                  type="number"
                  placeholder="0"
                  value={formData.raise_target_amount || ''}
                  onChange={(e) => handleInputChange('raise_target_amount', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deck_url">Pitch Deck URL</Label>
              <Input
                id="deck_url"
                type="url"
                placeholder="https://..."
                value={formData.deck_url || ''}
                onChange={(e) => handleInputChange('deck_url', e.target.value)}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Information</h3>
            <div className="space-y-2">
              <Label htmlFor="requested_intros">Requested Introductions</Label>
              <Textarea
                id="requested_intros"
                placeholder="What introductions would be helpful?"
                value={formData.requested_intros || ''}
                onChange={(e) => handleInputChange('requested_intros', e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comments">Comments & Updates</Label>
              <Textarea
                id="comments"
                placeholder="Share any additional updates, challenges, or wins..."
                value={formData.comments || ''}
                onChange={(e) => handleInputChange('comments', e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={submitUpdate.isPending}>
              {submitUpdate.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Update
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubmitUpdateForm;
