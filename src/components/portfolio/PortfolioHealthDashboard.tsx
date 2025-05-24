
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, TrendingUp, Clock, CheckCircle, Filter } from 'lucide-react';
import { subDays, parseISO } from 'date-fns';
import PortfolioTable from './PortfolioTable';
import { UpdateFreshnessIndicator, RaiseStatusIndicator } from './PortfolioHealthIndicators';

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

const PortfolioHealthDashboard: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'needs-update' | 'raising'>('all');

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['portfolio-health'],
    queryFn: async () => {
      // Fetch companies
      const { data: companiesData, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // For each company, fetch its latest update
      const companiesWithUpdates = await Promise.all(
        (companiesData || []).map(async (company) => {
          const { data: updates } = await supabase
            .from('founder_updates')
            .select('submitted_at, arr, mrr, raise_status')
            .eq('company_id', company.id)
            .order('submitted_at', { ascending: false })
            .limit(1);
          
          const latestUpdate = updates && updates.length > 0 ? updates[0] : null;
          
          // Calculate health indicators
          const daysSinceUpdate = latestUpdate 
            ? Math.floor((new Date().getTime() - new Date(latestUpdate.submitted_at).getTime()) / (1000 * 60 * 60 * 24))
            : 999;
          
          const needsUpdate = !latestUpdate || daysSinceUpdate > 30;
          const isRaising = latestUpdate?.raise_status?.toLowerCase().includes('raising') || 
                           latestUpdate?.raise_status?.toLowerCase().includes('active') || false;
          
          return {
            ...company,
            latest_update: latestUpdate,
            needsUpdate,
            isRaising,
            daysSinceUpdate
          };
        })
      );
      
      return companiesWithUpdates;
    },
  });

  // Calculate health metrics
  const healthMetrics = useMemo(() => {
    const total = companies.length;
    const needingUpdates = companies.filter(c => c.needsUpdate).length;
    const raising = companies.filter(c => c.isRaising).length;
    const healthy = companies.filter(c => !c.needsUpdate && !c.isRaising).length;
    
    return {
      total,
      needingUpdates,
      raising,
      healthy,
      percentageNeedingUpdates: total ? Math.round((needingUpdates / total) * 100) : 0,
      percentageRaising: total ? Math.round((raising / total) * 100) : 0
    };
  }, [companies]);

  // Filter companies based on active filter
  const filteredCompanies = useMemo(() => {
    switch (activeFilter) {
      case 'needs-update':
        return companies.filter(c => c.needsUpdate);
      case 'raising':
        return companies.filter(c => c.isRaising);
      default:
        return companies;
    }
  }, [companies, activeFilter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthMetrics.total}</div>
            <p className="text-xs text-muted-foreground">Portfolio companies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Updates</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{healthMetrics.needingUpdates}</div>
            <p className="text-xs text-muted-foreground">
              {healthMetrics.percentageNeedingUpdates}% of portfolio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Raising</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{healthMetrics.raising}</div>
            <p className="text-xs text-muted-foreground">
              {healthMetrics.percentageRaising}% of portfolio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{healthMetrics.healthy}</div>
            <p className="text-xs text-muted-foreground">Up to date & not raising</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as typeof activeFilter)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All Companies
            <Badge variant="secondary">{healthMetrics.total}</Badge>
          </TabsTrigger>
          <TabsTrigger value="needs-update" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Need Updates
            <Badge variant="destructive">{healthMetrics.needingUpdates}</Badge>
          </TabsTrigger>
          <TabsTrigger value="raising" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Raising
            <Badge className="bg-green-500">{healthMetrics.raising}</Badge>
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
    </div>
  );
};

export default PortfolioHealthDashboard;
