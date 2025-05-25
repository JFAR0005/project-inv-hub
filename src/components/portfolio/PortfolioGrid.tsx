
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import CompanyCard, { CompanyCardData } from './CompanyCard';
import { UpdateFreshnessIndicator, RaiseStatusIndicator } from './PortfolioHealthIndicators';

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
  last_update?: string;
  raise_status?: string;
  needs_attention?: boolean;
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
    raise_status: company.raise_status || null,
    last_update: company.last_update || null,
    needs_attention: company.needs_attention || false,
  }));

  return (
    <div className="space-y-6">
      {/* Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-red-800">Need Updates</h3>
            <span className="text-2xl font-bold text-red-600">
              {companies.filter(c => c.needs_attention).length}
            </span>
          </div>
          <p className="text-sm text-red-600 mt-1">Companies overdue for updates</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-green-800">Raising</h3>
            <span className="text-2xl font-bold text-green-600">
              {companies.filter(c => c.raise_status?.toLowerCase().includes('raising') || c.raise_status?.toLowerCase().includes('active')).length}
            </span>
          </div>
          <p className="text-sm text-green-600 mt-1">Currently fundraising</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-blue-800">Up to Date</h3>
            <span className="text-2xl font-bold text-blue-600">
              {companies.filter(c => !c.needs_attention).length}
            </span>
          </div>
          <p className="text-sm text-blue-600 mt-1">Recent updates received</p>
        </div>
      </div>

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
