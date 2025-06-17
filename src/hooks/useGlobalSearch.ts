
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { SearchResult, SearchFilters, SearchOptions } from '@/types/search';
import { useAuth } from '@/context/AuthContext';

interface CompanyData {
  id: string;
  name: string;
  sector?: string;
  location?: string;
  description?: string;
}

interface NoteData {
  id: string;
  title: string;
  content?: string;
  created_at: string;
  author_id: string;
  companies?: { id: string; name: string } | null;
}

interface MeetingData {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  companies?: { id: string; name: string } | null;
}

interface DealData {
  id: string;
  stage?: string;
  status?: string;
  valuation_expectation?: number;
  companies?: { id: string; name: string; sector?: string } | null;
}

export const useGlobalSearch = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    types: ['company', 'note', 'meeting', 'deal'],
  });

  const searchOptions: SearchOptions = useMemo(() => ({
    query: searchQuery,
    filters,
    limit: 50,
  }), [searchQuery, filters]);

  const { data: searchResults = [], isLoading, error } = useQuery({
    queryKey: ['global-search', searchOptions],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];

      const results: SearchResult[] = [];
      const query = searchQuery.toLowerCase();

      // Search companies
      if (filters.types.includes('company')) {
        const { data: companies } = await supabase
          .from('companies')
          .select('id, name, sector, location, description')
          .or(`name.ilike.%${query}%,sector.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(20);

        if (companies) {
          results.push(...companies.map((company: CompanyData) => ({
            id: company.id,
            type: 'company' as const,
            title: company.name,
            subtitle: company.sector || '',
            description: company.description || '',
            metadata: { location: company.location, sector: company.sector },
            url: `/company/${company.id}`,
            relevanceScore: calculateRelevance(query, company.name),
          })));
        }
      }

      // Search notes
      if (filters.types.includes('note')) {
        const { data: notes } = await supabase
          .from('notes')
          .select(`
            id, title, content, created_at, author_id,
            companies!inner(id, name)
          `)
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .limit(20);

        if (notes) {
          results.push(...notes.map((note: NoteData) => ({
            id: note.id,
            type: 'note' as const,
            title: note.title,
            subtitle: note.companies?.name || 'Unknown Company',
            description: note.content?.substring(0, 150) + '...' || '',
            metadata: { 
              created_at: note.created_at,
              company: note.companies?.name,
              author_id: note.author_id 
            },
            url: `/notes?noteId=${note.id}`,
            relevanceScore: calculateRelevance(query, note.title),
          })));
        }
      }

      // Search meetings
      if (filters.types.includes('meeting')) {
        const { data: meetings } = await supabase
          .from('meetings')
          .select(`
            id, title, description, start_time, end_time,
            companies!inner(id, name)
          `)
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(20);

        if (meetings) {
          results.push(...meetings.map((meeting: MeetingData) => ({
            id: meeting.id,
            type: 'meeting' as const,
            title: meeting.title,
            subtitle: meeting.companies?.name || 'Unknown Company',
            description: meeting.description || '',
            metadata: { 
              start_time: meeting.start_time,
              end_time: meeting.end_time,
              company: meeting.companies?.name 
            },
            url: `/meetings?meetingId=${meeting.id}`,
            relevanceScore: calculateRelevance(query, meeting.title),
          })));
        }
      }

      // Search deals
      if (filters.types.includes('deal') && ['admin', 'partner'].includes(user?.role || '')) {
        const { data: deals } = await supabase
          .from('deals')
          .select(`
            id, stage, status, valuation_expectation,
            companies!inner(id, name, sector)
          `)
          .limit(20);

        if (deals) {
          const filteredDeals = deals.filter((deal: DealData) => 
            deal.companies?.name?.toLowerCase().includes(query) ||
            deal.companies?.sector?.toLowerCase().includes(query) ||
            deal.stage?.toLowerCase().includes(query)
          );

          results.push(...filteredDeals.map((deal: DealData) => ({
            id: deal.id,
            type: 'deal' as const,
            title: deal.companies?.name || 'Unknown Company',
            subtitle: `${deal.stage} - ${deal.status}`,
            description: deal.companies?.sector || '',
            metadata: { 
              stage: deal.stage,
              status: deal.status,
              valuation: deal.valuation_expectation,
              sector: deal.companies?.sector 
            },
            url: `/dealflow?dealId=${deal.id}`,
            relevanceScore: calculateRelevance(query, deal.companies?.name || ''),
          })));
        }
      }

      // Sort by relevance score
      return results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    },
    enabled: searchQuery.length > 2,
  });

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setFilters({ types: ['company', 'note', 'meeting', 'deal'] });
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilters,
    searchResults,
    isLoading,
    error,
    clearSearch,
  };
};

// Helper function to calculate relevance score
function calculateRelevance(query: string, text: string): number {
  if (!text) return 0;
  
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();
  
  // Exact match gets highest score
  if (lowerText === lowerQuery) return 100;
  
  // Starts with query gets high score
  if (lowerText.startsWith(lowerQuery)) return 80;
  
  // Contains query gets medium score
  if (lowerText.includes(lowerQuery)) return 60;
  
  // Word match gets lower score
  const queryWords = lowerQuery.split(' ');
  const textWords = lowerText.split(' ');
  const matchedWords = queryWords.filter(word => 
    textWords.some(textWord => textWord.includes(word))
  );
  
  return (matchedWords.length / queryWords.length) * 40;
}
