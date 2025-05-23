
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface NotificationData {
  // For update_submitted
  company_name?: string;
  submitter_name?: string;
  update_link?: string;
  
  // For meeting_scheduled
  meeting_title?: string;
  meeting_date?: string;
  meeting_time?: string;
  participants?: string[];
  
  // For update_overdue
  days_overdue?: number;
  last_update_date?: string;
}

type NotificationType =
  | 'update_submitted'
  | 'meeting_scheduled'
  | 'update_overdue';

interface NotificationPayload {
  type: NotificationType;
  company_id: string;
  data: NotificationData;
  recipients: string[];
}

export const useNotificationTrigger = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const triggerNotification = async (payload: NotificationPayload): Promise<boolean> => {
    try {
      // Use the environment variable or hardcoded URL for Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://guikdtwcpagcpyqieftm.supabase.co';
      const functionUrl = `${supabaseUrl}/functions/v1/send-notifications`;
      
      // Get a fresh Supabase token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ notification: payload }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Notification failed: ${error}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error sending notification');
      }
      
      toast({
        title: "Notification sent",
        description: "The notification has been successfully delivered.",
      });
      
      return true;
    } catch (error) {
      console.error('Error triggering notification:', error);
      
      toast({
        title: "Notification failed",
        description: "There was a problem sending the notification. Please try again later.",
        variant: "destructive",
      });
      
      return false;
    }
  };
  
  // Helper for when a founder submits an update
  const notifyUpdateSubmitted = async (companyId: string, companyName: string, updateId: string): Promise<boolean> => {
    if (!user) return false;
    
    // Get partners associated with this company
    const { data: partners } = await supabase
      .from('users')
      .select('email')
      .eq('role', 'partner');
      
    const recipients = partners?.map(partner => partner.email) || [];
    
    return triggerNotification({
      type: 'update_submitted',
      company_id: companyId,
      data: {
        company_name: companyName,
        submitter_name: user.name,
        update_link: `${window.location.origin}/company/${companyId}/updates`,
      },
      recipients,
    });
  };
  
  // Helper for when a meeting is scheduled
  const notifyMeetingScheduled = async (
    companyId: string, 
    meetingTitle: string, 
    meetingDate: string, 
    meetingTime: string, 
    participantEmails: string[]
  ): Promise<boolean> => {
    if (!user) return false;
    
    return triggerNotification({
      type: 'meeting_scheduled',
      company_id: companyId,
      data: {
        meeting_title: meetingTitle,
        meeting_date: meetingDate,
        meeting_time: meetingTime,
        participants: participantEmails,
      },
      recipients: participantEmails,
    });
  };
  
  return {
    triggerNotification,
    notifyUpdateSubmitted,
    notifyMeetingScheduled,
  };
};
