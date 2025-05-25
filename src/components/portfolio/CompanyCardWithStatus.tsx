
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Building, MapPin, TrendingUp, TrendingDown } from 'lucide-react';
import UpdateStatusBadge from './UpdateStatusBadge';

interface CompanyWithHealth {
  id: string;
  name: string;
  sector?: string;
  stage?: string;
  location?: string;
  arr?: number;
  latest_update?: {
    submitted_at: string;
    arr?: number;
    mrr?: number;
    raise_status?: string;
  };
  needsUpdate: boolean;
  isRaising: boolean;
  daysSinceUpdate: number;
}

interface CompanyCardWithStatusProps {
  company: CompanyWithHealth;
}

const CompanyCardWithStatus: React.FC<CompanyCardWithStatusProps> = ({ company }) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const getStageColor = (stage?: string) => {
    switch (stage?.toLowerCase()) {
      case 'seed': return 'bg-blue-100 text-blue-800';
      case 'series a': return 'bg-green-100 text-green-800';
      case 'series b': return 'bg-purple-100 text-purple-800';
      case 'series c': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRaiseStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'actively fundraising': return 'bg-red-100 text-red-800';
      case 'preparing to raise': return 'bg-yellow-100 text-yellow-800';
      case 'not raising': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`h-full transition-shadow hover:shadow-md ${company.needsUpdate ? 'border-red-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            <Link 
              to={`/company/${company.id}`}
              className="hover:underline flex items-center gap-2"
            >
              <Building className="h-4 w-4" />
              {company.name}
            </Link>
          </CardTitle>
          <UpdateStatusBadge 
            lastUpdateDate={company.latest_update?.submitted_at}
            className="text-xs"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {company.stage && (
            <Badge className={getStageColor(company.stage)} variant="outline">
              {company.stage}
            </Badge>
          )}
          {company.latest_update?.raise_status && (
            <Badge className={getRaiseStatusColor(company.latest_update.raise_status)} variant="outline">
              {company.latest_update.raise_status}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {company.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {company.location}
          </div>
        )}
        
        {company.sector && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Sector:</span> {company.sector}
          </div>
        )}
        
        {company.arr && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">ARR:</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{formatCurrency(company.arr)}</span>
              {company.latest_update?.arr && company.latest_update.arr !== company.arr && (
                <div className="flex items-center">
                  {company.latest_update.arr > company.arr ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="pt-2 border-t">
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link to={`/company/${company.id}`} className="flex items-center gap-2">
              View Details
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyCardWithStatus;
