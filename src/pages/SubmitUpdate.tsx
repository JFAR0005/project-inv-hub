
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
    title: '',
    content: '',
    type: '',
    metrics: {
      revenue: '',
      burn_rate: '',
      runway: '',
      team_size: ''
    }
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
        .from('company_updates')
        .insert({
          company_id: user.companyId,
          title: updateData.title,
          content: updateData.content,
          type: updateData.type,
          metrics: updateData.metrics,
          submitted_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Update submitted successfully",
        description: "Your update has been sent to your investors.",
      });

      // Reset form
      setUpdateData({
        title: '',
        content: '',
        type: '',
        metrics: {
          revenue: '',
          burn_rate: '',
          runway: '',
          team_size: ''
        }
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
              <Label htmlFor="title">Update Title</Label>
              <Input
                id="title"
                placeholder="e.g., Q4 2024 Progress Update"
                value={updateData.title}
                onChange={(e) => setUpdateData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Update Type</Label>
              <Select
                value={updateData.type}
                onValueChange={(value) => setUpdateData(prev => ({ ...prev, type: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select update type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly Update</SelectItem>
                  <SelectItem value="quarterly">Quarterly Update</SelectItem>
                  <SelectItem value="milestone">Milestone Update</SelectItem>
                  <SelectItem value="fundraising">Fundraising Update</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Update Content</Label>
              <Textarea
                id="content"
                placeholder="Share your progress, achievements, challenges, and upcoming plans..."
                value={updateData.content}
                onChange={(e) => setUpdateData(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                required
              />
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">Key Metrics (Optional)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="revenue">Monthly Revenue</Label>
                  <Input
                    id="revenue"
                    type="number"
                    placeholder="0"
                    value={updateData.metrics.revenue}
                    onChange={(e) => setUpdateData(prev => ({
                      ...prev,
                      metrics: { ...prev.metrics, revenue: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="burn_rate">Monthly Burn Rate</Label>
                  <Input
                    id="burn_rate"
                    type="number"
                    placeholder="0"
                    value={updateData.metrics.burn_rate}
                    onChange={(e) => setUpdateData(prev => ({
                      ...prev,
                      metrics: { ...prev.metrics, burn_rate: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="runway">Runway (months)</Label>
                  <Input
                    id="runway"
                    type="number"
                    placeholder="0"
                    value={updateData.metrics.runway}
                    onChange={(e) => setUpdateData(prev => ({
                      ...prev,
                      metrics: { ...prev.metrics, runway: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team_size">Team Size</Label>
                  <Input
                    id="team_size"
                    type="number"
                    placeholder="0"
                    value={updateData.metrics.team_size}
                    onChange={(e) => setUpdateData(prev => ({
                      ...prev,
                      metrics: { ...prev.metrics, team_size: e.target.value }
                    }))}
                  />
                </div>
              </div>
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
