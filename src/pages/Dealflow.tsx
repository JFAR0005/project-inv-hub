
import React from 'react';
import Layout from '@/components/layout/Layout';
import DealTracker from '@/components/deals/DealTracker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Dealflow = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dealflow Kanban</h1>
          <p className="text-muted-foreground mt-1">
            Visual pipeline view of all deals by stage
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Deal Pipeline</CardTitle>
            <CardDescription>
              Drag and drop deals between stages in a Kanban board view
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <DealTracker viewType="kanban" />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dealflow;
