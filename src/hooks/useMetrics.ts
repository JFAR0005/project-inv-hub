
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Metric {
  id: string;
  company_id: string;
  metric_name: string;
  value: number;
  date: string;
}

export const useMetrics = (companyId?: string) => {
  return useQuery({
    queryKey: ['metrics', companyId],
    queryFn: async () => {
      let query = supabase
        .from('metrics')
        .select('*')
        .order('date', { ascending: true });
      
      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Metric[];
    },
    enabled: true,
  });
};

export const useCompanyMetrics = (companyId: string, metricName?: string) => {
  return useQuery({
    queryKey: ['company-metrics', companyId, metricName],
    queryFn: async () => {
      let query = supabase
        .from('metrics')
        .select('*')
        .eq('company_id', companyId)
        .order('date', { ascending: true });
      
      if (metricName) {
        query = query.eq('metric_name', metricName);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Metric[];
    },
    enabled: !!companyId,
  });
};
