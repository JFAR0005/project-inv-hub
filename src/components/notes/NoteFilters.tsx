
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Company {
  id: string;
  name: string;
}

interface NoteFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  search: string;
  visibility: string;
  companyId: string;
  dateRange: string;
}

export function NoteFilters({ onFilterChange }: NoteFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [companyId, setCompanyId] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from("companies")
          .select("id, name")
          .order("name");
        
        if (error) throw error;
        setCompanies(data || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    // Apply filters whenever they change
    onFilterChange({
      search: searchTerm,
      visibility,
      companyId,
      dateRange,
    });
  }, [searchTerm, visibility, companyId, dateRange, onFilterChange]);

  const resetFilters = () => {
    setSearchTerm("");
    setVisibility("all");
    setCompanyId("");
    setDateRange("all");
  };

  const toggleFilters = () => {
    setIsFiltersVisible(!isFiltersVisible);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-7 w-7 p-0"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        
        <Button
          variant={isFiltersVisible ? "default" : "outline"}
          onClick={toggleFilters}
          className="sm:w-auto"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {(visibility !== "all" || companyId !== "" || dateRange !== "all") && (
            <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary-foreground text-primary text-xs">
              {[
                visibility !== "all" ? 1 : 0,
                companyId !== "" ? 1 : 0,
                dateRange !== "all" ? 1 : 0,
              ].reduce((a, b) => a + b, 0)}
            </span>
          )}
        </Button>
      </div>

      {isFiltersVisible && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border rounded-lg bg-background">
          <div>
            <label className="text-sm font-medium mb-1 block">Visibility</label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger>
                <SelectValue placeholder="All visibility levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="internal">Internal Only</SelectItem>
                <SelectItem value="partner">Partner Level</SelectItem>
                <SelectItem value="founder">Founder Level</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Company</label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="All companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Date Range</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="All time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
                <SelectItem value="quarter">This quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <Button variant="ghost" onClick={resetFilters} className="text-sm">
              Reset filters
            </Button>
          </div>
        </div>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Notes</TabsTrigger>
          <TabsTrigger value="my">My Notes</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="important">Important</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

export default NoteFilters;
