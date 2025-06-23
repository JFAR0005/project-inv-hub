
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface HealthMetrics {
  total: number;
  needingUpdates: number;
  raising: number;
  healthy: number;
  percentageNeedingUpdates: number;
  percentageRaising: number;
}

interface PortfolioHealthTabsProps {
  companies: CompanyWithHealth[];
  metrics: HealthMetrics;
  activeFilter: 'all' | 'needs-update' | 'raising';
  setActiveFilter: (filter: 'all' | 'needs-update' | 'raising') => void;
}

const PortfolioHealthTabs: React.FC<PortfolioHealthTabsProps> = ({
  companies,
  metrics,
  activeFilter,
  setActiveFilter
}) => {
  const getFilteredCompanies = (filter: string) => {
    switch (filter) {
      case 'needs-update':
        return companies.filter(c => c.needsUpdate);
      case 'raising':
        return companies.filter(c => c.isRaising);
      default:
        return companies;
    }
  };

  const CompanyRow = ({ company }: { company: CompanyWithHealth }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <h3 className="font-semibold">{company.name}</h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
          {company.sector && <span>{company.sector}</span>}
          {company.stage && <span>{company.stage}</span>}
          <span>
            Last update: {company.latest_update 
              ? format(new Date(company.latest_update.submitted_at), 'MMM d, yyyy')
              : 'Never'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {company.needsUpdate && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Needs Update
          </Badge>
        )}
        {company.isRaising && (
          <Badge variant="default" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Raising
          </Badge>
        )}
        {!company.needsUpdate && !company.isRaising && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Building className="h-3 w-3" />
            Healthy
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as any)}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">
          All Companies ({metrics.total})
        </TabsTrigger>
        <TabsTrigger value="needs-update">
          Need Updates ({metrics.needingUpdates})
        </TabsTrigger>
        <TabsTrigger value="raising">
          Raising ({metrics.raising})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>All Portfolio Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getFilteredCompanies('all').map(company => (
                <CompanyRow key={company.id} company={company} />
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="needs-update" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Companies Needing Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getFilteredCompanies('needs-update').map(company => (
                <CompanyRow key={company.id} company={company} />
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="raising" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Companies Currently Raising</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getFilteredCompanies('raising').map(company => (
                <CompanyRow key={company.id} company={company} />
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default PortfolioHealthTabs;
