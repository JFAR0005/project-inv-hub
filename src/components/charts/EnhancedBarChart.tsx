
import React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

interface EnhancedBarChartProps {
  data: any[];
  bars: {
    dataKey: string;
    color: string;
    label: string;
  }[];
  xAxisKey: string;
  height?: number;
  formatValue?: (value: any) => string;
  showLegend?: boolean;
  showGrid?: boolean;
  layout?: 'horizontal' | 'vertical';
}

const EnhancedBarChart: React.FC<EnhancedBarChartProps> = ({
  data,
  bars,
  xAxisKey,
  height = 300,
  formatValue = (value) => value?.toString() || '',
  showLegend = true,
  showGrid = true,
  layout = 'vertical',
}) => {
  const chartConfig = bars.reduce((config, bar) => {
    config[bar.dataKey] = {
      label: bar.label,
      color: bar.color,
    };
    return config;
  }, {} as any);

  return (
    <ChartContainer config={chartConfig} className={`h-[${height}px]`}>
      <BarChart 
        data={data} 
        layout={layout}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
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
        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            fill={bar.color}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
};

export default EnhancedBarChart;
