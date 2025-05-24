
import React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

interface EnhancedLineChartProps {
  data: any[];
  lines: {
    dataKey: string;
    color: string;
    label: string;
  }[];
  xAxisKey: string;
  height?: number;
  formatValue?: (value: any) => string;
  showLegend?: boolean;
  showGrid?: boolean;
}

const EnhancedLineChart: React.FC<EnhancedLineChartProps> = ({
  data,
  lines,
  xAxisKey,
  height = 300,
  formatValue = (value) => value?.toString() || '',
  showLegend = true,
  showGrid = true,
}) => {
  const chartConfig = lines.reduce((config, line) => {
    config[line.dataKey] = {
      label: line.label,
      color: line.color,
    };
    return config;
  }, {} as any);

  return (
    <ChartContainer config={chartConfig} className={`h-[${height}px]`}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
        <XAxis 
          dataKey={xAxisKey} 
          className="text-muted-foreground"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          className="text-muted-foreground"
          tick={{ fontSize: 12 }}
          tickFormatter={formatValue}
        />
        <ChartTooltip 
          content={
            <ChartTooltipContent 
              formatter={(value, name) => [formatValue(value), chartConfig[name]?.label || name]}
            />
          }
        />
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
};

export default EnhancedLineChart;
