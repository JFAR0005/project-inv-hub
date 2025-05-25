
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Zap, Shield, Calendar, FileText, Workflow, Database } from 'lucide-react';
import IntegrationsPanel from '@/components/integrations/IntegrationsPanel';
import ServiceIntegrations from '@/components/integrations/ServiceIntegrations';
import IntegrationAuth from '@/components/integrations/IntegrationAuth';
import ProductionIntegrations from '@/components/integrations/ProductionIntegrations';

const Integrations = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Integrations Hub</h1>
        <p className="text-muted-foreground mt-2">
          Connect Black Nova with your favorite tools and services for seamless workflow automation
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Service Integrations</TabsTrigger>
          <TabsTrigger value="auth">API Credentials</TabsTrigger>
          <TabsTrigger value="production">Production Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <IntegrationsPanel />
        </TabsContent>

        <TabsContent value="services">
          <ServiceIntegrations />
        </TabsContent>

        <TabsContent value="auth">
          <IntegrationAuth />
        </TabsContent>

        <TabsContent value="production">
          <ProductionIntegrations />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Integrations;
