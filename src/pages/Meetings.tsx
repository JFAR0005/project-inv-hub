
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, Plus, Video, MapPin } from 'lucide-react';
import MeetingScheduleForm from '@/components/meetings/MeetingScheduleForm';

const Meetings = () => {
  const { user } = useAuth();
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  const upcomingMeetings = [
    {
      id: '1',
      title: 'Portfolio Review - TechCorp',
      date: '2024-12-15',
      time: '10:00 AM',
      participants: ['John Doe', 'Jane Smith'],
      type: 'video',
      location: 'Zoom'
    },
    {
      id: '2',
      title: 'Due Diligence Meeting',
      date: '2024-12-16',
      time: '2:00 PM',
      participants: ['Sarah Wilson'],
      type: 'in-person',
      location: 'Conference Room A'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Meetings</h1>
            <p className="text-muted-foreground mt-2">
              Schedule and manage meetings with portfolio companies and team members
            </p>
          </div>
          <Button onClick={() => setShowScheduleForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">Schedule Meeting</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Meetings
                </CardTitle>
                <Calendar className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingMeetings.length}</div>
                <p className="text-xs text-muted-foreground">
                  Next: {upcomingMeetings[0]?.date || 'None scheduled'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  This Week
                </CardTitle>
                <Clock className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">
                  Hours scheduled this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Participants
                </CardTitle>
                <Users className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  Active participants
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Meetings List */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
              <CardDescription>Your scheduled meetings and appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                        {meeting.type === 'video' ? (
                          <Video className="h-5 w-5 text-primary" />
                        ) : (
                          <MapPin className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{meeting.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {meeting.date} at {meeting.time} • {meeting.location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {meeting.participants.join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Join
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Schedule New Meeting</CardTitle>
              <CardDescription>
                Create a new meeting with portfolio companies or team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MeetingScheduleForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>
                Calendar integration coming soon
              </CardDescription>
            </CardHeader>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Calendar view will be available with upcoming integrations</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Meetings;
