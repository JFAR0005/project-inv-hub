
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Zap, Shield, Link as LinkIcon } from 'lucide-react';

const Integrations = () => {
  const { user } = useAuth();

  const integrations = [
    {
      name: 'Slack',
      description: 'Connect your team communication',
      status: 'Available',
      icon: '💬',
      category: 'Communication'
    },
    {
      name: 'Gmail',
      description: 'Email integration for deal flow',
      status: 'Available',
      icon: '📧',
      category: 'Email'
    },
    {
      name: 'Airtable',
      description: 'Sync data with Airtable bases',
      status: 'Coming Soon',
      icon: '📊',
      category: 'Data'
    },
    {
      name: 'Calendly',
      description: 'Meeting scheduling integration',
      status: 'Available',
      icon: '📅',
      category: 'Scheduling'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect Black Nova with your favorite tools and services
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card key={integration.name} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{integration.icon}</div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {integration.category}
                    </CardDescription>
                  </div>
                </div>
                <Badge 
                  variant={integration.status === 'Available' ? 'default' : 'secondary'}
                >
                  {integration.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {integration.description}
              </p>
              <Button 
                variant={integration.status === 'Available' ? 'default' : 'secondary'}
                size="sm"
                disabled={integration.status !== 'Available'}
                className="w-full"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                {integration.status === 'Available' ? 'Connect' : 'Coming Soon'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              API Configuration
            </CardTitle>
            <CardDescription>
              Manage your API keys and webhook settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Configure APIs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Review and manage integration security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Security Center
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Integrations;
