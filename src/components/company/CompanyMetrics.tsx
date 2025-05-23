
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, TrendingUp, Users, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import MetricsCharts from './MetricsCharts';

interface CompanyMetricsProps {
  companyId: string;
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
        startDate = new Date(0); // Beginning of time
        break;
    }
    
    return { startDate, endDate };
  };
  
  const { startDate } = getDateRange();
  
  const { data: updates, isLoading, error, refetch } = useQuery({
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
  
  // Format updates data for recharts
  const getChartData = () => {
    if (!updates || updates.length === 0) return [];
    
    return updates.map(update => ({
      date: format(new Date(update.submitted_at), 'MMM yyyy'),
      arr: update.arr || 0,
      mrr: update.mrr || 0,
      headcount: update.headcount || 0,
      burnRate: update.burn_rate || 0,
      runway: update.runway || 0,
      burnMultiple: update.arr && update.arr > 0 ? ((update.burn_rate || 0) / (update.arr / 12)).toFixed(2) : 0
    }));
  };
  
  const chartData = getChartData();
  
  // Calculate current metrics from latest data point
  const getLatestMetrics = () => {
    if (!updates || updates.length === 0) return null;
    
    return updates[updates.length - 1];
  };
  
  const latestMetrics = getLatestMetrics();
  
  // Calculate burn multiple
  const calculateBurnMultiple = () => {
    if (!latestMetrics || !latestMetrics.arr || latestMetrics.arr === 0) return 0;
    
    return ((latestMetrics.burn_rate || 0) / (latestMetrics.arr / 12)).toFixed(2);
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
        <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-2">
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </Alert>
    );
  }
  
  if (!updates || updates.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Metrics Available</h3>
          <p className="text-muted-foreground">
            There are no metrics recorded for this company yet.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ARR</p>
                <p className="text-2xl font-bold text-gray-900">
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
                <p className="text-sm font-medium text-gray-600">Monthly Burn</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${latestMetrics?.burn_rate?.toLocaleString() || '0'}
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
                <p className="text-sm font-medium text-gray-600">Headcount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {latestMetrics?.headcount || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Burn Multiple</p>
                <p className="text-2xl font-bold text-gray-900">
                  {calculateBurnMultiple()}x
                </p>
              </div>
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
      
      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="burn">Burn & Runway</TabsTrigger>
          <TabsTrigger value="headcount">Headcount</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Annual Recurring Revenue</CardTitle>
              <CardDescription>
                ARR growth over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <MetricsCharts 
                data={chartData} 
                type="line"
                dataKey="arr"
                color="#3b82f6" 
                yAxisLabel="ARR ($)"
                valueFormatter={(value) => `$${value.toLocaleString()}`}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="burn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Burn Rate</CardTitle>
              <CardDescription>
                Cash burn over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <MetricsCharts 
                data={chartData} 
                type="line"
                dataKey="burnRate"
                color="#ef4444" 
                yAxisLabel="Burn Rate ($)"
                valueFormatter={(value) => `$${value.toLocaleString()}`}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Runway (Months)</CardTitle>
              <CardDescription>
                Cash runway over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <MetricsCharts 
                data={chartData} 
                type="line"
                dataKey="runway"
                color="#8b5cf6" 
                yAxisLabel="Months"
                valueFormatter={(value) => `${value} months`}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="headcount" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Size</CardTitle>
              <CardDescription>
                Headcount over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <MetricsCharts 
                data={chartData} 
                type="bar"
                dataKey="headcount"
                color="#6366f1" 
                yAxisLabel="Employees"
                valueFormatter={(value) => `${value} employees`}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="efficiency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Burn Multiple</CardTitle>
              <CardDescription>
                Burn rate divided by net new ARR (monthly)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <MetricsCharts 
                data={chartData} 
                type="bar"
                dataKey="burnMultiple"
                color="#f97316" 
                yAxisLabel="Multiple"
                valueFormatter={(value) => `${value}x`}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyMetrics;
