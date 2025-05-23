
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import CompanyCard, { CompanyCardData } from './CompanyCard';

interface Company {
  id: string;
  name: string;
  sector: string;
  stage: string;
  location: string;
  arr: number;
  growth: number;
  headcount: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  website?: string;
  logo_url?: string;
  description?: string;
  burn_rate?: number;
  runway?: number;
  churn_rate?: number;
  mrr?: number;
}

interface PortfolioGridProps {
  companies: Company[];
}

const PortfolioGrid: React.FC<PortfolioGridProps> = ({ companies }) => {
  const { user } = useAuth();
  const showSensitiveData = user?.role === 'admin' || user?.role === 'partner';

  // Transform companies to CompanyCardData format
  const companyCards: CompanyCardData[] = companies.map(company => ({
    id: company.id,
    name: company.name,
    sector: company.sector,
    stage: company.stage,
    latest_arr: company.arr,
    latest_mrr: company.mrr,
    latest_runway: company.runway,
    latest_headcount: company.headcount,
    latest_growth: company.growth,
    raise_status: null, // This would come from founder updates in the enhanced view
    last_update: null, // This would come from founder updates in the enhanced view
    needs_attention: company.riskLevel === 'High',
  }));

  return (
    <div className="space-y-6">
      {/* Company Grid */}
      {companyCards.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            No companies match your current filters.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companyCards.map(company => (
            <CompanyCard 
              key={company.id} 
              company={company}
              showSensitiveData={showSensitiveData}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PortfolioGrid;
