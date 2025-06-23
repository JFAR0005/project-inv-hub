
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SearchFilters {
  types: string[];
  sectors: string[];
  stages: string[];
}

interface SearchResult {
  id: string;
  title: string;
  type: 'company' | 'note' | 'meeting' | 'deal';
  content?: string;
  description?: string;
}

export function useGlobalSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    types: [],
    sectors: [],
    stages: []
  });

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['global-search', searchQuery, filters],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!searchQuery.trim()) return [];

      const results: SearchResult[] = [];

      // Search companies
      if (filters.types.length === 0 || filters.types.includes('company')) {
        const { data: companies } = await supabase
          .from('companies')
          .select('id, name, description')
          .ilike('name', `%${searchQuery}%`)
          .limit(10);

        if (companies) {
          results.push(...companies.map(company => ({
            id: company.id,
            title: company.name,
            type: 'company' as const,
            description: company.description
          })));
        }
      }

      // Search notes
      if (filters.types.length === 0 || filters.types.includes('note')) {
        const { data: notes } = await supabase
          .from('notes')
          .select('id, title, content')
          .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
          .limit(10);

        if (notes) {
          results.push(...notes.map(note => ({
            id: note.id,
            title: note.title,
            type: 'note' as const,
            content: note.content
          })));
        }
      }

      // Search meetings
      if (filters.types.length === 0 || filters.types.includes('meeting')) {
        const { data: meetings } = await supabase
          .from('meetings')
          .select('id, title, description')
          .ilike('title', `%${searchQuery}%`)
          .limit(10);

        if (meetings) {
          results.push(...meetings.map(meeting => ({
            id: meeting.id,
            title: meeting.title,
            type: 'meeting' as const,
            description: meeting.description
          })));
        }
      }

      return results;
    },
    enabled: searchQuery.length >= 2,
    staleTime: 30000,
  });

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setFilters({ types: [], sectors: [], stages: [] });
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilters,
    searchResults,
    isLoading,
    clearSearch
  };
}
