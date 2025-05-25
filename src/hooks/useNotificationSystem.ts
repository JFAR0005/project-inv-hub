
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useNotificationTrigger } from './useNotificationTrigger';

export const useNotificationSystem = () => {
  const { user } = useAuth();
  const { notifyUpdateOverdue } = useNotificationTrigger();

  // Check for overdue updates every hour
  const { data: companies = [] } = useQuery({
    queryKey: ['overdue-check', user?.id],
    queryFn: async () => {
      if (!user || !['admin', 'partner'].includes(user.role || '')) {
        return [];
      }

      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (companiesError) throw companiesError;

      const { data: updates, error: updatesError } = await supabase
        .from('founder_updates')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (updatesError) throw updatesError;

      // Get latest update for each company
      const updatesByCompany = new Map();
      updates.forEach(update => {
        if (!updatesByCompany.has(update.company_id)) {
          updatesByCompany.set(update.company_id, update);
        }
      });

      return companiesData.map(company => {
        const latestUpdate = updatesByCompany.get(company.id);
        const lastUpdateDate = latestUpdate?.submitted_at;
        const daysSinceUpdate = lastUpdateDate 
          ? Math.floor((new Date().getTime() - new Date(lastUpdateDate).getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        return {
          ...company,
          daysSinceUpdate,
          needsUpdate: !lastUpdateDate || daysSinceUpdate > 30,
          latest_update: latestUpdate
        };
      });
    },
    enabled: !!user && ['admin', 'partner'].includes(user.role || ''),
    refetchInterval: 60 * 60 * 1000, // Check every hour
  });

  useEffect(() => {
    if (!user || !['admin', 'partner'].includes(user.role || '')) {
      return;
    }

    const checkAndNotifyOverdue = async () => {
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

    checkAndNotifyOverdue();
  }, [companies, notifyUpdateOverdue, user]);

  return {
    overdueCompanies: companies.filter(c => c.needsUpdate && c.daysSinceUpdate > 30),
    totalCompanies: companies.length
  };
};
