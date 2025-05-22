
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
import DealForm from './DealForm';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type Deal = Database['public']['Tables']['deals']['Row'] & {
  company_name: string;
};

type BoardColumn = {
  id: 'Discovery' | 'DD' | 'IC' | 'Funded' | 'Rejected';
  title: string;
  deals: Deal[];
};

const DealTracker = () => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [columns, setColumns] = useState<BoardColumn[]>([
    { id: 'Discovery', title: 'Discovery', deals: [] },
    { id: 'DD', title: 'Due Diligence', deals: [] },
    { id: 'IC', title: 'Investment Committee', deals: [] },
    { id: 'Funded', title: 'Funded', deals: [] },
    { id: 'Rejected', title: 'Rejected', deals: [] },
  ]);

  const canEditDeals = hasPermission('edit:all') || user?.role === 'admin' || user?.role === 'partner';

  // Use React Query for data fetching
  const { data: deals, refetch } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      setIsLoading(true);
      try {
        // Fetch deals with company information
        const { data, error } = await supabase
          .from('deals')
          .select(`
            *,
            companies (
              id,
              name
            )
          `);

        if (error) throw error;

        const formattedDeals = data?.map(deal => ({
          ...deal,
          company_name: deal.companies?.name || 'Unknown Company'
        })) || [];

        // Update columns with deals
        setColumns(prev => 
          prev.map(column => ({
            ...column,
            deals: formattedDeals.filter(deal => deal.stage === column.id)
          }))
        );

        setIsLoading(false);
        return formattedDeals;
      } catch (error) {
        console.error('Error fetching deals:', error);
        setIsLoading(false);
        throw error;
      }
    }
  });

  const handleDealCreated = () => {
    refetch();
  };

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
      
      // Invalidate the deals query to refresh data
      queryClient.invalidateQueries({ queryKey: ['deals'] });
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
          <Button onClick={() => setFormOpen(true)}>
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
                      {deal.source && (
                        <div className="mt-2 text-xs">
                          <span className="font-medium">Source:</span> {deal.source}
                        </div>
                      )}
                      {deal.notes && (
                        <p className="text-xs mt-1 line-clamp-2">{deal.notes}</p>
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
      
      {/* Deal creation form */}
      <DealForm 
        open={formOpen} 
        onOpenChange={setFormOpen} 
        onDealCreated={handleDealCreated} 
      />
    </div>
  );
};

export default DealTracker;
