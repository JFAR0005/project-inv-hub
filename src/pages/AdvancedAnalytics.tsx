
import React from 'react';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import AccessDenied from '@/components/layout/AccessDenied';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';

const AdvancedAnalytics: React.FC = () => {
  const { canAccessCapitalFeatures, userRole } = useRoleAccess();

  if (!canAccessCapitalFeatures()) {
    return (
      <AccessDenied 
        userRole={userRole}
        requiredRoles={['admin', 'capital_team', 'partner']}
        message="You need capital team or partner access to view advanced analytics."
      />
    );
  }

  return <AnalyticsDashboard />;
};

export default AdvancedAnalytics;
