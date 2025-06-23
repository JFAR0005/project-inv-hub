
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PortfolioHealthData {
  totalCompanies: number;
  companiesNeedingUpdate: number;
  companiesRaising: number;
  recentUpdates: number;
  averageRating: number;
  healthScore: number;
}

export function usePortfolioHealth() {
  return useQuery({
    queryKey: ['portfolio-health'],
    queryFn: async (): Promise<PortfolioHealthData> => {
      try {
        // Get total companies
        const { count: totalCompanies } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true });

        // Get companies that need updates (haven't submitted in 30+ days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: recentUpdates } = await supabase
          .from('founder_updates')
          .select('company_id')
          .gte('submitted_at', thirtyDaysAgo.toISOString());

        const companiesWithRecentUpdates = new Set(
          recentUpdates?.map(update => update.company_id) || []
        );

        const companiesNeedingUpdate = (totalCompanies || 0) - companiesWithRecentUpdates.size;

        // Get companies actively raising
        const { count: companiesRaising } = await supabase
          .from('founder_updates')
          .select('*', { count: 'exact', head: true })
          .not('raise_status', 'is', null)
          .neq('raise_status', 'Not raising');

        // Get recent updates count
        const { count: recentUpdatesCount } = await supabase
          .from('founder_updates')
          .select('*', { count: 'exact', head: true })
          .gte('submitted_at', thirtyDaysAgo.toISOString());

        return {
          totalCompanies: totalCompanies || 0,
          companiesNeedingUpdate: Math.max(0, companiesNeedingUpdate),
          companiesRaising: companiesRaising || 0,
          recentUpdates: recentUpdatesCount || 0,
          averageRating: 8.5,
          healthScore: 85,
        };
      } catch (error) {
        console.error('Error fetching portfolio health:', error);
        return {
          totalCompanies: 0,
          companiesNeedingUpdate: 0,
          companiesRaising: 0,
          recentUpdates: 0,
          averageRating: 0,
          healthScore: 0,
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
