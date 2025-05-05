import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { Calendar, Mail, Bell, Slack, Calendar as CalendarIcon } from 'lucide-react';

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

  const [apiKey, setApiKey] = useState<string>('');
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeIntegration, setActiveIntegration] = useState<string | null>(null);

  const handleConnectGoogle = () => {
    setIsLoading(true);
    // In a real app, this would open OAuth flow with Google
    setTimeout(() => {
      updateIntegrationStatus('google-calendar', true);
      toast("Connected to Google Calendar", {
        description: "Your Google Calendar has been connected successfully.",
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleConnectCalendly = () => {
    setIsLoading(true);
    // In a real app, this would open OAuth flow with Calendly
    setTimeout(() => {
      updateIntegrationStatus('calendly', true);
      toast("Connected to Calendly", {
        description: "Your Calendly account has been connected successfully.",
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleConnectSlack = () => {
    setIsLoading(true);
    // In a real app, this would open OAuth flow with Slack
    setTimeout(() => {
      updateIntegrationStatus('slack', true);
      toast("Connected to Slack", {
        description: "Your Slack workspace has been connected successfully.",
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleConnectZapier = () => {
    if (!webhookUrl) {
      toast("Error", {
        description: "Please enter your Zapier webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // In a real app, this would validate the Zapier webhook
    setTimeout(() => {
      updateIntegrationStatus('zapier', true);
      toast("Connected to Zapier", {
        description: "Your Zapier webhook has been configured successfully.",
      });
      setIsLoading(false);
      setActiveIntegration(null);
    }, 1500);
  };

  const handleConnectGmail = () => {
    setIsLoading(true);
    // In a real app, this would connect to Gmail API
    setTimeout(() => {
      updateIntegrationStatus('gmail', true);
      toast("Connected to Gmail", {
        description: "Your Gmail account has been connected successfully.",
      });
      setIsLoading(false);
    }, 1500);
  };

  const updateIntegrationStatus = (id: string, status: boolean) => {
    setIntegrations(
      integrations.map((integration) => 
        integration.id === id ? { ...integration, connected: status } : integration
      )
    );
  };

  const handleDisconnect = (id: string) => {
    updateIntegrationStatus(id, false);
    toast("Disconnected", {
      description: `${integrations.find(i => i.id === id)?.name} has been disconnected.`,
    });
  };

  const showIntegrationSettings = (id: string) => {
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
          <Card key={integration.id} className={activeIntegration === integration.id ? 'ring-2 ring-primary' : ''}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div className="p-2 rounded-lg bg-primary/10">
                  {integration.icon}
                </div>
                <Switch 
                  checked={integration.connected} 
                  onCheckedChange={(checked) => {
                    if (!checked) {
                      handleDisconnect(integration.id);
                    } else if (integration.id === 'zapier') {
                      showIntegrationSettings('zapier');
                    } else {
                      showIntegrationSettings(integration.id);
                    }
                  }}
                />
              </div>
              <CardTitle className="mt-2">{integration.name}</CardTitle>
              <CardDescription>{integration.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {activeIntegration === integration.id && (
                <div className="space-y-4 pt-2">
                  {integration.id === 'google-calendar' && (
                    <Button 
                      onClick={handleConnectGoogle} 
                      className="w-full"
                      disabled={isLoading}
                    >
                      Connect Google Calendar
                    </Button>
                  )}

                  {integration.id === 'calendly' && (
                    <Button 
                      onClick={handleConnectCalendly} 
                      className="w-full"
                      disabled={isLoading}
                    >
                      Connect Calendly
                    </Button>
                  )}

                  {integration.id === 'slack' && (
                    <Button 
                      onClick={handleConnectSlack} 
                      className="w-full"
                      disabled={isLoading}
                    >
                      Connect Slack
                    </Button>
                  )}

                  {integration.id === 'zapier' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="webhook">Zapier Webhook URL</Label>
                        <Input 
                          id="webhook" 
                          placeholder="https://hooks.zapier.com/..." 
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleConnectZapier} 
                        className="w-full"
                        disabled={isLoading}
                      >
                        Save Webhook URL
                      </Button>
                    </div>
                  )}

                  {integration.id === 'gmail' && (
                    <Button 
                      onClick={handleConnectGmail}
                      className="w-full"
                      disabled={isLoading}
                    >
                      Connect Gmail
                    </Button>
                  )}
                </div>
              )}
              
              {integration.connected && !activeIntegration && (
                <div className="pt-2">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    Connected
                  </div>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 h-auto text-xs"
                    onClick={() => showIntegrationSettings(integration.id)}
                  >
                    Configure settings
                  </Button>
                </div>
              )}
            </CardContent>
            {integration.connected && (
              <CardFooter className="pt-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDisconnect(integration.id)}
                >
                  Disconnect
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Learn how to use our APIs to extend the platform's functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              The Black Nova platform offers REST APIs that allow you to programmatically:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 pl-4">
              <li>Fetch portfolio company data</li>
              <li>Create and manage calendar events</li>
              <li>Send notifications to users</li>
              <li>Generate reports and analytics</li>
            </ul>
            <div className="mt-4">
              <Button variant="outline">View API Documentation</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsPanel;
