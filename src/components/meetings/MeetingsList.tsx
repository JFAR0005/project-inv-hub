
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { formatDistanceToNow, parseISO, format, isAfter } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MeetingScheduleForm from './MeetingScheduleForm';
import { Badge } from '@/components/ui/badge';

type Meeting = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  description: string | null;
  location: string | null;
  created_by: string;
  companyName?: string;
  participants: Array<{ id: string; name: string }>;
  isCreator: boolean;
};

const MeetingsList = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      try {
        // Fetch meetings where user is the creator or a participant
        const { data, error } = await supabase
          .from('meetings')
          .select(`
            id,
            title,
            start_time,
            end_time,
            description,
            location,
            created_by,
            companies(name),
            meeting_participants(user_id, users(id, name))
          `)
          .gte('start_time', new Date().toISOString())
          .or(`created_by.eq.${user.id},meeting_participants.user_id.eq.${user.id}`);

        if (error) throw error;

        if (data && data.length > 0) {
          // Transform Supabase data to our Meeting type
          const formattedMeetings: Meeting[] = data.map(meeting => ({
            id: meeting.id,
            title: meeting.title,
            start_time: meeting.start_time,
            end_time: meeting.end_time,
            description: meeting.description,
            location: meeting.location,
            created_by: meeting.created_by,
            companyName: meeting.companies?.name,
            participants: Array.isArray(meeting.meeting_participants) 
              ? meeting.meeting_participants.map((p: any) => ({
                  id: p.users?.id || p.user_id,
                  name: p.users?.name || 'Unknown'
                }))
              : [],
            isCreator: meeting.created_by === user.id
          }));
          
          // Sort meetings by date (closest first)
          formattedMeetings.sort((a, b) => 
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
          );
          
          setMeetings(formattedMeetings);
        } else {
          setMeetings([]);
        }
      } catch (error) {
        console.error('Error fetching meetings:', error);
        toast("Error loading meetings", {
          description: "Could not load your meetings. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
    
    // Setup real-time subscription for meeting updates
    const subscription = supabase
      .channel('meetings-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'meetings' 
      }, () => {
        fetchMeetings();
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleCancelMeeting = async (meetingId: string) => {
    if (!user) return;
    
    if (!confirm("Are you sure you want to cancel this meeting?")) return;
    
    try {
      // Check if user is creator or admin
      const canCancel = user.role === 'admin' || meetings.find(m => m.id === meetingId)?.isCreator;
      
      if (!canCancel) {
        toast.error("You don't have permission to cancel this meeting");
        return;
      }
      
      // Delete the meeting participants first (necessary for foreign key constraints)
      const { error: participantsError } = await supabase
        .from('meeting_participants')
        .delete()
        .eq('meeting_id', meetingId);
      
      if (participantsError) throw participantsError;
      
      // Then delete the meeting
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId);
        
      if (error) throw error;
      
      // Update local state
      setMeetings(meetings.filter(meeting => meeting.id !== meetingId));
      
      toast("Meeting cancelled", {
        description: "The meeting has been cancelled successfully.",
      });
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      toast.error("Failed to cancel meeting. Please try again.");
    }
  };

  const handleRescheduleMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsRescheduleDialogOpen(true);
  };
  
  // Format datetime
  const formatDateTime = (dateTimeString: string) => {
    const date = parseISO(dateTimeString);
    const today = new Date();
    
    let dayStr = formatDistanceToNow(date, { addSuffix: true });
    
    const timeStr = format(date, 'h:mm a');
    return {
      relative: dayStr,
      time: timeStr,
      full: format(date, 'PPPP p')
    };
  };

  const canManageMeeting = (meeting: Meeting) => {
    return meeting.isCreator || user?.role === 'admin';
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {meetings.map((meeting) => (
          <Card key={meeting.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{meeting.title}</CardTitle>
                {meeting.companyName && (
                  <Badge className="ml-2">{meeting.companyName}</Badge>
                )}
              </div>
              <CardDescription className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> 
                <span title={formatDateTime(meeting.start_time).full}>
                  {formatDateTime(meeting.start_time).relative}{' '}
                  ({formatDateTime(meeting.start_time).time})
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {meeting.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {meeting.description}
                </p>
              )}
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="text-muted-foreground">
                    {format(parseISO(meeting.start_time), 'h:mm a')} - {format(parseISO(meeting.end_time), 'h:mm a')}
                  </div>
                </div>
                
                {meeting.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div className="text-muted-foreground">
                      {meeting.location.startsWith('http') ? (
                        <a 
                          href={meeting.location} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Virtual Meeting Link
                        </a>
                      ) : (
                        meeting.location
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="text-muted-foreground">
                    {meeting.participants.length} attendee{meeting.participants.length !== 1 ? 's' : ''}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {meeting.participants.slice(0, 3).map((participant) => (
                        <div 
                          key={participant.id} 
                          className="bg-secondary text-secondary-foreground text-xs rounded-full px-2 py-0.5"
                        >
                          {participant.name}
                        </div>
                      ))}
                      {meeting.participants.length > 3 && (
                        <div className="bg-secondary text-secondary-foreground text-xs rounded-full px-2 py-0.5">
                          +{meeting.participants.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {canManageMeeting(meeting) && (
                <div className="flex mt-4 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => handleRescheduleMeeting(meeting)}
                  >
                    Reschedule
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs text-destructive hover:text-destructive"
                    onClick={() => handleCancelMeeting(meeting.id)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {meetings.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
          <div className="mb-2 p-4 bg-background rounded-full border">
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">No upcoming meetings</h3>
          <p className="text-muted-foreground text-center mb-4">
            You don't have any scheduled meetings.
          </p>
          <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(true)}>
            Schedule a Meeting
          </Button>
        </div>
      )}
      
      {isLoading && (
        <div className="flex justify-center items-center p-8">
          <div className="text-muted-foreground">Loading meetings...</div>
        </div>
      )}
      
      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedMeeting ? 'Reschedule Meeting' : 'Schedule Meeting'}
            </DialogTitle>
          </DialogHeader>
          <MeetingScheduleForm 
            onSuccess={() => {
              setIsRescheduleDialogOpen(false);
              setSelectedMeeting(null);
            }} 
            initialDate={selectedMeeting ? parseISO(selectedMeeting.start_time) : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MeetingsList;
