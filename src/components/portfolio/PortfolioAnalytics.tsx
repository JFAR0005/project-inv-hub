
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Download,
  AlertTriangle,
  Target,
  DollarSign,
  Users,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Cell, 
  ComposedChart, 
  Area, 
  AreaChart,
  Pie
} from 'recharts';
import { format, subMonths, startOfMonth } from 'date-fns';

interface PortfolioMetrics {
  totalCompanies: number;
  totalARR: number;
  avgGrowthRate: number;
  totalHeadcount: number;
  avgBurnMultiple: number;
  companiesRaising: number;
  portfolioHealthScore: number;
}

interface CompanyPerformance {
  id: string;
  name: string;
  sector: string;
  stage: string;
  arr: number;
  growth: number;
  burnMultiple: number;
  healthScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

interface SectorMetrics {
  sector: string;
  count: number;
  totalARR: number;
  avgGrowthRate: number;
  color: string;
}

interface TrendData {
  month: string;
  totalARR: number;
  avgGrowth: number;
  headcount: number;
}

const PortfolioAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [companyPerformance, setCompanyPerformance] = useState<CompanyPerformance[]>([]);
  const [sectorMetrics, setSectorMetrics] = useState<SectorMetrics[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  const sectorColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'partner' || user.role === 'lp')) {
      fetchPortfolioAnalytics();
    }
  }, [user]);

  const fetchPortfolioAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch companies and their latest updates
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*');

      if (companiesError) throw companiesError;

      const { data: updates, error: updatesError } = await supabase
        .from('founder_updates')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (updatesError) throw updatesError;

      // Process data for analytics
      const updatesByCompany = updates.reduce((acc: Record<string, any>, update) => {
        if (!acc[update.company_id] || new Date(update.submitted_at) > new Date(acc[update.company_id].submitted_at)) {
          acc[update.company_id] = update;
        }
        return acc;
      }, {});

      // Calculate company performance metrics
      const performanceData: CompanyPerformance[] = companies.map(company => {
        const latestUpdate = updatesByCompany[company.id];
        const arr = latestUpdate?.arr || company.arr || 0;
        const growth = latestUpdate?.growth || 0;
        const burnRate = latestUpdate?.burn_rate || company.burn_rate || 0;
        const burnMultiple = arr > 0 && burnRate > 0 ? burnRate / (arr / 12) : 0;
        
        // Calculate health score (0-100)
        let healthScore = 50; // Base score
        if (growth > 20) healthScore += 20;
        else if (growth > 10) healthScore += 10;
        else if (growth < 0) healthScore -= 20;
        
        if (burnMultiple > 0 && burnMultiple < 2) healthScore += 15;
        else if (burnMultiple > 4) healthScore -= 15;
        
        if (latestUpdate?.runway && latestUpdate.runway > 12) healthScore += 15;
        else if (latestUpdate?.runway && latestUpdate.runway < 6) healthScore -= 20;

        healthScore = Math.max(0, Math.min(100, healthScore));

        return {
          id: company.id,
          name: company.name,
          sector: company.sector || 'Other',
          stage: company.stage || 'Unknown',
          arr,
          growth,
          burnMultiple,
          healthScore,
          riskLevel: healthScore > 70 ? 'Low' : healthScore > 40 ? 'Medium' : 'High'
        };
      });

      setCompanyPerformance(performanceData);

      // Calculate portfolio-wide metrics
      const totalCompanies = companies.length;
      const totalARR = performanceData.reduce((sum, company) => sum + company.arr, 0);
      const companiesWithGrowth = performanceData.filter(c => c.growth !== 0);
      const avgGrowthRate = companiesWithGrowth.length > 0 
        ? companiesWithGrowth.reduce((sum, c) => sum + c.growth, 0) / companiesWithGrowth.length
        : 0;
      const totalHeadcount = companies.reduce((sum, company) => {
        const update = updatesByCompany[company.id];
        return sum + (update?.headcount || company.headcount || 0);
      }, 0);
      const avgBurnMultiple = performanceData
        .filter(c => c.burnMultiple > 0)
        .reduce((sum, c, _, arr) => sum + c.burnMultiple / arr.length, 0);
      const companiesRaising = updates.filter(u => u.raise_status === 'Raising').length;
      const portfolioHealthScore = performanceData.reduce((sum, c) => sum + c.healthScore, 0) / totalCompanies;

      setMetrics({
        totalCompanies,
        totalARR,
        avgGrowthRate,
        totalHeadcount,
        avgBurnMultiple,
        companiesRaising,
        portfolioHealthScore
      });

      // Calculate sector metrics
      const sectorData = performanceData.reduce((acc: Record<string, any>, company) => {
        const sector = company.sector;
        if (!acc[sector]) {
          acc[sector] = { sector, count: 0, totalARR: 0, growthSum: 0, growthCount: 0 };
        }
        acc[sector].count++;
        acc[sector].totalARR += company.arr;
        if (company.growth !== 0) {
          acc[sector].growthSum += company.growth;
          acc[sector].growthCount++;
        }
        return acc;
      }, {});

      const sectorMetricsData: SectorMetrics[] = Object.values(sectorData).map((sector: any, index) => ({
        sector: sector.sector,
        count: sector.count,
        totalARR: sector.totalARR,
        avgGrowthRate: sector.growthCount > 0 ? sector.growthSum / sector.growthCount : 0,
        color: sectorColors[index % sectorColors.length]
      }));

      setSectorMetrics(sectorMetricsData);

      // Generate trend data (last 12 months)
      const trendDataPoints: TrendData[] = [];
      for (let i = 11; i >= 0; i--) {
        const month = startOfMonth(subMonths(new Date(), i));
        const monthStr = format(month, 'MMM yyyy');
        
        // For demo purposes, generate trend data based on current metrics
        // In a real app, you'd query historical data
        const baseARR = totalARR * (0.7 + (11 - i) * 0.03);
        const baseGrowth = avgGrowthRate * (0.8 + Math.random() * 0.4);
        const baseHeadcount = totalHeadcount * (0.8 + (11 - i) * 0.02);

        trendDataPoints.push({
          month: monthStr,
          totalARR: Math.round(baseARR),
          avgGrowth: Math.round(baseGrowth * 10) / 10,
          headcount: Math.round(baseHeadcount)
        });
      }

      setTrendData(trendDataPoints);
    } catch (error) {
      console.error('Error fetching portfolio analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const exportData = () => {
    const csvContent = [
      ['Company', 'Sector', 'Stage', 'ARR', 'Growth Rate', 'Burn Multiple', 'Health Score', 'Risk Level'].join(','),
      ...companyPerformance.map(company => [
        company.name,
        company.sector,
        company.stage,
        company.arr,
        company.growth,
        company.burnMultiple.toFixed(1),
        company.healthScore.toFixed(0),
        company.riskLevel
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-analytics.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Key Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Health Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.portfolioHealthScore.toFixed(0)}/100
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.portfolioHealthScore > 70 ? 'Excellent' : 
               metrics.portfolioHealthScore > 50 ? 'Good' : 'Needs Attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Burn Multiple</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.avgBurnMultiple.toFixed(1)}x
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.avgBurnMultiple < 2 ? 'Excellent' : 
               metrics.avgBurnMultiple < 3 ? 'Good' : 'High'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio ARR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalARR)}</div>
            <p className="text-xs text-muted-foreground">
              Across {metrics.totalCompanies} companies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies Raising</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.companiesRaising}</div>
            <p className="text-xs text-muted-foreground">
              Currently fundraising
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="trends" className="w-full">
        <div className="flex justify-between items-center">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="sectors">Sectors</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          </TabsList>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Trends</CardTitle>
              <CardDescription>ARR and growth trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="arr" orientation="left" />
                  <YAxis yAxisId="growth" orientation="right" />
                  <Tooltip />
                  <Area yAxisId="arr" type="monotone" dataKey="totalARR" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  <Line yAxisId="growth" type="monotone" dataKey="avgGrowth" stroke="#10B981" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sectors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Sector Distribution</CardTitle>
                <CardDescription>Companies by sector</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={sectorMetrics}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ sector, count }) => `${sector}: ${count}`}
                    >
                      {sectorMetrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sector Performance</CardTitle>
                <CardDescription>ARR by sector</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={sectorMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sector" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Total ARR']} />
                    <Bar dataKey="totalARR" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Performance Matrix</CardTitle>
              <CardDescription>Growth vs ARR analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companyPerformance.slice(0, 10).map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium">{company.name}</div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{company.sector}</Badge>
                          <Badge variant="secondary">{company.stage}</Badge>
                          <Badge variant={company.riskLevel === 'Low' ? 'default' : 
                                        company.riskLevel === 'Medium' ? 'secondary' : 'destructive'}>
                            {company.riskLevel} Risk
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-bold">{formatCurrency(company.arr)}</div>
                      <div className="flex items-center text-sm">
                        {company.growth >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        <span className={company.growth >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {company.growth}%
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Health: {company.healthScore.toFixed(0)}/100
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Industry Benchmarks</CardTitle>
                <CardDescription>How your portfolio compares</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Growth Rate</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{metrics.avgGrowthRate.toFixed(1)}%</span>
                    <Badge variant={metrics.avgGrowthRate > 15 ? 'default' : 'secondary'}>
                      {metrics.avgGrowthRate > 15 ? 'Above' : 'Below'} Benchmark
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Burn Multiple</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{metrics.avgBurnMultiple.toFixed(1)}x</span>
                    <Badge variant={metrics.avgBurnMultiple < 3 ? 'default' : 'secondary'}>
                      {metrics.avgBurnMultiple < 3 ? 'Good' : 'High'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
                <CardDescription>Portfolio risk distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Low', 'Medium', 'High'].map((risk) => {
                    const count = companyPerformance.filter(c => c.riskLevel === risk).length;
                    const percentage = (count / companyPerformance.length) * 100;
                    return (
                      <div key={risk} className="flex justify-between items-center">
                        <span className="text-sm">{risk} Risk</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{count} companies</span>
                          <span className="text-xs text-muted-foreground">
                            ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioAnalytics;
