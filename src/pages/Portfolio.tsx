
import React from 'react';
import Layout from '@/components/layout/Layout';
import PortfolioList from '@/components/portfolio/PortfolioList';

const Portfolio = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Companies</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor the performance of portfolio companies
          </p>
        </div>
        
        <PortfolioList />
      </div>
    </Layout>
  );
};

export default Portfolio;
