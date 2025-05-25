
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, Area, AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Calendar, Filter, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Company {
  id: string;
  name: string;
  sector: string;
  stage: string;
  headcount: number;
  mrr: number;
  arr: number;
  burn_rate: number;
  runway: number;
  churn_rate: number;
  created_at: string;
}

interface AdvancedPortfolioAnalyticsProps {
  companies: Company[];
}

const AdvancedPortfolioAnalytics: React.FC<AdvancedPortfolioAnalyticsProps> = ({ companies }) => {
  const [timeRange, setTimeRange] = useState('12m');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter companies based on current filters
  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = sectorFilter === 'all' || company.sector === sectorFilter;
      const matchesStage = stageFilter === 'all' || company.stage === stageFilter;
      return matchesSearch && matchesSector && matchesStage;
    });
  }, [companies, searchTerm, sectorFilter, stageFilter]);

  // Get unique sectors and stages for filters
  const sectors = [...new Set(companies.map(c => c.sector).filter(Boolean))];
  const stages = [...new Set(companies.map(c => c.stage).filter(Boolean))];

  // Portfolio overview metrics
  const portfolioMetrics = useMemo(() => {
    const totalCompanies = filteredCompanies.length;
    const totalARR = filteredCompanies.reduce((sum, c) => sum + (c.arr || 0), 0);
    const totalMRR = filteredCompanies.reduce((sum, c) => sum + (c.mrr || 0), 0);
    const totalHeadcount = filteredCompanies.reduce((sum, c) => sum + (c.headcount || 0), 0);
    const averageRunway = filteredCompanies.length > 0 
      ? filteredCompanies.reduce((sum, c) => sum + (c.runway || 0), 0) / filteredCompanies.length 
      : 0;
    const averageChurn = filteredCompanies.length > 0
      ? filteredCompanies.reduce((sum, c) => sum + (c.churn_rate || 0), 0) / filteredCompanies.length
      : 0;

    return {
      totalCompanies,
      totalARR,
      totalMRR,
      totalHeadcount,
      averageRunway,
      averageChurn
    };
  }, [filteredCompanies]);

  // Sector distribution data
  const sectorData = useMemo(() => {
    const sectorCounts = filteredCompanies.reduce((acc, company) => {
      const sector = company.sector || 'Unknown';
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sectorCounts).map(([sector, count]) => ({
      sector,
      count,
      value: count
    }));
  }, [filteredCompanies]);

  // Stage distribution data
  const stageData = useMemo(() => {
    const stageCounts = filteredCompanies.reduce((acc, company) => {
      const stage = company.stage || 'Unknown';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stageCounts).map(([stage, count]) => ({
      stage,
      count,
      arr: filteredCompanies
        .filter(c => c.stage === stage)
        .reduce((sum, c) => sum + (c.arr || 0), 0)
    }));
  }, [filteredCompanies]);

  // Performance metrics over time (mock data for demonstration)
  const performanceData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      month,
      totalARR: portfolioMetrics.totalARR * (0.8 + index * 0.02),
      averageRunway: portfolioMetrics.averageRunway * (0.9 + Math.sin(index) * 0.1),
      churnRate: Math.max(0, portfolioMetrics.averageChurn * (1.2 - index * 0.1))
    }));
  }, [portfolioMetrics]);

  // Growth vs Burn analysis
  const growthBurnData = useMemo(() => {
    return filteredCompanies
      .filter(company => company.mrr && company.burn_rate)
      .map(company => ({
        name: company.name,
        growth: (company.mrr || 0) * 12, // Annualized
        burn: company.burn_rate || 0,
        efficiency: company.mrr && company.burn_rate ? (company.mrr * 12) / company.burn_rate : 0
      }));
  }, [filteredCompanies]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Portfolio Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {sectors.map(sector => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {stages.map(stage => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="12m">Last 12 Months</SelectItem>
                <SelectItem value="24m">Last 24 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              {sectorFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Sector: {sectorFilter}
                  <button onClick={() => setSectorFilter('all')} className="ml-1 text-xs">×</button>
                </Badge>
              )}
              {stageFilter !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Stage: {stageFilter}
                  <button onClick={() => setStageFilter('all')} className="ml-1 text-xs">×</button>
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Companies</p>
                <p className="text-2xl font-bold">{portfolioMetrics.totalCompanies}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total ARR</p>
                <p className="text-2xl font-bold">{formatCurrency(portfolioMetrics.totalARR)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total MRR</p>
                <p className="text-2xl font-bold">{formatCurrency(portfolioMetrics.totalMRR)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Headcount</p>
                <p className="text-2xl font-bold">{portfolioMetrics.totalHeadcount}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Runway</p>
                <p className="text-2xl font-bold">{portfolioMetrics.averageRunway.toFixed(1)}m</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Churn</p>
                <p className="text-2xl font-bold">{portfolioMetrics.averageChurn.toFixed(1)}%</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="growth">Growth Analysis</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio ARR Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'ARR']} />
                    <Area 
                      type="monotone" 
                      dataKey="totalARR" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio Health Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="averageRunway" 
                      stroke="#00C49F" 
                      name="Avg Runway (months)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="churnRate" 
                      stroke="#FF8042" 
                      name="Churn Rate (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Companies by Sector</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ sector, count }) => `${sector}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`sector-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ARR by Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'ARR']} />
                    <Bar dataKey="arr" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Growth vs Burn Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">
                Companies positioned in the top-left quadrant (high growth, low burn) are performing optimally
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis 
                    type="number" 
                    dataKey="burn" 
                    name="Monthly Burn"
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="growth" 
                    name="Annualized Growth"
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value, name) => [
                      name === 'growth' ? formatCurrency(Number(value)) : formatCurrency(Number(value)),
                      name === 'growth' ? 'Annualized Growth' : 'Monthly Burn'
                    ]}
                  />
                  <Scatter data={growthBurnData} fill="#8884d8">
                    {growthBurnData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Benchmarks</CardTitle>
              <p className="text-sm text-muted-foreground">
                Compare your portfolio metrics against industry benchmarks
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Growth Rate</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Portfolio Avg</span>
                        <span className="font-medium">24%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Industry Avg</span>
                        <span className="font-medium">18%</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Above Average</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Burn Efficiency</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Portfolio Avg</span>
                        <span className="font-medium">2.3x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Industry Avg</span>
                        <span className="font-medium">1.8x</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Runway</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Portfolio Avg</span>
                        <span className="font-medium">{portfolioMetrics.averageRunway.toFixed(1)}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Recommended</span>
                        <span className="font-medium">18m+</span>
                      </div>
                      <Badge className={portfolioMetrics.averageRunway >= 18 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                        {portfolioMetrics.averageRunway >= 18 ? "Healthy" : "Monitor"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedPortfolioAnalytics;
