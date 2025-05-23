
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/layout/Layout';
import DealTracker from '@/components/deals/DealTracker';
import DealForm from '@/components/deals/DealForm';
import DDForm from '@/components/deals/DDForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { BarChart4, KanbanSquare, Plus } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Deal = Database['public']['Tables']['deals']['Row'] & {
  companies?: Database['public']['Tables']['companies']['Row'];
  users?: Database['public']['Tables']['users']['Row'];
};

const Deals = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'kanban' | 'table'>('kanban');
  const [dealFormOpen, setDealFormOpen] = useState(false);
  const [ddFormOpen, setDDFormOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  // Fetch deals with company information
  const { data: deals = [], isLoading, refetch } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          companies (*),
          users (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Deal[];
    },
  });

  const handleEditDeal = (deal: Deal) => {
    setEditingDeal(deal);
    setDealFormOpen(true);
  };

  const handleDDFormOpen = (deal: Deal) => {
    setSelectedDeal(deal);
    setDDFormOpen(true);
  };

  const renderKanbanView = () => {
    const stages = ['Discovery', 'DD', 'IC', 'Funded', 'Rejected'];
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stages.map((stage) => (
          <div key={stage} className="space-y-3">
            <h3 className="font-semibold text-gray-900">{stage}</h3>
            <div className="space-y-2 min-h-[400px]">
              {deals
                .filter(deal => deal.stage === stage)
                .map((deal) => (
                  <DealTracker
                    key={deal.id}
                    deal={deal}
                    onEditDeal={handleEditDeal}
                    onOpenDD={handleDDFormOpen}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTableView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <DealTracker
            key={deal.id}
            deal={deal}
            onEditDeal={handleEditDeal}
            onOpenDD={handleDDFormOpen}
          />
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Deal Pipeline</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage all investment opportunities in the pipeline
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => setDealFormOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Deal
            </Button>
            
            <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'kanban' | 'table')} className="w-[240px]">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="kanban" className="flex items-center gap-1">
                  <KanbanSquare className="h-4 w-4" />
                  <span>Kanban</span>
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center gap-1">
                  <BarChart4 className="h-4 w-4" />
                  <span>Cards</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Deal Management</CardTitle>
            <CardDescription>
              {activeView === 'kanban' 
                ? 'Drag and drop deals between stages in the pipeline' 
                : 'View all deals in a card format with filtering options'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {activeView === 'kanban' ? renderKanbanView() : renderTableView()}
          </CardContent>
        </Card>
      </div>

      {/* Deal Form Modal */}
      <DealForm 
        open={dealFormOpen} 
        onOpenChange={(open) => {
          setDealFormOpen(open);
          if (!open) {
            setEditingDeal(null);
          }
        }}
        onDealCreated={refetch}
        editingDeal={editingDeal}
      />

      {/* Due Diligence Form Modal */}
      {selectedDeal && (
        <DDForm
          dealId={selectedDeal.id}
          companyName={selectedDeal.companies?.name || 'Unknown Company'}
          open={ddFormOpen}
          onOpenChange={setDDFormOpen}
          onDDDataUpdated={refetch}
        />
      )}
    </Layout>
  );
};

export default Deals;
