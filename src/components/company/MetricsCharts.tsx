
import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MetricsChartsProps {
  chartData: any[];
  type: 'line' | 'bar';
  dataKey: string;
  color: string;
  yAxisLabel?: string;
  valueFormatter?: (value: any) => string;
}

const MetricsCharts: React.FC<MetricsChartsProps> = ({
  chartData,
  type,
  dataKey,
  color,
  yAxisLabel,
  valueFormatter = (value) => value.toString(),
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      let statusBadge = null;
      if (dataKey === 'burnMultiple') {
        const value = Number(data.burnMultiple);
        if (value < 1) {
          statusBadge = <Badge className="bg-green-500 text-white">Efficient</Badge>;
        } else if (value < 2) {
          statusBadge = <Badge className="bg-yellow-500 text-white">Good</Badge>;
        } else {
          statusBadge = <Badge variant="destructive">Concerning</Badge>;
        }
      }
      
      return (
        <Card className="border shadow-sm p-2 bg-white dark:bg-gray-900">
          <CardContent className="p-2">
            <p className="font-medium">{label}</p>
            <p className="text-sm text-muted-foreground">
              {valueFormatter(payload[0].value)}
            </p>
            {statusBadge}
          </CardContent>
        </Card>
      );
    }
  
    return null;
  };

  const renderChart = () => {
    if (type === 'line') {
      return (
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis 
            tickFormatter={valueFormatter} 
            label={{ 
              value: yAxisLabel, 
              angle: -90, 
              position: 'insideLeft', 
              style: { textAnchor: 'middle' } 
            }} 
            tick={{ fontSize: 12 }} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey={dataKey}
            stroke={color}
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
        </LineChart>
      );
    }
    
    if (type === 'bar') {
      return (
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis 
            tickFormatter={valueFormatter} 
            label={{ 
              value: yAxisLabel, 
              angle: -90, 
              position: 'insideLeft', 
              style: { textAnchor: 'middle' } 
            }} 
            tick={{ fontSize: 12 }} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey={dataKey} fill={color} />
        </BarChart>
      );
    }
    
    return null;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default MetricsCharts;
