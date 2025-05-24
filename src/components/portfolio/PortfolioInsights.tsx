
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  Lightbulb,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Insight {
  id: string;
  type: 'warning' | 'opportunity' | 'success' | 'recommendation';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  companies?: string[];
}

interface PortfolioInsightsProps {
  insights: Insight[];
  onActionClick?: (insight: Insight) => void;
}

const PortfolioInsights: React.FC<PortfolioInsightsProps> = ({
  insights,
  onActionClick
}) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'opportunity':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Medium Priority</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Low Priority</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Portfolio Insights
        </CardTitle>
        <CardDescription>
          AI-powered recommendations and alerts for your portfolio
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="font-medium">All Good!</h3>
              <p className="text-sm">No critical insights at this time.</p>
            </div>
          ) : (
            insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 border-l-4 rounded-r-lg ${getPriorityColor(insight.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                        {getPriorityBadge(insight.priority)}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {insight.description}
                      </p>
                      {insight.companies && insight.companies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {insight.companies.slice(0, 3).map((company) => (
                            <Badge key={company} variant="outline" className="text-xs">
                              {company}
                            </Badge>
                          ))}
                          {insight.companies.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{insight.companies.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {insight.actionable && onActionClick && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onActionClick(insight)}
                      >
                        Take Action
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioInsights;
