
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Calendar, CalendarCheck, CalendarClock } from 'lucide-react';

type IntegrationStatus = 'connected' | 'disconnected';

interface CalendarIntegrationProps {
  onSuccess?: () => void;
}

const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({ onSuccess }) => {
  const [googleAuthUrl, setGoogleAuthUrl] = useState<string>('');
  const [googleStatus, setGoogleStatus] = useState<IntegrationStatus>('disconnected');
  const [calendlyUrl, setCalendlyUrl] = useState<string>('');
  const [calendlyStatus, setCalendlyStatus] = useState<IntegrationStatus>('disconnected');
  const [zapierWebhookUrl, setZapierWebhookUrl] = useState<string>('');

  const handleGoogleConnect = () => {
    // In a real implementation, this would redirect to Google OAuth flow
    toast("Google Calendar Integration", {
      description: "To connect with Google Calendar, you'd be redirected to Google's authentication page.",
    });
    
    // For demo purposes, we'll simulate a successful connection
    setTimeout(() => {
      setGoogleStatus('connected');
      toast("Connected to Google Calendar", {
        description: "Your Google Calendar account has been successfully connected.",
      });
      if (onSuccess) onSuccess();
    }, 1500);
  };

  const handleGoogleDisconnect = () => {
    setGoogleStatus('disconnected');
    toast("Disconnected from Google Calendar", {
      description: "Your Google Calendar connection has been removed.",
    });
  };

  const handleCalendlyConnect = () => {
    if (!calendlyUrl) {
      toast("Missing Calendly URL", {
        description: "Please enter your Calendly URL to continue.",
        variant: "destructive"
      });
      return;
    }

    // In a real implementation, this would validate and store the Calendly URL
    toast("Calendly Integration", {
      description: "Your Calendly scheduling page has been connected.",
    });
    setCalendlyStatus('connected');
    if (onSuccess) onSuccess();
  };

  const handleCalendlyDisconnect = () => {
    setCalendlyUrl('');
    setCalendlyStatus('disconnected');
    toast("Disconnected from Calendly", {
      description: "Your Calendly connection has been removed.",
    });
  };

  const handleZapierTest = async () => {
    if (!zapierWebhookUrl) {
      toast({
        title: "Error",
        description: "Please enter your Zapier webhook URL",
        variant: "destructive",
      });
      return;
    }

    try {
      await fetch(zapierWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
          event: "test_connection"
        }),
      });

      toast({
        title: "Request Sent",
        description: "The test event was sent to Zapier. Please check your Zap's history to confirm it was triggered.",
      });
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Error",
        description: "Failed to trigger the Zapier webhook. Please check the URL and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
          </CardTitle>
          <CardDescription>
            Connect your Google Calendar to automatically sync meetings and send invites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                Status: <span className={googleStatus === 'connected' ? 'text-green-500' : 'text-muted-foreground'}>
                  {googleStatus === 'connected' ? 'Connected' : 'Not connected'}
                </span>
              </p>
              {googleStatus === 'connected' && (
                <p className="text-sm text-muted-foreground">Connected as example@gmail.com</p>
              )}
            </div>
            {googleStatus === 'connected' ? (
              <Button variant="outline" onClick={handleGoogleDisconnect}>Disconnect</Button>
            ) : (
              <Button onClick={handleGoogleConnect}>Connect Google Calendar</Button>
            )}
          </div>

          {googleStatus === 'connected' && (
            <div className="mt-4 rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground">
                Your meetings will be synced with Google Calendar, and meeting invites will be sent to participants automatically.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Calendly Integration
          </CardTitle>
          <CardDescription>
            Connect your Calendly booking page to allow others to schedule meetings with you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Status: <span className={calendlyStatus === 'connected' ? 'text-green-500' : 'text-muted-foreground'}>
                  {calendlyStatus === 'connected' ? 'Connected' : 'Not connected'}
                </span>
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="calendlyUrl">Calendly URL</Label>
              <Input
                id="calendlyUrl"
                placeholder="https://calendly.com/yourusername"
                value={calendlyUrl}
                onChange={(e) => setCalendlyUrl(e.target.value)}
                disabled={calendlyStatus === 'connected'}
              />
            </div>

            <div className="flex justify-end">
              {calendlyStatus === 'connected' ? (
                <Button variant="outline" onClick={handleCalendlyDisconnect}>Disconnect</Button>
              ) : (
                <Button onClick={handleCalendlyConnect}>Connect Calendly</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            Zapier Integration for Notifications
          </CardTitle>
          <CardDescription>
            Use Zapier to send meeting notifications to Slack, email, or other platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="zapierWebhook">Zapier Webhook URL</Label>
              <Input
                id="zapierWebhook"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={zapierWebhookUrl}
                onChange={(e) => setZapierWebhookUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Create a Zap that starts with a Webhook trigger, then copy the webhook URL here.
              </p>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={handleZapierTest}>
                Test Webhook
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarIntegration;
