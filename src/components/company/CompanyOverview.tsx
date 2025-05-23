import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from '@/integrations/supabase/types';
import { Building2, MapPin, Globe, Users, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import CommentSection from '@/components/comments/CommentSection';
import ActivityFeed from '@/components/activity/ActivityFeed';

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Company Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.description && (
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{company.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.sector && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{company.sector}</Badge>
                  <span className="text-sm text-muted-foreground">Sector</span>
                </div>
              )}
              
              {company.stage && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{company.stage}</Badge>
                  <span className="text-sm text-muted-foreground">Stage</span>
                </div>
              )}
              
              {company.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{company.location}</span>
                </div>
              )}
              
              {company.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {new URL(company.website).hostname}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold">{formatCurrency(company.arr)}</p>
                <p className="text-sm text-muted-foreground">ARR</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold">{formatCurrency(company.mrr)}</p>
                <p className="text-sm text-muted-foreground">MRR</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold">{formatNumber(company.headcount)}</p>
                <p className="text-sm text-muted-foreground">Headcount</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <p className="text-2xl font-bold">{formatCurrency(company.burn_rate)}</p>
                <p className="text-sm text-muted-foreground">Monthly Burn</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <p className="text-2xl font-bold">{company.runway ? `${company.runway}mo` : 'N/A'}</p>
                <p className="text-sm text-muted-foreground">Runway</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <p className="text-2xl font-bold">{company.churn_rate ? `${company.churn_rate}%` : 'N/A'}</p>
                <p className="text-sm text-muted-foreground">Churn Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <CommentSection companyId={company.id} />
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <ActivityFeed companyId={company.id} limit={10} />
      </div>
    </div>
  );
};

export default CompanyOverview;
