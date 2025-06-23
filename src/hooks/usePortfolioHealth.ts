
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, parseISO } from 'date-fns';

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

interface PortfolioHealthData {
  companies: CompanyWithHealth[];
  totalCompanies: number;
  companiesNeedingUpdate: number;
  companiesRaising: number;
}

export function usePortfolioHealth() {
  return useQuery({
    queryKey: ['portfolio-health'],
    queryFn: async (): Promise<PortfolioHealthData> => {
      // Fetch companies with their latest updates
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*');

      if (companiesError) throw companiesError;

      // Fetch latest founder updates for each company
      const { data: updates, error: updatesError } = await supabase
        .from('founder_updates')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (updatesError) throw updatesError;

      // Process companies with health data
      const companiesWithHealth: CompanyWithHealth[] = (companies || []).map(company => {
        const latestUpdate = updates?.find(update => update.company_id === company.id);
        
        const daysSinceUpdate = latestUpdate 
          ? differenceInDays(new Date(), parseISO(latestUpdate.submitted_at))
          : 999;

        const needsUpdate = daysSinceUpdate > 30; // 30 days threshold
        const isRaising = latestUpdate?.raise_status === 'raising';

        return {
          id: company.id,
          name: company.name,
          sector: company.sector,
          stage: company.stage,
          arr: company.arr,
          latest_update: latestUpdate ? {
            submitted_at: latestUpdate.submitted_at,
            arr: latestUpdate.arr,
            mrr: latestUpdate.mrr,
            raise_status: latestUpdate.raise_status,
          } : undefined,
          needsUpdate,
          isRaising,
          daysSinceUpdate
        };
      });

      const totalCompanies = companiesWithHealth.length;
      const companiesNeedingUpdate = companiesWithHealth.filter(c => c.needsUpdate).length;
      const companiesRaising = companiesWithHealth.filter(c => c.isRaising).length;

      return {
        companies: companiesWithHealth,
        totalCompanies,
        companiesNeedingUpdate,
        companiesRaising
      };
    },
    staleTime: 60000, // 1 minute
  });
}
