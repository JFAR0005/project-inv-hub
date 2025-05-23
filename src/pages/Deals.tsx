
import React from 'react';
import Layout from '@/components/layout/Layout';
import DealTracker from '@/components/deals/DealTracker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Deals = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Deal Pipeline</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage all investment deals in the pipeline
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Deal Management</CardTitle>
            <CardDescription>
              View all deals in a table format with filtering options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DealTracker viewType="table" />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Deals;
