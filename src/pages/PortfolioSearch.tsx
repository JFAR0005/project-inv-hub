
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Loader2 } from 'lucide-react';

const PortfolioSearch = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');

  const { data: companies, isLoading, error } = useQuery({
    queryKey: ['portfolio-search', searchTerm, selectedSector],
    queryFn: async () => {
      let query = supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,sector.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }

      if (selectedSector !== 'all') {
        query = query.eq('sector', selectedSector);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: sectors } = useQuery({
    queryKey: ['sectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('sector')
        .not('sector', 'is', null);
      
      if (error) throw error;
      
      const uniqueSectors = [...new Set(data.map(c => c.sector))].filter(Boolean);
      return uniqueSectors;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Portfolio Search</h1>
        <p className="text-muted-foreground mt-2">
          Search and filter your portfolio companies
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search companies, sectors, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Advanced
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedSector === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSector('all')}
            >
              All Sectors
            </Button>
            {sectors?.map((sector) => (
              <Button
                key={sector}
                variant={selectedSector === sector ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSector(sector)}
              >
                {sector}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {companies?.map((company) => (
          <Card key={company.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{company.name}</h3>
                    <Badge variant="secondary">{company.sector}</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {company.location} • Stage: {company.stage || 'Not specified'}
                  </p>
                  {company.description && (
                    <p className="text-sm mt-2 line-clamp-2">{company.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {companies?.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No companies found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PortfolioSearch;
