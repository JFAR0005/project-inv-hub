
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PortfolioAnalytics from '@/components/portfolio/PortfolioAnalytics';
import PortfolioMetricsDashboard from '@/components/analytics/PortfolioMetricsDashboard';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive portfolio analysis, performance metrics, and insights
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Analytics</TabsTrigger>
          <TabsTrigger value="metrics">Portfolio Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div>
            <h2 className="text-xl font-semibold mb-4">Portfolio Analytics Overview</h2>
            <PortfolioAnalytics />
          </div>
        </TabsContent>

        <TabsContent value="advanced">
          <div>
            <h2 className="text-xl font-semibold mb-4">Advanced Analytics Dashboard</h2>
            <AnalyticsDashboard />
          </div>
        </TabsContent>

        <TabsContent value="metrics">
          <div>
            <h2 className="text-xl font-semibold mb-4">Portfolio Metrics Dashboard</h2>
            <PortfolioMetricsDashboard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
