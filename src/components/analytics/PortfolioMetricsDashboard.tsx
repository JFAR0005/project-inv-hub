
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const PortfolioMetricsDashboard: React.FC = () => {
  const { data: portfolioMetrics, isLoading } = useQuery({
    queryKey: ['portfolio-metrics'],
    queryFn: async () => {
      // Get all companies with their latest metrics
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, sector');
      
      if (companiesError) throw companiesError;
      
      // Get all metrics for these companies
      const { data: metrics, error: metricsError } = await supabase
        .from('metrics')
        .select('*')
        .order('date', { ascending: false });
      
      if (metricsError) throw metricsError;
      
      // Calculate portfolio totals and trends
      const companiesWithMetrics = companies?.map(company => {
        const companyMetrics = metrics?.filter(m => m.company_id === company.id) || [];
        const latestARR = companyMetrics.find(m => m.metric_name === 'ARR')?.value || 0;
        const latestBurn = companyMetrics.find(m => m.metric_name === 'Burn Rate')?.value || 0;
        const latestHeadcount = companyMetrics.find(m => m.metric_name === 'Headcount')?.value || 0;
        
        return {
          ...company,
          latestARR,
          latestBurn,
          latestHeadcount,
          metrics: companyMetrics
        };
      }) || [];
      
      // Calculate totals
      const totalARR = companiesWithMetrics.reduce((sum, company) => sum + company.latestARR, 0);
      const totalBurn = companiesWithMetrics.reduce((sum, company) => sum + company.latestBurn, 0);
      const totalHeadcount = companiesWithMetrics.reduce((sum, company) => sum + company.latestHeadcount, 0);
      
      // Group by sector
      const sectorBreakdown = companiesWithMetrics.reduce((acc: Record<string, any>, company) => {
        const sector = company.sector || 'Unknown';
        if (!acc[sector]) {
          acc[sector] = { name: sector, companies: 0, arr: 0, burn: 0 };
        }
        acc[sector].companies += 1;
        acc[sector].arr += company.latestARR;
        acc[sector].burn += company.latestBurn;
        return acc;
      }, {});
      
      return {
        totalARR,
        totalBurn,
        totalHeadcount,
        companiesCount: companies?.length || 0,
        sectorBreakdown: Object.values(sectorBreakdown),
        companiesWithMetrics,
        allMetrics: metrics || []
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse h-24 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!portfolioMetrics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No portfolio data available</p>
        </CardContent>
      </Card>
    );
  }

  const { totalARR, totalBurn, totalHeadcount, companiesCount, sectorBreakdown } = portfolioMetrics;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio ARR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalARR / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">
              Across {companiesCount} companies
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Monthly Burn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalBurn / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">
              Monthly burn rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Headcount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHeadcount}</div>
            <p className="text-xs text-muted-foreground">
              Total team members
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Runway</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalBurn > 0 ? Math.round((totalARR / 12) / totalBurn) : 0} months
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated runway
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Breakdown */}
        {sectorBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Portfolio by Sector (ARR)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sectorBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="arr"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {sectorBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${(Number(value) / 1000000).toFixed(1)}M`, 'ARR']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Company Count by Sector */}
        {sectorBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Companies by Sector</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sectorBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="companies" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PortfolioMetricsDashboard;
