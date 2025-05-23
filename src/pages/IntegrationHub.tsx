
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WebhookManager from '@/components/integrations/WebhookManager';
import ServiceIntegrations from '@/components/integrations/ServiceIntegrations';
import ApiMonitor from '@/components/integrations/ApiMonitor';
import IntegrationsPanel from '@/components/integrations/IntegrationsPanel';
import { Webhook, Bell, Activity, Code } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import ApiDocumentation from '@/components/integrations/ApiDocumentation';

const IntegrationHub: React.FC = () => {
  // Get the tab from the URL or default to 'webhooks'
  const location = useLocation();
  const navigate = useNavigate();
  
  const getTabFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'webhooks';
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromUrl());
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/integration-hub?tab=${value}`, { replace: true });
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Integration Hub</h1>
          <p className="text-muted-foreground">
            Manage webhooks, third-party integrations, and monitor API usage.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Service Integrations
            </TabsTrigger>
            <TabsTrigger value="api-monitor" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              API Monitor
            </TabsTrigger>
            <TabsTrigger value="documentation" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              API Documentation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="webhooks">
            <WebhookManager />
          </TabsContent>

          <TabsContent value="services">
            <ServiceIntegrations />
          </TabsContent>

          <TabsContent value="api-monitor">
            <ApiMonitor />
          </TabsContent>

          <TabsContent value="documentation">
            <ApiDocumentation />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default IntegrationHub;
