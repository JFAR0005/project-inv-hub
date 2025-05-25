
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Building, Grid, List } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { usePortfolioHealth } from '@/hooks/usePortfolioHealth';
import PortfolioHealthTabs from './health/PortfolioHealthTabs';
import CompanyCardWithStatus from './CompanyCardWithStatus';
import { useOverdueUpdateChecker } from '@/hooks/useOverdueUpdateChecker';

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

const PortfolioHealthDashboard: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'needs-update' | 'raising'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  
  const { data: portfolioData, isLoading, error } = usePortfolioHealth();
  
  // Enable overdue update checking
  useOverdueUpdateChecker();

  const companies = portfolioData?.companies || [];
  const healthMetrics = React.useMemo(() => {
    if (!portfolioData) {
      return {
        total: 0,
        needingUpdates: 0,
        raising: 0,
        healthy: 0,
        percentageNeedingUpdates: 0,
        percentageRaising: 0,
      };
    }

    return {
      total: portfolioData.totalCompanies,
      needingUpdates: portfolioData.companiesNeedingUpdate,
      raising: portfolioData.companiesRaising,
      healthy: portfolioData.totalCompanies - portfolioData.companiesNeedingUpdate,
      percentageNeedingUpdates: portfolioData.totalCompanies > 0 ? Math.round((portfolioData.companiesNeedingUpdate / portfolioData.totalCompanies) * 100) : 0,
      percentageRaising: portfolioData.totalCompanies > 0 ? Math.round((portfolioData.companiesRaising / portfolioData.totalCompanies) * 100) : 0,
    };
  }, [portfolioData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Error Loading Portfolio</h3>
          <p className="text-muted-foreground">
            Failed to load portfolio data. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

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
    <div className="space-y-6">
      {/* Health Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Companies</CardDescription>
            <CardTitle className="text-3xl">{healthMetrics.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Active portfolio</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Need Updates</CardDescription>
            <CardTitle className="text-3xl text-red-600">{healthMetrics.needingUpdates}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">
                {healthMetrics.percentageNeedingUpdates}% of portfolio
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Actively Raising</CardDescription>
            <CardTitle className="text-3xl text-green-600">{healthMetrics.raising}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">
                {healthMetrics.percentageRaising}% of portfolio
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Healthy</CardDescription>
            <CardTitle className="text-3xl text-green-600">{healthMetrics.healthy}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Up to date</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4 mr-2" />
            Table
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4 mr-2" />
            Grid
          </Button>
        </div>
      </div>

      {/* Companies Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map(company => (
            <CompanyCardWithStatus key={company.id} company={company} />
          ))}
        </div>
      ) : (
        <PortfolioHealthTabs
          companies={companies}
          metrics={healthMetrics}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />
      )}

      {filteredCompanies.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Companies Found</h3>
            <p className="text-muted-foreground">
              {activeFilter === 'needs-update' 
                ? "All companies are up to date with their updates."
                : activeFilter === 'raising'
                ? "No companies are currently raising funds."
                : "No companies in your portfolio yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PortfolioHealthDashboard;
