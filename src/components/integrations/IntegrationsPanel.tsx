
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';
import { Calendar, FileText, Bell, Zap, Calendar as CalendarIcon, Workflow } from 'lucide-react';
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
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Access and manage documents in Google Drive',
      icon: <FileText className="h-8 w-8" />,
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
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect with 6000+ apps via Zapier',
      icon: <Zap className="h-8 w-8" />,
      connected: false,
      key: '',
      adminOnly: true,
    },
    {
      id: 'n8n',
      name: 'n8n',
      description: 'Self-hosted workflow automation',
      icon: <Workflow className="h-8 w-8" />,
      connected: false,
      adminOnly: true,
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
    
    // Simulate OAuth flow for Google services
    if (id === 'google-calendar' || id === 'google-drive') {
      // In production, this would redirect to Google OAuth
      const authUrl = `https://accounts.google.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}&scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.readonly')}&response_type=code&access_type=offline`;
      
      toast(`Connect to ${integrations.find(i => i.id === id)?.name}`, {
        description: `In production, you would be redirected to: ${authUrl}`,
        action: {
          label: "Open OAuth",
          onClick: () => window.open(authUrl, '_blank')
        }
      });
    }
    
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
          Connect Black Nova platform with your favorite tools and services for seamless workflow automation
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
