
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, FileText, AlertCircle } from 'lucide-react';

interface FounderUpdate {
  id: string;
  company_id: string;
  submitted_by: string;
  arr: number | null;
  mrr: number | null;
  burn_rate: number | null;
  runway: number | null;
  headcount: number | null;
  churn: number | null;
  raise_status: string | null;
  raise_target_amount: number | null;
  requested_intros: string | null;
  comments: string | null;
  deck_url: string | null;
  submitted_at: string;
}

interface CompanyUpdatesProps {
  companyId: string;
}

const CompanyUpdates: React.FC<CompanyUpdatesProps> = ({ companyId }) => {
  const { user, hasPermission } = useAuth();
  const [updates, setUpdates] = useState<FounderUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchUpdates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('founder_updates')
        .select('*')
        .eq('company_id', companyId)
        .order('submitted_at', { ascending: false });
        
      if (error) throw error;
      
      setUpdates(data || []);
    } catch (err: any) {
      console.error('Error fetching updates:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (companyId) {
      fetchUpdates();
    }
  }, [companyId]);
  
  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    
    // Format with appropriate suffix (K, M, B) for readability
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    } else {
      return `$${value.toFixed(0)}`;
    }
  };
  
  const getRaiseStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    switch (status) {
      case 'Not Raising':
        return <Badge variant="outline">Not Raising</Badge>;
      case 'Planning':
        return <Badge variant="secondary">Planning</Badge>;
      case 'Raising':
        return <Badge variant="default">Raising</Badge>;
      case 'Closed':
        return <Badge variant="success">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-16" />
                ))}
              </div>
              <Skeleton className="h-20 mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertCircle className="mr-2" /> Error Loading Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Failed to load company updates: {error}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (updates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Updates Available</CardTitle>
          <CardDescription>
            No monthly updates have been submitted yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {updates.map((update) => (
        <Card key={update.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Update: {format(new Date(update.submitted_at), 'MMMM yyyy')}</CardTitle>
                <CardDescription>
                  Submitted on {format(new Date(update.submitted_at), 'MMM d, yyyy')}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {getRaiseStatusBadge(update.raise_status)}
                {update.deck_url && (
                  <a 
                    href={update.deck_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Deck
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">ARR</div>
                <div className="text-2xl font-bold">{formatCurrency(update.arr)}</div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">MRR</div>
                <div className="text-2xl font-bold">{formatCurrency(update.mrr)}</div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Runway</div>
                <div className="text-2xl font-bold">
                  {update.runway !== null ? `${update.runway} months` : 'N/A'}
                </div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Headcount</div>
                <div className="text-2xl font-bold">
                  {update.headcount !== null ? update.headcount : 'N/A'}
                </div>
              </div>
            </div>
            
            {update.comments && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Commentary</h4>
                <div className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-lg">
                  {update.comments}
                </div>
              </div>
            )}
            
            {/* Only show requested intros to venture team members */}
            {hasPermission('view:sensitive') && update.requested_intros && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Requested Introductions</h4>
                <div className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-lg">
                  {update.requested_intros}
                </div>
              </div>
            )}
            
            {/* Show fundraising details if applicable */}
            {update.raise_status === 'Raising' && update.raise_target_amount && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Fundraising Target</h4>
                <div className="text-sm bg-muted/30 p-3 rounded-lg">
                  {formatCurrency(update.raise_target_amount)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CompanyUpdates;
