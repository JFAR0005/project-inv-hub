import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, RefreshCw } from 'lucide-react';

interface SystemSettings {
  autoNotifications: boolean;
  updateRemindersEnabled: boolean;
  notificationFrequency: string;
  systemMessage: string;
  maintenanceMode: boolean;
}

const AdminSettings: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [settings, setSettings] = useState<SystemSettings>({
    autoNotifications: true,
    updateRemindersEnabled: true,
    notificationFrequency: 'weekly',
    systemMessage: '',
    maintenanceMode: false,
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: SystemSettings) => {
      // In a real implementation, this would save to a settings table
      console.log('Saving settings:', newSettings);
      
      // Log the action - convert settings to JSON-compatible object
      await supabase
        .from('audit_logs')
        .insert({
          action: 'system_settings_updated',
          target_type: 'system',
          target_id: 'settings',
          details: newSettings as any
        });
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "System settings have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    },
  });

  const clearCacheMutation = useMutation({
    mutationFn: async () => {
      // Clear React Query cache
      queryClient.clear();
      
      // Log the action
      await supabase
        .from('audit_logs')
        .insert({
          action: 'cache_cleared',
          target_type: 'system',
          target_id: 'cache'
        });
    },
    onSuccess: () => {
      toast({
        title: "Cache cleared",
        description: "System cache has been cleared successfully.",
      });
    },
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleClearCache = () => {
    clearCacheMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Settings</h2>
          <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
        </div>
        <Button onClick={handleClearCache} disabled={clearCacheMutation.isPending}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Clear Cache
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-notifications">Auto Notifications</Label>
              <Switch
                id="auto-notifications"
                checked={settings.autoNotifications}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, autoNotifications: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="update-reminders">Update Reminders</Label>
              <Switch
                id="update-reminders"
                checked={settings.updateRemindersEnabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, updateRemindersEnabled: checked }))
                }
              />
            </div>

            <div>
              <Label htmlFor="notification-frequency">Notification Frequency</Label>
              <select
                id="notification-frequency"
                value={settings.notificationFrequency}
                onChange={(e) => setSettings(prev => ({ ...prev, notificationFrequency: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              <Switch
                id="maintenance-mode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, maintenanceMode: checked }))
                }
              />
            </div>

            <div>
              <Label htmlFor="system-message">System Message</Label>
              <Textarea
                id="system-message"
                placeholder="Enter a system-wide message for users..."
                value={settings.systemMessage}
                onChange={(e) => setSettings(prev => ({ ...prev, systemMessage: e.target.value }))}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings} 
          disabled={saveSettingsMutation.isPending}
          className="min-w-[120px]"
        >
          <Save className="h-4 w-4 mr-2" />
          {saveSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
