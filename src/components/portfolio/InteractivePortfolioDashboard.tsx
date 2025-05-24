
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Target,
  DollarSign,
  Users,
  Activity,
  Filter,
  RefreshCw,
  Download
} from 'lucide-react';
import EnhancedLineChart from '@/components/charts/EnhancedLineChart';
import EnhancedBarChart from '@/components/charts/EnhancedBarChart';
import EnhancedPieChart from '@/components/charts/EnhancedPieChart';
import MetricsCharts from '@/components/company/MetricsCharts';

interface DashboardFilters {
  sector: string;
  stage: string;
  riskLevel: string;
  timeRange: string;
}

interface CompanyMetrics {
  id: string;
  name: string;
  sector: string;
  stage: string;
  arr: number;
  growth: number;
  burnRate: number;
  runway: number;
  healthScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  lastUpdated: string;
}

interface PortfolioSummary {
  totalCompanies: number;
  totalARR: number;
  avgGrowthRate: number;
  avgHealthScore: number;
  companiesAtRisk: number;
  topPerformers: CompanyMetrics[];
  underPerformers: CompanyMetrics[];
}

const InteractivePortfolioDashboard: React.FC = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<DashboardFilters>({
    sector: 'all',
    stage: 'all',
    riskLevel: 'all',
    timeRange: '12m'
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch portfolio data with real-time updates
  const { 
    data: portfolioData, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['interactive-portfolio-dashboard', user?.id, filters, refreshKey],
    queryFn: async () => {
      console.log('Fetching interactive portfolio data...');
      
      // Fetch companies
      let companiesQuery = supabase
        .from('companies')
        .select('*')
        .order('name');

      if (filters.sector !== 'all') {
        companiesQuery = companiesQuery.eq('sector', filters.sector);
      }
      if (filters.stage !== 'all') {
        companiesQuery = companiesQuery.eq('stage', filters.stage);
      }

      const { data: companies, error: companiesError } = await companiesQuery;
      if (companiesError) throw companiesError;

      // Fetch latest updates
      const { data: updates, error: updatesError } = await supabase
        .from('founder_updates')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (updatesError) throw updatesError;

      // Fetch metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('metrics')
        .select('*')
        .order('date', { ascending: false });

      if (metricsError) throw metricsError;

      // Process data
      const updatesByCompany = updates.reduce((acc: Record<string, any>, update) => {
        if (!acc[update.company_id] || new Date(update.submitted_at) > new Date(acc[update.company_id].submitted_at)) {
          acc[update.company_id] = update;
        }
        return acc;
      }, {});

      const metricsByCompany = metricsData.reduce((acc: Record<string, Record<string, any>>, metric) => {
        if (!acc[metric.company_id]) {
          acc[metric.company_id] = {};
        }
        const numericValue = Number(metric.value) || 0;
        const dateKey = `${metric.metric_name}_date`;
        
        if (!acc[metric.company_id][metric.metric_name] || 
            new Date(metric.date) > new Date(acc[metric.company_id][dateKey] || '1970-01-01')) {
          acc[metric.company_id][metric.metric_name] = numericValue;
          acc[metric.company_id][dateKey] = metric.date;
        }
        return acc;
      }, {});

      // Calculate enhanced metrics for each company
      const companyMetrics: CompanyMetrics[] = companies.map(company => {
        const latestUpdate = updatesByCompany[company.id];
        const companyMetricsData = metricsByCompany[company.id] || {};
        
        const arr = companyMetricsData.arr || latestUpdate?.arr || company.arr || 0;
        const burnRate = companyMetricsData.burn_rate || latestUpdate?.burn_rate || company.burn_rate || 0;
        const growth = latestUpdate?.growth || 0;
        const runway = latestUpdate?.runway || company.runway || 0;
        
        // Enhanced health score calculation
        let healthScore = 50;
        if (growth > 30) healthScore += 25;
        else if (growth > 15) healthScore += 15;
        else if (growth > 0) healthScore += 5;
        else if (growth < -10) healthScore -= 25;
        else if (growth < 0) healthScore -= 15;
        
        const burnMultiple = arr > 0 && burnRate > 0 ? burnRate / (arr / 12) : 0;
        if (burnMultiple > 0 && burnMultiple < 1.5) healthScore += 20;
        else if (burnMultiple < 2.5) healthScore += 10;
        else if (burnMultiple > 4) healthScore -= 20;
        else if (burnMultiple > 3) healthScore -= 10;
        
        if (runway > 18) healthScore += 15;
        else if (runway > 12) healthScore += 10;
        else if (runway < 6) healthScore -= 25;
        else if (runway < 9) healthScore -= 15;

        healthScore = Math.max(0, Math.min(100, healthScore));
        
        const riskLevel: 'Low' | 'Medium' | 'High' = 
          healthScore > 75 ? 'Low' : 
          healthScore > 50 ? 'Medium' : 'High';

        return {
          id: company.id,
          name: company.name,
          sector: company.sector || 'Other',
          stage: company.stage || 'Unknown',
          arr,
          growth,
          burnRate,
          runway,
          healthScore,
          riskLevel,
          lastUpdated: latestUpdate?.submitted_at || company.updated_at || 'Never'
        };
      });

      // Apply risk level filter
      const filteredCompanies = filters.riskLevel === 'all' 
        ? companyMetrics 
        : companyMetrics.filter(company => company.riskLevel === filters.riskLevel);

      // Calculate portfolio summary
      const totalCompanies = filteredCompanies.length;
      const totalARR = filteredCompanies.reduce((sum, company) => sum + company.arr, 0);
      const avgGrowthRate = filteredCompanies.length > 0 
        ? filteredCompanies.reduce((sum, company) => sum + company.growth, 0) / filteredCompanies.length 
        : 0;
      const avgHealthScore = filteredCompanies.length > 0 
        ? filteredCompanies.reduce((sum, company) => sum + company.healthScore, 0) / filteredCompanies.length 
        : 0;
      const companiesAtRisk = filteredCompanies.filter(company => company.riskLevel === 'High').length;
      
      const topPerformers = filteredCompanies
        .filter(company => company.healthScore > 70)
        .sort((a, b) => b.healthScore - a.healthScore)
        .slice(0, 5);
        
      const underPerformers = filteredCompanies
        .filter(company => company.healthScore < 50)
        .sort((a, b) => a.healthScore - b.healthScore)
        .slice(0, 5);

      const portfolioSummary: PortfolioSummary = {
        totalCompanies,
        totalARR,
        avgGrowthRate,
        avgHealthScore,
        companiesAtRisk,
        topPerformers,
        underPerformers
      };

      return {
        companies: filteredCompanies,
        summary: portfolioSummary,
        sectors: [...new Set(companyMetrics.map(c => c.sector))],
        stages: [...new Set(companyMetrics.map(c => c.stage))]
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!user
  });

  // Format currency helper
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  // Generate chart data for trends
  const trendChartData = useMemo(() => {
    if (!portfolioData?.companies) return [];
    
    const sectors = portfolioData.sectors;
    return sectors.map(sector => {
      const sectorCompanies = portfolioData.companies.filter(c => c.sector === sector);
      const totalARR = sectorCompanies.reduce((sum, c) => sum + c.arr, 0);
      const avgGrowth = sectorCompanies.length > 0 
        ? sectorCompanies.reduce((sum, c) => sum + c.growth, 0) / sectorCompanies.length 
        : 0;
      
      return {
        sector,
        arr: totalARR,
        growth: avgGrowth,
        companies: sectorCompanies.length
      };
    });
  }, [portfolioData]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  const handleExport = () => {
    if (!portfolioData?.companies) return;
    
    const csvContent = [
      ['Company', 'Sector', 'Stage', 'ARR', 'Growth Rate', 'Health Score', 'Risk Level', 'Burn Rate', 'Runway'].join(','),
      ...portfolioData.companies.map(company => [
        company.name,
        company.sector,
        company.stage,
        company.arr,
        company.growth,
        company.healthScore,
        company.riskLevel,
        company.burnRate,
        company.runway
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading || !portfolioData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { companies, summary } = portfolioData;

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time insights and analytics for your portfolio companies
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filters.sector} onValueChange={(value) => setFilters(prev => ({ ...prev, sector: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {portfolioData.sectors.map(sector => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.stage} onValueChange={(value) => setFilters(prev => ({ ...prev, stage: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {portfolioData.stages.map(stage => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.riskLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, riskLevel: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="Low">Low Risk</SelectItem>
                <SelectItem value="Medium">Medium Risk</SelectItem>
                <SelectItem value="High">High Risk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.timeRange} onValueChange={(value) => setFilters(prev => ({ ...prev, timeRange: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="12m">Last 12 Months</SelectItem>
                <SelectItem value="24m">Last 24 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.avgHealthScore.toFixed(0)}/100
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.avgHealthScore > 70 ? 'Excellent' : 
               summary.avgHealthScore > 50 ? 'Good' : 'Needs Attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ARR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalARR)}</div>
            <p className="text-xs text-muted-foreground">
              Across {summary.totalCompanies} companies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Growth</CardTitle>
            {summary.avgGrowthRate >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.avgGrowthRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.avgGrowthRate > 15 ? 'Strong growth' : 
               summary.avgGrowthRate > 0 ? 'Positive' : 'Declining'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies at Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {summary.companiesAtRisk}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Distribution by Sector</CardTitle>
                <CardDescription>ARR distribution across sectors</CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedBarChart
                  data={trendChartData}
                  bars={[
                    {
                      dataKey: 'arr',
                      color: '#3B82F6',
                      label: 'Total ARR',
                    }
                  ]}
                  xAxisKey="sector"
                  height={300}
                  formatValue={formatCurrency}
                  showGrid={true}
                  showLegend={false}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth vs ARR</CardTitle>
                <CardDescription>Performance correlation analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedLineChart
                  data={trendChartData}
                  lines={[
                    {
                      dataKey: 'growth',
                      color: '#10B981',
                      label: 'Avg Growth %',
                    }
                  ]}
                  xAxisKey="sector"
                  height={300}
                  formatValue={(value) => `${value}%`}
                  showGrid={true}
                  showLegend={false}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Companies with highest health scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {summary.topPerformers.map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{company.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {company.sector} • {formatCurrency(company.arr)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {company.healthScore.toFixed(0)}/100
                        </div>
                        <Badge variant="default" className="text-xs">
                          {company.growth.toFixed(1)}% growth
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attention Required</CardTitle>
                <CardDescription>Companies needing immediate focus</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {summary.underPerformers.map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{company.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {company.sector} • {formatCurrency(company.arr)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">
                          {company.healthScore.toFixed(0)}/100
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          {company.growth.toFixed(1)}% growth
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription>Portfolio risk assessment breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedPieChart
                data={[
                  { 
                    risk: 'Low Risk', 
                    count: companies.filter(c => c.riskLevel === 'Low').length,
                    percentage: (companies.filter(c => c.riskLevel === 'Low').length / companies.length) * 100
                  },
                  { 
                    risk: 'Medium Risk', 
                    count: companies.filter(c => c.riskLevel === 'Medium').length,
                    percentage: (companies.filter(c => c.riskLevel === 'Medium').length / companies.length) * 100
                  },
                  { 
                    risk: 'High Risk', 
                    count: companies.filter(c => c.riskLevel === 'High').length,
                    percentage: (companies.filter(c => c.riskLevel === 'High').length / companies.length) * 100
                  }
                ]}
                dataKey="count"
                nameKey="risk"
                colors={['#10B981', '#F59E0B', '#EF4444']}
                height={350}
                formatValue={(value) => `${value} companies`}
                showLegend={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Insights & Recommendations</CardTitle>
              <CardDescription>AI-powered portfolio analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary.companiesAtRisk > 0 && (
                <div className="p-4 border-l-4 border-red-500 bg-red-50">
                  <h4 className="font-semibold text-red-800">High Priority</h4>
                  <p className="text-red-700">
                    {summary.companiesAtRisk} companies require immediate attention due to low health scores.
                  </p>
                </div>
              )}
              
              {summary.avgGrowthRate < 10 && (
                <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
                  <h4 className="font-semibold text-yellow-800">Growth Opportunity</h4>
                  <p className="text-yellow-700">
                    Portfolio average growth is below 10%. Consider growth acceleration strategies.
                  </p>
                </div>
              )}
              
              {summary.topPerformers.length > 0 && (
                <div className="p-4 border-l-4 border-green-500 bg-green-50">
                  <h4 className="font-semibold text-green-800">Success Stories</h4>
                  <p className="text-green-700">
                    {summary.topPerformers.length} companies are performing exceptionally well. 
                    Consider case studies and best practice sharing.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InteractivePortfolioDashboard;
