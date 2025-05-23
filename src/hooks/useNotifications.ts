
import { useToast } from '@/hooks/use-toast';

// Notification types
export type NotificationType = 
  | 'update_submitted'  // When a founder submits an update
  | 'meeting_scheduled' // When a meeting is scheduled
  | 'update_overdue';   // When an update is overdue (30+ days)

// Data specific to each notification type
export type NotificationData = {
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
};

export interface NotificationRequest {
  type: NotificationType;
  company_id: string;
  data: NotificationData;
  recipients?: string[]; // Optional override for default recipients
}

export const useNotifications = () => {
  const { toast } = useToast();

  const sendNotification = async (notification: NotificationRequest) => {
    try {
      // For now, just show a local toast notification
      // In the future, this could call a Supabase Edge Function to send emails/Slack messages
      let title = '';
      let description = '';
      
      switch (notification.type) {
        case 'update_submitted':
          title = 'Update Submitted';
          description = `${notification.data.company_name} has submitted a new update`;
          break;
        case 'meeting_scheduled':
          title = 'Meeting Scheduled';
          description = `${notification.data.meeting_title} scheduled for ${notification.data.meeting_date}`;
          break;
        case 'update_overdue':
          title = 'Update Overdue';
          description = `${notification.data.company_name} hasn't submitted an update in ${notification.data.days_overdue} days`;
          break;
      }
      
      toast({
        title,
        description,
      });
      
      // TODO: Implement actual notification sending via Supabase Edge Function
      console.log('Notification sent:', notification);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Notification Failed",
        description: "There was an error sending the notification",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { sendNotification };
};
