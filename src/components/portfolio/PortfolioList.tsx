
import React, { useState } from "react";
import { Company, PortfolioCard } from "./PortfolioCard";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Sample data
const MOCK_COMPANIES: Company[] = [
  {
    id: "101",
    name: "TechStartup Inc",
    logo: "",
    sector: "SaaS",
    stage: "Series A",
    metrics: {
      mrr: 125000,
      arr: 1500000,
      growth: 15,
      runway: 14,
    },
    lastUpdate: "2 days ago",
  },
  {
    id: "102",
    name: "CloudScale AI",
    logo: "",
    sector: "AI/ML",
    stage: "Seed",
    metrics: {
      mrr: 45000,
      arr: 540000,
      growth: 28,
      runway: 8,
    },
    lastUpdate: "1 week ago",
  },
  {
    id: "103",
    name: "DevSecOps Platform",
    logo: "",
    sector: "DevTools",
    stage: "Series B",
    metrics: {
      mrr: 320000,
      arr: 3840000,
      growth: 12,
      runway: 18,
    },
    lastUpdate: "3 days ago",
  },
  {
    id: "104",
    name: "DataMetrics",
    logo: "",
    sector: "Analytics",
    stage: "Seed",
    metrics: {
      mrr: 35000,
      arr: 420000,
      growth: 22,
      runway: 5,
    },
    lastUpdate: "5 days ago",
  },
  {
    id: "105",
    name: "SupplyChainConnect",
    logo: "",
    sector: "Logistics",
    stage: "Series A",
    metrics: {
      mrr: 85000,
      arr: 1020000,
      growth: 9,
      runway: 11,
    },
    lastUpdate: "Yesterday",
  },
  {
    id: "106",
    name: "HealthTech Innovations",
    logo: "",
    sector: "HealthTech",
    stage: "Pre-seed",
    metrics: {
      mrr: 18000,
      arr: 216000,
      growth: 32,
      runway: 7,
    },
    lastUpdate: "4 days ago",
  },
];

const PortfolioList: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);

  // Get unique sectors and stages for filters
  const sectors = Array.from(new Set(MOCK_COMPANIES.map((c) => c.sector)));
  const stages = Array.from(new Set(MOCK_COMPANIES.map((c) => c.stage)));

  // Filter companies based on search term and selected filters
  const filteredCompanies = MOCK_COMPANIES.filter((company) => {
    // For founders, only show their company
    if (user?.role === "founder") {
      return user.companyId === company.id;
    }

    // Filter by search term
    const matchesSearch =
      searchTerm === "" ||
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.sector.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by selected sectors
    const matchesSector =
      selectedSectors.length === 0 || selectedSectors.includes(company.sector);

    // Filter by selected stages
    const matchesStage =
      selectedStages.length === 0 || selectedStages.includes(company.stage);

    return matchesSearch && matchesSector && matchesStage;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search companies..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Sector
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {sectors.map((sector) => (
                <DropdownMenuCheckboxItem
                  key={sector}
                  checked={selectedSectors.includes(sector)}
                  onCheckedChange={(checked) => {
                    setSelectedSectors(
                      checked
                        ? [...selectedSectors, sector]
                        : selectedSectors.filter((s) => s !== sector)
                    );
                  }}
                >
                  {sector}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Stage
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {stages.map((stage) => (
                <DropdownMenuCheckboxItem
                  key={stage}
                  checked={selectedStages.includes(stage)}
                  onCheckedChange={(checked) => {
                    setSelectedStages(
                      checked
                        ? [...selectedStages, stage]
                        : selectedStages.filter((s) => s !== stage)
                    );
                  }}
                >
                  {stage}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user?.role === "admin" && (
            <Button size="sm">
              + Add Company
            </Button>
          )}
        </div>
      </div>

      {filteredCompanies.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No companies match your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => (
            <PortfolioCard key={company.id} company={company} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PortfolioList;
