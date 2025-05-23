
import React from 'react';
import Layout from '@/components/layout/Layout';
import PortfolioAnalytics from '@/components/portfolio/PortfolioAnalytics';
import RoleGuard from '@/components/layout/RoleGuard';

const Analytics = () => {
  return (
    <Layout>
      <RoleGuard allowedRoles={['admin', 'partner', 'lp']}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Portfolio Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive portfolio analysis, performance metrics, and insights
            </p>
          </div>
          <PortfolioAnalytics />
        </div>
      </RoleGuard>
    </Layout>
  );
};

export default Analytics;
