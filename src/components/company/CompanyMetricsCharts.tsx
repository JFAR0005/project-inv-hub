
import React from 'react';
import { useCompanyMetrics } from '@/hooks/useMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import DataLoadingState from '@/components/data/DataLoadingState';

interface CompanyMetricsChartsProps {
  companyId: string;
}

const CompanyMetricsCharts: React.FC<CompanyMetricsChartsProps> = ({ companyId }) => {
  const { data: allMetrics, isLoading } = useCompanyMetrics(companyId);

  if (isLoading) {
    return <DataLoadingState />;
  }

  if (!allMetrics || allMetrics.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="text-lg font-medium">No metrics data available</h3>
          <p className="text-muted-foreground mt-2">
            Metrics will appear here once data is submitted
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group metrics by type
  const arrMetrics = allMetrics.filter(m => m.metric_name === 'ARR');
  const burnMetrics = allMetrics.filter(m => m.metric_name === 'Burn Rate');
  const headcountMetrics = allMetrics.filter(m => m.metric_name === 'Headcount');

  // Calculate burn multiple data
  const burnMultipleData = arrMetrics.map(arrMetric => {
    const correspondingBurn = burnMetrics.find(burnMetric => 
      burnMetric.date === arrMetric.date
    );
    
    return {
      date: arrMetric.date,
      burnMultiple: correspondingBurn && arrMetric.value > 0 
        ? (correspondingBurn.value / (arrMetric.value / 12)) 
        : 0
    };
  }).filter(item => item.burnMultiple > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ARR Chart */}
      {arrMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Annual Recurring Revenue (ARR)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={arrMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value) => [formatCurrency(Number(value)), 'ARR']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Burn Rate Chart */}
      {burnMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Burn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={burnMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value) => [formatCurrency(Number(value)), 'Burn Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#ff7300" 
                  strokeWidth={2}
                  dot={{ fill: '#ff7300' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Headcount Chart */}
      {headcountMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Team Headcount</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={headcountMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value) => [value, 'Employees']}
                />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Burn Multiple Chart */}
      {burnMultipleData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Burn Multiple</CardTitle>
            <p className="text-sm text-muted-foreground">
              Monthly burn rate as a multiple of monthly ARR
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={burnMultipleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis tickFormatter={(value) => `${value.toFixed(1)}x`} />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value) => [`${Number(value).toFixed(1)}x`, 'Burn Multiple']}
                />
                <Line 
                  type="monotone" 
                  dataKey="burnMultiple" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  dot={{ fill: '#dc2626' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompanyMetricsCharts;
