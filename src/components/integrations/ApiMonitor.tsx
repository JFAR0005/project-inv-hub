
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { 
  LineChart, 
  BarChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  TooltipProps 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Download, Activity, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ApiUsageData {
  date: string;
  requests: number;
  successes: number;
  failures: number;
  latency: number;
}

interface EndpointStats {
  endpoint: string;
  requests: number;
  successes: number;
  failures: number;
  avg_latency: number;
}

interface RateLimitInfo {
  limit: number;
  used: number;
  resetAt: string;
}

interface RateLimits {
  daily: RateLimitInfo;
  monthly: RateLimitInfo;
}

const ApiMonitor: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');
  const [tab, setTab] = useState('usage');
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Get API usage data
  const { data: usageData = [], isLoading: isLoadingUsage } = useQuery({
    queryKey: ['api-usage', timeRange],
    queryFn: async () => {
      // Simulate API call - In a real app, this would fetch from your database
      // Create mock data
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const data: ApiUsageData[] = [];
      
      const now = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Generate some realistic looking data
        const requests = Math.floor(Math.random() * 1000) + 500;
        const failures = Math.floor(Math.random() * (requests * 0.1));
        
        data.push({
          date: format(date, 'yyyy-MM-dd'),
          requests,
          successes: requests - failures,
          failures,
          latency: Math.floor(Math.random() * 300) + 100,
        });
      }
      
      return data;
    },
    enabled: !!user,
  });

  // Get endpoint stats
  const { data: endpointStats = [], isLoading: isLoadingEndpoints } = useQuery({
    queryKey: ['endpoint-stats', timeRange],
    queryFn: async () => {
      // Simulate API call - In a real app, this would fetch from your database
      // Create mock data for different endpoints
      const endpoints = [
        '/api/companies', 
        '/api/comments', 
        '/api/meetings', 
        '/api/metrics',
        '/api/documents',
        '/api/users',
        '/api/webhooks',
        '/api/integrations',
        '/api/analytics',
        '/api/auth'
      ];
      
      return endpoints.map(endpoint => {
        const requests = Math.floor(Math.random() * 10000) + 1000;
        const failures = Math.floor(Math.random() * (requests * 0.05));
        
        return {
          endpoint,
          requests,
          successes: requests - failures,
          failures,
          avg_latency: Math.floor(Math.random() * 300) + 50,
        };
      }).sort((a, b) => b.requests - a.requests);
    },
    enabled: !!user,
  });

  // Get rate limits
  const { data: rateLimits = { 
    daily: { limit: 10000, used: 5000, resetAt: new Date().toISOString() },
    monthly: { limit: 300000, used: 150000, resetAt: new Date().toISOString() }
  }, isLoading: isLoadingRateLimits } = useQuery({
    queryKey: ['rate-limits'],
    queryFn: async () => {
      // Simulate API call - In a real app, this would fetch your actual rate limits
      return {
        daily: {
          limit: 10000,
          used: Math.floor(Math.random() * 8000) + 1000,
          resetAt: new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000).toISOString(),
        },
        monthly: {
          limit: 300000,
          used: Math.floor(Math.random() * 240000) + 50000,
          resetAt: new Date(new Date().setDate(1)).toISOString(),
        }
      } as RateLimits;
    },
    enabled: !!user,
  });

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-green-600">
            Success: {payload[0].value} requests
          </p>
          <p className="text-sm text-red-600">
            Failed: {payload[1].value} requests
          </p>
          <p className="text-sm text-blue-600">
            Avg Latency: {payload[2].value} ms
          </p>
        </div>
      );
    }
  
    return null;
  };

  const endpointPerformance = endpointStats.map(stat => ({
    name: stat.endpoint,
    success: (stat.successes / stat.requests) * 100,
    latency: stat.avg_latency,
  }));

  // Calculate overall statistics
  const totalRequests = usageData.reduce((sum, day) => sum + day.requests, 0);
  const totalSuccesses = usageData.reduce((sum, day) => sum + day.successes, 0);
  const totalFailures = usageData.reduce((sum, day) => sum + day.failures, 0);
  const avgLatency = usageData.length > 0 
    ? Math.round(usageData.reduce((sum, day) => sum + day.latency, 0) / usageData.length) 
    : 0;
  const successRate = totalRequests > 0 ? (totalSuccesses / totalRequests * 100).toFixed(2) : '100.00';

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please log in to view API monitoring.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">API Monitoring</h2>
          <p className="text-muted-foreground">
            Monitor your API usage, performance metrics, and rate limits.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[160px] justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold">{successRate}%</div>
              <Badge variant="outline" className={Number(successRate) >= 99 ? "bg-green-100 text-green-800" : Number(successRate) >= 95 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                {Number(successRate) >= 99 ? "Excellent" : Number(successRate) >= 95 ? "Good" : "Poor"}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold">{totalFailures.toLocaleString()}</div>
              {totalFailures > 50 && (
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  High
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-2xl font-bold">{avgLatency} ms</div>
              <Badge variant="outline" className={avgLatency < 150 ? "bg-green-100 text-green-800" : avgLatency < 300 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                {avgLatency < 150 ? "Fast" : avgLatency < 300 ? "Average" : "Slow"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Rate Limits
          </CardTitle>
          <CardDescription>
            Monitor your API usage against your rate limits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Daily usage</span>
                <span className="font-medium">{rateLimits.daily.used.toLocaleString()} / {rateLimits.daily.limit.toLocaleString()}</span>
              </div>
              <Progress value={(rateLimits.daily.used / rateLimits.daily.limit) * 100} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Resets at {new Date(rateLimits.daily.resetAt).toLocaleTimeString()}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monthly usage</span>
                <span className="font-medium">{rateLimits.monthly.used.toLocaleString()} / {rateLimits.monthly.limit.toLocaleString()}</span>
              </div>
              <Progress value={(rateLimits.monthly.used / rateLimits.monthly.limit) * 100} className="h-2" />
              <div className="text-xs text-muted-foreground">
                Resets on {format(new Date(rateLimits.monthly.resetAt), 'MMMM 1')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Main Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="usage">Usage Trends</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoint Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Usage Trends</CardTitle>
              <CardDescription>
                Visualize your API request volume and performance metrics over time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUsage ? (
                <div className="h-[400px] bg-gray-50 animate-pulse rounded" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={usageData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="successes"
                      name="Successful Requests"
                      stroke="#10b981"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="failures"
                      name="Failed Requests"
                      stroke="#f43f5e"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="latency"
                      name="Avg Latency (ms)"
                      stroke="#3b82f6"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Performance</CardTitle>
              <CardDescription>
                Monitor performance metrics for individual API endpoints.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEndpoints ? (
                <div className="h-[400px] bg-gray-50 animate-pulse rounded" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={endpointPerformance}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="success" name="Success Rate (%)" fill="#10b981" />
                    <Bar dataKey="latency" name="Avg Latency (ms)" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Endpoints by Usage</CardTitle>
              <CardDescription>
                Most frequently used API endpoints.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endpointStats.slice(0, 5).map((endpoint) => (
                  <div key={endpoint.endpoint} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-sm">{endpoint.endpoint}</span>
                      <Badge variant="outline">{endpoint.requests.toLocaleString()} requests</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(endpoint.successes / endpoint.requests) * 100} 
                        className={cn("h-2 flex-1", {
                          "bg-green-500": (endpoint.successes / endpoint.requests) * 100 >= 99,
                          "bg-yellow-500": (endpoint.successes / endpoint.requests) * 100 >= 95 && (endpoint.successes / endpoint.requests) * 100 < 99,
                          "bg-red-500": (endpoint.successes / endpoint.requests) * 100 < 95
                        })}
                      />
                      <span className="text-xs text-muted-foreground w-12">
                        {((endpoint.successes / endpoint.requests) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiMonitor;
