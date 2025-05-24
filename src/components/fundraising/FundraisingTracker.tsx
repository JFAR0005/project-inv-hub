
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LPLeadsTable from './LPLeadsTable';
import FundraisingDashboard from './FundraisingDashboard';
import FollowUpTasks from './FollowUpTasks';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CreateLPLeadModal from './CreateLPLeadModal';

const FundraisingTracker = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: lpLeads, isLoading, refetch } = useQuery({
    queryKey: ['lp-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lp_leads')
        .select(`
          *,
          relationship_owner:users(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fundraising Tracker</h1>
          <p className="text-muted-foreground">
            Manage LP relationships and track fundraising progress
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add LP Lead
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="leads">LP Leads</TabsTrigger>
          <TabsTrigger value="tasks">Follow-Up Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <FundraisingDashboard lpLeads={lpLeads || []} />
        </TabsContent>

        <TabsContent value="leads">
          <LPLeadsTable 
            lpLeads={lpLeads || []} 
            isLoading={isLoading}
            onRefetch={refetch}
          />
        </TabsContent>

        <TabsContent value="tasks">
          <FollowUpTasks lpLeads={lpLeads || []} />
        </TabsContent>
      </Tabs>

      <CreateLPLeadModal 
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          setShowCreateModal(false);
          refetch();
        }}
      />
    </div>
  );
};

export default FundraisingTracker;
