
import React from 'react';
import Layout from '@/components/layout/Layout';
import RoleGuard from '@/components/layout/RoleGuard';
import EnhancedPortfolioView from '@/components/portfolio/EnhancedPortfolioView';

const EnhancedPortfolio = () => {
  return (
    <RoleGuard allowedRoles={['admin', 'partner', 'analyst', 'lp']}>
      <Layout>
        <EnhancedPortfolioView />
      </Layout>
    </RoleGuard>
  );
};

export default EnhancedPortfolio;
