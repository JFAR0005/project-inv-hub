
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, DollarSign, Users, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import DataLoadingState from '@/components/data/DataLoadingState';

const PortfolioAnalytics: React.FC = () => {
  // Fetch portfolio companies with latest metrics
  const { data: companies, isLoading: companiesLoading } = useQuery({
    queryKey: ['portfolio-companies-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch latest founder updates for each company
  const { data: latestUpdates, isLoading: updatesLoading } = useQuery({
    queryKey: ['latest-founder-updates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('founder_updates')
        .select('company_id, arr, mrr, burn_rate, headcount, runway, submitted_at')
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      
      // Get only the latest update for each company
      const latestByCompany = (data || []).reduce((acc, update) => {
        if (!acc[update.company_id] || new Date(update.submitted_at) > new Date(acc[update.company_id].submitted_at)) {
          acc[update.company_id] = update;
        }
        return acc;
      }, {} as Record<string, any>);
      
      return Object.values(latestByCompany);
    },
  });

  // Fetch historical metrics for trends
  const { data: historicalMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['historical-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  if (companiesLoading || updatesLoading || metricsLoading) {
    return <DataLoadingState />;
  }

  // Combine company data with latest metrics
  const enrichedCompanies = companies?.map(company => {
    const latestUpdate = latestUpdates?.find(u => u.company_id === company.id);
    return {
      ...company,
      currentARR: latestUpdate?.arr || company.arr || 0,
      currentMRR: latestUpdate?.mrr || company.mrr || 0,
      currentBurn: latestUpdate?.burn_rate || company.burn_rate || 0,
      currentHeadcount: latestUpdate?.headcount || company.headcount || 0,
      currentRunway: latestUpdate?.runway || company.runway || 0,
      lastUpdate: latestUpdate?.submitted_at,
    };
  }) || [];

  // Calculate portfolio totals
  const totalARR = enrichedCompanies.reduce((sum, company) => sum + (company.currentARR || 0), 0);
  const totalMRR = enrichedCompanies.reduce((sum, company) => sum + (company.currentMRR || 0), 0);
  const totalBurn = enrichedCompanies.reduce((sum, company) => sum + (company.currentBurn || 0), 0);
  const totalHeadcount = enrichedCompanies.reduce((sum, company) => sum + (company.currentHeadcount || 0), 0);

  // Prepare chart data
  const arrByCompany = enrichedCompanies
    .filter(c => c.currentARR > 0)
    .sort((a, b) => (b.currentARR || 0) - (a.currentARR || 0))
    .slice(0, 10)
    .map(c => ({
      name: c.name,
      arr: c.currentARR,
    }));

  const sectorData = enrichedCompanies.reduce((acc, company) => {
    const sector = company.sector || 'Unknown';
    acc[sector] = (acc[sector] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sectorChartData = Object.entries(sectorData).map(([sector, count]) => ({
    name: sector,
    value: count,
  }));

  const stageData = enrichedCompanies.reduce((acc, company) => {
    const stage = company.stage || 'Unknown';
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stageChartData = Object.entries(stageData).map(([stage, count]) => ({
    name: stage,
    value: count,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio ARR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalARR)}</div>
            <p className="text-xs text-muted-foreground">
              Across {enrichedCompanies.length} companies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMRR)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Burn</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBurn)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Headcount</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHeadcount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ARR by Company */}
        <Card>
          <CardHeader>
            <CardTitle>ARR by Company (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={arrByCompany}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="arr" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Companies by Sector */}
        <Card>
          <CardHeader>
            <CardTitle>Companies by Sector</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sectorChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sectorChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Companies by Stage */}
        <Card>
          <CardHeader>
            <CardTitle>Companies by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stageChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Company Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Health Indicators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Companies with positive ARR growth</span>
                <Badge variant="secondary">
                  {enrichedCompanies.filter(c => c.currentARR > 0).length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Companies with runway > 12 months</span>
                <Badge variant="secondary">
                  {enrichedCompanies.filter(c => (c.currentRunway || 0) > 12).length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Companies needing updates (>30 days)</span>
                <Badge variant="destructive">
                  {enrichedCompanies.filter(c => {
                    if (!c.lastUpdate) return true;
                    const daysSinceUpdate = (Date.now() - new Date(c.lastUpdate).getTime()) / (1000 * 60 * 60 * 24);
                    return daysSinceUpdate > 30;
                  }).length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioAnalytics;
