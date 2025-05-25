
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Users, Building2, AlertTriangle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    timeframe: string;
  };
  icon: React.ReactNode;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {change && (
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          {change.type === 'increase' ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span className={change.type === 'increase' ? 'text-green-500' : 'text-red-500'}>
            {Math.abs(change.value)}%
          </span>
          <span>from {change.timeframe}</span>
        </div>
      )}
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
);

interface PortfolioMetricsProps {
  portfolioData: {
    totalCompanies: number;
    totalValuation: number;
    totalARR: number;
    avgGrowthRate: number;
    companiesRaising: number;
    companiesNeedingUpdates: number;
  };
}

const PortfolioMetrics: React.FC<PortfolioMetricsProps> = ({ portfolioData }) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title="Portfolio Companies"
        value={portfolioData.totalCompanies}
        icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
        description="Active investments"
      />
      
      <MetricCard
        title="Total Portfolio Value"
        value={formatCurrency(portfolioData.totalValuation)}
        change={{
          value: 12.5,
          type: 'increase',
          timeframe: 'last quarter'
        }}
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        description="Estimated portfolio valuation"
      />
      
      <MetricCard
        title="Total ARR"
        value={formatCurrency(portfolioData.totalARR)}
        change={{
          value: 8.2,
          type: 'increase',
          timeframe: 'last quarter'
        }}
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        description="Annual recurring revenue"
      />
      
      <MetricCard
        title="Average Growth Rate"
        value={`${portfolioData.avgGrowthRate}%`}
        change={{
          value: 2.1,
          type: 'increase',
          timeframe: 'last quarter'
        }}
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        description="Quarterly revenue growth"
      />
      
      <MetricCard
        title="Companies Raising"
        value={portfolioData.companiesRaising}
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        description="Currently fundraising"
      />
      
      <MetricCard
        title="Needing Updates"
        value={portfolioData.companiesNeedingUpdates}
        icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
        description="Overdue for monthly updates"
      />
    </div>
  );
};

export default PortfolioMetrics;
