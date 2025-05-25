
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface CompanyWithHealth {
  id: string;
  name: string;
  sector?: string;
  stage?: string;
  arr?: number;
  latest_update?: {
    submitted_at: string;
    arr?: number;
    mrr?: number;
    raise_status?: string;
  };
  needsUpdate: boolean;
  isRaising: boolean;
  daysSinceUpdate: number;
}

export const usePortfolioHealth = () => {
  return useQuery({
    queryKey: ['portfolio-health'],
    queryFn: async (): Promise<CompanyWithHealth[]> => {
      // Fetch companies
      const { data: companiesData, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // For each company, fetch its latest update
      const companiesWithUpdates = await Promise.all(
        (companiesData || []).map(async (company) => {
          const { data: updates } = await supabase
            .from('founder_updates')
            .select('submitted_at, arr, mrr, raise_status')
            .eq('company_id', company.id)
            .order('submitted_at', { ascending: false })
            .limit(1);
          
          const latestUpdate = updates && updates.length > 0 ? updates[0] : null;
          
          // Calculate health indicators
          const daysSinceUpdate = latestUpdate 
            ? Math.floor((new Date().getTime() - new Date(latestUpdate.submitted_at).getTime()) / (1000 * 60 * 60 * 24))
            : 999;
          
          const needsUpdate = !latestUpdate || daysSinceUpdate > 30;
          const isRaising = latestUpdate?.raise_status?.toLowerCase().includes('raising') || 
                           latestUpdate?.raise_status?.toLowerCase().includes('active') || false;
          
          return {
            ...company,
            latest_update: latestUpdate,
            needsUpdate,
            isRaising,
            daysSinceUpdate
          };
        })
      );
      
      return companiesWithUpdates;
    },
  });
};
