
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, TrendingUp, Users, DollarSign, AlertCircle, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import EnhancedLineChart from '@/components/charts/EnhancedLineChart';
import EnhancedBarChart from '@/components/charts/EnhancedBarChart';

interface CompanyMetricsProps {
  companyId: string;
}

interface MetricData {
  id: string;
  company_id: string;
  metric_name: string;
  value: number;
  date: string;
}

interface FounderUpdate {
  id: string;
  company_id: string;
  arr: number | null;
  mrr: number | null;
  headcount: number | null;
  burn_rate: number | null;
  runway: number | null;
  submitted_at: string;
}

const CompanyMetrics: React.FC<CompanyMetricsProps> = ({ companyId }) => {
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y' | 'all'>('6m');
  
  // Get date range based on selected timeframe
  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '3m':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }
    
    return { startDate, endDate };
  };
  
  const { startDate } = getDateRange();
  
  // Fetch metrics data from Supabase
  const { data: metrics, isLoading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useQuery({
    queryKey: ['company-metrics', companyId, timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('company_id', companyId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data as MetricData[];
    },
    enabled: !!companyId,
  });

  // Fetch founder updates as backup data source
  const { data: updates, isLoading: updatesLoading, error: updatesError } = useQuery({
    queryKey: ['founder-updates-metrics', companyId, timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('founder_updates')
        .select('id, company_id, arr, mrr, headcount, burn_rate, runway, submitted_at')
        .eq('company_id', companyId)
        .gte('submitted_at', startDate.toISOString())
        .order('submitted_at', { ascending: true });
      
      if (error) throw error;
      return data as FounderUpdate[];
    },
    enabled: !!companyId,
  });
  
  const isLoading = metricsLoading || updatesLoading;
  const error = metricsError || updatesError;
  
  // Process and combine data for charts
  const getChartData = () => {
    const combinedData: Record<string, any> = {};
    
    // Process metrics data (primary source)
    if (metrics && metrics.length > 0) {
      metrics.forEach(metric => {
        const dateKey = format(new Date(metric.date), 'yyyy-MM');
        if (!combinedData[dateKey]) {
          combinedData[dateKey] = {
            date: format(new Date(metric.date), 'MMM yyyy'),
            dateKey
          };
        }
        
        // Map metric names to chart keys
        const metricName = metric.metric_name.toLowerCase();
        if (metricName === 'arr') {
          combinedData[dateKey].arr = metric.value;
        } else if (metricName === 'burn_rate' || metricName === 'burn') {
          combinedData[dateKey].burnRate = metric.value;
        } else if (metricName === 'headcount') {
          combinedData[dateKey].headcount = metric.value;
        } else if (metricName === 'mrr') {
          combinedData[dateKey].mrr = metric.value;
        }
      });
    }
    
    // Fill gaps with founder updates data
    if (updates && updates.length > 0) {
      updates.forEach(update => {
        const dateKey = format(new Date(update.submitted_at), 'yyyy-MM');
        if (!combinedData[dateKey]) {
          combinedData[dateKey] = {
            date: format(new Date(update.submitted_at), 'MMM yyyy'),
            dateKey
          };
        }
        
        // Only use update data if metrics data doesn't exist
        if (update.arr && !combinedData[dateKey].arr) {
          combinedData[dateKey].arr = update.arr;
        }
        if (update.burn_rate && !combinedData[dateKey].burnRate) {
          combinedData[dateKey].burnRate = update.burn_rate;
        }
        if (update.headcount && !combinedData[dateKey].headcount) {
          combinedData[dateKey].headcount = update.headcount;
        }
        if (update.mrr && !combinedData[dateKey].mrr) {
          combinedData[dateKey].mrr = update.mrr;
        }
      });
    }
    
    return Object.values(combinedData)
      .sort((a: any, b: any) => a.dateKey.localeCompare(b.dateKey))
      .map((item: any) => ({
        ...item,
        burnMultiple: item.arr && item.arr > 0 && item.burnRate ? 
          Number(((item.burnRate * 12) / item.arr).toFixed(2)) : 0
      }));
  };
  
  const chartData = getChartData();
  
  // Get latest metrics for summary cards
  const getLatestMetrics = () => {
    if (chartData.length === 0) return null;
    return chartData[chartData.length - 1];
  };
  
  const latestMetrics = getLatestMetrics();
  
  // Calculate burn multiple with proper validation
  const calculateBurnMultiple = () => {
    if (!latestMetrics || !latestMetrics.arr || latestMetrics.arr === 0 || !latestMetrics.burnRate) {
      return 0;
    }
    return Number(((latestMetrics.burnRate * 12) / latestMetrics.arr).toFixed(2));
  };

  const getBurnMultipleBadge = (burnMultiple: number) => {
    if (burnMultiple === 0) return null;
    if (burnMultiple < 1) {
      return <Badge className="bg-green-500 text-white">Efficient</Badge>;
    } else if (burnMultiple < 2) {
      return <Badge className="bg-yellow-500 text-white">Good</Badge>;
    } else {
      return <Badge variant="destructive">Concerning</Badge>;
    }
  };
  
  const refetch = () => {
    refetchMetrics();
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load company metrics. Please try again.
        </AlertDescription>
        <Button variant="outline" size="sm" onClick={refetch} className="ml-2">
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </Alert>
    );
  }
  
  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Metrics Available</h3>
          <p className="text-muted-foreground">
            There are no metrics recorded for this company yet. Metrics will appear once data is added to the system.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const burnMultiple = calculateBurnMultiple();
  
  return (
    <div className="space-y-6">
      {/* Key Metrics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">ARR</p>
                <p className="text-2xl font-bold">
                  ${latestMetrics?.arr?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Monthly Burn</p>
                <p className="text-2xl font-bold">
                  ${latestMetrics?.burnRate?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Headcount</p>
                <p className="text-2xl font-bold">
                  {latestMetrics?.headcount || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calculator className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Burn Multiple</p>
                  <p className="text-2xl font-bold">
                    {burnMultiple}x
                  </p>
                </div>
              </div>
              {getBurnMultipleBadge(burnMultiple)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Time Range Filter */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Performance Over Time</h3>
        <div className="flex space-x-1">
          <Button 
            size="sm" 
            variant={timeRange === '3m' ? 'default' : 'outline'}
            onClick={() => setTimeRange('3m')}
          >
            3M
          </Button>
          <Button 
            size="sm" 
            variant={timeRange === '6m' ? 'default' : 'outline'}
            onClick={() => setTimeRange('6m')}
          >
            6M
          </Button>
          <Button 
            size="sm" 
            variant={timeRange === '1y' ? 'default' : 'outline'}
            onClick={() => setTimeRange('1y')}
          >
            1Y
          </Button>
          <Button 
            size="sm" 
            variant={timeRange === 'all' ? 'default' : 'outline'}
            onClick={() => setTimeRange('all')}
          >
            All
          </Button>
        </div>
      </div>
      
      {/* Charts Tabs */}
      <Tabs defaultValue="arr" className="space-y-4">
        <TabsList>
          <TabsTrigger value="arr">ARR</TabsTrigger>
          <TabsTrigger value="burn">Burn Rate</TabsTrigger>
          <TabsTrigger value="headcount">Headcount</TabsTrigger>
          <TabsTrigger value="efficiency">Burn Multiple</TabsTrigger>
        </TabsList>
        
        <TabsContent value="arr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Annual Recurring Revenue</CardTitle>
              <CardDescription>ARR growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedLineChart
                data={chartData}
                lines={[
                  {
                    dataKey: 'arr',
                    color: '#3b82f6',
                    label: 'ARR',
                  }
                ]}
                xAxisKey="date"
                height={300}
                formatValue={(value) => `$${value.toLocaleString()}`}
                showGrid={true}
                showLegend={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="burn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Burn Rate</CardTitle>
              <CardDescription>Cash burn over time</CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedLineChart
                data={chartData}
                lines={[
                  {
                    dataKey: 'burnRate',
                    color: '#ef4444',
                    label: 'Burn Rate',
                  }
                ]}
                xAxisKey="date"
                height={300}
                formatValue={(value) => `$${value.toLocaleString()}`}
                showGrid={true}
                showLegend={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="headcount" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Size</CardTitle>
              <CardDescription>Headcount over time</CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedBarChart
                data={chartData}
                bars={[
                  {
                    dataKey: 'headcount',
                    color: '#6366f1',
                    label: 'Headcount',
                  }
                ]}
                xAxisKey="date"
                height={300}
                formatValue={(value) => `${value} employees`}
                showGrid={true}
                showLegend={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="efficiency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Burn Multiple</CardTitle>
              <CardDescription>Annual burn rate divided by ARR - lower is better</CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedBarChart
                data={chartData}
                bars={[
                  {
                    dataKey: 'burnMultiple',
                    color: '#f97316',
                    label: 'Burn Multiple',
                  }
                ]}
                xAxisKey="date"
                height={300}
                formatValue={(value) => `${value}x`}
                showGrid={true}
                showLegend={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyMetrics;
