
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Bell, Slack, Mail, Zap } from 'lucide-react';

const NotificationSettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    slackWebhook: '',
    zapierWebhook: '',
    emailEnabled: true,
    slackEnabled: false,
    zapierEnabled: false,
  });

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    toast({
      title: "Settings saved",
      description: "Your notification settings have been updated.",
    });
  };

  const testNotification = async (type: 'slack' | 'zapier') => {
    const webhookUrl = type === 'slack' ? settings.slackWebhook : settings.zapierWebhook;
    
    if (!webhookUrl) {
      toast({
        title: "No webhook URL",
        description: `Please enter a ${type} webhook URL first.`,
        variant: "destructive",
      });
      return;
    }

    try {
      const testData = type === 'slack' ? {
        text: "🧪 Test notification from your VC platform",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "This is a test notification to verify your webhook integration is working correctly."
            }
          }
        ]
      } : {
        event_type: 'test',
        message: 'Test notification from VC platform',
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      if (response.ok) {
        toast({
          title: "Test successful",
          description: `Test notification sent to ${type} successfully.`,
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      toast({
        title: "Test failed",
        description: `Failed to send test notification to ${type}.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Notification Settings
        </h2>
        <p className="text-muted-foreground mt-2">
          Configure how you want to receive notifications about portfolio updates, meetings, and overdue reports.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Slack className="h-5 w-5" />
              Slack Integration
            </CardTitle>
            <CardDescription>
              Send notifications to a Slack channel using a webhook URL.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="slack-enabled"
                checked={settings.slackEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, slackEnabled: checked })}
              />
              <Label htmlFor="slack-enabled">Enable Slack notifications</Label>
            </div>
            {settings.slackEnabled && (
              <div className="space-y-2">
                <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="slack-webhook"
                    placeholder="https://hooks.slack.com/services/..."
                    value={settings.slackWebhook}
                    onChange={(e) => setSettings({ ...settings, slackWebhook: e.target.value })}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => testNotification('slack')}
                    disabled={!settings.slackWebhook}
                  >
                    Test
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Zapier Integration
            </CardTitle>
            <CardDescription>
              Trigger Zapier workflows with portfolio events for advanced automation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="zapier-enabled"
                checked={settings.zapierEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, zapierEnabled: checked })}
              />
              <Label htmlFor="zapier-enabled">Enable Zapier notifications</Label>
            </div>
            {settings.zapierEnabled && (
              <div className="space-y-2">
                <Label htmlFor="zapier-webhook">Zapier Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="zapier-webhook"
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    value={settings.zapierWebhook}
                    onChange={(e) => setSettings({ ...settings, zapierWebhook: e.target.value })}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => testNotification('zapier')}
                    disabled={!settings.zapierWebhook}
                  >
                    Test
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Send email notifications to team members and founders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="email-enabled"
                checked={settings.emailEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, emailEnabled: checked })}
              />
              <Label htmlFor="email-enabled">Enable email notifications</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={saveSettings}>
          Save Settings
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Events</CardTitle>
          <CardDescription>
            Your platform will automatically send notifications for these events:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <strong>Founder submits update</strong> → Notify assigned Venture Partner
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <strong>Meeting is scheduled</strong> → Notify all participants
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <strong>Company has no update in 30+ days</strong> → Notify founder + VP
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
