
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, RefreshCw, FileSpreadsheet, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface CompanyUpdatesProps {
  companyId: string;
}

interface Update {
  id: string;
  company_id: string;
  submitted_by: string;
  submitted_at: string;
  arr: number | null;
  mrr: number | null;
  burn_rate: number | null;
  runway: number | null;
  headcount: number | null;
  churn: number | null;
  raise_status: string | null;
  raise_target_amount: number | null;
  comments: string | null;
  requested_intros: string | null;
  deck_url: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

const CompanyUpdates: React.FC<CompanyUpdatesProps> = ({ companyId }) => {
  const { data: updates, isLoading, error, refetch } = useQuery({
    queryKey: ['company-updates', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('founder_updates')
        .select(`
          *,
          user:submitted_by (id, name, email)
        `)
        .eq('company_id', companyId)
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to handle the nested user object properly
      const transformedData = data?.map(update => ({
        ...update,
        user: Array.isArray(update.user) && update.user.length > 0 ? update.user[0] : null
      })) || [];
      
      return transformedData as Update[];
    },
    enabled: !!companyId,
  });
  
  const getRaiseStatusColor = (status: string | null) => {
    switch (status) {
      case 'Not Raising': return 'bg-gray-100 text-gray-800';
      case 'Preparing': return 'bg-blue-100 text-blue-800';
      case 'Raising': return 'bg-green-100 text-green-800';
      case 'Closing': return 'bg-yellow-100 text-yellow-800';
      case 'Closed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load company updates. Please try again.
        </AlertDescription>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-2">
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </Alert>
    );
  }
  
  if (!updates || updates.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Updates Available</h3>
          <p className="text-muted-foreground">
            There are no founder updates for this company yet.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Founder Updates</h3>
        <Badge className="text-xs" variant="outline">
          {updates.length} update{updates.length !== 1 ? 's' : ''}
        </Badge>
      </div>
      
      <div className="space-y-4">
        {updates.map((update) => (
          <Card key={update.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">
                    Update on {format(new Date(update.submitted_at), 'MMMM d, yyyy')}
                  </CardTitle>
                  <CardDescription>
                    From {update.user?.name || 'Unknown User'}
                  </CardDescription>
                </div>
                {update.raise_status && (
                  <Badge className={getRaiseStatusColor(update.raise_status)}>
                    {update.raise_status}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {update.arr !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground">ARR</p>
                    <p className="text-lg font-medium">${update.arr.toLocaleString()}</p>
                  </div>
                )}
                
                {update.mrr !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground">MRR</p>
                    <p className="text-lg font-medium">${update.mrr.toLocaleString()}</p>
                  </div>
                )}
                
                {update.burn_rate !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Burn</p>
                    <p className="text-lg font-medium">${update.burn_rate.toLocaleString()}</p>
                  </div>
                )}
                
                {update.headcount !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground">Team Size</p>
                    <p className="text-lg font-medium">{update.headcount}</p>
                  </div>
                )}
              </div>
              
              {update.comments && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-1">Comments</p>
                  <p className="text-sm">{update.comments}</p>
                </div>
              )}
              
              {update.requested_intros && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-1">Requested Introductions</p>
                  <p className="text-sm">{update.requested_intros}</p>
                </div>
              )}
              
              {update.raise_target_amount && update.raise_status && update.raise_status !== 'Not Raising' && (
                <div className="pt-2 flex gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Target Amount</p>
                    <p className="text-sm font-medium">${update.raise_target_amount.toLocaleString()}</p>
                  </div>
                  
                  {update.deck_url && (
                    <div className="ml-auto">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(update.deck_url!, '_blank')}
                      >
                        View Deck <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CompanyUpdates;
