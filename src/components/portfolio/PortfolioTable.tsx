import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, subDays, parseISO } from 'date-fns';
import { Eye, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface Company {
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
}

interface PortfolioTableProps {
  companies: Company[];
}

const PortfolioTable: React.FC<PortfolioTableProps> = ({ companies }) => {
  const navigate = useNavigate();
  const [sortedCompanies, setSortedCompanies] = useState<Company[]>([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc' as 'asc' | 'desc'
  });
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [showNeedsUpdate, setShowNeedsUpdate] = useState(false);
  
  useEffect(() => {
    const sorted = [...companies].sort((a, b) => {
      let valA, valB;
      
      if (sortConfig.key === 'update_age') {
        valA = a.latest_update?.submitted_at ? new Date(a.latest_update.submitted_at).getTime() : 0;
        valB = b.latest_update?.submitted_at ? new Date(b.latest_update.submitted_at).getTime() : 0;
      } else if (sortConfig.key === 'arr') {
        valA = a.latest_update?.arr || a.arr || 0;
        valB = b.latest_update?.arr || b.arr || 0;
      } else if (sortConfig.key === 'raise_status') {
        valA = a.latest_update?.raise_status || '';
        valB = b.latest_update?.raise_status || '';
      } else {
        valA = a[sortConfig.key as keyof Company] || '';
        valB = b[sortConfig.key as keyof Company] || '';
      }
      
      if (valA < valB) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    // Apply "needs update" filter if enabled
    if (showNeedsUpdate) {
      const filtered = sorted.filter(company => {
        if (!company.latest_update?.submitted_at) return true;
        const updateDate = new Date(company.latest_update.submitted_at);
        const thirtyDaysAgo = subDays(new Date(), 30);
        return updateDate < thirtyDaysAgo;
      });
      setSortedCompanies(filtered);
    } else {
      setSortedCompanies(sorted);
    }
  }, [companies, sortConfig, showNeedsUpdate]);
  
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const getUpdateFreshness = (date: string | undefined) => {
    if (!date) return <Badge variant="destructive">No Updates</Badge>;
    
    const updateDate = parseISO(date);
    const thirtyDaysAgo = subDays(new Date(), 30);
    
    if (updateDate < thirtyDaysAgo) {
      return (
        <div className="flex items-center">
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {formatDistanceToNow(updateDate, { addSuffix: true })}
          </Badge>
        </div>
      );
    }
    
    return (
      <Badge variant="secondary">
        {formatDistanceToNow(updateDate, { addSuffix: true })}
      </Badge>
    );
  };
  
  const getRaiseStatusBadge = (status: string | undefined) => {
    if (!status) return <span className="text-muted-foreground">Not specified</span>;
    
    if (status.toLowerCase().includes('active') || status.toLowerCase().includes('raising')) {
      return <Badge className="bg-green-500 text-white">{status}</Badge>;
    } else if (status.toLowerCase().includes('planned')) {
      return <Badge className="bg-yellow-500 text-white">{status}</Badge>;
    } else {
      return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCompanies(sortedCompanies.map(c => c.id));
    } else {
      setSelectedCompanies([]);
    }
  };
  
  const handleSelectCompany = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedCompanies(prev => [...prev, id]);
    } else {
      setSelectedCompanies(prev => prev.filter(companyId => companyId !== id));
    }
  };
  
  const getRowClassName = (company: Company) => {
    if (company.latest_update?.raise_status?.toLowerCase().includes('active') || 
        company.latest_update?.raise_status?.toLowerCase().includes('raising')) {
      return "bg-green-50 dark:bg-green-900/10";
    }
    
    if (!company.latest_update?.submitted_at) {
      return "bg-red-50 dark:bg-red-900/10";
    }
    
    const updateDate = company.latest_update?.submitted_at ? parseISO(company.latest_update.submitted_at) : null;
    const thirtyDaysAgo = subDays(new Date(), 30);
    
    if (updateDate && updateDate < thirtyDaysAgo) {
      return "bg-red-50 dark:bg-red-900/10";
    }
    
    return "";
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox 
            id="needsUpdate"
            checked={showNeedsUpdate}
            onCheckedChange={() => setShowNeedsUpdate(!showNeedsUpdate)}
          />
          <label htmlFor="needsUpdate" className="text-sm font-medium">
            Show only companies needing updates
          </label>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {selectedCompanies.length} of {sortedCompanies.length} selected
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px]">
                <Checkbox 
                  checked={selectedCompanies.length === sortedCompanies.length && sortedCompanies.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('name')} className="px-0 font-medium flex items-center">
                  Company
                  {sortConfig.key === 'name' && (
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('sector')} className="px-0 font-medium flex items-center">
                  Sector
                  {sortConfig.key === 'sector' && (
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('stage')} className="px-0 font-medium flex items-center">
                  Stage
                  {sortConfig.key === 'stage' && (
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('arr')} className="px-0 font-medium flex items-center">
                  ARR
                  {sortConfig.key === 'arr' && (
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('raise_status')} className="px-0 font-medium flex items-center">
                  Raise Status
                  {sortConfig.key === 'raise_status' && (
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('update_age')} className="px-0 font-medium flex items-center">
                  Last Update
                  {sortConfig.key === 'update_age' && (
                    <ArrowUpDown className={`ml-1 h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCompanies.length > 0 ? (
              sortedCompanies.map((company) => (
                <TableRow key={company.id} className={getRowClassName(company)}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedCompanies.includes(company.id)}
                      onCheckedChange={(checked) => handleSelectCompany(company.id, checked as boolean)}
                      aria-label={`Select ${company.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell>{company.sector || 'N/A'}</TableCell>
                  <TableCell>{company.stage || 'N/A'}</TableCell>
                  <TableCell>{formatCurrency(company.latest_update?.arr || company.arr)}</TableCell>
                  <TableCell>{getRaiseStatusBadge(company.latest_update?.raise_status)}</TableCell>
                  <TableCell>{getUpdateFreshness(company.latest_update?.submitted_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/company/${company.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No companies found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PortfolioTable;
