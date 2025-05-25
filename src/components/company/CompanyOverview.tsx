
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, DollarSign, Users, TrendingUp } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Company = Database['public']['Tables']['companies']['Row'];

interface CompanyOverviewProps {
  company: Company;
  companyId: string;
}

const CompanyOverview: React.FC<CompanyOverviewProps> = ({ company, companyId }) => {
  // Fetch recent metrics
  const { data: recentMetrics } = useQuery({
    queryKey: ['company-recent-metrics', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('company_id', companyId)
        .order('date', { ascending: false })
        .limit(12); // Last 12 data points
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch recent founder updates
  const { data: recentUpdates } = useQuery({
    queryKey: ['company-recent-updates', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('founder_updates')
        .select(`
          *,
          submitted_by_user:submitted_by(name)
        `)
        .eq('company_id', companyId)
        .order('submitted_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Process metrics for mini charts
  const processMetricsForCharts = () => {
    if (!recentMetrics || recentMetrics.length === 0) return { arrData: [], headcountData: [] };

    const groupedByDate = recentMetrics.reduce((acc, metric) => {
      const date = metric.date;
      if (!acc[date]) {
        acc[date] = { date };
      }
      acc[date][metric.metric_name] = metric.value;
      return acc;
    }, {} as Record<string, any>);

    const chartData = Object.values(groupedByDate).reverse(); // Chronological order

    return {
      arrData: chartData.filter(d => d.arr !== undefined).slice(-6),
      headcountData: chartData.filter(d => d.headcount !== undefined).slice(-6),
    };
  };

  const { arrData, headcountData } = processMetricsForCharts();

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Company Basic Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sector</p>
                <p className="font-medium">{company.sector || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stage</p>
                <p className="font-medium">{company.stage || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="font-medium">{company.location || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Website</p>
                <p className="font-medium">
                  {company.website ? (
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {company.website}
                    </a>
                  ) : 'Not specified'}
                </p>
              </div>
            </div>
            {company.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-sm">{company.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">ARR</span>
                </div>
                <p className="text-lg font-bold">{formatCurrency(company.arr)}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">MRR</span>
                </div>
                <p className="text-lg font-bold">{formatCurrency(company.mrr)}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Headcount</span>
                </div>
                <p className="text-lg font-bold">{company.headcount || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Burn Rate</span>
                </div>
                <p className="text-lg font-bold">{formatCurrency(company.burn_rate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mini Charts */}
      {(arrData.length > 0 || headcountData.length > 0) && (
        <div className="grid gap-6 md:grid-cols-2">
          {arrData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ARR Trend</CardTitle>
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={arrData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => [`$${(value as number).toLocaleString()}`, 'ARR']} />
                    <Line 
                      type="monotone" 
                      dataKey="arr" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {headcountData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Headcount Growth</CardTitle>
                <CardDescription>Last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={headcountData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="headcount" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recent Updates */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Updates</CardTitle>
          <CardDescription>Latest founder updates and progress reports</CardDescription>
        </CardHeader>
        <CardContent>
          {recentUpdates && recentUpdates.length > 0 ? (
            <div className="space-y-4">
              {recentUpdates.map((update, index) => (
                <div key={update.id}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(update.submitted_at)}
                        </span>
                        {update.raise_status && (
                          <Badge variant="outline">{update.raise_status}</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        {update.arr && (
                          <div>
                            <span className="font-medium">ARR: </span>
                            {formatCurrency(update.arr)}
                          </div>
                        )}
                        {update.mrr && (
                          <div>
                            <span className="font-medium">MRR: </span>
                            {formatCurrency(update.mrr)}
                          </div>
                        )}
                        {update.headcount && (
                          <div>
                            <span className="font-medium">Headcount: </span>
                            {update.headcount}
                          </div>
                        )}
                      </div>
                      {update.comments && (
                        <p className="text-sm text-muted-foreground">
                          {update.comments.length > 100 
                            ? `${update.comments.substring(0, 100)}...` 
                            : update.comments
                          }
                        </p>
                      )}
                    </div>
                  </div>
                  {index < recentUpdates.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No recent updates available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyOverview;
