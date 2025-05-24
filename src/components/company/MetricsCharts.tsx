
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EnhancedLineChart from '@/components/charts/EnhancedLineChart';
import EnhancedBarChart from '@/components/charts/EnhancedBarChart';

interface MetricsChartsProps {
  chartData: any[];
  type: 'line' | 'bar';
  dataKey: string;
  color: string;
  yAxisLabel?: string;
  valueFormatter?: (value: any) => string;
  title?: string;
  description?: string;
}

const MetricsCharts: React.FC<MetricsChartsProps> = ({
  chartData,
  type,
  dataKey,
  color,
  yAxisLabel,
  valueFormatter = (value) => value.toString(),
  title,
  description,
}) => {
  const getStatusBadge = (value: number, metricType: string) => {
    if (metricType === 'burnMultiple') {
      if (value < 1) {
        return <Badge className="bg-green-500 text-white">Efficient</Badge>;
      } else if (value < 2) {
        return <Badge className="bg-yellow-500 text-white">Good</Badge>;
      } else {
        return <Badge variant="destructive">Concerning</Badge>;
      }
    }
    return null;
  };

  const renderChart = () => {
    if (type === 'line') {
      return (
        <EnhancedLineChart
          data={chartData}
          lines={[
            {
              dataKey: dataKey,
              color: color,
              label: yAxisLabel || dataKey,
            }
          ]}
          xAxisKey="date"
          height={300}
          formatValue={valueFormatter}
          showGrid={true}
          showLegend={false}
        />
      );
    }
    
    if (type === 'bar') {
      return (
        <EnhancedBarChart
          data={chartData}
          bars={[
            {
              dataKey: dataKey,
              color: color,
              label: yAxisLabel || dataKey,
            }
          ]}
          xAxisKey="date"
          height={300}
          formatValue={valueFormatter}
          showGrid={true}
          showLegend={false}
        />
      );
    }
    
    return null;
  };

  const latestValue = chartData.length > 0 ? chartData[chartData.length - 1][dataKey] : 0;
  const statusBadge = getStatusBadge(Number(latestValue), dataKey);

  return (
    <Card className="w-full">
      {(title || description) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {statusBadge}
          </div>
        </CardHeader>
      )}
      <CardContent>
        <div className="w-full h-full">
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricsCharts;
