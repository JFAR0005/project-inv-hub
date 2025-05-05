import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Calendar as CalendarIcon, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import MeetingsList from './MeetingsList';
import IntegrationsPanel from '../integrations/IntegrationsPanel';

const MeetingScheduler = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [meetingType, setMeetingType] = useState<string>('1on1');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [attendees, setAttendees] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('upcoming');

  // Mock time slots - in a real app these would come from calendar integration
  const availableTimeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', 
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  // Mock attendees - in a real app these would come from user database
  const possibleAttendees = [
    { id: '1', name: 'Admin User', role: 'admin' },
    { id: '2', name: 'Venture Partner', role: 'partner' },
    { id: '3', name: 'Founder User', role: 'founder' },
  ].filter(a => a.id !== user?.id);

  const handleScheduleMeeting = () => {
    if (!date || !selectedTime || !title || attendees.length === 0) {
      toast.error("Please fill out all required fields");
      return;
    }

    // In a real app, this would connect to calendar APIs and send invites
    toast("Meeting Scheduled", {
      description: `Your meeting "${title}" has been scheduled for ${format(date, 'PPPP')} at ${selectedTime}`,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setAttendees([]);
    setActiveTab('upcoming');
  };

  const handleSelectAttendee = (attendeeId: string) => {
    if (attendees.includes(attendeeId)) {
      setAttendees(attendees.filter(id => id !== attendeeId));
    } else {
      setAttendees([...attendees, attendeeId]);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="schedule" className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full sm:w-auto grid-cols-3">
          <TabsTrigger value="schedule">Schedule Meeting</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Meetings</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule" className="space-y-4 pt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Date & Time</CardTitle>
                <CardDescription>
                  Choose when you want to schedule your meeting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Select Time</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableTimeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        className="text-sm"
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Meeting Details</CardTitle>
                <CardDescription>
                  Enter details about your meeting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Meeting Title*</Label>
                  <Input
                    id="title"
                    placeholder="Enter meeting title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What is this meeting about?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Meeting Type</Label>
                  <Select value={meetingType} onValueChange={setMeetingType}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select meeting type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1on1">One-on-One</SelectItem>
                      <SelectItem value="group">Group Meeting</SelectItem>
                      <SelectItem value="review">Portfolio Review</SelectItem>
                      <SelectItem value="pitch">Pitch Session</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Attendees*</Label>
                  <div className="border rounded-md p-2 space-y-2">
                    {possibleAttendees.map((attendee) => (
                      <div 
                        key={attendee.id}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                          attendees.includes(attendee.id) ? 'bg-primary/10' : 'hover:bg-muted'
                        }`}
                        onClick={() => handleSelectAttendee(attendee.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                            {attendee.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{attendee.name}</div>
                            <div className="text-xs text-muted-foreground capitalize">{attendee.role}</div>
                          </div>
                        </div>
                        <div className={`h-4 w-4 rounded-full ${
                          attendees.includes(attendee.id) ? 'bg-primary' : 'border border-gray-300'
                        }`}>
                          {attendees.includes(attendee.id) && (
                            <div className="h-full w-full flex items-center justify-center text-white">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleScheduleMeeting}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="pt-4">
          <MeetingsList />
        </TabsContent>

        <TabsContent value="integrations" className="pt-4">
          <IntegrationsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MeetingScheduler;
