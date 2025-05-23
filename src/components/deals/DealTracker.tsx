
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, DollarSign, User, Building, Clock, FileText } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Deal = Database['public']['Tables']['deals']['Row'] & {
  companies?: Database['public']['Tables']['companies']['Row'];
  users?: Database['public']['Tables']['users']['Row'];
};

interface DealTrackerProps {
  deal: Deal;
  onEditDeal: (deal: Deal) => void;
  onOpenDD: (deal: Deal) => void;
}

const DealTracker: React.FC<DealTrackerProps> = ({ deal, onEditDeal, onOpenDD }) => {
  const getStageProgress = (stage: string) => {
    switch (stage) {
      case 'Discovery': return 20;
      case 'DD': return 40;
      case 'IC': return 60;
      case 'Funded': return 100;
      case 'Rejected': return 0;
      default: return 0;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Discovery': return 'bg-blue-500';
      case 'DD': return 'bg-yellow-500';
      case 'IC': return 'bg-purple-500';
      case 'Funded': return 'bg-green-500';
      case 'Rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const progress = getStageProgress(deal.stage);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{deal.companies?.name || 'Unknown Company'}</CardTitle>
          <Badge className={`${getStageColor(deal.stage)} text-white`}>
            {deal.stage}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <Building className="h-3 w-3" />
            {deal.companies?.sector || 'Unknown Sector'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(deal.created_at)}
          </span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Deal Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Deal Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-gray-600">Valuation</p>
                <p className="font-medium">{formatCurrency(deal.valuation_expectation)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-gray-600">Lead Partner</p>
                <p className="font-medium">{deal.users?.name || 'Unassigned'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-gray-600">Status</p>
              <Badge variant={deal.status === 'Active' ? 'default' : 'secondary'}>
                {deal.status}
              </Badge>
            </div>
            
            {deal.source && (
              <div>
                <p className="text-gray-600">Source</p>
                <p className="font-medium">{deal.source}</p>
              </div>
            )}
          </div>
        </div>

        {/* Company Info */}
        {deal.companies && (
          <div className="border-t pt-3">
            <p className="text-xs text-gray-600 mb-1">Company Details</p>
            <div className="flex justify-between text-sm">
              <span>{deal.companies.location || 'Unknown Location'}</span>
              <span className="text-gray-500">{deal.companies.stage || 'Unknown Stage'}</span>
            </div>
          </div>
        )}

        {/* Notes */}
        {deal.notes && (
          <div className="border-t pt-3">
            <p className="text-xs text-gray-600 mb-1">Notes</p>
            <p className="text-sm text-gray-700 line-clamp-2">{deal.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditDeal(deal)}
            className="flex-1"
          >
            Edit Deal
          </Button>
          {deal.stage === 'DD' && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onOpenDD(deal)}
              className="flex-1 flex items-center gap-1"
            >
              <FileText className="h-3 w-3" />
              DD Form
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DealTracker;
