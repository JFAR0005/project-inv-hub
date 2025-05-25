
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Download, RefreshCw } from 'lucide-react';
import PortfolioMetrics from './PortfolioMetrics';
import PerformanceCharts from './PerformanceCharts';
import PortfolioReports from './PortfolioReports';

// Mock data for demonstration
const mockPortfolioData = {
  totalCompanies: 24,
  totalValuation: 480000000,
  totalARR: 85000000,
  avgGrowthRate: 22.5,
  companiesRaising: 6,
  companiesNeedingUpdates: 3
};

const mockTimeSeriesData = [
  { month: 'Jan', portfolioValue: 350000000, totalARR: 65000000, newInvestments: 2, companies: 20 },
  { month: 'Feb', portfolioValue: 365000000, totalARR: 68000000, newInvestments: 1, companies: 21 },
  { month: 'Mar', portfolioValue: 380000000, totalARR: 72000000, newInvestments: 1, companies: 22 },
  { month: 'Apr', portfolioValue: 395000000, totalARR: 75000000, newInvestments: 0, companies: 22 },
  { month: 'May', portfolioValue: 420000000, totalARR: 79000000, newInvestments: 1, companies: 23 },
  { month: 'Jun', portfolioValue: 480000000, totalARR: 85000000, newInvestments: 1, companies: 24 }
];

const mockSectorData = [
  { name: 'SaaS', value: 180000000, companies: 8 },
  { name: 'FinTech', value: 120000000, companies: 5 },
  { name: 'HealthTech', value: 90000000, companies: 4 },
  { name: 'E-commerce', value: 60000000, companies: 4 },
  { name: 'AI/ML', value: 30000000, companies: 3 }
];

const mockStageData = [
  { stage: 'Seed', companies: 8, totalValue: 45000000 },
  { stage: 'Series A', companies: 9, totalValue: 180000000 },
  { stage: 'Series B', companies: 5, totalValue: 200000000 },
  { stage: 'Series C+', companies: 2, totalValue: 55000000 }
];

const mockCompanyPerformance = [
  {
    id: '1',
    name: 'TechFlow Solutions',
    sector: 'SaaS',
    stage: 'Series A',
    currentARR: 12000000,
    previousARR: 9500000,
    growthRate: 26.3,
    lastUpdate: '2024-05-15',
    riskLevel: 'Low' as const
  },
  {
    id: '2',
    name: 'DataViz Pro',
    sector: 'AI/ML',
    stage: 'Seed',
    currentARR: 2800000,
    previousARR: 2200000,
    growthRate: 27.3,
    lastUpdate: '2024-05-20',
    riskLevel: 'Medium' as const
  },
  {
    id: '3',
    name: 'CloudSecure',
    sector: 'SaaS',
    stage: 'Series B',
    currentARR: 45000000,
    previousARR: 38000000,
    growthRate: 18.4,
    lastUpdate: '2024-05-18',
    riskLevel: 'Low' as const
  },
  {
    id: '4',
    name: 'FinanceAI',
    sector: 'FinTech',
    stage: 'Series A',
    currentARR: 8500000,
    previousARR: 9200000,
    growthRate: -7.6,
    lastUpdate: '2024-04-28',
    riskLevel: 'High' as const
  }
];

const AnalyticsDashboard: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Analytics</h1>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance Charts</TabsTrigger>
          <TabsTrigger value="reports">Detailed Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PortfolioMetrics portfolioData={mockPortfolioData} />
          
          {/* Quick Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600">Top Performers</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• DataViz Pro: +27.3% ARR growth</li>
                    <li>• TechFlow Solutions: +26.3% ARR growth</li>
                    <li>• CloudSecure: Strong Series B performance</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-600">Attention Needed</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• FinanceAI: -7.6% ARR decline</li>
                    <li>• 3 companies overdue for updates</li>
                    <li>• 2 companies approaching runway concerns</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceCharts
            timeSeriesData={mockTimeSeriesData}
            sectorData={mockSectorData}
            stageData={mockStageData}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <PortfolioReports companies={mockCompanyPerformance} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
