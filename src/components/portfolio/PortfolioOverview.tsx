
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { differenceInDays } from 'date-fns';
import PortfolioSkeleton from './PortfolioSkeleton';
import PortfolioError from './PortfolioError';
import PortfolioEmpty from './PortfolioEmpty';
import { CircleDollarSign, Briefcase, AlertCircle, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const PortfolioOverview: React.FC = () => {
  const { data: companies, isLoading, error, refetch } = useQuery({
    queryKey: ['portfolio-overview'],
    queryFn: async () => {
      // Fetch companies
      const { data: companiesData, error } = await supabase
        .from('companies')
        .select('*');
      
      if (error) throw error;
      
      // For each company, fetch its latest update
      const companiesWithUpdates = await Promise.all(
        (companiesData || []).map(async (company) => {
          const { data: updates } = await supabase
            .from('founder_updates')
            .select('submitted_at, arr, mrr, raise_status, burn_rate')
            .eq('company_id', company.id)
            .order('submitted_at', { ascending: false })
            .limit(1);
          
          return {
            ...company,
            latest_update: updates && updates.length > 0 ? updates[0] : null
          };
        })
      );
      
      return companiesWithUpdates;
    },
  });
  
  // If loading, show skeleton
  if (isLoading) return <PortfolioSkeleton />;
  
  // If error, show error component
  if (error) return <PortfolioError error={error as Error} onRetry={refetch} />;
  
  // If no companies, show empty state
  if (!companies || companies.length === 0) return <PortfolioEmpty />;
  
  // Calculate portfolio metrics
  const calculatePortfolioMetrics = () => {
    // Total companies
    const totalCompanies = companies.length;
    
    // Total invested amount
    const totalInvested = companies.reduce((sum, company) => 
      sum + (company.investment_amount || 0), 0);
    
    // Portfolio ARR
    const totalArr = companies.reduce((sum, company) => 
      sum + (company.latest_update?.arr || 0), 0);
    
    // Portfolio ARR growth
    const arrGrowth = 12.5; // Placeholder - would need historical data
    
    // Companies by status
    const companyStatuses = companies.reduce((acc: Record<string, number>, company) => {
      acc[company.status] = (acc[company.status] || 0) + 1;
      return acc;
    }, {});
    
    // Companies by update status
    const now = new Date();
    let upToDate = 0;
    let needsUpdate = 0;
    let neverUpdated = 0;
    
    companies.forEach(company => {
      if (!company.latest_update) {
        neverUpdated++;
      } else {
        const lastUpdate = new Date(company.latest_update.submitted_at);
        const daysSinceUpdate = differenceInDays(now, lastUpdate);
        if (daysSinceUpdate <= 30) {
          upToDate++;
        } else {
          needsUpdate++;
        }
      }
    });
    
    // Companies raising
    const raising = companies.filter(company => 
      company.latest_update?.raise_status === 'Raising').length;
    
    return {
      totalCompanies,
      totalInvested,
      totalArr,
      arrGrowth,
      companyStatuses,
      updateStatus: { upToDate, needsUpdate, neverUpdated },
      raising,
    };
  };
  
  const metrics = calculatePortfolioMetrics();
  
  // Prepare chart data
  const statusChartData = Object.entries(metrics.companyStatuses).map(([name, value]) => ({
    name,
    value,
  }));
  
  const updateStatusData = [
    { name: 'Up to Date', value: metrics.updateStatus.upToDate },
    { name: 'Needs Update', value: metrics.updateStatus.needsUpdate },
    { name: 'Never Updated', value: metrics.updateStatus.neverUpdated },
  ];
  
  // ARR by sector
  const sectorArr = companies.reduce((acc: Record<string, number>, company) => {
    if (company.latest_update?.arr) {
      acc[company.sector] = (acc[company.sector] || 0) + company.latest_update.arr;
    }
    return acc;
  }, {});
  
  const sectorArrData = Object.entries(sectorArr)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Portfolio Companies</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalCompanies}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CircleDollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Invested</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(metrics.totalInvested / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Portfolio ARR</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(metrics.totalArr / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Need Updates</p>
                <p className="text-2xl font-bold text-red-600">
                  {metrics.updateStatus.needsUpdate + metrics.updateStatus.neverUpdated}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Status Chart */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4 text-center">Companies by Status</h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} companies`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Update Status Chart */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4 text-center">Update Health</h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={updateStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#4ade80" /> {/* Up to Date - Green */}
                    <Cell fill="#f87171" /> {/* Needs Update - Red */}
                    <Cell fill="#fb923c" /> {/* Never Updated - Orange */}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} companies`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* ARR by Sector */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4 text-center">ARR by Sector</h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sectorArrData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis type="number" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip formatter={(value) => [`$${(Number(value) / 1000000).toFixed(2)}M`, 'ARR']} />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioOverview;
