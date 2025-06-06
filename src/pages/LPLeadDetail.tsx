
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import LPLeadDetailView from '@/components/fundraising/LPLeadDetailView';

const LPLeadDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: lpLead, isLoading, refetch } = useQuery({
    queryKey: ['lp-lead', id],
    queryFn: async () => {
      if (!id) throw new Error('No LP lead ID provided');
      
      const { data, error } = await supabase
        .from('lp_leads')
        .select(`
          *,
          relationship_owner:users(name, email),
          documents:lp_documents(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading LP lead details...</div>
      </div>
    );
  }

  if (!lpLead) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">LP lead not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <LPLeadDetailView lpLead={lpLead} onRefetch={refetch} />
    </div>
  );
};

export default LPLeadDetail;
