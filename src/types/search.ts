
export interface SearchResult {
  id: string;
  type: 'company' | 'note' | 'meeting' | 'deal';
  title: string;
  description?: string;
  subtitle?: string;
  metadata?: Record<string, any>;
  url: string;
  relevanceScore?: number;
}

export interface SearchFilters {
  types: Array<'company' | 'note' | 'meeting' | 'deal'>;
  dateRange?: {
    from: Date;
    to: Date;
  };
  sectors?: string[];
  stages?: string[];
  statuses?: string[];
  tags?: string[];
  authors?: string[];
  companies?: string[];
}

export interface SearchOptions {
  query: string;
  filters: SearchFilters;
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'date' | 'alphabetical';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'suggestion' | 'filter';
  category?: string;
}
