
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Meeting } from '@/pages/Meetings';

interface MeetingScheduleFormProps {
  onSuccess?: () => void;
  meeting?: Meeting | null;
}

export default function MeetingScheduleForm({ onSuccess, meeting }: MeetingScheduleFormProps) {
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    company_id: '',
    participants: [] as string[]
  });

  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Populate form data when editing a meeting
  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title || '',
        description: meeting.description || '',
        start_time: meeting.start_time ? new Date(meeting.start_time).toISOString().slice(0, 16) : '',
        end_time: meeting.end_time ? new Date(meeting.end_time).toISOString().slice(0, 16) : '',
        location: meeting.location || '',
        company_id: meeting.company_id || '',
        participants: meeting.participants || []
      });
    }
  }, [meeting]);

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name');

      if (error) {
        console.error('Error fetching companies:', error);
        toast('Failed to load companies', {
          description: error.message || 'Please try again'
        });
      } else {
        setCompanies(data || []);
      }
    };

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email');

      if (error) {
        console.error('Error fetching users:', error);
        toast('Failed to load users', {
          description: error.message || 'Please try again'
        });
      } else {
        setUsers(data || []);
      }
    };

    fetchCompanies();
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      if (meeting) {
        // Update existing meeting
        const { error: updateError } = await supabase
          .from('meetings')
          .update({
            title: formData.title,
            description: formData.description,
            start_time: formData.start_time,
            end_time: formData.end_time,
            location: formData.location,
            company_id: formData.company_id || null,
          })
          .eq('id', meeting.id);

        if (updateError) throw updateError;

        // Delete existing participants
        await supabase
          .from('meeting_participants')
          .delete()
          .eq('meeting_id', meeting.id);

        // Add new participants
        if (formData.participants.length > 0) {
          const participantInserts = formData.participants.map(participantId => ({
            meeting_id: meeting.id,
            user_id: participantId
          }));

          const { error: participantError } = await supabase
            .from('meeting_participants')
            .insert(participantInserts);

          if (participantError) throw participantError;
        }

        toast('Meeting updated successfully!');
      } else {
        // Create new meeting
        const { data: meetingData, error: meetingError } = await supabase
          .from('meetings')
          .insert({
            title: formData.title,
            description: formData.description,
            start_time: formData.start_time,
            end_time: formData.end_time,
            location: formData.location,
            company_id: formData.company_id || null,
            created_by: user.id,
          })
          .select()
          .single();

        if (meetingError) throw meetingError;

        // Add participants
        if (formData.participants.length > 0) {
          const participantInserts = formData.participants.map(participantId => ({
            meeting_id: meetingData.id,
            user_id: participantId
          }));

          const { error: participantError } = await supabase
            .from('meeting_participants')
            .insert(participantInserts);

          if (participantError) throw participantError;
        }

        // Get company name if selected
        let companyName = 'General Meeting';
        if (formData.company_id) {
          const { data: company } = await supabase
            .from('companies')
            .select('name')
            .eq('id', formData.company_id)
            .single();
          
          if (company) companyName = company.name;
        }

        // Get participant names
        const participantNames: string[] = [];
        if (formData.participants.length > 0) {
          const { data: users } = await supabase
            .from('users')
            .select('name, email')
            .in('id', formData.participants);
          
          if (users) {
            participantNames.push(...users.map(u => u.name || u.email || 'Unknown'));
          }
        }

        // Send notification
        await sendNotification({
          type: 'meeting_scheduled',
          company_id: formData.company_id || 'general',
          data: {
            company_name: companyName,
            meeting_title: formData.title,
            meeting_time: new Date(formData.start_time).toLocaleString(),
            participants: participantNames,
            meeting_link: `${window.location.origin}/meetings`
          }
        });

        toast('Meeting scheduled successfully!', {
          description: 'All participants have been notified.'
        });

        // Reset form
        setFormData({
          title: '',
          description: '',
          start_time: '',
          end_time: '',
          location: '',
          company_id: '',
          participants: []
        });
      }

      onSuccess?.();

    } catch (error) {
      console.error('Error creating/updating meeting:', error);
      toast('Failed to schedule meeting', {
        description: error.message || 'Please try again'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleParticipantToggle = (participantId: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(participantId)
        ? prev.participants.filter(id => id !== participantId)
        : [...prev.participants, participantId]
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {meeting ? 'Edit Meeting' : 'Schedule New Meeting'}
        </CardTitle>
        <CardDescription>
          {meeting ? 'Update meeting details and participants' : 'Create a new meeting and invite participants'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Meeting Title</Label>
            <Input
              id="title"
              placeholder="Weekly Check-in"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Meeting agenda and details..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Conference Room A or Zoom link"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div>
            <Label htmlFor="company_id">Company (Optional)</Label>
            <Select value={formData.company_id} onValueChange={(value) => setFormData({...formData, company_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">General Meeting</SelectItem>
                {companies.map(company => (
                  <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Participants</Label>
            <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
              {users.map(user => (
                <div 
                  key={user.id}
                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                    formData.participants.includes(user.id) ? 'bg-primary/10' : 'hover:bg-muted'
                  }`}
                  onClick={() => handleParticipantToggle(user.id)}
                >
                  <input
                    type="checkbox"
                    checked={formData.participants.includes(user.id)}
                    onChange={() => handleParticipantToggle(user.id)}
                    className="rounded"
                  />
                  <span>{user.name || user.email}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (meeting ? 'Updating...' : 'Scheduling...') : (meeting ? 'Update Meeting' : 'Schedule Meeting')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
