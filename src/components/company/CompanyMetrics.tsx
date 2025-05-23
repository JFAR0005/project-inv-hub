
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TrendingUp, Clock, Users, DollarSign, Target, AlertTriangle } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Company = Database['public']['Tables']['companies']['Row'];

interface CompanyMetricsProps {
  company: Company;
  isEditing: boolean;
  formData: Partial<Company>;
  onNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CompanyMetrics: React.FC<CompanyMetricsProps> = ({
  company,
  isEditing,
  formData,
  onNumberChange
}) => {
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getRunwayStatus = (runway?: number) => {
    if (!runway) return { color: 'text-gray-500', icon: Clock };
    if (runway < 6) return { color: 'text-red-500', icon: AlertTriangle };
    if (runway < 12) return { color: 'text-yellow-500', icon: Clock };
    return { color: 'text-green-500', icon: Clock };
  };

  const runwayStatus = getRunwayStatus(company.runway);

  if (isEditing) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="arr" className="text-sm font-medium">ARR</label>
          <Input 
            id="arr" 
            name="arr" 
            type="number" 
            value={formData.arr || ''} 
            onChange={onNumberChange} 
            placeholder="Annual Recurring Revenue"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="mrr" className="text-sm font-medium">MRR</label>
          <Input 
            id="mrr" 
            name="mrr" 
            type="number" 
            value={formData.mrr || ''} 
            onChange={onNumberChange} 
            placeholder="Monthly Recurring Revenue"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="burn_rate" className="text-sm font-medium">Burn Rate (monthly)</label>
          <Input 
            id="burn_rate" 
            name="burn_rate" 
            type="number" 
            value={formData.burn_rate || ''} 
            onChange={onNumberChange} 
            placeholder="Monthly burn rate"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="runway" className="text-sm font-medium">Runway (months)</label>
          <Input 
            id="runway" 
            name="runway" 
            type="number" 
            value={formData.runway || ''} 
            onChange={onNumberChange} 
            placeholder="Runway in months"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="churn_rate" className="text-sm font-medium">Churn Rate (%)</label>
          <Input 
            id="churn_rate" 
            name="churn_rate" 
            type="number" 
            step="0.1" 
            value={formData.churn_rate || ''} 
            onChange={onNumberChange} 
            placeholder="Monthly churn rate"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="headcount" className="text-sm font-medium">Headcount</label>
          <Input 
            id="headcount" 
            name="headcount" 
            type="number" 
            value={formData.headcount || ''} 
            onChange={onNumberChange} 
            placeholder="Total employees"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="text-sm font-medium text-green-800">Revenue</h3>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(company.arr)}
            </div>
            <p className="text-xs text-green-700 mt-1">
              ARR • MRR: {formatCurrency(company.mrr)}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className={`bg-gradient-to-br ${
        company.runway && company.runway < 6 
          ? 'from-red-50 to-red-100 border-red-200' 
          : company.runway && company.runway < 12
          ? 'from-yellow-50 to-yellow-100 border-yellow-200'
          : 'from-blue-50 to-blue-100 border-blue-200'
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <runwayStatus.icon className={`h-5 w-5 ${runwayStatus.color}`} />
              <h3 className={`text-sm font-medium ${runwayStatus.color.replace('text-', 'text-').replace('-500', '-800')}`}>
                Runway
              </h3>
            </div>
          </div>
          <div className="mt-2">
            <div className={`text-2xl font-bold ${runwayStatus.color.replace('text-', 'text-').replace('-500', '-900')}`}>
              {company.runway !== undefined && company.runway !== null 
                ? `${company.runway} months` 
                : 'N/A'}
            </div>
            <p className={`text-xs mt-1 ${runwayStatus.color.replace('text-', 'text-').replace('-500', '-700')}`}>
              Burn: {formatCurrency(company.burn_rate)}/mo
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <h3 className="text-sm font-medium text-purple-800">Team</h3>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-purple-900">
              {company.headcount !== undefined && company.headcount !== null 
                ? company.headcount 
                : 'N/A'}
            </div>
            <p className="text-xs text-purple-700 mt-1">
              Churn: {company.churn_rate !== undefined && company.churn_rate !== null 
                ? `${company.churn_rate}%` 
                : 'N/A'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyMetrics;
