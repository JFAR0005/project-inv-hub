
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useNotificationTrigger } from '@/hooks/useNotificationTrigger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User } from 'lucide-react';
import { format } from 'date-fns';

interface MeetingFormData {
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  company_id?: string;
  participants: string[];
}

interface MeetingScheduleFormProps {
  companyId?: string;
  onSuccess?: () => void;
}

const MeetingScheduleForm: React.FC<MeetingScheduleFormProps> = ({ 
  companyId, 
  onSuccess 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { notifyMeetingScheduled } = useNotificationTrigger();
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  
  const { register, handleSubmit, formState: { errors } } = useForm<MeetingFormData>();

  // Fetch available users for participant selection
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch company name if companyId is provided
  const { data: company } = useQuery({
    queryKey: ['company', companyId],
    queryFn: async () => {
      if (!companyId) return null;
      
      const { data, error } = await supabase
        .from('companies')
        .select('name')
        .eq('id', companyId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  const scheduleMeetingMutation = useMutation({
    mutationFn: async (data: MeetingFormData) => {
      // Create the meeting
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          title: data.title,
          description: data.description,
          location: data.location,
          start_time: data.start_time,
          end_time: data.end_time,
          company_id: companyId || null,
          created_by: user?.id
        })
        .select()
        .single();

      if (meetingError) throw meetingError;

      // Add participants
      if (selectedParticipants.length > 0) {
        const participantRecords = selectedParticipants.map(userId => ({
          meeting_id: meeting.id,
          user_id: userId
        }));

        const { error: participantsError } = await supabase
          .from('meeting_participants')
          .insert(participantRecords);

        if (participantsError) throw participantsError;
      }

      return meeting;
    },
    onSuccess: async (meeting) => {
      // Get participant emails for notifications
      const participantEmails = users
        .filter(u => selectedParticipants.includes(u.id))
        .map(u => u.email)
        .filter(Boolean);

      // Trigger notification after successful meeting creation
      try {
        await notifyMeetingScheduled(
          companyId || '',
          meeting.title,
          format(new Date(meeting.start_time), 'PPP'),
          format(new Date(meeting.start_time), 'p'),
          participantEmails
        );
      } catch (error) {
        console.error('Failed to send meeting notification:', error);
        // Don't fail the whole operation if notification fails
      }

      toast({
        title: "Meeting scheduled successfully",
        description: "Your meeting has been scheduled and notifications have been sent to participants.",
      });

      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error scheduling meeting",
        description: error.message || "There was an error scheduling your meeting. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: MeetingFormData) => {
    scheduleMeetingMutation.mutate({
      ...data,
      participants: selectedParticipants
    });
  };

  const handleParticipantChange = (userId: string, checked: boolean) => {
    setSelectedParticipants(prev => {
      if (checked) {
        return [...prev, userId];
      } else {
        return prev.filter(id => id !== userId);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Schedule Meeting
          {company && <span className="text-muted-foreground"> - {company.name}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Quarterly Review, Board Meeting"
              {...register('title', { required: 'Meeting title is required' })}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Meeting agenda or additional details..."
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Conference Room A, Zoom link, etc."
              {...register('location')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                {...register('start_time', { required: 'Start time is required' })}
              />
              {errors.start_time && (
                <p className="text-sm text-destructive">{errors.start_time.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="datetime-local"
                {...register('end_time', { required: 'End time is required' })}
              />
              {errors.end_time && (
                <p className="text-sm text-destructive">{errors.end_time.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Participants</Label>
            <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`participant-${user.id}`}
                    checked={selectedParticipants.includes(user.id)}
                    onCheckedChange={(checked) => 
                      handleParticipantChange(user.id, checked as boolean)
                    }
                  />
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Label 
                      htmlFor={`participant-${user.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {user.name} ({user.email})
                    </Label>
                  </div>
                </div>
              ))}
            </div>
            {selectedParticipants.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {selectedParticipants.length} participant(s) selected
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={scheduleMeetingMutation.isPending}
            className="w-full"
          >
            {scheduleMeetingMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              'Schedule Meeting'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MeetingScheduleForm;
