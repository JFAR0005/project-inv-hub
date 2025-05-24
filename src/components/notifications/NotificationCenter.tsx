
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Settings, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Send
} from 'lucide-react';

interface NotificationSettings {
  email_updates: boolean;
  email_meetings: boolean;
  email_overdue: boolean;
  slack_enabled: boolean;
  slack_webhook_url: string;
}

const NotificationCenter: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    email_updates: true,
    email_meetings: true,
    email_overdue: true,
    slack_enabled: false,
    slack_webhook_url: ''
  });

  const [testNotificationLoading, setTestNotificationLoading] = useState(false);

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    try {
      // In a real implementation, this would save to the database
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification settings.",
        variant: "destructive",
      });
    }
  };

  const sendTestNotification = async () => {
    setTestNotificationLoading(true);
    try {
      // Mock test notification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Test notification sent",
        description: "Check your configured channels for the test message.",
      });
    } catch (error) {
      toast({
        title: "Test failed",
        description: "Failed to send test notification.",
        variant: "destructive",
      });
    } finally {
      setTestNotificationLoading(false);
    }
  };

  const notificationTypes = [
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "Update Submitted",
      description: "When founders submit company updates",
      color: "bg-blue-100 text-blue-800"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Meeting Scheduled",
      description: "When new meetings are scheduled",
      color: "bg-green-100 text-green-800"
    },
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      title: "Updates Overdue",
      description: "When companies haven't updated in 30+ days",
      color: "bg-red-100 text-red-800"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notification Center</h2>
        <p className="text-muted-foreground">
          Configure how and when you receive notifications about portfolio activity.
        </p>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="types" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification Types
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Configure which events trigger email notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-updates">Company Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when founders submit updates
                  </p>
                </div>
                <Switch
                  id="email-updates"
                  checked={settings.email_updates}
                  onCheckedChange={(checked) => handleSettingChange('email_updates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-meetings">Meeting Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when meetings are scheduled
                  </p>
                </div>
                <Switch
                  id="email-meetings"
                  checked={settings.email_meetings}
                  onCheckedChange={(checked) => handleSettingChange('email_meetings', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-overdue">Overdue Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when updates are overdue (30+ days)
                  </p>
                </div>
                <Switch
                  id="email-overdue"
                  checked={settings.email_overdue}
                  onCheckedChange={(checked) => handleSettingChange('email_overdue', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Slack Integration
              </CardTitle>
              <CardDescription>
                Send notifications to your Slack workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="slack-enabled">Enable Slack Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications to Slack channels
                  </p>
                </div>
                <Switch
                  id="slack-enabled"
                  checked={settings.slack_enabled}
                  onCheckedChange={(checked) => handleSettingChange('slack_enabled', checked)}
                />
              </div>

              {settings.slack_enabled && (
                <div className="space-y-2">
                  <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                  <Input
                    id="slack-webhook"
                    placeholder="https://hooks.slack.com/services/..."
                    value={settings.slack_webhook_url}
                    onChange={(e) => handleSettingChange('slack_webhook_url', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Get your webhook URL from your Slack app settings
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={saveSettings}>
              Save Settings
            </Button>
            <Button 
              variant="outline" 
              onClick={sendTestNotification}
              disabled={testNotificationLoading}
            >
              {testNotificationLoading ? (
                <>
                  <Send className="mr-2 h-4 w-4 animate-pulse" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Test
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
              <CardDescription>
                Overview of different notification events and their triggers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationTypes.map((type, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className={`p-2 rounded-md ${type.color}`}>
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{type.title}</h4>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                    <Badge variant="secondary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationCenter;
