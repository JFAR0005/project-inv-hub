
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import PortfolioTable from '../PortfolioTable';

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
  const filteredCompanies = React.useMemo(() => {
    switch (activeFilter) {
      case 'needs-update':
        return companies.filter(c => c.needsUpdate);
      case 'raising':
        return companies.filter(c => c.isRaising);
      default:
        return companies;
    }
  }, [companies, activeFilter]);

  return (
    <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as typeof activeFilter)} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all" className="flex items-center gap-2">
          All Companies
          <Badge variant="secondary">{metrics.total}</Badge>
        </TabsTrigger>
        <TabsTrigger value="needs-update" className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Need Updates
          <Badge variant="destructive">{metrics.needingUpdates}</Badge>
        </TabsTrigger>
        <TabsTrigger value="raising" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Raising
          <Badge className="bg-green-500">{metrics.raising}</Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-4">
        <PortfolioTable companies={filteredCompanies} />
      </TabsContent>

      <TabsContent value="needs-update" className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-800 dark:text-red-400">Companies Requiring Attention</h3>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300">
            These companies haven't submitted updates in over 30 days. Consider reaching out to founders.
          </p>
        </div>
        <PortfolioTable companies={filteredCompanies} />
      </TabsContent>

      <TabsContent value="raising" className="space-y-4">
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-green-800 dark:text-green-400">Active Fundraising</h3>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">
            These companies are currently raising capital. Monitor progress and provide support.
          </p>
        </div>
        <PortfolioTable companies={filteredCompanies} />
      </TabsContent>
    </Tabs>
  );
};

export default PortfolioHealthTabs;
