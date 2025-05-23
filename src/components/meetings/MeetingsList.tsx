
import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, MoreHorizontal, Edit, Trash2, User } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Meeting } from '@/pages/Meetings';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface MeetingsListProps {
  meetings: Meeting[];
  isLoading: boolean;
  onEditMeeting: (meeting: Meeting) => void;
}

const MeetingsList: React.FC<MeetingsListProps> = ({
  meetings,
  isLoading,
  onEditMeeting,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!user) return;

    try {
      // First delete from meeting_participants
      const { error: participantsError } = await supabase
        .from('meeting_participants')
        .delete()
        .eq('meeting_id', meetingId);

      if (participantsError) throw participantsError;

      // Then delete the meeting
      const { error: meetingError } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId);

      if (meetingError) throw meetingError;

      toast({
        title: "Success",
        description: "Meeting has been deleted",
      });

      // Force reload of the page to refresh the meetings list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast({
        title: "Error",
        description: "Failed to delete meeting. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-16 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <Card className="p-6 text-center">
        <h3 className="text-lg font-medium">No upcoming meetings</h3>
        <p className="text-muted-foreground mt-2">
          You don't have any meetings scheduled. Click "Schedule Meeting" to create one.
        </p>
      </Card>
    );
  }

  // Sort meetings by start time (ascending)
  const sortedMeetings = [...meetings].sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMeetings.map((meeting) => (
            <TableRow key={meeting.id}>
              <TableCell className="font-medium">{meeting.title}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  {format(new Date(meeting.start_time), "PPP")}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  {format(new Date(meeting.start_time), "p")} - {format(new Date(meeting.end_time), "p")}
                </div>
              </TableCell>
              <TableCell>{meeting.company_name || 'N/A'}</TableCell>
              <TableCell>
                {meeting.location ? (
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    {meeting.location}
                  </div>
                ) : (
                  'N/A'
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditMeeting(meeting)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDeleteMeeting(meeting.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MeetingsList;
