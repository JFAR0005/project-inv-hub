
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from '@/integrations/supabase/types';

type Company = Database['public']['Tables']['companies']['Row'];

interface CompanyProfileTabsProps {
  company: Company;
  companyId: string;
}

const CompanyProfileTabs: React.FC<CompanyProfileTabsProps> = ({ company, companyId }) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="metrics">Metrics</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="meetings">Meetings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Company Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Financial Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>ARR:</span>
                    <span>${company.arr?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MRR:</span>
                    <span>${company.mrr?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Burn Rate:</span>
                    <span>${company.burn_rate?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Runway:</span>
                    <span>{company.runway || 'N/A'} months</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Team</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Headcount:</span>
                    <span>{company.headcount || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Churn Rate:</span>
                    <span>{company.churn_rate ? `${company.churn_rate}%` : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="metrics">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Metrics dashboard coming soon...</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="notes">
        <Card>
          <CardHeader>
            <CardTitle>Company Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Notes section coming soon...</p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="meetings">
        <Card>
          <CardHeader>
            <CardTitle>Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Meetings section coming soon...</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default CompanyProfileTabs;
