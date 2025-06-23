
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface GlobalSearchInputProps {
  placeholder?: string;
  showFilters?: boolean;
  onSearch?: (query: string) => void;
}

const GlobalSearchInput: React.FC<GlobalSearchInputProps> = ({
  placeholder = "Search...",
  showFilters = false,
  onSearch
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>
      <Button onClick={handleSearch}>
        Search
      </Button>
    </div>
  );
};

export default GlobalSearchInput;
