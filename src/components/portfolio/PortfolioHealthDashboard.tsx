
import React, { useState, useMemo } from 'react';
import { usePortfolioHealth } from '@/hooks/usePortfolioHealth';
import { useOverdueUpdateChecker } from '@/hooks/useOverdueUpdateChecker';
import PortfolioHealthMetrics from './health/PortfolioHealthMetrics';
import PortfolioHealthTabs from './health/PortfolioHealthTabs';
import DataLoadingState from '@/components/data/DataLoadingState';

const PortfolioHealthDashboard: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'needs-update' | 'raising'>('all');
  const { data: companies = [], isLoading } = usePortfolioHealth();
  
  // Enable automatic overdue update checking
  useOverdueUpdateChecker();

  // Calculate health metrics
  const healthMetrics = useMemo(() => {
    const total = companies.length;
    const needingUpdates = companies.filter(c => c.needsUpdate).length;
    const raising = companies.filter(c => c.isRaising).length;
    const healthy = companies.filter(c => !c.needsUpdate && !c.isRaising).length;
    
    return {
      total,
      needingUpdates,
      raising,
      healthy,
      percentageNeedingUpdates: total ? Math.round((needingUpdates / total) * 100) : 0,
      percentageRaising: total ? Math.round((raising / total) * 100) : 0
    };
  }, [companies]);

  if (isLoading) {
    return <DataLoadingState />;
  }

  return (
    <div className="space-y-6">
      <PortfolioHealthMetrics metrics={healthMetrics} />
      <PortfolioHealthTabs 
        companies={companies}
        metrics={healthMetrics}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />
    </div>
  );
};

export default PortfolioHealthDashboard;
