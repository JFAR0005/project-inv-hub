
import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import CompanyProfile from '@/components/company/CompanyProfile';

const CompanyProfilePage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800">Invalid Company ID</h2>
          <p className="text-gray-600 mt-2">The company ID provided is not valid.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <CompanyProfile />
    </Layout>
  );
};

export default CompanyProfilePage;
