
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ComposedChart, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

interface MetricsChartsProps {
  arrData: any[];
  headcountData: any[];
  burnRateData: any[];
  revenueGrowthData: any[];
}

const chartConfig = {
  arr: {
    label: "ARR",
    color: "hsl(var(--chart-1))",
  },
  headcount: {
    label: "Headcount",
    color: "hsl(var(--chart-2))",
  },
  burnRate: {
    label: "Burn Rate",
    color: "hsl(var(--chart-3))",
  },
  growth: {
    label: "Growth Rate",
    color: "hsl(var(--chart-4))",
  },
};

const MetricsCharts: React.FC<MetricsChartsProps> = ({
  arrData,
  headcountData,
  burnRateData,
  revenueGrowthData
}) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value.toLocaleString()}`;
  };

  const calculateGrowthRate = (data: any[]) => {
    if (data.length < 2) return 0;
    const latest = data[data.length - 1]?.value || 0;
    const previous = data[data.length - 2]?.value || 0;
    if (previous === 0) return 0;
    return ((latest - previous) / previous) * 100;
  };

  const arrGrowthRate = calculateGrowthRate(arrData);
  const headcountGrowthRate = calculateGrowthRate(headcountData);

  // Combine data for growth analysis
  const combinedData = arrData.map((item, index) => ({
    ...item,
    headcount: headcountData[index]?.value || 0,
    burnRate: burnRateData[index]?.value || 0,
  }));

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ARR Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  ARR Growth Trend
                </CardTitle>
                <CardDescription>
                  Annual Recurring Revenue over time
                  <span className={`ml-2 text-sm font-medium ${arrGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {arrGrowthRate >= 0 ? <TrendingUp className="inline h-3 w-3 mr-1" /> : <TrendingDown className="inline h-3 w-3 mr-1" />}
                    {Math.abs(arrGrowthRate).toFixed(1)}% vs last period
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={arrData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="formattedDate" 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={formatCurrency}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={chartConfig.arr.color}
                        fill={chartConfig.arr.color}
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Team Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Team Growth
                </CardTitle>
                <CardDescription>
                  Headcount progression
                  <span className={`ml-2 text-sm font-medium ${headcountGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {headcountGrowthRate >= 0 ? <TrendingUp className="inline h-3 w-3 mr-1" /> : <TrendingDown className="inline h-3 w-3 mr-1" />}
                    {Math.abs(headcountGrowthRate).toFixed(1)}% vs last period
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={headcountData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="formattedDate" 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="value" 
                        fill={chartConfig.headcount.color}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
              <CardDescription>Detailed ARR and MRR tracking with growth indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={combinedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fontSize: 12 }}
                      tickFormatter={formatCurrency}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="value"
                      fill={chartConfig.arr.color}
                      fillOpacity={0.3}
                      stroke={chartConfig.arr.color}
                      strokeWidth={2}
                      name="ARR"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="headcount"
                      stroke={chartConfig.headcount.color}
                      strokeWidth={2}
                      name="Headcount"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Growth Metrics</CardTitle>
              <CardDescription>Revenue growth rate and key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Growth Rate']}
                    />
                    <Line
                      type="monotone"
                      dataKey="growthRate"
                      stroke={chartConfig.growth.color}
                      strokeWidth={3}
                      dot={{ r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Efficiency Metrics</CardTitle>
              <CardDescription>ARR per employee and burn efficiency analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={combinedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fontSize: 12 }}
                      tickFormatter={formatCurrency}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={formatCurrency}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      yAxisId="left"
                      dataKey="value"
                      fill={chartConfig.arr.color}
                      name="ARR"
                      opacity={0.8}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="burnRate"
                      stroke={chartConfig.burnRate.color}
                      strokeWidth={2}
                      name="Monthly Burn"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MetricsCharts;
