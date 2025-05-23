
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import DealTracker from '@/components/deals/DealTracker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { BarChart4, KanbanSquare } from 'lucide-react';

const Deals = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'kanban' | 'table'>('kanban');

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
          
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'kanban' | 'table')} className="w-[240px]">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="kanban" className="flex items-center gap-1">
                <KanbanSquare className="h-4 w-4" />
                <span>Kanban</span>
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-1">
                <BarChart4 className="h-4 w-4" />
                <span>Table</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Deal Management</CardTitle>
            <CardDescription>
              {activeView === 'kanban' 
                ? 'Drag and drop deals between stages in the pipeline' 
                : 'View all deals in a table format with filtering options'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <DealTracker viewType={activeView} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Deals;
