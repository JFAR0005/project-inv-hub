
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  Users,
  DollarSign
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  sector: string;
  stage: string;
  arr: number;
  growth: number;
  headcount: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  burnMultiple?: number;
  healthScore?: number;
}

interface SmartSuggestionsProps {
  companies: Company[];
  onSuggestionClick: (suggestion: string) => void;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  type: 'insight' | 'opportunity' | 'warning' | 'metric';
  icon: React.ReactNode;
  action: string;
  companies?: Company[];
}

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  companies,
  onSuggestionClick
}) => {
  const suggestions: Suggestion[] = useMemo(() => {
    const suggestions: Suggestion[] = [];

    // High-growth companies
    const highGrowthCompanies = companies.filter(c => c.growth > 50);
    if (highGrowthCompanies.length > 0) {
      suggestions.push({
        id: 'high-growth',
        title: 'High Growth Performers',
        description: `${highGrowthCompanies.length} companies showing exceptional growth (>50%)`,
        type: 'opportunity',
        icon: <TrendingUp className="h-4 w-4 text-green-600" />,
        action: 'View high-growth companies',
        companies: highGrowthCompanies
      });
    }

    // At-risk companies
    const atRiskCompanies = companies.filter(c => c.riskLevel === 'High');
    if (atRiskCompanies.length > 0) {
      suggestions.push({
        id: 'at-risk',
        title: 'Companies Requiring Attention',
        description: `${atRiskCompanies.length} companies flagged as high risk`,
        type: 'warning',
        icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
        action: 'Review at-risk companies',
        companies: atRiskCompanies
      });
    }

    // Sector concentration
    const sectorCounts = companies.reduce((acc, company) => {
      acc[company.sector] = (acc[company.sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const dominantSector = Object.entries(sectorCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (dominantSector && dominantSector[1] > companies.length * 0.4) {
      suggestions.push({
        id: 'sector-concentration',
        title: 'Portfolio Concentration Risk',
        description: `${((dominantSector[1] / companies.length) * 100).toFixed(0)}% of portfolio in ${dominantSector[0]}`,
        type: 'warning',
        icon: <Target className="h-4 w-4 text-yellow-600" />,
        action: `View ${dominantSector[0]} companies`
      });
    }

    // Large ARR companies
    const largeARRCompanies = companies.filter(c => c.arr > 5000000);
    if (largeARRCompanies.length > 0) {
      suggestions.push({
        id: 'large-arr',
        title: 'Enterprise-Scale Companies',
        description: `${largeARRCompanies.length} companies with ARR > $5M`,
        type: 'insight',
        icon: <DollarSign className="h-4 w-4 text-blue-600" />,
        action: 'View enterprise companies',
        companies: largeARRCompanies
      });
    }

    // Rapid hiring companies
    const rapidHiringCompanies = companies.filter(c => c.headcount > 100);
    if (rapidHiringCompanies.length > 0) {
      suggestions.push({
        id: 'rapid-hiring',
        title: 'Scaling Teams',
        description: `${rapidHiringCompanies.length} companies with 100+ employees`,
        type: 'insight',
        icon: <Users className="h-4 w-4 text-purple-600" />,
        action: 'View scaling companies',
        companies: rapidHiringCompanies
      });
    }

    // Negative growth companies
    const negativeGrowthCompanies = companies.filter(c => c.growth < 0);
    if (negativeGrowthCompanies.length > 0) {
      suggestions.push({
        id: 'negative-growth',
        title: 'Declining Performance',
        description: `${negativeGrowthCompanies.length} companies with negative growth`,
        type: 'warning',
        icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
        action: 'Review declining companies',
        companies: negativeGrowthCompanies
      });
    }

    // Early stage with high growth
    const earlyHighGrowth = companies.filter(c => 
      (c.stage === 'Seed' || c.stage === 'Series A') && c.growth > 100
    );
    if (earlyHighGrowth.length > 0) {
      suggestions.push({
        id: 'early-high-growth',
        title: 'Breakout Early-Stage Companies',
        description: `${earlyHighGrowth.length} early-stage companies with 100%+ growth`,
        type: 'opportunity',
        icon: <TrendingUp className="h-4 w-4 text-green-600" />,
        action: 'View breakout companies',
        companies: earlyHighGrowth
      });
    }

    return suggestions.slice(0, 6); // Limit to 6 suggestions
  }, [companies]);

  const getVariantForType = (type: string) => {
    switch (type) {
      case 'opportunity': return 'default';
      case 'warning': return 'destructive';
      case 'insight': return 'secondary';
      default: return 'outline';
    }
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5" />
          Smart Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start space-x-3 flex-1">
              <div className="mt-0.5">
                {suggestion.icon}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{suggestion.title}</h4>
                  <Badge variant={getVariantForType(suggestion.type)} className="text-xs">
                    {suggestion.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {suggestion.description}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSuggestionClick(suggestion.action)}
              className="text-xs"
            >
              View
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SmartSuggestions;
