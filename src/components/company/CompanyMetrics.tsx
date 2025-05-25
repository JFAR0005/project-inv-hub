
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CompanyMetricsCharts from './CompanyMetricsCharts';
import DataLoadingState from '@/components/data/DataLoadingState';

interface CompanyMetricsProps {
  companyId?: string;
}

const CompanyMetrics: React.FC<CompanyMetricsProps> = ({ companyId }) => {
  // Fetch latest founder update for current metrics
  const { data: latestUpdate, isLoading: updatesLoading } = useQuery({
    queryKey: ['latest-founder-update', companyId],
    queryFn: async () => {
      if (!companyId) return null;
      
      const { data, error } = await supabase
        .from('founder_updates')
        .select('*')
        .eq('company_id', companyId)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!companyId,
  });

  // Fetch company data for fallback metrics
  const { data: company, isLoading: companyLoading } = useQuery({
    queryKey: ['company', companyId],
    queryFn: async () => {
      if (!companyId) return null;
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  if (!companyId) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="text-lg font-medium">No company selected</h3>
          <p className="text-muted-foreground mt-2">
            Please select a company to view metrics
          </p>
        </CardContent>
      </Card>
    );
  }

  if (updatesLoading || companyLoading) {
    return <DataLoadingState />;
  }

  // Use latest update data or fallback to company data
  const currentARR = latestUpdate?.arr || company?.arr || 0;
  const currentMRR = latestUpdate?.mrr || company?.mrr || 0;
  const currentBurn = latestUpdate?.burn_rate || company?.burn_rate || 0;
  const currentHeadcount = latestUpdate?.headcount || company?.headcount || 0;
  const currentRunway = latestUpdate?.runway || company?.runway || 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Current Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Annual Recurring Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentARR)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Recurring Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentMRR)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Burn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentBurn)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Team Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentHeadcount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Runway (Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentRunway ? `${currentRunway} months` : 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Burn Multiple
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentARR > 0 && currentBurn > 0 
                ? `${(currentBurn / (currentARR / 12)).toFixed(1)}x`
                : 'N/A'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tab */}
      <Tabs defaultValue="charts" className="w-full">
        <TabsList>
          <TabsTrigger value="charts">Historical Charts</TabsTrigger>
        </TabsList>
        <TabsContent value="charts" className="mt-6">
          <CompanyMetricsCharts companyId={companyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyMetrics;
