
import React from 'react';
import RoleGuard from '@/components/layout/RoleGuard';
import EnhancedPortfolioView from '@/components/portfolio/EnhancedPortfolioView';

const EnhancedPortfolio = () => {
  return (
    <RoleGuard allowedRoles={['admin', 'partner', 'analyst', 'lp']}>
      <EnhancedPortfolioView />
    </RoleGuard>
  );
};

export default EnhancedPortfolio;

