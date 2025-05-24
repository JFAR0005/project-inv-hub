
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, TrendingUp } from 'lucide-react';
import MetricsCharts from './MetricsChartsFixed';

interface CompanyMetricsProps {
  companyId: string;
}

const CompanyMetrics: React.FC<CompanyMetricsProps> = ({ companyId }) => {
  const { data: latestMetrics, isLoading, error, refetch } = useQuery({
    queryKey: ['latest-metrics', companyId],
    queryFn: async () => {
      // Get the latest metrics for each type
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('company_id', companyId)
        .order('date', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      // Group by metric_name and get the latest value for each
      const latestByType = data?.reduce((acc: Record<string, any>, metric) => {
        if (!acc[metric.metric_name] || metric.date > acc[metric.metric_name].date) {
          acc[metric.metric_name] = metric;
        }
        return acc;
      }, {});
      
      return latestByType || {};
    },
    enabled: !!companyId,
  });
  
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
  
  return (
    <div className="space-y-6">
      {/* Current Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {latestMetrics?.ARR && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Recurring Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${latestMetrics.ARR.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                As of {new Date(latestMetrics.ARR.date).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        )}
        
        {latestMetrics?.['Burn Rate'] && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Burn Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${latestMetrics['Burn Rate'].value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                As of {new Date(latestMetrics['Burn Rate'].date).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        )}
        
        {latestMetrics?.Headcount && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Size</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latestMetrics.Headcount.value}</div>
              <p className="text-xs text-muted-foreground">
                As of {new Date(latestMetrics.Headcount.date).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Charts */}
      <div>
        <h3 className="text-lg font-medium mb-4">Historical Trends</h3>
        <MetricsCharts companyId={companyId} />
      </div>
      
      {Object.keys(latestMetrics || {}).length === 0 && (
        <Card>
          <CardContent className="py-6 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Metrics Available</h3>
            <p className="text-muted-foreground">
              No metrics data has been recorded for this company yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompanyMetrics;
