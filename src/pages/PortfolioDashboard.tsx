import React from 'react';
import { useAuth } from '@/context/AuthContext';
import PortfolioErrorBoundary from '@/components/portfolio/PortfolioErrorBoundary';
import PortfolioOverview from '@/components/portfolio/PortfolioOverview';

const PortfolioDashboard = () => {
  const { user } = useAuth();

  return (
    <PortfolioErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Portfolio Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your portfolio companies and their performance
          </p>
        </div>

        <PortfolioOverview />
      </div>
    </PortfolioErrorBoundary>
  );
};

export default PortfolioDashboard;
