
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, AlertTriangle, BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MetricsCharts from './MetricsCharts';

interface CompanyMetricsProps {
  company: any;
  isEditing: boolean;
  formData: any;
  onNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface Metric {
  id: string;
  company_id: string;
  metric_name: string;
  value: number;
  date: string;
}

interface ChartData {
  date: string;
  value: number;
  formattedDate: string;
}

const CompanyMetrics: React.FC<CompanyMetricsProps> = ({
  company,
  isEditing,
  formData,
  onNumberChange
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [company.id]);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('company_id', company.id)
        .order('date', { ascending: true });

      if (error) throw error;
      setMetrics(data || []);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load metrics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatChartData = (metricName: string): ChartData[] => {
    return metrics
      .filter(m => m.metric_name.toLowerCase() === metricName.toLowerCase())
      .map(m => ({
        date: m.date,
        value: m.value,
        formattedDate: new Date(m.date).toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        })
      }));
  };

  const getLatestMetric = (metricName: string): number => {
    const filteredMetrics = metrics
      .filter(m => m.metric_name.toLowerCase() === metricName.toLowerCase())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return filteredMetrics.length > 0 ? filteredMetrics[0].value : 0;
  };

  const calculateBurnMultiple = (): number => {
    const latestARR = getLatestMetric('arr');
    const latestBurnRate = getLatestMetric('burn_rate');
    
    if (latestARR > 0 && latestBurnRate > 0) {
      return latestBurnRate / (latestARR / 12);
    }
    return 0;
  };

  const calculateGrowthData = (): ChartData[] => {
    const arrData = formatChartData('arr');
    return arrData.map((item, index) => {
      if (index === 0) {
        return { ...item, growthRate: 0 };
      }
      const previousValue = arrData[index - 1].value;
      const growthRate = previousValue > 0 ? ((item.value - previousValue) / previousValue) * 100 : 0;
      return { ...item, growthRate };
    });
  };

  const arrData = formatChartData('arr');
  const headcountData = formatChartData('headcount');
  const burnRateData = formatChartData('burn_rate');
  const revenueGrowthData = calculateGrowthData();
  const burnMultiple = calculateBurnMultiple();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest ARR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(getLatestMetric('arr') || company.arr || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {arrData.length > 0 ? `Last updated: ${arrData[arrData.length - 1]?.formattedDate}` : 'No data available'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Headcount</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getLatestMetric('headcount') || company.headcount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {headcountData.length > 0 ? `Last updated: ${headcountData[headcountData.length - 1]?.formattedDate}` : 'No data available'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Burn Multiple</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {burnMultiple > 0 ? burnMultiple.toFixed(1) + 'x' : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {burnMultiple > 3 && (
                <span className="flex items-center gap-1 text-orange-600">
                  <AlertTriangle className="h-3 w-3" />
                  High burn multiple
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts */}
      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Interactive Charts
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            Edit Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts">
          <MetricsCharts
            arrData={arrData}
            headcountData={headcountData}
            burnRateData={burnRateData}
            revenueGrowthData={revenueGrowthData}
          />
        </TabsContent>

        <TabsContent value="form">
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Update Current Metrics</CardTitle>
                <CardDescription>
                  These values will be saved to the company profile
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Current ARR ($)</label>
                  <input
                    type="number"
                    name="arr"
                    value={formData.arr || ''}
                    onChange={onNumberChange}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Current MRR ($)</label>
                  <input
                    type="number"
                    name="mrr"
                    value={formData.mrr || ''}
                    onChange={onNumberChange}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Headcount</label>
                  <input
                    type="number"
                    name="headcount"
                    value={formData.headcount || ''}
                    onChange={onNumberChange}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Monthly Burn Rate ($)</label>
                  <input
                    type="number"
                    name="burn_rate"
                    value={formData.burn_rate || ''}
                    onChange={onNumberChange}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Runway (months)</label>
                  <input
                    type="number"
                    name="runway"
                    value={formData.runway || ''}
                    onChange={onNumberChange}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Churn Rate (%)</label>
                  <input
                    type="number"
                    name="churn_rate"
                    value={formData.churn_rate || ''}
                    onChange={onNumberChange}
                    step="0.1"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </CardContent>
            </Card>
          )}
          {!isEditing && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Metrics Form</h3>
                <p>Enable edit mode to update company metrics</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyMetrics;
