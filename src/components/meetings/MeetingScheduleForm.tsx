
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';

interface MeetingScheduleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMeetingCreated?: () => void;
}

// Create form schema
const meetingSchema = z.object({
  title: z.string().min(3, { message: "Title is required" }),
  description: z.string().optional(),
  date: z.string().min(1, { message: "Date is required" }),
  time: z.string().min(1, { message: "Time is required" }),
  duration: z.string().min(1, { message: "Duration is required" }),
  company_id: z.string().optional(),
  location: z.string().optional(),
});

type MeetingFormValues = z.infer<typeof meetingSchema>;

const MeetingScheduleForm: React.FC<MeetingScheduleFormProps> = ({ 
  open, 
  onOpenChange,
  onMeetingCreated
}) => {
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch companies on open
  React.useEffect(() => {
    if (open) {
      fetchCompanies();
    }
  }, [open]);
  
  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast('Failed to load companies');
    }
  };

  // Initialize form
  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      duration: "60",
      company_id: "",
      location: "",
    },
  });

  const onSubmit = async (data: MeetingFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Create meeting in database
      const { data: meeting, error } = await supabase
        .from('meetings')
        .insert({
          title: data.title,
          description: data.description || null,
          date: data.date,
          time: data.time,
          duration: parseInt(data.duration),
          company_id: data.company_id || null,
          location: data.location || null,
          organizer_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Get company info if applicable
      let companyName = 'N/A';
      if (data.company_id) {
        const { data: company } = await supabase
          .from('companies')
          .select('name')
          .eq('id', data.company_id)
          .single();
        
        if (company) {
          companyName = company.name;
        }
      }
      
      // Get participants (simplified - would normally have attendee selection)
      const recipients = [user.email];
      
      if (data.company_id) {
        // Get company founders
        const { data: founders } = await supabase
          .from('users')
          .select('email')
          .eq('company_id', data.company_id);
        
        if (founders) {
          recipients.push(...founders.map(f => f.email));
        }
      }
      
      // Send notification
      await sendNotification({
        type: 'meeting_scheduled',
        company_id: data.company_id || user.id, // Use user ID if no company
        data: {
          meeting_title: data.title,
          meeting_date: format(new Date(data.date), 'MMMM d, yyyy'),
          meeting_time: data.time,
          participants: recipients,
        },
        recipients
      });
      
      toast('Meeting scheduled successfully', {
        description: `${data.title} has been scheduled for ${data.date} at ${data.time}`
      });
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      
      // Refresh meetings list
      if (onMeetingCreated) {
        onMeetingCreated();
      }
      
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast('Failed to schedule meeting', {
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Meeting</DialogTitle>
          <DialogDescription>
            Fill in the details to schedule a new meeting
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Strategy Meeting" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (mins)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="company_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Company</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {companies.map(company => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Office / Zoom URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Meeting agenda and details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Scheduling...' : 'Schedule Meeting'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingScheduleForm;
