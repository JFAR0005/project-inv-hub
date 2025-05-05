
import React from 'react';
import Layout from '@/components/layout/Layout';

const Deals = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Deals Pipeline</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage potential investment opportunities
          </p>
        </div>
        
        <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">
            Deal pipeline coming soon...
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Deals;
