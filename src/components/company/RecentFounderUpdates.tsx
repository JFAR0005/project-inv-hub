
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database } from '@/integrations/supabase/types';
import { Calendar, DollarSign, MessageSquare, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

type FounderUpdate = Database['public']['Tables']['founder_updates']['Row'];

interface RecentFounderUpdatesProps {
  updates: FounderUpdate[];
  isLoading: boolean;
  error: string | null;
  companyId: string;
}

const RecentFounderUpdates: React.FC<RecentFounderUpdatesProps> = ({ 
  updates, 
  isLoading, 
  error, 
  companyId 
}) => {
  const navigate = useNavigate();

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const truncateText = (text: string | null, maxLength: number = 100) => {
    if (!text) return 'No comments provided';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const getRaiseStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">Not specified</Badge>;
    
    const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'actively_raising': 'default',
      'not_raising': 'secondary',
      'planning_to_raise': 'outline',
      'recently_closed': 'destructive'
    };
    
    return (
      <Badge variant={statusVariants[status] || 'outline'}>
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Founder Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Founder Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Recent Founder Updates
        </CardTitle>
      </CardHeader>
      <CardContent>
        {updates.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Updates Yet</h3>
            <p>No founder updates have been submitted for this company.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <div key={update.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(update.submitted_at), 'MMM d, yyyy')}
                  </div>
                  {getRaiseStatusBadge(update.raise_status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">ARR:</span>
                    <span className="text-sm">{formatCurrency(update.arr)}</span>
                  </div>
                  
                  {update.mrr && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">MRR:</span>
                      <span className="text-sm">{formatCurrency(update.mrr)}</span>
                    </div>
                  )}
                </div>
                
                {update.comments && (
                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground mb-1">Commentary:</p>
                    <p className="text-sm">{truncateText(update.comments)}</p>
                  </div>
                )}
                
                {(update.burn_rate || update.runway || update.headcount) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                    {update.burn_rate && (
                      <span>Burn: {formatCurrency(update.burn_rate)}/mo</span>
                    )}
                    {update.runway && (
                      <span>Runway: {update.runway} months</span>
                    )}
                    {update.headcount && (
                      <span>Team: {update.headcount} people</span>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {updates.length > 0 && (
              <div className="flex justify-end pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/company-profile/${companyId}?tab=updates`)}
                  className="flex items-center gap-1"
                >
                  View All Updates
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentFounderUpdates;
