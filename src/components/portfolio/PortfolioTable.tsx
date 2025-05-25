
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import UpdateStatusBadge from './UpdateStatusBadge';

interface CompanyWithHealth {
  id: string;
  name: string;
  sector?: string;
  stage?: string;
  arr?: number;
  latest_update?: {
    submitted_at: string;
    arr?: number;
    mrr?: number;
    raise_status?: string;
  };
  needsUpdate: boolean;
  isRaising: boolean;
  daysSinceUpdate: number;
}

interface PortfolioTableProps {
  companies: CompanyWithHealth[];
}

const PortfolioTable: React.FC<PortfolioTableProps> = ({ companies }) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const getStageColor = (stage?: string) => {
    switch (stage?.toLowerCase()) {
      case 'seed': return 'bg-blue-100 text-blue-800';
      case 'series a': return 'bg-green-100 text-green-800';
      case 'series b': return 'bg-purple-100 text-purple-800';
      case 'series c': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRaiseStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'actively fundraising': return 'bg-red-100 text-red-800';
      case 'preparing to raise': return 'bg-yellow-100 text-yellow-800';
      case 'not raising': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>ARR</TableHead>
            <TableHead>Update Status</TableHead>
            <TableHead>Fundraising</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell>
                <Link 
                  to={`/company/${company.id}`}
                  className="font-medium hover:underline"
                >
                  {company.name}
                </Link>
              </TableCell>
              <TableCell>
                {company.stage && (
                  <Badge className={getStageColor(company.stage)}>
                    {company.stage}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {company.sector || '-'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {company.arr ? formatCurrency(company.arr) : '-'}
                  {company.latest_update?.arr && company.arr && company.latest_update.arr !== company.arr && (
                    <div className="flex items-center text-xs">
                      {company.latest_update.arr > company.arr ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <UpdateStatusBadge 
                  lastUpdateDate={company.latest_update?.submitted_at}
                />
              </TableCell>
              <TableCell>
                {company.latest_update?.raise_status && (
                  <Badge className={getRaiseStatusColor(company.latest_update.raise_status)}>
                    {company.latest_update.raise_status}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/company/${company.id}`}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PortfolioTable;
