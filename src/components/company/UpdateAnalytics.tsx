
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';

interface UpdateAnalyticsProps {
  companyId: string;
}

interface AnalyticsData {
  date: string;
  arr: number | null;
  mrr: number | null;
  burn_rate: number | null;
  headcount: number | null;
  runway: number | null;
}

const UpdateAnalytics: React.FC<UpdateAnalyticsProps> = ({ companyId }) => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['update-analytics', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('founder_updates')
        .select('submitted_at, arr, mrr, burn_rate, headcount, runway')
        .eq('company_id', companyId)
        .order('submitted_at', { ascending: true });
      
      if (error) throw error;
      
      // Transform data for charts
      const chartData: AnalyticsData[] = data.map(update => ({
        date: format(parseISO(update.submitted_at), 'MMM dd'),
        arr: update.arr,
        mrr: update.mrr,
        burn_rate: update.burn_rate,
        headcount: update.headcount,
        runway: update.runway,
      }));
      
      // Calculate insights
      const latestUpdate = data[data.length - 1];
      const previousUpdate = data[data.length - 2];
      
      const insights = {
        totalUpdates: data.length,
        avgUpdateFrequency: data.length > 1 ? 
          Math.round(differenceInDays(parseISO(data[data.length - 1].submitted_at), parseISO(data[0].submitted_at)) / (data.length - 1)) 
          : 0,
        arrGrowth: latestUpdate?.arr && previousUpdate?.arr ? 
          ((latestUpdate.arr - previousUpdate.arr) / previousUpdate.arr) * 100 : null,
        mrrGrowth: latestUpdate?.mrr && previousUpdate?.mrr ? 
          ((latestUpdate.mrr - previousUpdate.mrr) / previousUpdate.mrr) * 100 : null,
        burnTrend: latestUpdate?.burn_rate && previousUpdate?.burn_rate ? 
          latestUpdate.burn_rate - previousUpdate.burn_rate : null,
        headcountGrowth: latestUpdate?.headcount && previousUpdate?.headcount ? 
          latestUpdate.headcount - previousUpdate.headcount : null,
        runwayChange: latestUpdate?.runway && previousUpdate?.runway ? 
          latestUpdate.runway - previousUpdate.runway : null,
      };
      
      return { chartData, insights, latestUpdate };
    },
    enabled: !!companyId,
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const getGrowthIndicator = (value: number | null, isReverse = false) => {
    if (value === null) return null;
    const isPositive = isReverse ? value < 0 : value > 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span className="text-sm font-medium">
          {Math.abs(value).toFixed(1)}{typeof value === 'number' && value % 1 !== 0 ? '%' : ''}
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics?.chartData || analytics.chartData.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Analytics Available</h3>
          <p className="text-muted-foreground">
            Analytics will be available once there are multiple updates to compare.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { chartData, insights } = analytics;

  return (
    <div className="space-y-6">
      {/* Key Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Updates</p>
                <p className="text-2xl font-bold">{insights.totalUpdates}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Update Frequency</p>
                <p className="text-2xl font-bold">{insights.avgUpdateFrequency}</p>
                <p className="text-xs text-muted-foreground">days average</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ARR Growth</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {insights.arrGrowth ? `${insights.arrGrowth.toFixed(1)}%` : 'N/A'}
                  </p>
                  {getGrowthIndicator(insights.arrGrowth)}
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Growth</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {insights.headcountGrowth !== null ? 
                      (insights.headcountGrowth > 0 ? `+${insights.headcountGrowth}` : insights.headcountGrowth.toString()) 
                      : 'N/A'}
                  </p>
                  {insights.headcountGrowth !== null && getGrowthIndicator(insights.headcountGrowth)}
                </div>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>ARR and MRR growth over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                labelFormatter={(label) => `Update: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="arr" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="ARR"
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="mrr" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="MRR"
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Operational Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Headcount Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Team Size</CardTitle>
            <CardDescription>Headcount changes over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="headcount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Burn & Runway */}
        <Card>
          <CardHeader>
            <CardTitle>Burn Rate & Runway</CardTitle>
            <CardDescription>Cash management metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" tickFormatter={formatCurrency} />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'burn_rate' ? formatCurrency(value) : `${value} months`,
                    name === 'burn_rate' ? 'Monthly Burn' : 'Runway'
                  ]}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="burn_rate" 
                  stroke="#ff7300" 
                  strokeWidth={2}
                  name="Monthly Burn"
                  connectNulls={false}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="runway" 
                  stroke="#8dd1e1" 
                  strokeWidth={2}
                  name="Runway (months)"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>Automated analysis of recent trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.arrGrowth !== null && (
              <div className="flex items-center gap-3">
                {insights.arrGrowth > 0 ? (
                  <Badge className="bg-green-100 text-green-800">Positive</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">Negative</Badge>
                )}
                <span className="text-sm">
                  ARR {insights.arrGrowth > 0 ? 'increased' : 'decreased'} by {Math.abs(insights.arrGrowth).toFixed(1)}% since the last update
                </span>
              </div>
            )}

            {insights.burnTrend !== null && (
              <div className="flex items-center gap-3">
                {insights.burnTrend < 0 ? (
                  <Badge className="bg-green-100 text-green-800">Improved</Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800">Watch</Badge>
                )}
                <span className="text-sm">
                  Monthly burn {insights.burnTrend < 0 ? 'decreased' : 'increased'} by {formatCurrency(Math.abs(insights.burnTrend))}
                </span>
              </div>
            )}

            {insights.avgUpdateFrequency > 60 && (
              <div className="flex items-center gap-3">
                <Badge className="bg-yellow-100 text-yellow-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Attention
                </Badge>
                <span className="text-sm">
                  Updates are less frequent than recommended (every 30-45 days)
                </span>
              </div>
            )}

            {insights.headcountGrowth !== null && insights.headcountGrowth > 0 && (
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-100 text-blue-800">Growing</Badge>
                <span className="text-sm">
                  Team expanded by {insights.headcountGrowth} member{insights.headcountGrowth > 1 ? 's' : ''} since the last update
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateAnalytics;
