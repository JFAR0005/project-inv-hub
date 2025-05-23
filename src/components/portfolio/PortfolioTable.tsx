
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';

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

interface PortfolioTableProps {
  companies: Company[];
}

const PortfolioTable: React.FC<PortfolioTableProps> = ({ companies }) => {
  const { user } = useAuth();
  const showSensitiveData = user?.role === 'admin' || user?.role === 'partner';

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Location</TableHead>
            {showSensitiveData && (
              <>
                <TableHead>ARR</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>Burn Rate</TableHead>
                <TableHead>Runway</TableHead>
              </>
            )}
            <TableHead>Headcount</TableHead>
            <TableHead>Growth</TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showSensitiveData ? 12 : 8} className="text-center py-8 text-muted-foreground">
                No companies match your current filters.
              </TableCell>
            </TableRow>
          ) : (
            companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    {company.logo_url && (
                      <img
                        src={company.logo_url}
                        alt={`${company.name} logo`}
                        className="h-6 w-6 rounded"
                      />
                    )}
                    <span>{company.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {company.sector && (
                    <Badge variant="outline">{company.sector}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {company.stage && (
                    <Badge variant="secondary">{company.stage}</Badge>
                  )}
                </TableCell>
                <TableCell>{company.location || 'N/A'}</TableCell>
                {showSensitiveData && (
                  <>
                    <TableCell>{formatCurrency(company.arr)}</TableCell>
                    <TableCell>{formatCurrency(company.mrr)}</TableCell>
                    <TableCell>{formatCurrency(company.burn_rate)}</TableCell>
                    <TableCell>
                      {company.runway ? `${company.runway} months` : 'N/A'}
                    </TableCell>
                  </>
                )}
                <TableCell>{company.headcount || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    {company.growth !== null && company.growth !== undefined ? (
                      <>
                        {company.growth >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <span className={company.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {company.growth}%
                        </span>
                      </>
                    ) : (
                      <span>N/A</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRiskBadgeVariant(company.riskLevel)}>
                    {company.riskLevel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/companies/${company.id}`}>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PortfolioTable;
