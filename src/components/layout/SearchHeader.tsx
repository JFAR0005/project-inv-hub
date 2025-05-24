
import React from 'react';
import GlobalSearch from '@/components/search/GlobalSearch';
import { SearchProvider } from '@/context/SearchContext';

const SearchHeader: React.FC = () => {
  return (
    <SearchProvider>
      <div className="flex items-center gap-2">
        <GlobalSearch />
      </div>
    </SearchProvider>
  );
};

export default SearchHeader;
