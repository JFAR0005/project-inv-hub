
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface Company {
  id: string;
  name: string;
  sector: string;
  stage: string;
  location: string;
  arr?: number;
  mrr?: number;
  growth?: number;
  headcount?: number;
  runway?: number;
  burn_rate?: number;
  last_update?: string;
  logo_url?: string;
  raise_status?: string;
  needs_attention?: boolean;
}

interface EnhancedCompanyCardProps {
  company: Company;
}

const EnhancedCompanyCard: React.FC<EnhancedCompanyCardProps> = ({ company }) => {
  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'N/A';
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Seed': return 'bg-green-100 text-green-800';
      case 'Series A': return 'bg-blue-100 text-blue-800';
      case 'Series B': return 'bg-purple-100 text-purple-800';
      case 'Series C+': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRaiseStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    if (status.toLowerCase().includes('raising')) return 'bg-red-100 text-red-800';
    if (status.toLowerCase().includes('closed')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getRunwayStatus = (runway?: number) => {
    if (!runway) return null;
    if (runway < 6) return { color: 'text-red-600', icon: AlertTriangle, status: 'Critical' };
    if (runway < 12) return { color: 'text-yellow-600', icon: AlertTriangle, status: 'Warning' };
    return { color: 'text-green-600', icon: null, status: 'Healthy' };
  };

  const runwayStatus = getRunwayStatus(company.runway);

  return (
    <Card className={`hover:shadow-md transition-shadow ${company.needs_attention ? 'border-amber-200 bg-amber-50/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {company.logo_url && (
              <img 
                src={company.logo_url} 
                alt={`${company.name} logo`}
                className="h-10 w-10 rounded-full object-cover"
              />
            )}
            <div>
              <CardTitle className="text-lg">{company.name}</CardTitle>
              <CardDescription className="mt-1">
                <Badge variant="outline" className={getStageColor(company.stage)}>
                  {company.stage}
                </Badge>
              </CardDescription>
            </div>
          </div>
          {company.needs_attention && (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Sector</div>
            <div className="font-medium">{company.sector}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Location</div>
            <div className="font-medium">{company.location}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">ARR</div>
            <div className="font-semibold text-lg">{formatCurrency(company.arr)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Growth</div>
            <div className="flex items-center">
              {company.growth !== undefined ? (
                <>
                  {company.growth >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={`font-semibold ${company.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {company.growth}%
                  </span>
                </>
              ) : (
                <span className="font-semibold">N/A</span>
              )}
            </div>
          </div>
        </div>

        {company.runway && runwayStatus && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Runway</span>
            <div className={`flex items-center ${runwayStatus.color}`}>
              {runwayStatus.icon && <runwayStatus.icon className="h-3 w-3 mr-1" />}
              <span className="font-medium">{company.runway} months</span>
            </div>
          </div>
        )}

        {company.raise_status && (
          <div>
            <Badge className={getRaiseStatusColor(company.raise_status)}>
              {company.raise_status}
            </Badge>
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
            <span>
              {company.last_update 
                ? `Updated ${format(new Date(company.last_update), 'MMM d, yyyy')}`
                : 'No recent updates'
              }
            </span>
          </div>
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link to={`/company/${company.id}`}>
              View Details
              <ExternalLink className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedCompanyCard;
