
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import NotificationSettings from '@/components/notifications/NotificationSettings';

const Notifications = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Manage your notification preferences and view notification history
        </p>
      </div>
      
      <Tabs defaultValue="center" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="center">Notification Center</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="center" className="mt-6">
          <NotificationCenter />
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
