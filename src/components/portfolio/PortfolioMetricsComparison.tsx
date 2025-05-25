
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Company {
  id: string;
  name: string;
  sector: string;
  arr: number;
  mrr: number;
  runway: number;
  headcount: number;
  churn_rate: number;
  burn_rate: number;
}

interface PortfolioMetricsComparisonProps {
  companies: Company[];
}

const PortfolioMetricsComparison: React.FC<PortfolioMetricsComparisonProps> = ({ companies }) => {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState<'radar' | 'bar'>('radar');

  const addCompanyToComparison = (companyId: string) => {
    if (selectedCompanies.length < 5 && !selectedCompanies.includes(companyId)) {
      setSelectedCompanies([...selectedCompanies, companyId]);
    }
  };

  const removeCompanyFromComparison = (companyId: string) => {
    setSelectedCompanies(selectedCompanies.filter(id => id !== companyId));
  };

  const getSelectedCompaniesData = () => {
    return companies.filter(c => selectedCompanies.includes(c.id));
  };

  // Normalize metrics for radar chart (0-100 scale)
  const normalizeMetrics = (companies: Company[]) => {
    if (companies.length === 0) return [];

    const maxValues = {
      arr: Math.max(...companies.map(c => c.arr || 0)),
      mrr: Math.max(...companies.map(c => c.mrr || 0)),
      runway: Math.max(...companies.map(c => c.runway || 0)),
      headcount: Math.max(...companies.map(c => c.headcount || 0)),
      efficiency: Math.max(...companies.map(c => c.mrr && c.burn_rate ? (c.mrr / c.burn_rate) : 0))
    };

    return companies.map(company => ({
      name: company.name,
      ARR: maxValues.arr > 0 ? ((company.arr || 0) / maxValues.arr) * 100 : 0,
      MRR: maxValues.mrr > 0 ? ((company.mrr || 0) / maxValues.mrr) * 100 : 0,
      Runway: maxValues.runway > 0 ? ((company.runway || 0) / maxValues.runway) * 100 : 0,
      Headcount: maxValues.headcount > 0 ? ((company.headcount || 0) / maxValues.headcount) * 100 : 0,
      Efficiency: maxValues.efficiency > 0 && company.mrr && company.burn_rate
        ? ((company.mrr / company.burn_rate) / maxValues.efficiency) * 100 
        : 0,
      'Low Churn': company.churn_rate ? Math.max(0, 100 - (company.churn_rate * 10)) : 100
    }));
  };

  const getComparisonData = () => {
    const selectedCompaniesData = getSelectedCompaniesData();
    return selectedCompaniesData.map(company => ({
      name: company.name,
      ARR: company.arr || 0,
      MRR: company.mrr || 0,
      Runway: company.runway || 0,
      Headcount: company.headcount || 0,
      'Burn Rate': company.burn_rate || 0,
      'Churn Rate': company.churn_rate || 0
    }));
  };

  const radarData = normalizeMetrics(getSelectedCompaniesData());
  const barData = getComparisonData();
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Company Metrics Comparison
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select up to 5 companies to compare their key metrics
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Company Selection */}
            <div>
              <Select onValueChange={addCompanyToComparison}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a company to compare..." />
                </SelectTrigger>
                <SelectContent>
                  {companies
                    .filter(c => !selectedCompanies.includes(c.id))
                    .map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name} ({company.sector})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Companies */}
            {selectedCompanies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {getSelectedCompaniesData().map((company, index) => (
                  <Badge
                    key={company.id}
                    variant="secondary"
                    className="flex items-center gap-2 px-3 py-1"
                    style={{ backgroundColor: `${colors[index]}20`, borderColor: colors[index] }}
                  >
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: colors[index] }}
                    />
                    {company.name}
                    <button
                      onClick={() => removeCompanyFromComparison(company.id)}
                      className="ml-1 text-xs hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Comparison Mode Toggle */}
            {selectedCompanies.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant={comparisonMode === 'radar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setComparisonMode('radar')}
                >
                  Radar Chart
                </Button>
                <Button
                  variant={comparisonMode === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setComparisonMode('bar')}
                >
                  Bar Chart
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Charts */}
      {selectedCompanies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {comparisonMode === 'radar' ? 'Performance Radar' : 'Metrics Comparison'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {comparisonMode === 'radar' 
                ? 'Normalized metrics on a 0-100 scale for easy comparison'
                : 'Absolute values for direct metric comparison'
              }
            </p>
          </CardHeader>
          <CardContent>
            {comparisonMode === 'radar' ? (
              <ResponsiveContainer width="100%" height={500}>
                <RadarChart data={radarData[0] ? Object.keys(radarData[0]).filter(key => key !== 'name').map(metric => ({
                  metric,
                  ...radarData.reduce((acc, company, index) => ({
                    ...acc,
                    [company.name]: company[metric as keyof typeof company]
                  }), {})
                })) : []}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  {radarData.map((company, index) => (
                    <Radar
                      key={company.name}
                      name={company.name}
                      dataKey={company.name}
                      stroke={colors[index]}
                      fill={colors[index]}
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="space-y-6">
                {/* ARR Comparison */}
                <div>
                  <h4 className="font-semibold mb-3">Annual Recurring Revenue (ARR)</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'ARR']} />
                      <Bar dataKey="ARR" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* MRR Comparison */}
                <div>
                  <h4 className="font-semibold mb-3">Monthly Recurring Revenue (MRR)</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'MRR']} />
                      <Bar dataKey="MRR" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Operational Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Runway (Months)</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} months`, 'Runway']} />
                        <Bar dataKey="Runway" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Headcount</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} employees`, 'Headcount']} />
                        <Bar dataKey="Headcount" fill="#ff7300" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comparison Summary Table */}
      {selectedCompanies.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Metric</th>
                    {getSelectedCompaniesData().map(company => (
                      <th key={company.id} className="text-center py-2">{company.name}</th>
                    ))}
                    <th className="text-center py-2">Best</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'ARR', label: 'ARR', format: formatCurrency, higher: true },
                    { key: 'MRR', label: 'MRR', format: formatCurrency, higher: true },
                    { key: 'Runway', label: 'Runway (months)', format: (v: number) => `${v}m`, higher: true },
                    { key: 'Headcount', label: 'Headcount', format: (v: number) => v.toString(), higher: true },
                    { key: 'Burn Rate', label: 'Burn Rate', format: formatCurrency, higher: false },
                    { key: 'Churn Rate', label: 'Churn Rate (%)', format: (v: number) => `${v}%`, higher: false }
                  ].map(metric => {
                    const values = getSelectedCompaniesData().map(c => {
                      switch (metric.key) {
                        case 'ARR': return c.arr || 0;
                        case 'MRR': return c.mrr || 0;
                        case 'Runway': return c.runway || 0;
                        case 'Headcount': return c.headcount || 0;
                        case 'Burn Rate': return c.burn_rate || 0;
                        case 'Churn Rate': return c.churn_rate || 0;
                        default: return 0;
                      }
                    });
                    const bestValue = metric.higher ? Math.max(...values) : Math.min(...values.filter(v => v > 0));
                    const bestCompany = getSelectedCompaniesData().find(c => {
                      const value = (() => {
                        switch (metric.key) {
                          case 'ARR': return c.arr || 0;
                          case 'MRR': return c.mrr || 0;
                          case 'Runway': return c.runway || 0;
                          case 'Headcount': return c.headcount || 0;
                          case 'Burn Rate': return c.burn_rate || 0;
                          case 'Churn Rate': return c.churn_rate || 0;
                          default: return 0;
                        }
                      })();
                      return value === bestValue;
                    });

                    return (
                      <tr key={metric.key} className="border-b">
                        <td className="py-2 font-medium">{metric.label}</td>
                        {getSelectedCompaniesData().map((company, index) => {
                          const value = (() => {
                            switch (metric.key) {
                              case 'ARR': return company.arr || 0;
                              case 'MRR': return company.mrr || 0;
                              case 'Runway': return company.runway || 0;
                              case 'Headcount': return company.headcount || 0;
                              case 'Burn Rate': return company.burn_rate || 0;
                              case 'Churn Rate': return company.churn_rate || 0;
                              default: return 0;
                            }
                          })();
                          const isBest = value === bestValue && value > 0;
                          
                          return (
                            <td key={company.id} className="text-center py-2">
                              <div className="flex items-center justify-center gap-1">
                                {metric.format(value)}
                                {isBest && <TrendingUp className="w-4 h-4 text-green-500" />}
                              </div>
                            </td>
                          );
                        })}
                        <td className="text-center py-2">
                          <Badge variant="outline">
                            {bestCompany?.name || 'N/A'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PortfolioMetricsComparison;
