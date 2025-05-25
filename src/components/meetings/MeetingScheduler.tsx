
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNotificationTrigger } from '@/hooks/useNotificationTrigger';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface MeetingFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  company_id: string;
  participant_emails: string;
}

const MeetingScheduler: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { notifyMeetingScheduled } = useNotificationTrigger();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<MeetingFormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '60',
    company_id: '',
    participant_emails: ''
  });

  const createMeetingMutation = useMutation({
    mutationFn: async (meetingData: MeetingFormData) => {
      const participantEmails = meetingData.participant_emails
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      const { data, error } = await supabase
        .from('meetings')
        .insert({
          title: meetingData.title,
          description: meetingData.description || null,
          date: meetingData.date,
          time: meetingData.time,
          duration: parseInt(meetingData.duration),
          company_id: meetingData.company_id || null,
          created_by: user?.id,
          participant_emails: participantEmails
        })
        .select()
        .single();

      if (error) throw error;
      return { ...data, participant_emails: participantEmails };
    },
    onSuccess: async (data) => {
      console.log('Meeting created successfully:', data);
      
      // Trigger notification
      if (data.participant_emails && data.participant_emails.length > 0) {
        const notificationSent = await notifyMeetingScheduled(
          data.company_id || '',
          data.title,
          format(new Date(data.date), 'MMMM d, yyyy'),
          data.time,
          data.participant_emails
        );
        
        if (notificationSent) {
          console.log('Meeting notification sent successfully');
        }
      }
      
      // Reset form and close dialog
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: '60',
        company_id: '',
        participant_emails: ''
      });
      setIsOpen(false);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      
      toast({
        title: "Meeting scheduled successfully",
        description: "The meeting has been created and participants have been notified.",
      });
    },
    onError: (error) => {
      console.error('Error creating meeting:', error);
      toast({
        title: "Error scheduling meeting",
        description: "There was a problem creating the meeting. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.time) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    createMeetingMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof MeetingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule New Meeting
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Quarterly Review with Acme Corp"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Meeting agenda and notes..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="participant_emails">Participant Emails</Label>
            <Input
              id="participant_emails"
              placeholder="email1@example.com, email2@example.com"
              value={formData.participant_emails}
              onChange={(e) => handleInputChange('participant_emails', e.target.value)}
            />
            <p className="text-xs text-gray-500">Separate multiple emails with commas</p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMeetingMutation.isPending}>
              {createMeetingMutation.isPending ? 'Scheduling...' : 'Schedule Meeting'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingScheduler;
