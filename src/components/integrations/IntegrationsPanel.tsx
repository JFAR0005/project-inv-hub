
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';
import { Calendar, Mail, Bell, Slack, Calendar as CalendarIcon } from 'lucide-react';
import IntegrationCard from './IntegrationCard';
import ApiDocumentation from './ApiDocumentation';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  key?: string;
  adminOnly?: boolean;
}

const IntegrationsPanel = () => {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sync your meetings with Google Calendar',
      icon: <Calendar className="h-8 w-8" />,
      connected: false,
    },
    {
      id: 'calendly',
      name: 'Calendly',
      description: 'Schedule meetings using Calendly',
      icon: <CalendarIcon className="h-8 w-8" />,
      connected: false,
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications in your Slack workspace',
      icon: <Slack className="h-8 w-8" />,
      connected: false,
      adminOnly: true,
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect with thousands of apps via Zapier',
      icon: <Bell className="h-8 w-8" />,
      connected: false,
      key: '',
      adminOnly: true,
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Send and receive email notifications',
      icon: <Mail className="h-8 w-8" />,
      connected: false,
    },
  ]);

  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeIntegration, setActiveIntegration] = useState<string | null>(null);

  const updateIntegrationStatus = (id: string, status: boolean) => {
    setIntegrations(
      integrations.map((integration) => 
        integration.id === id ? { ...integration, connected: status } : integration
      )
    );
  };

  const handleConnect = (id: string) => {
    setIsLoading(true);
    
    setTimeout(() => {
      updateIntegrationStatus(id, true);
      const integration = integrations.find(i => i.id === id);
      toast(`Connected to ${integration?.name}`, {
        description: `Your ${integration?.name} has been connected successfully.`,
      });
      setIsLoading(false);
      setActiveIntegration(null);
    }, 1500);
  };

  const handleDisconnect = (id: string) => {
    updateIntegrationStatus(id, false);
    const integration = integrations.find(i => i.id === id);
    toast("Disconnected", {
      description: `${integration?.name} has been disconnected.`,
    });
  };

  const handleToggle = (id: string, checked: boolean) => {
    if (checked) {
      setActiveIntegration(id);
    }
  };

  const handleShowSettings = (id: string) => {
    setActiveIntegration(id);
  };

  // Filter integrations based on user role
  const filteredIntegrations = integrations.filter(
    integration => !integration.adminOnly || user?.role === 'admin'
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">External Integrations</h2>
        <p className="text-muted-foreground mb-4">
          Connect Black Nova platform with your favorite tools and services
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            isActive={activeIntegration === integration.id}
            isLoading={isLoading}
            onToggle={(checked) => handleToggle(integration.id, checked)}
            onConnect={() => handleConnect(integration.id)}
            onDisconnect={() => handleDisconnect(integration.id)}
            onShowSettings={() => handleShowSettings(integration.id)}
            webhookUrl={webhookUrl}
            onWebhookUrlChange={setWebhookUrl}
          />
        ))}
      </div>
      
      <ApiDocumentation />
    </div>
  );
};

export default IntegrationsPanel;
