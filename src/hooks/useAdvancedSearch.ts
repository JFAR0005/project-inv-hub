
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export interface SearchFilters {
  query: string;
  entityTypes: string[];
  sectors: string[];
  stages: string[];
  riskLevels: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  arrRange: {
    min: number | null;
    max: number | null;
  };
  growthRange: {
    min: number | null;
    max: number | null;
  };
}

export interface SearchResult {
  id: string;
  type: 'company' | 'note' | 'meeting';
  title: string;
  subtitle?: string;
  description?: string;
  relevanceScore: number;
  matchedFields: string[];
  metadata?: Record<string, any>;
}

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  entityTypes: ['company', 'note', 'meeting'],
  sectors: [],
  stages: [],
  riskLevels: [],
  dateRange: { start: null, end: null },
  arrRange: { min: null, max: null },
  growthRange: { min: null, max: null },
};

export const useAdvancedSearch = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch all searchable data
  const { data: searchData, isLoading } = useQuery({
    queryKey: ['search-data', user?.id],
    queryFn: async () => {
      const [companiesRes, notesRes, meetingsRes, updatesRes] = await Promise.all([
        supabase.from('companies').select('*'),
        supabase.from('notes').select('*'),
        supabase.from('meetings').select('*, companies(name)'),
        supabase.from('founder_updates').select('*')
      ]);

      return {
        companies: companiesRes.data || [],
        notes: notesRes.data || [],
        meetings: meetingsRes.data || [],
        updates: updatesRes.data || []
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Perform search with filters
  const searchResults = useMemo(() => {
    if (!searchData || (!filters.query && filters.entityTypes.length === 3)) {
      return [];
    }

    const results: SearchResult[] = [];
    const queryLower = filters.query.toLowerCase();

    // Search companies
    if (filters.entityTypes.includes('company')) {
      searchData.companies.forEach(company => {
        const matchedFields: string[] = [];
        let relevanceScore = 0;

        // Check text matches
        if (company.name.toLowerCase().includes(queryLower)) {
          matchedFields.push('name');
          relevanceScore += 10;
        }
        if (company.description?.toLowerCase().includes(queryLower)) {
          matchedFields.push('description');
          relevanceScore += 5;
        }
        if (company.sector?.toLowerCase().includes(queryLower)) {
          matchedFields.push('sector');
          relevanceScore += 3;
        }

        // Apply filters
        if (filters.sectors.length && !filters.sectors.includes(company.sector)) return;
        if (filters.stages.length && !filters.stages.includes(company.stage)) return;
        
        // ARR range filter
        if (filters.arrRange.min !== null && (company.arr || 0) < filters.arrRange.min) return;
        if (filters.arrRange.max !== null && (company.arr || 0) > filters.arrRange.max) return;

        if (matchedFields.length > 0 || !filters.query) {
          results.push({
            id: company.id,
            type: 'company',
            title: company.name,
            subtitle: `${company.sector} • ${company.stage}`,
            description: company.description,
            relevanceScore,
            matchedFields,
            metadata: {
              arr: company.arr,
              sector: company.sector,
              stage: company.stage,
              location: company.location
            }
          });
        }
      });
    }

    // Search notes
    if (filters.entityTypes.includes('note')) {
      searchData.notes.forEach(note => {
        const matchedFields: string[] = [];
        let relevanceScore = 0;

        if (note.title.toLowerCase().includes(queryLower)) {
          matchedFields.push('title');
          relevanceScore += 8;
        }
        if (note.content.toLowerCase().includes(queryLower)) {
          matchedFields.push('content');
          relevanceScore += 6;
        }

        // Date range filter
        if (filters.dateRange.start && new Date(note.created_at) < filters.dateRange.start) return;
        if (filters.dateRange.end && new Date(note.created_at) > filters.dateRange.end) return;

        if (matchedFields.length > 0 || !filters.query) {
          results.push({
            id: note.id,
            type: 'note',
            title: note.title,
            subtitle: `Note • ${new Date(note.created_at).toLocaleDateString()}`,
            description: note.content.substring(0, 150) + '...',
            relevanceScore,
            matchedFields,
            metadata: {
              created_at: note.created_at,
              visibility: note.visibility
            }
          });
        }
      });
    }

    // Search meetings
    if (filters.entityTypes.includes('meeting')) {
      searchData.meetings.forEach(meeting => {
        const matchedFields: string[] = [];
        let relevanceScore = 0;

        if (meeting.title.toLowerCase().includes(queryLower)) {
          matchedFields.push('title');
          relevanceScore += 8;
        }
        if (meeting.description?.toLowerCase().includes(queryLower)) {
          matchedFields.push('description');
          relevanceScore += 6;
        }

        // Date range filter
        if (filters.dateRange.start && new Date(meeting.start_time) < filters.dateRange.start) return;
        if (filters.dateRange.end && new Date(meeting.start_time) > filters.dateRange.end) return;

        if (matchedFields.length > 0 || !filters.query) {
          results.push({
            id: meeting.id,
            type: 'meeting',
            title: meeting.title,
            subtitle: `Meeting • ${new Date(meeting.start_time).toLocaleDateString()}`,
            description: meeting.description,
            relevanceScore,
            matchedFields,
            metadata: {
              start_time: meeting.start_time,
              location: meeting.location,
              company_name: meeting.companies?.name
            }
          });
        }
      });
    }

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [searchData, filters]);

  // Get search suggestions
  const getSuggestions = (query: string) => {
    if (!searchData || query.length < 2) return [];

    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();

    // Company suggestions
    searchData.companies.forEach(company => {
      if (company.name.toLowerCase().includes(queryLower)) {
        suggestions.add(company.name);
      }
      if (company.sector?.toLowerCase().includes(queryLower)) {
        suggestions.add(company.sector);
      }
    });

    // Note title suggestions
    searchData.notes.forEach(note => {
      if (note.title.toLowerCase().includes(queryLower)) {
        suggestions.add(note.title);
      }
    });

    return Array.from(suggestions).slice(0, 8);
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return {
    filters,
    updateFilters,
    resetFilters,
    searchResults,
    isLoading: isLoading || isSearching,
    getSuggestions,
    searchData
  };
};
