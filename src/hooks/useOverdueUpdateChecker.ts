
import { useEffect } from 'react';
import { usePortfolioHealth } from './usePortfolioHealth';
import { useNotificationTrigger } from './useNotificationTrigger';
import { useAuth } from '@/context/AuthContext';

export const useOverdueUpdateChecker = () => {
  const { data: companies = [] } = usePortfolioHealth();
  const { notifyUpdateOverdue } = useNotificationTrigger();
  const { user } = useAuth();

  useEffect(() => {
    // Only run for admin/partner roles
    if (!user || !['admin', 'partner'].includes(user.role || '')) {
      return;
    }

    const checkOverdueUpdates = async () => {
      console.log('Checking for overdue updates...');
      
      const overdueCompanies = companies.filter(company => 
        company.needsUpdate && company.daysSinceUpdate > 30
      );

      for (const company of overdueCompanies) {
        // Check if we've already notified recently (to avoid spam)
        const lastNotifiedKey = `overdue_notified_${company.id}`;
        const lastNotified = localStorage.getItem(lastNotifiedKey);
        const daysSinceNotification = lastNotified 
          ? Math.floor((Date.now() - parseInt(lastNotified)) / (1000 * 60 * 60 * 24))
          : 999;

        // Only notify if we haven't notified in the last 7 days
        if (daysSinceNotification >= 7) {
          console.log(`Sending overdue notification for ${company.name}`);
          
          const success = await notifyUpdateOverdue(
            company.id,
            company.name,
            company.daysSinceUpdate,
            company.latest_update?.submitted_at || null
          );

          if (success) {
            localStorage.setItem(lastNotifiedKey, Date.now().toString());
          }
        }
      }
    };

    // Check immediately and then every hour
    checkOverdueUpdates();
    const interval = setInterval(checkOverdueUpdates, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [companies, notifyUpdateOverdue, user]);
};
