
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/integrations/supabase/types';
import { DollarSign, Users, Calendar, TrendingUp, Building2 } from 'lucide-react';
import { format } from 'date-fns';

type Company = Database['public']['Tables']['companies']['Row'];

interface CompanyOverviewProps {
  company: Company;
}

const CompanyOverview: React.FC<CompanyOverviewProps> = ({ company }) => {
  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number | null) => {
    if (!num) return 'Not specified';
    return new Intl.NumberFormat('en-US').format(num);
  };

  const metrics = [
    {
      title: 'Annual Recurring Revenue',
      value: formatCurrency(company.arr),
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Monthly Recurring Revenue',
      value: formatCurrency(company.mrr),
      icon: TrendingUp,
      color: 'text-blue-600',
    },
    {
      title: 'Team Size',
      value: formatNumber(company.headcount),
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Monthly Burn Rate',
      value: formatCurrency(company.burn_rate),
      icon: DollarSign,
      color: 'text-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Company Description */}
      {company.description && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              About {company.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{company.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <IconComponent className={`h-4 w-4 ${metric.color}`} />
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                </div>
                <p className="text-2xl font-bold">{metric.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Company Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sector</p>
                <p className="text-sm">{company.sector || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stage</p>
                {company.stage ? (
                  <Badge variant="outline">{company.stage}</Badge>
                ) : (
                  <p className="text-sm">Not specified</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-sm">{company.location || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Founded</p>
                <p className="text-sm">{company.created_at ? format(new Date(company.created_at), 'yyyy') : 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {company.runway && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Runway</span>
                  <span className="text-sm">{company.runway} months</span>
                </div>
              )}
              {company.churn_rate && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Churn Rate</span>
                  <span className="text-sm">{(company.churn_rate * 100).toFixed(1)}%</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                <span className="text-sm">
                  {company.updated_at ? format(new Date(company.updated_at), 'MMM d, yyyy') : 'Never'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyOverview;
