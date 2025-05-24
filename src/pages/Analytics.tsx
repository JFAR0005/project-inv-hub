import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';
import PortfolioAnalytics from '@/components/portfolio/PortfolioAnalytics';
import PortfolioMetricsDashboard from '@/components/analytics/PortfolioMetricsDashboard';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive portfolio analysis, performance metrics, and insights
          </p>
        </div>
        <Link to="/portfolio-dashboard">
          <Button className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Interactive Dashboard
          </Button>
        </Link>
      </div>
      
      {/* Portfolio Metrics Dashboard */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Portfolio Metrics Overview</h2>
        <PortfolioMetricsDashboard />
      </div>
      
      {/* Existing Portfolio Analytics */}
      <PortfolioAnalytics />
    </div>
  );
};

export default Analytics;
