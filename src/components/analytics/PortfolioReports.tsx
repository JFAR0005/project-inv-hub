
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Filter, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

interface CompanyPerformance {
  id: string;
  name: string;
  sector: string;
  stage: string;
  currentARR: number;
  previousARR: number;
  growthRate: number;
  lastUpdate: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

interface PortfolioReportsProps {
  companies: CompanyPerformance[];
}

const PortfolioReports: React.FC<PortfolioReportsProps> = ({ companies }) => {
  const [sortBy, setSortBy] = useState('growthRate');
  const [filterBy, setFilterBy] = useState('all');
  const [timeframe, setTimeframe] = useState('quarterly');

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const getGrowthIcon = (growthRate: number) => {
    return growthRate >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const filteredAndSortedCompanies = companies
    .filter(company => {
      if (filterBy === 'all') return true;
      if (filterBy === 'high-growth') return company.growthRate > 20;
      if (filterBy === 'at-risk') return company.riskLevel === 'High';
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'growthRate':
          return b.growthRate - a.growthRate;
        case 'arr':
          return b.currentARR - a.currentARR;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const handleExportReport = () => {
    // Simulate report export
    console.log('Exporting portfolio report...');
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Portfolio Performance Report
            <Button onClick={handleExportReport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  <SelectItem value="high-growth">High Growth</SelectItem>
                  <SelectItem value="at-risk">At Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="growthRate">Growth Rate</SelectItem>
                <SelectItem value="arr">ARR</SelectItem>
                <SelectItem value="name">Company Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Top Performers</div>
            <div className="text-2xl font-bold text-green-600">
              {companies.filter(c => c.growthRate > 25).length}
            </div>
            <div className="text-xs text-muted-foreground">Companies with {'>'}25% growth</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">At Risk</div>
            <div className="text-2xl font-bold text-red-600">
              {companies.filter(c => c.riskLevel === 'High').length}
            </div>
            <div className="text-xs text-muted-foreground">Companies requiring attention</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Avg Growth</div>
            <div className="text-2xl font-bold">
              {(companies.reduce((sum, c) => sum + c.growthRate, 0) / companies.length).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Portfolio average</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total ARR</div>
            <div className="text-2xl font-bold">
              {formatCurrency(companies.reduce((sum, c) => sum + c.currentARR, 0))}
            </div>
            <div className="text-xs text-muted-foreground">Combined recurring revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Company Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Company Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Current ARR</TableHead>
                <TableHead>Growth Rate</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Last Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.sector}</TableCell>
                  <TableCell>{company.stage}</TableCell>
                  <TableCell>{formatCurrency(company.currentARR)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getGrowthIcon(company.growthRate)}
                      <span className={company.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {company.growthRate > 0 ? '+' : ''}{company.growthRate.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRiskBadgeColor(company.riskLevel)}>
                      {company.riskLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>{company.lastUpdate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioReports;
