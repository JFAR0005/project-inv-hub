
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { format, isAfter, subDays } from 'date-fns';

export interface CompanyCardData {
  id: string;
  name: string;
  sector: string | null;
  stage: string | null;
  latest_arr: number | null;
  latest_mrr: number | null;
  latest_runway: number | null;
  latest_headcount: number | null;
  latest_growth: number | null;
  raise_status: string | null;
  last_update: string | null;
  needs_attention: boolean;
}

interface CompanyCardProps {
  company: CompanyCardData;
  showSensitiveData?: boolean;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, showSensitiveData = false }) => {
  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const getRunwayColor = (runway: number | null) => {
    if (runway === null) return 'bg-gray-200';
    if (runway < 6) return 'bg-red-500';
    if (runway < 12) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRaiseStatusBadge = (status: string | null) => {
    switch (status) {
      case 'Raising':
        return <Badge variant="destructive">Raising</Badge>;
      case 'Closed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Closed</Badge>;
      case 'Planning':
        return <Badge variant="secondary">Planning</Badge>;
      default:
        return status ? <Badge variant="outline">{status}</Badge> : null;
    }
  };

  return (
    <Card className={`relative transition-all hover:shadow-md ${company.needs_attention ? 'border-amber-200 bg-amber-50/30' : ''}`}>
      {company.needs_attention && (
        <div className="absolute top-2 right-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{company.name}</CardTitle>
            <CardDescription className="mt-1">
              <div className="flex items-center gap-2">
                {company.sector && (
                  <Badge variant="outline">{company.sector}</Badge>
                )}
                {company.stage && (
                  <Badge variant="secondary">{company.stage}</Badge>
                )}
              </div>
            </CardDescription>
          </div>
          {company.raise_status && getRaiseStatusBadge(company.raise_status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {showSensitiveData && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">ARR</div>
              <div className="font-semibold">{formatCurrency(company.latest_arr)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">MRR</div>
              <div className="font-semibold">{formatCurrency(company.latest_mrr)}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Headcount</div>
            <div className="font-semibold">{company.latest_headcount || 'N/A'}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Growth</div>
            <div className="flex items-center">
              {company.latest_growth !== null ? (
                <>
                  {company.latest_growth >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={`font-semibold ${company.latest_growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {company.latest_growth}%
                  </span>
                </>
              ) : (
                <span className="font-semibold">N/A</span>
              )}
            </div>
          </div>
        </div>

        {showSensitiveData && company.latest_runway !== null && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Runway</span>
              <span>{company.latest_runway} months</span>
            </div>
            <Progress 
              value={(company.latest_runway / 18) * 100} 
              className={`h-2 ${getRunwayColor(company.latest_runway)}`}
            />
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              {company.last_update 
                ? `Updated ${format(new Date(company.last_update), 'MMM d, yyyy')}`
                : 'No updates'
              }
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/companies/${company.id}`}>
                View Details
                <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyCard;
