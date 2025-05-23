import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { TrendingUp, DollarSign, Users, Calendar, Upload } from 'lucide-react';
import { UserRole } from '@/context/AuthContext';

export default function SubmitUpdate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { sendNotification } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    arr: '',
    mrr: '',
    burn_rate: '',
    runway: '',
    headcount: '',
    churn: '',
    raise_status: '',
    raise_target_amount: '',
    comments: '',
    requested_intros: '',
    deck_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.companyId) {
      toast('Error: No company associated with user');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit the update
      const { data: updateData, error } = await supabase
        .from('founder_updates')
        .insert({
          company_id: user.companyId,
          submitted_by: user.id,
          arr: formData.arr ? parseFloat(formData.arr) : null,
          mrr: formData.mrr ? parseFloat(formData.mrr) : null,
          burn_rate: formData.burn_rate ? parseFloat(formData.burn_rate) : null,
          runway: formData.runway ? parseFloat(formData.runway) : null,
          headcount: formData.headcount ? parseInt(formData.headcount) : null,
          churn: formData.churn ? parseFloat(formData.churn) : null,
          raise_status: formData.raise_status || null,
          raise_target_amount: formData.raise_target_amount ? parseFloat(formData.raise_target_amount) : null,
          comments: formData.comments || null,
          requested_intros: formData.requested_intros || null,
          deck_url: formData.deck_url || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Get company name for notification
      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('id', user.companyId)
        .single();

      // Send notification
      await sendNotification({
        type: 'update_submitted',
        company_id: user.companyId,
        data: {
          company_name: company?.name || 'Unknown Company',
          submitter_name: user.name || user.email || 'Unknown User',
          update_link: `${window.location.origin}/companies/${user.companyId}`
        }
      });

      toast('Update submitted successfully!', {
        description: 'Your update has been sent to your assigned partner.'
      });

      // Reset form
      setFormData({
        arr: '',
        mrr: '',
        burn_rate: '',
        runway: '',
        headcount: '',
        churn: '',
        raise_status: '',
        raise_target_amount: '',
        comments: '',
        requested_intros: '',
        deck_url: ''
      });

    } catch (error) {
      console.error('Error submitting update:', error);
      toast('Failed to submit update', {
        description: error.message || 'Please try again'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute requiredRoles={['founder']}>
      <Layout>
        <div className="container mx-auto py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Submit Company Update</h1>
            <p className="text-muted-foreground mt-1">
              Share your latest metrics and progress with your investment team
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Financial Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Metrics
                  </CardTitle>
                  <CardDescription>Revenue and financial performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="arr">ARR ($)</Label>
                      <Input
                        id="arr"
                        type="number"
                        placeholder="250000"
                        value={formData.arr}
                        onChange={(e) => setFormData({...formData, arr: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="mrr">MRR ($)</Label>
                      <Input
                        id="mrr"
                        type="number"
                        placeholder="20000"
                        value={formData.mrr}
                        onChange={(e) => setFormData({...formData, mrr: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="burn_rate">Burn Rate ($)</Label>
                      <Input
                        id="burn_rate"
                        type="number"
                        placeholder="15000"
                        value={formData.burn_rate}
                        onChange={(e) => setFormData({...formData, burn_rate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="runway">Runway (months)</Label>
                      <Input
                        id="runway"
                        type="number"
                        placeholder="18"
                        value={formData.runway}
                        onChange={(e) => setFormData({...formData, runway: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="churn">Churn Rate (%)</Label>
                    <Input
                      id="churn"
                      type="number"
                      step="0.1"
                      placeholder="2.5"
                      value={formData.churn}
                      onChange={(e) => setFormData({...formData, churn: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Team & Operations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team & Operations
                  </CardTitle>
                  <CardDescription>Team size and operational metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="headcount">Total Headcount</Label>
                    <Input
                      id="headcount"
                      type="number"
                      placeholder="12"
                      value={formData.headcount}
                      onChange={(e) => setFormData({...formData, headcount: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fundraising */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Fundraising Status
                </CardTitle>
                <CardDescription>Current fundraising activities and needs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="raise_status">Raise Status</Label>
                    <Select value={formData.raise_status} onValueChange={(value) => setFormData({...formData, raise_status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Raising">Not Raising</SelectItem>
                        <SelectItem value="Preparing">Preparing</SelectItem>
                        <SelectItem value="Raising">Raising</SelectItem>
                        <SelectItem value="Closing">Closing</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="raise_target_amount">Target Amount ($)</Label>
                    <Input
                      id="raise_target_amount"
                      type="number"
                      placeholder="1000000"
                      value={formData.raise_target_amount}
                      onChange={(e) => setFormData({...formData, raise_target_amount: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="deck_url">Pitch Deck URL</Label>
                  <Input
                    id="deck_url"
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={formData.deck_url}
                    onChange={(e) => setFormData({...formData, deck_url: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>Comments, requests, and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="comments">Comments & Updates</Label>
                  <Textarea
                    id="comments"
                    placeholder="Share any key updates, challenges, or wins..."
                    rows={4}
                    value={formData.comments}
                    onChange={(e) => setFormData({...formData, comments: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="requested_intros">Requested Introductions</Label>
                  <Textarea
                    id="requested_intros"
                    placeholder="Any specific introductions or help you need..."
                    rows={3}
                    value={formData.requested_intros}
                    onChange={(e) => setFormData({...formData, requested_intros: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Submit Update
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
