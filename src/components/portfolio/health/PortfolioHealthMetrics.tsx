
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface HealthMetrics {
  total: number;
  needingUpdates: number;
  raising: number;
  healthy: number;
  percentageNeedingUpdates: number;
  percentageRaising: number;
}

interface PortfolioHealthMetricsProps {
  metrics: HealthMetrics;
}

const PortfolioHealthMetrics: React.FC<PortfolioHealthMetricsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.total}</div>
          <p className="text-xs text-muted-foreground">Portfolio companies</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Need Updates</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{metrics.needingUpdates}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.percentageNeedingUpdates}% of portfolio
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Currently Raising</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{metrics.raising}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.percentageRaising}% of portfolio
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Healthy</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{metrics.healthy}</div>
          <p className="text-xs text-muted-foreground">Up to date & not raising</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioHealthMetrics;
