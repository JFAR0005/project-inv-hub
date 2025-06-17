
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MetricData {
  date: string;
  metric_name: string;
  value: number;
}

interface ChartDataPoint {
  date: string;
  arr?: number;
  burn_rate?: number;
  headcount?: number;
  [key: string]: any;
}

const Analytics = () => {
  const { user } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');

  // Fetch companies
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch metrics for selected company
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['metrics', selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('company_id', selectedCompanyId)
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCompanyId,
  });

  // Process metrics data for charts
  const processMetricsData = () => {
    if (!metrics || metrics.length === 0) return { arrData: [], burnData: [], headcountData: [] };

    const groupedByDate = metrics.reduce((acc, metric: MetricData) => {
      const date = metric.date;
      if (!acc[date]) {
        acc[date] = { date };
      }
      acc[date][metric.metric_name] = metric.value;
      return acc;
    }, {} as Record<string, ChartDataPoint>);

    const chartData = Object.values(groupedByDate);

    return {
      arrData: chartData.filter(d => typeof d.arr === 'number'),
      burnData: chartData.filter(d => typeof d.burn_rate === 'number'),
      headcountData: chartData.filter(d => typeof d.headcount === 'number'),
    };
  };

  const { arrData, burnData, headcountData } = processMetricsData();

  if (isLoading && selectedCompanyId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Portfolio performance metrics and insights
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="metrics">Company Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{companies?.length || 0}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Detailed portfolio analysis and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Advanced analytics features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Metrics</CardTitle>
              <CardDescription>
                View detailed metrics for individual portfolio companies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select a company to view metrics" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies?.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCompanyId && (
                <div className="space-y-8">
                  {/* ARR Chart */}
                  {arrData.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Annual Recurring Revenue (ARR)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={arrData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`$${(value as number).toLocaleString()}`, 'ARR']} />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="arr" 
                              stroke="#8884d8" 
                              strokeWidth={2}
                              name="ARR"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Burn Rate Chart */}
                  {burnData.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Monthly Burn Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={burnData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip formatter={(value) => [`$${(value as number).toLocaleString()}`, 'Burn Rate']} />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="burn_rate" 
                              stroke="#82ca9d" 
                              strokeWidth={2}
                              name="Burn Rate"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Headcount Chart */}
                  {headcountData.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Team Headcount</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={headcountData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="headcount" fill="#ffc658" name="Headcount" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {arrData.length === 0 && burnData.length === 0 && headcountData.length === 0 && (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">
                          No metrics data available for this company yet.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
