
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Building } from 'lucide-react';
import { format } from 'date-fns';

interface CompanyWithHealth {
  id: string;
  name: string;
  sector?: string;
  stage?: string;
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
  const getStatusColor = () => {
    if (company.needsUpdate) return 'destructive';
    if (company.isRaising) return 'default';
    return 'secondary';
  };

  const getStatusIcon = () => {
    if (company.needsUpdate) return <AlertTriangle className="h-4 w-4" />;
    if (company.isRaising) return <TrendingUp className="h-4 w-4" />;
    return <Building className="h-4 w-4" />;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{company.name}</CardTitle>
          <Badge variant={getStatusColor()} className="flex items-center gap-1">
            {getStatusIcon()}
            {company.needsUpdate ? 'Needs Update' : 
             company.isRaising ? 'Raising' : 'Healthy'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {company.sector && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sector:</span>
              <span>{company.sector}</span>
            </div>
          )}
          {company.stage && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Stage:</span>
              <span>{company.stage}</span>
            </div>
          )}
          {company.arr && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ARR:</span>
              <span>${company.arr.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last Update:</span>
            <span>
              {company.latest_update 
                ? format(new Date(company.latest_update.submitted_at), 'MMM d')
                : 'Never'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyCardWithStatus;
