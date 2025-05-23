
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  key?: string;
  adminOnly?: boolean;
}

interface IntegrationCardProps {
  integration: Integration;
  isActive: boolean;
  isLoading: boolean;
  onToggle: (checked: boolean) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onShowSettings: () => void;
  apiKey?: string;
  webhookUrl?: string;
  onApiKeyChange?: (value: string) => void;
  onWebhookUrlChange?: (value: string) => void;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  isActive,
  isLoading,
  onToggle,
  onConnect,
  onDisconnect,
  onShowSettings,
  apiKey = '',
  webhookUrl = '',
  onApiKeyChange,
  onWebhookUrlChange,
}) => {
  const renderConfiguration = () => {
    if (!isActive) return null;

    switch (integration.id) {
      case 'google-calendar':
      case 'calendly':
      case 'slack':
      case 'gmail':
        return (
          <div className="space-y-4 pt-2">
            <Button 
              onClick={onConnect} 
              className="w-full"
              disabled={isLoading}
            >
              Connect {integration.name}
            </Button>
          </div>
        );

      case 'zapier':
        return (
          <div className="space-y-4 pt-2">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="webhook">Zapier Webhook URL</Label>
                <Input 
                  id="webhook" 
                  placeholder="https://hooks.zapier.com/..." 
                  value={webhookUrl}
                  onChange={(e) => onWebhookUrlChange?.(e.target.value)}
                />
              </div>
              <Button 
                onClick={onConnect} 
                className="w-full"
                disabled={isLoading}
              >
                Save Webhook URL
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={isActive ? 'ring-2 ring-primary' : ''}>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="p-2 rounded-lg bg-primary/10">
            {integration.icon}
          </div>
          <Switch 
            checked={integration.connected} 
            onCheckedChange={(checked) => {
              if (!checked) {
                onDisconnect();
              } else {
                onToggle(checked);
              }
            }}
          />
        </div>
        <CardTitle className="mt-2">{integration.name}</CardTitle>
        <CardDescription>{integration.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {renderConfiguration()}
        
        {integration.connected && !isActive && (
          <div className="pt-2">
            <div className="text-sm text-muted-foreground flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
              Connected
            </div>
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto text-xs"
              onClick={onShowSettings}
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
            onClick={onDisconnect}
          >
            Disconnect
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default IntegrationCard;
