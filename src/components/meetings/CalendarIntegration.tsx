
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Mail, Slack } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const CalendarIntegration = () => {
  const { user } = useAuth();

  const handleGoogleCalendarConnect = () => {
    // In a real implementation, this would redirect to OAuth flow
    alert('This would connect to Google Calendar in a real implementation');
  };

  const handleOutlookCalendarConnect = () => {
    // In a real implementation, this would redirect to OAuth flow
    alert('This would connect to Outlook Calendar in a real implementation');
  };

  const handleSlackConnect = () => {
    // In a real implementation, this would redirect to OAuth flow
    alert('This would connect to Slack in a real implementation');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              Google Calendar
            </CardTitle>
            <CardDescription>
              Sync meetings with your Google Calendar account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Keep your Google Calendar in sync with your Black Nova meetings. Changes made in either system will be reflected in both.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGoogleCalendarConnect} className="w-full">
              Connect Google Calendar
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5 text-primary" />
              Outlook Calendar
            </CardTitle>
            <CardDescription>
              Sync meetings with your Outlook Calendar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Keep your Outlook Calendar in sync with your Black Nova meetings. Changes made in either system will be reflected in both.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleOutlookCalendarConnect} variant="outline" className="w-full">
              Connect Outlook
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Slack className="mr-2 h-5 w-5 text-primary" />
              Slack Notifications
            </CardTitle>
            <CardDescription>
              Get meeting notifications in Slack
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Receive notifications about upcoming meetings, changes, and cancellations directly in your Slack workspace.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSlackConnect} variant="outline" className="w-full">
              Connect Slack
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendar Settings</CardTitle>
          <CardDescription>
            Configure your calendar preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            These settings control how your calendar appears and behaves in the Black Nova system.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for meeting updates
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="email-notifications" className="rounded border-gray-300" defaultChecked />
                <label htmlFor="email-notifications" className="text-sm">Enabled</label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Calendar Reminders</h4>
                <p className="text-sm text-muted-foreground">
                  Get reminders before scheduled meetings
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <select className="text-sm border rounded px-2 py-1">
                  <option value="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="1440">1 day before</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Save Settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CalendarIntegration;
