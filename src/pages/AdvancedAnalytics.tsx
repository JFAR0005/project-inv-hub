
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BarChart3, TrendingUp, Zap } from 'lucide-react';
import AdvancedPortfolioAnalytics from '@/components/portfolio/AdvancedPortfolioAnalytics';
import PortfolioFilters from '@/components/portfolio/PortfolioFilters';
import PortfolioMetricsComparison from '@/components/portfolio/PortfolioMetricsComparison';

interface FilterState {
  search: string;
  sectors: string[];
  stages: string[];
  arrRange: [number, number];
  mrrRange: [number, number];
  runwayRange: [number, number];
  headcountRange: [number, number];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const AdvancedAnalytics = () => {
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sectors: [],
    stages: [],
    arrRange: [0, 10000000],
    mrrRange: [0, 1000000],
    runwayRange: [0, 60],
    headcountRange: [0, 500],
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Calculate available filter options
  const availableOptions = useMemo(() => {
    if (!companies) return {
      sectors: [],
      stages: [],
      maxARR: 10000000,
      maxMRR: 1000000,
      maxRunway: 60,
      maxHeadcount: 500
    };

    const sectors = [...new Set(companies.map(c => c.sector).filter(Boolean))];
    const stages = [...new Set(companies.map(c => c.stage).filter(Boolean))];
    const maxARR = Math.max(...companies.map(c => c.arr || 0), 10000000);
    const maxMRR = Math.max(...companies.map(c => c.mrr || 0), 1000000);
    const maxRunway = Math.max(...companies.map(c => c.runway || 0), 60);
    const maxHeadcount = Math.max(...companies.map(c => c.headcount || 0), 500);

    return { sectors, stages, maxARR, maxMRR, maxRunway, maxHeadcount };
  }, [companies]);

  // Filter and sort companies
  const filteredCompanies = useMemo(() => {
    if (!companies) return [];

    let filtered = companies.filter(company => {
      // Search filter
      if (filters.search && !company.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Sector filter
      if (filters.sectors.length > 0 && !filters.sectors.includes(company.sector || '')) {
        return false;
      }

      // Stage filter
      if (filters.stages.length > 0 && !filters.stages.includes(company.stage || '')) {
        return false;
      }

      // Range filters
      const arr = company.arr || 0;
      const mrr = company.mrr || 0;
      const runway = company.runway || 0;
      const headcount = company.headcount || 0;

      if (arr < filters.arrRange[0] || arr > filters.arrRange[1]) return false;
      if (mrr < filters.mrrRange[0] || mrr > filters.mrrRange[1]) return false;
      if (runway < filters.runwayRange[0] || runway > filters.runwayRange[1]) return false;
      if (headcount < filters.headcountRange[0] || headcount > filters.headcountRange[1]) return false;

      return true;
    });

    // Sort companies
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'arr':
          aValue = a.arr || 0;
          bValue = b.arr || 0;
          break;
        case 'mrr':
          aValue = a.mrr || 0;
          bValue = b.mrr || 0;
          break;
        case 'runway':
          aValue = a.runway || 0;
          bValue = b.runway || 0;
          break;
        case 'headcount':
          aValue = a.headcount || 0;
          bValue = b.headcount || 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
        default:
          aValue = a.name || '';
          bValue = b.name || '';
      }

      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return filters.sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const comparison = aValue - bValue;
        return filters.sortOrder === 'asc' ? comparison : -comparison;
      }
    });

    return filtered;
  }, [companies, filters]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="w-8 h-8" />
          Advanced Portfolio Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Deep insights into your portfolio performance with interactive charts and advanced filtering
        </p>
      </div>

      <div className="space-y-6">
        {/* Portfolio Filters */}
        <PortfolioFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableOptions={availableOptions}
          isExpanded={filtersExpanded}
          onToggleExpanded={() => setFiltersExpanded(!filtersExpanded)}
        />

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Portfolio Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Advanced Analytics
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Company Comparison
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {filteredCompanies.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-semibold mb-2">No companies match your filters</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters to see more companies in your portfolio.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Filtered Companies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{filteredCompanies.length}</div>
                    <p className="text-xs text-muted-foreground">
                      of {companies?.length || 0} total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total ARR</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${(filteredCompanies.reduce((sum, c) => sum + (c.arr || 0), 0) / 1000000).toFixed(1)}M
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Across filtered portfolio
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg Runway</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {filteredCompanies.length > 0 
                        ? (filteredCompanies.reduce((sum, c) => sum + (c.runway || 0), 0) / filteredCompanies.length).toFixed(1)
                        : 0
                      }m
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Average runway
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <AdvancedPortfolioAnalytics companies={filteredCompanies} />
          </TabsContent>

          <TabsContent value="comparison">
            <PortfolioMetricsComparison companies={filteredCompanies} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
