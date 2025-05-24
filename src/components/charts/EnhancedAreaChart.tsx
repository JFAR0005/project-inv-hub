
import React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

interface EnhancedAreaChartProps {
  data: any[];
  areas: {
    dataKey: string;
    color: string;
    label: string;
    fillOpacity?: number;
  }[];
  xAxisKey: string;
  height?: number;
  formatValue?: (value: any) => string;
  showLegend?: boolean;
  showGrid?: boolean;
  stacked?: boolean;
}

const EnhancedAreaChart: React.FC<EnhancedAreaChartProps> = ({
  data,
  areas,
  xAxisKey,
  height = 300,
  formatValue = (value) => value?.toString() || '',
  showLegend = true,
  showGrid = true,
  stacked = false,
}) => {
  const chartConfig = areas.reduce((config, area) => {
    config[area.dataKey] = {
      label: area.label,
      color: area.color,
    };
    return config;
  }, {} as any);

  return (
    <ChartContainer config={chartConfig} className={`h-[${height}px]`}>
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
        {areas.map((area) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            stackId={stacked ? "1" : area.dataKey}
            stroke={area.color}
            fill={area.color}
            fillOpacity={area.fillOpacity || 0.3}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
};

export default EnhancedAreaChart;
