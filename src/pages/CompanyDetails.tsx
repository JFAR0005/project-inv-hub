
import React from 'react';
import CompanyProfile from '@/components/company/CompanyProfile';
import CompanyAccessGuard from '@/components/company/CompanyAccessGuard';

const CompanyDetails = () => {
  return (
    <CompanyAccessGuard>
      <CompanyProfile />
    </CompanyAccessGuard>
  );
};

export default CompanyDetails;
