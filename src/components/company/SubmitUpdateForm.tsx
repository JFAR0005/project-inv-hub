
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNotificationTrigger } from '@/hooks/useNotificationTrigger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';

const SubmitUpdateForm: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { notifyUpdateSubmitted } = useNotificationTrigger();

  const [formData, setFormData] = useState({
    arr: '',
    mrr: '',
    growth: '',
    burn_rate: '',
    runway: '',
    headcount: '',
    churn: '',
    raise_status: '',
    comments: ''
  });

  // Fetch company details
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['company', companyId],
    queryFn: async () => {
      if (!companyId) throw new Error('Company ID is required');
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!companyId
  });

  // Submit update mutation
  const submitUpdateMutation = useMutation({
    mutationFn: async (updateData: typeof formData) => {
      if (!companyId) throw new Error('Company ID is required');
      
      const { data, error } = await supabase
        .from('founder_updates')
        .insert({
          company_id: companyId,
          arr: updateData.arr ? parseFloat(updateData.arr) : null,
          mrr: updateData.mrr ? parseFloat(updateData.mrr) : null,
          growth: updateData.growth ? parseFloat(updateData.growth) : null,
          burn_rate: updateData.burn_rate ? parseFloat(updateData.burn_rate) : null,
          runway: updateData.runway ? parseInt(updateData.runway) : null,
          headcount: updateData.headcount ? parseInt(updateData.headcount) : null,
          churn: updateData.churn ? parseFloat(updateData.churn) : null,
          raise_status: updateData.raise_status || null,
          comments: updateData.comments || null,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      console.log('Update submitted successfully:', data);
      
      // Trigger notification
      if (company?.name) {
        const notificationSent = await notifyUpdateSubmitted(
          companyId!,
          company.name,
          data.id
        );
        
        if (notificationSent) {
          console.log('Notification sent successfully');
        }
      }
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['company', companyId] });
      queryClient.invalidateQueries({ queryKey: ['founder-updates'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-portfolio'] });
      
      toast({
        title: "Update submitted successfully",
        description: "Your company update has been submitted and partners have been notified.",
      });
      
      navigate(`/company-profile/${companyId}?tab=updates`);
    },
    onError: (error) => {
      console.error('Error submitting update:', error);
      toast({
        title: "Error submitting update",
        description: "There was a problem submitting your update. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitUpdateMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (companyLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Company Not Found</h1>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Submit Update</h1>
          <p className="text-gray-600">{company.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Update</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="arr">Annual Recurring Revenue (ARR)</Label>
                <Input
                  id="arr"
                  type="number"
                  placeholder="e.g., 1200000"
                  value={formData.arr}
                  onChange={(e) => handleInputChange('arr', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mrr">Monthly Recurring Revenue (MRR)</Label>
                <Input
                  id="mrr"
                  type="number"
                  placeholder="e.g., 100000"
                  value={formData.mrr}
                  onChange={(e) => handleInputChange('mrr', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="growth">Growth Rate (%)</Label>
                <Input
                  id="growth"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 15.5"
                  value={formData.growth}
                  onChange={(e) => handleInputChange('growth', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="burn_rate">Monthly Burn Rate</Label>
                <Input
                  id="burn_rate"
                  type="number"
                  placeholder="e.g., 75000"
                  value={formData.burn_rate}
                  onChange={(e) => handleInputChange('burn_rate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="runway">Runway (months)</Label>
                <Input
                  id="runway"
                  type="number"
                  placeholder="e.g., 18"
                  value={formData.runway}
                  onChange={(e) => handleInputChange('runway', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="headcount">Team Size</Label>
                <Input
                  id="headcount"
                  type="number"
                  placeholder="e.g., 25"
                  value={formData.headcount}
                  onChange={(e) => handleInputChange('headcount', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="churn">Churn Rate (%)</Label>
                <Input
                  id="churn"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 2.5"
                  value={formData.churn}
                  onChange={(e) => handleInputChange('churn', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="raise_status">Fundraising Status</Label>
                <Select value={formData.raise_status} onValueChange={(value) => handleInputChange('raise_status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_raising">Not Raising</SelectItem>
                    <SelectItem value="planning_to_raise">Planning to Raise</SelectItem>
                    <SelectItem value="actively_raising">Actively Raising</SelectItem>
                    <SelectItem value="recently_closed">Recently Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Comments & Updates</Label>
              <Textarea
                id="comments"
                placeholder="Share any updates, wins, challenges, or other relevant information..."
                value={formData.comments}
                onChange={(e) => handleInputChange('comments', e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitUpdateMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {submitUpdateMutation.isPending ? 'Submitting...' : 'Submit Update'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmitUpdateForm;
