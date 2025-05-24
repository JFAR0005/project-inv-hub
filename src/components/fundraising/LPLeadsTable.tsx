
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface LPLead {
  id: string;
  name: string;
  type: 'Individual' | 'Family Office' | 'Institutional';
  contact_name?: string;
  contact_email?: string;
  location?: string;
  status: 'Contacted' | 'Interested' | 'In DD' | 'Committed' | 'Declined';
  estimated_commitment?: number;
  confirmed_commitment?: number;
  next_followup_date?: string;
  relationship_owner?: { name: string; email: string };
}

interface LPLeadsTableProps {
  lpLeads: LPLead[];
  isLoading: boolean;
  onRefetch: () => void;
}

const LPLeadsTable: React.FC<LPLeadsTableProps> = ({ lpLeads, isLoading, onRefetch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Committed': return 'bg-green-100 text-green-800';
      case 'Interested': return 'bg-blue-100 text-blue-800';
      case 'In DD': return 'bg-yellow-100 text-yellow-800';
      case 'Contacted': return 'bg-gray-100 text-gray-800';
      case 'Declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLeads = lpLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.contact_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesType = typeFilter === 'all' || lead.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading LP leads...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>LP Leads</CardTitle>
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Interested">Interested</SelectItem>
              <SelectItem value="In DD">In DD</SelectItem>
              <SelectItem value="Committed">Committed</SelectItem>
              <SelectItem value="Declined">Declined</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Individual">Individual</SelectItem>
              <SelectItem value="Family Office">Family Office</SelectItem>
              <SelectItem value="Institutional">Institutional</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>LP Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Estimated</TableHead>
              <TableHead>Confirmed</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Next Follow-Up</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  No LP leads found
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.type}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{lead.contact_name}</div>
                      <div className="text-muted-foreground">{lead.contact_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {lead.estimated_commitment ? formatCurrency(lead.estimated_commitment) : '-'}
                  </TableCell>
                  <TableCell>
                    {lead.confirmed_commitment ? formatCurrency(lead.confirmed_commitment) : '-'}
                  </TableCell>
                  <TableCell>
                    {lead.relationship_owner?.name || '-'}
                  </TableCell>
                  <TableCell>
                    {lead.next_followup_date ? 
                      new Date(lead.next_followup_date).toLocaleDateString() : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/fundraising/leads/${lead.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LPLeadsTable;
