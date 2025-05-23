
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
  Legend
} from 'recharts';

interface MetricsChartsProps {
  data: any[];
  type: 'line' | 'bar';
  dataKey: string;
  color: string;
  yAxisLabel?: string;
  valueFormatter?: (value: number) => string;
}

const MetricsCharts: React.FC<MetricsChartsProps> = ({
  data,
  type,
  dataKey,
  color,
  yAxisLabel,
  valueFormatter = (value) => `${value}`
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-700">
            {valueFormatter(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickMargin={10}
            label={{ 
              value: yAxisLabel, 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickMargin={10}
          label={{ 
            value: yAxisLabel, 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle', fontSize: 12, fill: '#6b7280' }
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          dataKey={dataKey}
          fill={color}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MetricsCharts;
