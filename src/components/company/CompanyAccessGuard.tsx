
import React from 'react';
import { useParams } from 'react-router-dom';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import AccessDenied from '@/components/layout/AccessDenied';

interface CompanyAccessGuardProps {
  children: React.ReactNode;
  requireEdit?: boolean;
}

const CompanyAccessGuard: React.FC<CompanyAccessGuardProps> = ({ 
  children, 
  requireEdit = false 
}) => {
  const { id } = useParams<{ id: string }>();
  const { canViewCompany, canEditCompany, userRole } = useRolePermissions();

  if (!id) {
    return (
      <AccessDenied 
        userRole={userRole}
        message="Company ID is required to access this page."
      />
    );
  }

  const hasAccess = requireEdit ? canEditCompany(id) : canViewCompany(id);

  if (!hasAccess) {
    return (
      <AccessDenied 
        userRole={userRole}
        message={`You don't have permission to ${requireEdit ? 'edit' : 'view'} this company.`}
      />
    );
  }

  return <>{children}</>;
};

export default CompanyAccessGuard;
