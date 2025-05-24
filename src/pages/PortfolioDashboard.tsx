
import React from 'react';
import RoleGuard from '@/components/layout/RoleGuard';
import InteractivePortfolioDashboard from '@/components/portfolio/InteractivePortfolioDashboard';

const PortfolioDashboard = () => {
  return (
    <RoleGuard allowedRoles={['admin', 'partner', 'capital_team']}>
      <div className="container mx-auto py-6">
        <InteractivePortfolioDashboard />
      </div>
    </RoleGuard>
  );
};

export default PortfolioDashboard;
