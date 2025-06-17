import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  Briefcase, 
  FileText, 
  CalendarDays, 
  Users,
  BarChart3
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { useSearch } from '@/context/SearchContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface SearchResult {
  id: string;
  name: string;
  type: 'company' | 'note' | 'meeting' | 'document';
  subtitle?: string;
  url: string;
}

interface CompanyResult {
  id: string;
  name: string;
  sector?: string;
}

interface NoteResult {
  id: string;
  title: string;
  company_id?: string;
  companies: CompanyResult[] | null;
}

interface MeetingResult {
  id: string;
  title: string;
  company_id?: string;
  companies: CompanyResult[] | null;
}

const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { globalQuery, setGlobalQuery, recentSearches, addRecentSearch } = useSearch();
  
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['global-search', globalQuery],
    queryFn: async () => {
      if (!globalQuery || globalQuery.length < 2) return [] as SearchResult[];
      
      // Search companies
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name, sector')
        .ilike('name', `%${globalQuery}%`)
        .limit(5);
      
      // Search notes
      const { data: notes } = await supabase
        .from('notes')
        .select('id, title, company_id, companies(id, name)')
        .ilike('title', `%${globalQuery}%`)
        .limit(5);
      
      // Search meetings
      const { data: meetings } = await supabase
        .from('meetings')
        .select('id, title, company_id, companies(id, name)')
        .ilike('title', `%${globalQuery}%`)
        .limit(5);
      
      // Combine results with proper type handling
      const results: SearchResult[] = [
        ...(companies || []).map((c: CompanyResult) => ({
          id: c.id,
          name: c.name,
          type: 'company' as const,
          subtitle: c.sector || 'Company',
          url: `/companies/${c.id}`
        })),
        
        ...(notes || []).map((n: NoteResult) => {
          const companyName = n.companies && n.companies.length > 0 ? n.companies[0].name : null;
          return {
            id: n.id,
            name: n.title,
            type: 'note' as const,
            subtitle: companyName ? `Note - ${companyName}` : 'Note',
            url: `/notes/${n.id}`
          };
        }),
        
        ...(meetings || []).map((m: MeetingResult) => {
          const companyName = m.companies && m.companies.length > 0 ? m.companies[0].name : null;
          return {
            id: m.id,
            name: m.title,
            type: 'meeting' as const,
            subtitle: companyName ? `Meeting - ${companyName}` : 'Meeting',
            url: `/meetings/${m.id}`
          };
        })
      ];
      
      return results;
    },
    enabled: open && globalQuery.length >= 2
  });
  
  const handleSelect = (item: SearchResult) => {
    setOpen(false);
    addRecentSearch(item.name);
    navigate(item.url);
  };
  
  const renderIcon = (type: string) => {
    switch (type) {
      case 'company':
        return <Briefcase className="mr-2 h-4 w-4" />;
      case 'note':
        return <FileText className="mr-2 h-4 w-4" />;
      case 'meeting':
        return <CalendarDays className="mr-2 h-4 w-4" />;
      case 'document':
        return <FileText className="mr-2 h-4 w-4" />;
      default:
        return <Search className="mr-2 h-4 w-4" />;
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-10 w-full justify-start rounded-[0.5rem] bg-background text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search...</span>
        <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          ref={inputRef}
          placeholder="Search companies, notes, meetings..."
          value={globalQuery}
          onValueChange={setGlobalQuery}
        />
        <CommandList>
          <CommandEmpty>
            {globalQuery.length > 0 ? 'No results found.' : 'Start typing to search...'}
          </CommandEmpty>
          
          {recentSearches.length > 0 && globalQuery.length === 0 && (
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((search) => (
                <CommandItem 
                  key={search}
                  onSelect={() => {
                    setGlobalQuery(search);
                    inputRef.current?.focus();
                  }}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {search}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {globalQuery.length > 0 && (
            <>
              {searchResults.filter(item => item.type === 'company').length > 0 && (
                <CommandGroup heading="Companies">
                  {searchResults
                    .filter(item => item.type === 'company')
                    .map((item) => (
                      <CommandItem key={`${item.type}-${item.id}`} onSelect={() => handleSelect(item)}>
                        {renderIcon(item.type)}
                        <span>{item.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{item.subtitle}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
              
              {searchResults.filter(item => item.type === 'note').length > 0 && (
                <CommandGroup heading="Notes">
                  {searchResults
                    .filter(item => item.type === 'note')
                    .map((item) => (
                      <CommandItem key={`${item.type}-${item.id}`} onSelect={() => handleSelect(item)}>
                        {renderIcon(item.type)}
                        <span>{item.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{item.subtitle}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
              
              {searchResults.filter(item => item.type === 'meeting').length > 0 && (
                <CommandGroup heading="Meetings">
                  {searchResults
                    .filter(item => item.type === 'meeting')
                    .map((item) => (
                      <CommandItem key={`${item.type}-${item.id}`} onSelect={() => handleSelect(item)}>
                        {renderIcon(item.type)}
                        <span>{item.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{item.subtitle}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
            </>
          )}
          
          <CommandSeparator />
          
          <CommandGroup heading="Jump to">
            <CommandItem onSelect={() => { navigate('/portfolio'); setOpen(false); }}>
              <Briefcase className="mr-2 h-4 w-4" />
              <span>Portfolio</span>
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/meetings'); setOpen(false); }}>
              <CalendarDays className="mr-2 h-4 w-4" />
              <span>Meetings</span>
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/notes'); setOpen(false); }}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Notes</span>
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/analytics'); setOpen(false); }}>
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Analytics</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;
