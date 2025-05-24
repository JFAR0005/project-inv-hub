
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

interface MetricsChartsProps {
  companyId: string;
}

interface Metric {
  id: string;
  company_id: string;
  metric_name: string;
  value: number;
  date: string;
}

const MetricsCharts: React.FC<MetricsChartsProps> = ({ companyId }) => {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['company-metrics', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('company_id', companyId)
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data as Metric[];
    },
    enabled: !!companyId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse h-48 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-red-500">Failed to load metrics</p>
        </CardContent>
      </Card>
    );
  }

  if (!metrics || metrics.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No metrics data available</p>
        </CardContent>
      </Card>
    );
  }

  // Group metrics by type and format for charts
  const arrData = metrics
    .filter(m => m.metric_name === 'ARR')
    .map(m => ({
      date: format(parseISO(m.date), 'MMM yyyy'),
      value: m.value,
    }));

  const burnData = metrics
    .filter(m => m.metric_name === 'Burn Rate')
    .map(m => ({
      date: format(parseISO(m.date), 'MMM yyyy'),
      value: m.value,
    }));

  const headcountData = metrics
    .filter(m => m.metric_name === 'Headcount')
    .map(m => ({
      date: format(parseISO(m.date), 'MMM yyyy'),
      value: m.value,
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* ARR Chart */}
      {arrData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ARR Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={arrData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'ARR']} />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
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
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Burn Rate']} />
                <Line type="monotone" dataKey="value" stroke="#e74c3c" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Headcount Chart */}
      {headcountData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Team Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={headcountData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} people`, 'Headcount']} />
                <Bar dataKey="value" fill="#2ecc71" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MetricsCharts;
