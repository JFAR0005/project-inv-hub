
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';
import PortfolioAnalytics from '@/components/portfolio/PortfolioAnalytics';
import EnhancedProtectedRoute from '@/components/layout/EnhancedProtectedRoute';

const Analytics = () => {
  return (
    <EnhancedProtectedRoute allowedRoles={['admin']}>
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
        <PortfolioAnalytics />
      </div>
    </EnhancedProtectedRoute>
  );
};

export default Analytics;
