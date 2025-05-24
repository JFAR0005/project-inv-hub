
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Send, FileText, Loader2 } from 'lucide-react';

const SubmitUpdate = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateData, setUpdateData] = useState({
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
    comments: ''
  });

  const { data: company } = useQuery({
    queryKey: ['user-company', user?.companyId],
    queryFn: async () => {
      if (!user?.companyId) return null;
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', user.companyId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.companyId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.companyId) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('founder_updates')
        .insert({
          company_id: user.companyId,
          submitted_by: user.id,
          arr: updateData.arr ? parseFloat(updateData.arr) : null,
          mrr: updateData.mrr ? parseFloat(updateData.mrr) : null,
          burn_rate: updateData.burn_rate ? parseFloat(updateData.burn_rate) : null,
          runway: updateData.runway ? parseFloat(updateData.runway) : null,
          headcount: updateData.headcount ? parseInt(updateData.headcount) : null,
          churn: updateData.churn ? parseFloat(updateData.churn) : null,
          raise_status: updateData.raise_status || null,
          raise_target_amount: updateData.raise_target_amount ? parseFloat(updateData.raise_target_amount) : null,
          deck_url: updateData.deck_url || null,
          requested_intros: updateData.requested_intros || null,
          comments: updateData.comments || null
        });

      if (error) throw error;

      toast({
        title: "Update submitted successfully",
        description: "Your update has been sent to your investors.",
      });

      // Reset form
      setUpdateData({
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
        comments: ''
      });
    } catch (error) {
      console.error('Error submitting update:', error);
      toast({
        title: "Error submitting update",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Submit Update</h1>
        <p className="text-muted-foreground mt-2">
          Share your company's progress with investors
        </p>
        {company && (
          <p className="text-sm text-muted-foreground mt-1">
            Submitting for: <span className="font-medium">{company.name}</span>
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Company Update
          </CardTitle>
          <CardDescription>
            Provide regular updates on your company's progress, metrics, and milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="raise_status">Fundraising Status</Label>
              <Select
                value={updateData.raise_status}
                onValueChange={(value) => setUpdateData(prev => ({ ...prev, raise_status: value }))}
              >
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

            <div className="space-y-4">
              <Label className="text-base font-medium">Key Metrics</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="arr">ARR ($)</Label>
                  <Input
                    id="arr"
                    type="number"
                    step="0.01"
                    placeholder="Annual Recurring Revenue"
                    value={updateData.arr}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, arr: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mrr">MRR ($)</Label>
                  <Input
                    id="mrr"
                    type="number"
                    step="0.01"
                    placeholder="Monthly Recurring Revenue"
                    value={updateData.mrr}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, mrr: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="burn_rate">Burn Rate ($)</Label>
                  <Input
                    id="burn_rate"
                    type="number"
                    step="0.01"
                    placeholder="Monthly burn rate"
                    value={updateData.burn_rate}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, burn_rate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="runway">Runway (months)</Label>
                  <Input
                    id="runway"
                    type="number"
                    placeholder="Months of runway remaining"
                    value={updateData.runway}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, runway: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headcount">Headcount</Label>
                  <Input
                    id="headcount"
                    type="number"
                    placeholder="Total employees"
                    value={updateData.headcount}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, headcount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="churn">Churn Rate (%)</Label>
                  <Input
                    id="churn"
                    type="number"
                    step="0.01"
                    placeholder="Monthly churn rate"
                    value={updateData.churn}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, churn: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {updateData.raise_status && ['Planning to raise', 'Actively raising'].includes(updateData.raise_status) && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="raise_target_amount">Target Raise Amount ($)</Label>
                  <Input
                    id="raise_target_amount"
                    type="number"
                    step="0.01"
                    placeholder="Target fundraising amount"
                    value={updateData.raise_target_amount}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, raise_target_amount: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deck_url">Pitch Deck URL</Label>
                  <Input
                    id="deck_url"
                    type="url"
                    placeholder="https://..."
                    value={updateData.deck_url}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, deck_url: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="requested_intros">Requested Introductions</Label>
              <Textarea
                id="requested_intros"
                placeholder="Any specific introductions you'd like us to make..."
                value={updateData.requested_intros}
                onChange={(e) => setUpdateData(prev => ({ ...prev, requested_intros: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Additional Comments</Label>
              <Textarea
                id="comments"
                placeholder="Any additional updates, challenges, or wins to share..."
                value={updateData.comments}
                onChange={(e) => setUpdateData(prev => ({ ...prev, comments: e.target.value }))}
                rows={8}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Update
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmitUpdate;
