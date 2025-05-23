
import { SearchFilters } from '@/components/portfolio/AdvancedSearch';

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
}

export const filterCompanies = (companies: Company[], filters: SearchFilters): Company[] => {
  return companies.filter(company => {
    // Text search - optimized with early return
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const searchableText = `${company.name} ${company.sector} ${company.stage} ${company.location}`.toLowerCase();
      if (!searchableText.includes(query)) return false;
    }

    // Exact match filters - fastest checks first
    if (filters.sectors.length > 0 && !filters.sectors.includes(company.sector)) return false;
    if (filters.stages.length > 0 && !filters.stages.includes(company.stage)) return false;
    if (filters.locations.length > 0 && !filters.locations.includes(company.location)) return false;
    if (filters.riskLevels.length > 0 && !filters.riskLevels.includes(company.riskLevel)) return false;

    // Range filters - more expensive checks last
    const arr = company.arr || 0;
    if (arr < filters.arrRange[0] || arr > filters.arrRange[1]) return false;

    const growth = company.growth || 0;
    if (growth < filters.growthRange[0] || growth > filters.growthRange[1]) return false;

    const headcount = company.headcount || 0;
    if (headcount < filters.headcountRange[0] || headcount > filters.headcountRange[1]) return false;

    return true;
  });
};

export const sortCompanies = (companies: Company[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): Company[] => {
  return [...companies].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Company];
    let bValue: any = b[sortBy as keyof Company];
    
    // Handle null/undefined values
    if (aValue === null || aValue === undefined) aValue = 0;
    if (bValue === null || bValue === undefined) bValue = 0;
    
    // Convert to numbers if needed
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // String comparison
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    
    if (sortOrder === 'asc') {
      return aStr.localeCompare(bStr);
    } else {
      return bStr.localeCompare(aStr);
    }
  });
};

export const formatCurrency = (value: number | null): string => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${Math.round(value).toLocaleString()}`;
};

export const formatPercentage = (value: number | null): string => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const getRiskBadgeVariant = (riskLevel: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (riskLevel) {
    case 'High': return 'destructive';
    case 'Medium': return 'secondary';
    case 'Low': return 'outline';
    default: return 'outline';
  }
};

export const calculatePortfolioMetrics = (companies: Company[]) => {
  const totalCompanies = companies.length;
  const totalARR = companies.reduce((sum, company) => sum + (company.arr || 0), 0);
  const avgGrowth = companies.reduce((sum, company) => sum + (company.growth || 0), 0) / totalCompanies;
  const totalHeadcount = companies.reduce((sum, company) => sum + (company.headcount || 0), 0);
  
  const riskDistribution = companies.reduce((acc, company) => {
    acc[company.riskLevel] = (acc[company.riskLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sectorDistribution = companies.reduce((acc, company) => {
    acc[company.sector] = (acc[company.sector] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalCompanies,
    totalARR,
    avgGrowth,
    totalHeadcount,
    riskDistribution,
    sectorDistribution,
    highGrowthCompanies: companies.filter(c => (c.growth || 0) > 50).length,
    atRiskCompanies: companies.filter(c => c.riskLevel === 'High').length
  };
};
