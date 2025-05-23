
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

interface NotificationData {
  type: 'update_submitted' | 'meeting_scheduled' | 'overdue_update';
  company_id: string;
  data: {
    company_name?: string;
    submitter_name?: string;
    meeting_title?: string;
    meeting_time?: string;
    participants?: string[];
    update_link?: string;
    meeting_link?: string;
  };
}

export const useNotifications = () => {
  const sendNotification = async (notificationData: NotificationData) => {
    try {
      console.log('Sending notification:', notificationData);
      
      const { data, error } = await supabase.functions.invoke('send-notifications', {
        body: notificationData
      });

      if (error) {
        throw error;
      }

      console.log('Notification sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to send notification:', error);
      toast('Failed to send notification', {
        description: error.message || 'Unknown error occurred'
      });
      throw error;
    }
  };

  return { sendNotification };
};
