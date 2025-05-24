
import React from 'react';
import RoleGuard from '@/components/layout/RoleGuard';
import EnhancedPortfolioView from '@/components/portfolio/EnhancedPortfolioView';

const EnhancedPortfolio = () => {
  return (
    <RoleGuard allowedRoles={['admin', 'partner', 'capital_team']}>
      <EnhancedPortfolioView />
    </RoleGuard>
  );
};

export default EnhancedPortfolio;
