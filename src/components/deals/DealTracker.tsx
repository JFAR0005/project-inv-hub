
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, DollarSign, User, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

type Deal = Database['public']['Tables']['deals']['Row'] & {
  company_name: string;
};

type BoardColumn = {
  id: 'Discovery' | 'DD' | 'IC' | 'Funded' | 'Rejected';
  title: string;
  deals: Deal[];
};

const DealTracker = () => {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [columns, setColumns] = useState<BoardColumn[]>([
    { id: 'Discovery', title: 'Discovery', deals: [] },
    { id: 'DD', title: 'Due Diligence', deals: [] },
    { id: 'IC', title: 'Investment Committee', deals: [] },
    { id: 'Funded', title: 'Funded', deals: [] },
    { id: 'Rejected', title: 'Rejected', deals: [] },
  ]);

  const canEditDeals = hasPermission('edit:all');

  useEffect(() => {
    const fetchDeals = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be a Supabase query with joins
        const { data, error } = await supabase
          .from('deals')
          .select(`
            *,
            companies (
              name
            )
          `);

        if (error) {
          throw error;
        }

        if (data) {
          // Process the data to format it for our columns
          const formattedDeals = data.map(deal => ({
            ...deal,
            company_name: deal.companies?.name || 'Unknown Company'
          }));

          // Update each column with its deals
          setColumns(prev => 
            prev.map(column => ({
              ...column,
              deals: formattedDeals.filter(deal => deal.stage === column.id)
            }))
          );
        } else {
          // Fallback to mock data for development
          // Mock data for development
          const mockDeals: Deal[] = [
            {
              id: '1',
              company_id: '101',
              company_name: 'TechStartup Inc',
              stage: 'Discovery',
              status: 'Active',
              source: 'Referral',
              valuation_expectation: 10000000,
              lead_partner: 'Jane Smith',
              notes: 'Initial meeting went well, they have a solid team.',
              created_at: '2023-01-15T09:00:00Z',
              updated_at: '2023-01-20T15:30:00Z',
            },
            {
              id: '2',
              company_id: '102',
              company_name: 'CloudScale AI',
              stage: 'DD',
              status: 'In Progress',
              source: 'Conference',
              valuation_expectation: 7500000,
              lead_partner: 'Mike Johnson',
              notes: 'Technical review pending, financials look good.',
              created_at: '2023-02-10T10:15:00Z',
              updated_at: '2023-02-18T11:45:00Z',
            },
            {
              id: '3',
              company_id: '103',
              company_name: 'DevSecOps Platform',
              stage: 'IC',
              status: 'Scheduled',
              source: 'Direct',
              valuation_expectation: 15000000,
              lead_partner: 'Jane Smith',
              notes: 'IC meeting scheduled for next week, all materials ready.',
              created_at: '2023-03-05T14:30:00Z',
              updated_at: '2023-03-12T16:20:00Z',
            },
            {
              id: '4',
              company_id: '104',
              company_name: 'DataMetrics',
              stage: 'Funded',
              status: 'Completed',
              source: 'VC Referral',
              valuation_expectation: 5000000,
              lead_partner: 'Mike Johnson',
              notes: 'Term sheet signed, closing next month.',
              created_at: '2023-01-20T11:00:00Z',
              updated_at: '2023-04-05T09:15:00Z',
            },
            {
              id: '5',
              company_id: '105',
              company_name: 'SupplyChainConnect',
              stage: 'Rejected',
              status: 'Closed',
              source: 'Inbound',
              valuation_expectation: 12000000,
              lead_partner: 'Jane Smith',
              notes: 'Not a good fit for our investment thesis at this time.',
              created_at: '2023-02-25T13:45:00Z',
              updated_at: '2023-03-10T10:30:00Z',
            },
          ];

          // Update each column with its mock deals
          setColumns(prev => 
            prev.map(column => ({
              ...column,
              deals: mockDeals.filter(deal => deal.stage === column.id)
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
        toast({
          title: "Error",
          description: "Failed to load deals data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeals();
  }, [toast]);

  const handleDragStart = (e: React.DragEvent, dealId: string, currentColumn: string) => {
    e.dataTransfer.setData('dealId', dealId);
    e.dataTransfer.setData('sourceColumn', currentColumn);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');
    const sourceColumn = e.dataTransfer.getData('sourceColumn');
    
    if (sourceColumn === targetColumn) return;

    // Find the deal in the source column
    const sourceDeal = columns
      .find(col => col.id === sourceColumn)
      ?.deals.find(deal => deal.id === dealId);
      
    if (!sourceDeal) return;

    try {
      // Update the deal's stage in the database
      const { error } = await supabase
        .from('deals')
        .update({ 
          stage: targetColumn as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', dealId);

      if (error) throw error;

      // Update the local state by moving the deal to the new column
      setColumns(prev => prev.map(column => {
        if (column.id === sourceColumn) {
          return {
            ...column,
            deals: column.deals.filter(deal => deal.id !== dealId)
          };
        }
        if (column.id === targetColumn) {
          return {
            ...column,
            deals: [...column.deals, { ...sourceDeal, stage: targetColumn as any }]
          };
        }
        return column;
      }));

      toast({
        title: "Deal Moved",
        description: `Deal moved to ${targetColumn} stage`,
      });
    } catch (error) {
      console.error('Error updating deal stage:', error);
      toast({
        title: "Error",
        description: "Failed to update deal stage",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Deals Pipeline</h1>
          <p className="text-muted-foreground">Track and manage potential investment opportunities</p>
        </div>

        {canEditDeals && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Deal
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div 
            key={column.id}
            className="min-w-[280px] bg-muted/40 rounded-lg p-3"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">{column.title}</h3>
              <Badge variant="outline">{column.deals.length}</Badge>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, index) => (
                  <Card key={index} className="bg-card animate-pulse h-32" />
                ))
              ) : (
                column.deals.map((deal) => (
                  <Card
                    key={deal.id}
                    className="bg-card cursor-pointer hover:shadow-md transition-shadow"
                    draggable={canEditDeals}
                    onDragStart={(e) => handleDragStart(e, deal.id, column.id)}
                  >
                    <CardHeader className="p-3 pb-1">
                      <CardTitle className="text-base flex items-center justify-between">
                        <Link 
                          to={`/companies/${deal.company_id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {deal.company_name}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 pb-1">
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{formatCurrency(deal.valuation_expectation)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{deal.lead_partner || 'Unassigned'}</span>
                        </div>
                      </div>
                      {deal.notes && (
                        <p className="text-xs mt-2 line-clamp-2">{deal.notes}</p>
                      )}
                    </CardContent>
                    <CardFooter className="p-3 pt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Updated {formatDate(deal.updated_at)}</span>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DealTracker;
