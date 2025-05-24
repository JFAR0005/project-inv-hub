
import React from 'react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

interface EnhancedPieChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  colors: string[];
  height?: number;
  formatValue?: (value: any) => string;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

const EnhancedPieChart: React.FC<EnhancedPieChartProps> = ({
  data,
  dataKey,
  nameKey,
  colors,
  height = 300,
  formatValue = (value) => value?.toString() || '',
  showLegend = true,
  innerRadius = 0,
  outerRadius = 80,
}) => {
  const chartConfig = data.reduce((config, item, index) => {
    config[item[nameKey]] = {
      label: item[nameKey],
      color: colors[index % colors.length],
    };
    return config;
  }, {} as any);

  return (
    <ChartContainer config={chartConfig} className={`h-[${height}px]`}>
      <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          dataKey={dataKey}
          nameKey={nameKey}
          label={({ name, value }) => `${name}: ${formatValue(value)}`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <ChartTooltip 
          content={
            <ChartTooltipContent 
              formatter={(value, name) => [formatValue(value), name]}
            />
          }
        />
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
      </PieChart>
    </ChartContainer>
  );
};

export default EnhancedPieChart;
