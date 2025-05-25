
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, BarChart3, Activity, Users, Building } from 'lucide-react';
import CompanyOverview from './CompanyOverview';
import CompanyMetrics from './CompanyMetrics';
import CompanyDocuments from './CompanyDocuments';
import CompanyUpdates from './CompanyUpdates';
import { Database } from '@/integrations/supabase/types';

type Company = Database['public']['Tables']['companies']['Row'];

interface CompanyProfileTabsProps {
  company: Company;
  companyId: string;
}

const CompanyProfileTabs: React.FC<CompanyProfileTabsProps> = ({ company, companyId }) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="metrics" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Metrics
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Documents
        </TabsTrigger>
        <TabsTrigger value="updates" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Updates
        </TabsTrigger>
        <TabsTrigger value="team" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Team
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <CompanyOverview company={company} />
      </TabsContent>

      <TabsContent value="metrics" className="mt-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Key Metrics</h2>
            <p className="text-muted-foreground">Financial and operational performance indicators</p>
          </div>
          <CompanyMetrics companyId={companyId} />
        </div>
      </TabsContent>

      <TabsContent value="documents" className="mt-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Documents</h2>
            <p className="text-muted-foreground">Files and resources related to {company.name}</p>
          </div>
          <CompanyDocuments companyId={companyId} />
        </div>
      </TabsContent>

      <TabsContent value="updates" className="mt-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Founder Updates</h2>
            <p className="text-muted-foreground">Regular updates from the company founders</p>
          </div>
          <CompanyUpdates companyId={companyId} />
        </div>
      </TabsContent>

      <TabsContent value="team" className="mt-6">
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Team Management</h3>
          <p>Team member management will be available soon</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default CompanyProfileTabs;
