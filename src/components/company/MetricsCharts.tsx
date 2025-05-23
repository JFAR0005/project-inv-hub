
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  TooltipProps,
} from 'recharts';
import { format, parseISO, subMonths, isAfter } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown, Users, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface MetricsChartsProps {
  companyId: string;
}

type MetricEntry = {
  id: string;
  metric_name: string;
  value: number;
  date: string;
  company_id: string;
};

type ProcessedMetrics = {
  date: string;
  arr?: number;
  mrr?: number;
  headcount?: number;
  burn_rate?: number;
  runway?: number;
  churn_rate?: number;
  formattedDate?: string;
};

const MetricsCharts: React.FC<MetricsChartsProps> = ({ companyId }) => {
  const [metrics, setMetrics] = useState<ProcessedMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchCompanyMetrics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch metrics from Supabase
        const { data, error } = await supabase
          .from('metrics')
          .select('*')
          .eq('company_id', companyId)
          .order('date', { ascending: true });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
          // If no metrics, try to get latest company data
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('arr, mrr, headcount, burn_rate, runway, churn_rate, updated_at')
            .eq('id', companyId)
            .single();
          
          if (companyError) throw companyError;
          
          if (companyData) {
            // Create a single data point from company data
            const singleMetric: ProcessedMetrics = {
              date: companyData.updated_at,
              arr: companyData.arr,
              mrr: companyData.mrr,
              headcount: companyData.headcount,
              burn_rate: companyData.burn_rate,
              runway: companyData.runway,
              churn_rate: companyData.churn_rate,
              formattedDate: format(new Date(companyData.updated_at), 'MMM dd, yyyy')
            };
            setMetrics([singleMetric]);
          } else {
            setMetrics([]);
          }
        } else {
          // Process metrics data
          const processedData = processMetricsData(data);
          setMetrics(processedData);
        }
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Failed to load metrics data.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (companyId) {
      fetchCompanyMetrics();
    }
  }, [companyId]);
  
  // Process raw metrics into a format suitable for charts
  const processMetricsData = (rawMetrics: MetricEntry[]): ProcessedMetrics[] => {
    const metricsByDate: { [key: string]: ProcessedMetrics } = {};
    
    // Group metrics by date
    rawMetrics.forEach(metric => {
      const dateStr = metric.date;
      
      if (!metricsByDate[dateStr]) {
        metricsByDate[dateStr] = { 
          date: dateStr,
          formattedDate: format(new Date(dateStr), 'MMM dd, yyyy')
        };
      }
      
      // Add metric value to the appropriate property
      switch (metric.metric_name) {
        case 'arr':
          metricsByDate[dateStr].arr = metric.value;
          break;
        case 'mrr':
          metricsByDate[dateStr].mrr = metric.value;
          break;
        case 'headcount':
          metricsByDate[dateStr].headcount = metric.value;
          break;
        case 'burn_rate':
          metricsByDate[dateStr].burn_rate = metric.value;
          break;
        case 'runway':
          metricsByDate[dateStr].runway = metric.value;
          break;
        case 'churn_rate':
          metricsByDate[dateStr].churn_rate = metric.value;
          break;
        default:
          break;
      }
    });
    
    // Convert to array and sort by date
    return Object.values(metricsByDate).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };
  
  const calculateGrowthMetrics = () => {
    if (metrics.length < 2) return null;
    
    const latest = metrics[metrics.length - 1];
    const previous = metrics[metrics.length - 2];
    
    const arrGrowth = latest.arr && previous.arr 
      ? ((latest.arr - previous.arr) / previous.arr * 100).toFixed(1)
      : null;
    
    const headcountGrowth = latest.headcount && previous.headcount 
      ? ((latest.headcount - previous.headcount) / previous.headcount * 100).toFixed(1)
      : null;
    
    return { arrGrowth, headcountGrowth };
  };

  const growthMetrics = calculateGrowthMetrics();
  
  const formatDollar = (value: number | undefined) => {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-md shadow">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.name?.includes('$') 
                ? formatDollar(entry.value) 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (metrics.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Metrics Data</AlertTitle>
        <AlertDescription>
          There are no metrics available for this company yet.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="revenue">Revenue</TabsTrigger>
        <TabsTrigger value="team">Team & Growth</TabsTrigger>
        <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ARR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {formatDollar(metrics[metrics.length - 1]?.arr)}
                </div>
                {growthMetrics?.arrGrowth && (
                  <Badge variant={Number(growthMetrics.arrGrowth) > 0 ? "success" : "destructive"} className="flex items-center">
                    {Number(growthMetrics.arrGrowth) > 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {growthMetrics.arrGrowth}%
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Headcount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    {metrics[metrics.length - 1]?.headcount || 'N/A'}
                  </span>
                </div>
                {growthMetrics?.headcountGrowth && (
                  <Badge variant={Number(growthMetrics.headcountGrowth) > 0 ? "success" : "destructive"} className="flex items-center">
                    {Number(growthMetrics.headcountGrowth) > 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {growthMetrics.headcountGrowth}%
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Runway</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics[metrics.length - 1]?.runway !== undefined ? 
                  `${metrics[metrics.length - 1].runway} months` : 
                  'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fontSize: 12 }} 
                    tickFormatter={(value) => {
                      return format(new Date(value), 'MMM yy');
                    }}
                  />
                  <YAxis 
                    yAxisId="left" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      return `$${(value / 1000)}k`;
                    }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="arr" 
                    name="ARR ($)" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="headcount" 
                    name="Headcount" 
                    fill="#82ca9d" 
                    barSize={20}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="burn_rate" 
                    name="Burn Rate ($)" 
                    stroke="#ff7300" 
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="revenue" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Metrics</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => format(new Date(value), 'MMM yy')}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="arr" 
                    name="ARR ($)" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }}
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mrr" 
                    name="MRR ($)" 
                    stroke="#82ca9d" 
                    activeDot={{ r: 6 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Revenue Efficiency</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => format(new Date(value), 'MMM yy')}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000)}k`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="arr" 
                    name="ARR ($)" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="churn_rate" 
                    name="Churn Rate (%)" 
                    stroke="#ff0000" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="team" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Headcount Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => format(new Date(value), 'MMM yy')}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="headcount" 
                    name="Headcount" 
                    fill="#82ca9d" 
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Revenue per Employee</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={metrics.map(m => ({
                  ...m,
                  revenue_per_employee: m.arr && m.headcount ? m.arr / m.headcount : undefined
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => format(new Date(value), 'MMM yy')}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000)}k`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue_per_employee" 
                    name="Revenue per Employee ($)" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="headcount" 
                    name="Headcount" 
                    fill="#82ca9d" 
                    barSize={20}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="efficiency" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Runway & Burn Rate</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={metrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => format(new Date(value), 'MMM yy')}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000)}k`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    domain={[0, (max) => Math.max(24, max)]}
                    label={{ value: 'Months', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="burn_rate" 
                    name="Burn Rate ($)" 
                    fill="#ff7300" 
                    barSize={20}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="runway" 
                    name="Runway (months)" 
                    stroke="#413ea0" 
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Efficiency Metrics</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={metrics.map(m => ({
                    ...m,
                    burn_multiple: m.burn_rate && m.arr ? m.burn_rate / (m.arr / 12) : undefined
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => format(new Date(value), 'MMM yy')}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="burn_multiple" 
                    name="Burn Multiple" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default MetricsCharts;
