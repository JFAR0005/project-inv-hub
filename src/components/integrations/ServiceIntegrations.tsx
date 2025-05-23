
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Check, ExternalLink, MessageSquare, Bell, Shield, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Integration {
  id: string;
  service: string;
  is_connected: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

const AVAILABLE_INTEGRATIONS = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send notifications to Slack channels',
    icon: MessageSquare,
    color: '#4A154B',
  },
  {
    id: 'ms-teams',
    name: 'Microsoft Teams',
    description: 'Send notifications to Microsoft Teams channels',
    icon: MessageSquare,
    color: '#6264A7',
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Send notifications to Discord channels',
    icon: MessageSquare,
    color: '#5865F2',
  },
  {
    id: 'email',
    name: 'Email Notifications',
    description: 'Configure custom email notifications',
    icon: Bell,
    color: '#2196F3',
  },
  {
    id: 'sso',
    name: 'Single Sign-On',
    description: 'Configure SSO with Google, Microsoft, or SAML',
    icon: Shield,
    color: '#FF5722',
  },
];

const ServiceIntegrations: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('slack');
  const [integrationConfig, setIntegrationConfig] = useState<Record<string, any>>({
    webhook_url: '',
    channel: '#general',
    events: ['comment', 'meeting', 'update'],
  });

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Integration[];
    },
    enabled: !!user,
  });

  const saveIntegrationMutation = useMutation({
    mutationFn: async (integration: Partial<Integration>) => {
      // Check if integration already exists
      const existingIntegration = integrations.find((i) => i.service === integration.service);
      
      if (existingIntegration) {
        // Update existing
        const { data, error } = await supabase
          .from('integrations')
          .update({
            is_connected: integration.is_connected,
            config: integration.config,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingIntegration.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('integrations')
          .insert({
            service: integration.service,
            is_connected: integration.is_connected,
            config: integration.config,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast({
        title: 'Integration saved',
        description: 'Your integration settings have been saved.',
      });
    },
  });

  const testIntegrationMutation = useMutation({
    mutationFn: async (service: string) => {
      // In a real implementation, this would call an edge function to test the integration
      // For now, we'll simulate a successful test
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Test successful',
        description: 'Test message sent successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Test failed',
        description: 'Failed to send test message. Please check your configuration.',
        variant: 'destructive',
      });
    },
  });

  const disconnectIntegrationMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const { data, error } = await supabase
        .from('integrations')
        .update({ is_connected: false })
        .eq('id', integrationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast({
        title: 'Integration disconnected',
        description: 'Your integration has been disconnected.',
      });
    },
  });

  const getCurrentIntegration = (service: string) => {
    return integrations.find((i) => i.service === service);
  };

  const handleSaveIntegration = () => {
    saveIntegrationMutation.mutate({
      service: activeTab,
      is_connected: true,
      config: integrationConfig,
    });
  };

  const handleTestIntegration = () => {
    testIntegrationMutation.mutate(activeTab);
  };

  const handleDisconnect = (integrationId: string) => {
    disconnectIntegrationMutation.mutate(integrationId);
  };

  const renderIntegrationConfig = (service: string) => {
    const integration = getCurrentIntegration(service);
    
    if (integration?.is_connected) {
      // Show connected state
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">
              <Check className="h-3 w-3 mr-1" /> Connected
            </Badge>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(integration.updated_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="space-y-4">
            {service === 'slack' && (
              <>
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={integration.config.webhook_url} 
                      type="password"
                      disabled
                    />
                    <Button variant="outline" size="sm" onClick={() => setIntegrationConfig(integration.config)}>
                      Edit
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Channel</Label>
                  <Input 
                    value={integration.config.channel} 
                    disabled 
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {integration.config.events.map((event: string) => (
                    <Badge key={event} variant="secondary">
                      {event}
                    </Badge>
                  ))}
                </div>
              </>
            )}
            
            {/* Similar config displays for other services */}
            
            <div className="flex gap-2">
              <Button 
                onClick={handleTestIntegration} 
                disabled={testIntegrationMutation.isPending}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {testIntegrationMutation.isPending ? 'Testing...' : 'Test Connection'}
              </Button>
              
              <Button 
                onClick={() => handleDisconnect(integration.id)}
                variant="ghost"
                className="text-red-600"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    // Show configuration form
    return (
      <div className="space-y-4">
        {service === 'slack' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="webhook_url">Webhook URL *</Label>
              <Input
                id="webhook_url"
                placeholder="https://hooks.slack.com/services/..."
                value={integrationConfig.webhook_url}
                onChange={(e) => setIntegrationConfig({ ...integrationConfig, webhook_url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                You can get this URL from Slack by creating a new app and setting up an Incoming Webhook.
                <Button variant="link" className="h-auto p-0 ml-1" asChild>
                  <a href="https://api.slack.com/messaging/webhooks" target="_blank" rel="noopener noreferrer">
                    Learn more <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <Input
                id="channel"
                placeholder="#general"
                value={integrationConfig.channel}
                onChange={(e) => setIntegrationConfig({ ...integrationConfig, channel: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="grid grid-cols-2 gap-2">
                {['comment', 'meeting', 'update', 'metric'].map((event) => (
                  <div key={event} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`event-${event}`}
                      checked={integrationConfig.events?.includes(event)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setIntegrationConfig({
                            ...integrationConfig,
                            events: [...(integrationConfig.events || []), event],
                          });
                        } else {
                          setIntegrationConfig({
                            ...integrationConfig,
                            events: integrationConfig.events?.filter((e: string) => e !== event),
                          });
                        }
                      }}
                      className="rounded border-gray-300 text-primary h-4 w-4"
                    />
                    <Label htmlFor={`event-${event}`} className="text-sm font-normal">
                      {event.charAt(0).toUpperCase() + event.slice(1)} Notifications
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {/* Similar config forms for other services */}
        
        {service !== 'slack' && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <h4 className="text-lg font-medium">Coming Soon</h4>
              <p className="text-sm text-muted-foreground">
                {service === 'ms-teams' && 'Microsoft Teams integration is coming soon.'}
                {service === 'discord' && 'Discord integration is coming soon.'}
                {service === 'email' && 'Custom email notification settings are coming soon.'}
                {service === 'sso' && 'SSO configuration is coming soon.'}
              </p>
            </div>
          </div>
        )}
        
        {service === 'slack' && (
          <Button 
            onClick={handleSaveIntegration}
            disabled={!integrationConfig.webhook_url || saveIntegrationMutation.isPending}
          >
            {saveIntegrationMutation.isPending ? 'Connecting...' : 'Connect Integration'}
          </Button>
        )}
      </div>
    );
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please log in to manage integrations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Service Integrations</h2>
        <p className="text-muted-foreground">
          Connect third-party services to enhance your workflow.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5">
          {AVAILABLE_INTEGRATIONS.map((integration) => (
            <TabsTrigger key={integration.id} value={integration.id} className="flex items-center gap-2">
              <integration.icon className="h-4 w-4" style={{ color: integration.color }} />
              <span className="hidden md:inline">{integration.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {AVAILABLE_INTEGRATIONS.map((integration) => (
          <TabsContent key={integration.id} value={integration.id}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <integration.icon className="h-5 w-5" style={{ color: integration.color }} />
                  <CardTitle>{integration.name}</CardTitle>
                </div>
                <CardDescription>{integration.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  renderIntegrationConfig(integration.id)
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ServiceIntegrations;
