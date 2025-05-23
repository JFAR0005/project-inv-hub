
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import RoleGuard from '@/components/layout/RoleGuard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import IntegrationsPanel from '@/components/integrations/IntegrationsPanel';
import WorkflowBuilder from '@/components/integrations/WorkflowBuilder';
import { Settings, Workflow, Zap, Bot } from 'lucide-react';

export default function Integrations() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('connections');

  return (
    <RoleGuard allowedRoles={['admin', 'partner']}>
      <Layout>
        <div className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Integration Center</h1>
              <p className="text-muted-foreground mt-1">
                Connect external services and automate workflows
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="connections" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Connections
              </TabsTrigger>
              <TabsTrigger value="workflows" className="flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                Workflows
              </TabsTrigger>
              <TabsTrigger value="automations" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Automations
              </TabsTrigger>
              <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Assistant
              </TabsTrigger>
            </TabsList>

            <TabsContent value="connections" className="space-y-6">
              <IntegrationsPanel />
            </TabsContent>

            <TabsContent value="workflows" className="space-y-6">
              <WorkflowBuilder />
            </TabsContent>

            <TabsContent value="automations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Automation Templates</CardTitle>
                  <CardDescription>
                    Pre-built automation templates for common portfolio management tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Meeting Follow-up</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Automatically send follow-up emails and create tasks after meetings
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Popular</span>
                        <button className="text-sm text-primary hover:underline">Use Template</button>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Update Reminders</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Send reminders to founders for monthly updates
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Essential</span>
                        <button className="text-sm text-primary hover:underline">Use Template</button>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Investment Alerts</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Get notified when companies hit key milestones
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">New</span>
                        <button className="text-sm text-primary hover:underline">Use Template</button>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Slack Notifications</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Send portfolio updates to team Slack channels
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Team</span>
                        <button className="text-sm text-primary hover:underline">Use Template</button>
                      </div>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-assistant" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Portfolio Assistant</CardTitle>
                  <CardDescription>
                    Configure AI-powered insights and automated analysis for your portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className="p-4">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          Update Analysis
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          AI analyzes founder updates and highlights key insights
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                          <button className="text-sm text-primary hover:underline">Configure</button>
                        </div>
                      </Card>
                      
                      <Card className="p-4">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          Risk Assessment
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Automated risk scoring based on metrics and updates
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Inactive</span>
                          <button className="text-sm text-primary hover:underline">Setup</button>
                        </div>
                      </Card>
                      
                      <Card className="p-4">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          Meeting Summaries
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Generate AI summaries from meeting transcripts
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Beta</span>
                          <button className="text-sm text-primary hover:underline">Enable</button>
                        </div>
                      </Card>
                      
                      <Card className="p-4">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          Trend Analysis
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Identify patterns and trends across portfolio companies
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Coming Soon</span>
                          <button className="text-sm text-muted-foreground" disabled>Notify Me</button>
                        </div>
                      </Card>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">AI Configuration</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        These features require AI service integration. Connect your preferred AI provider to enable advanced portfolio analytics.
                      </p>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
                          Connect OpenAI
                        </button>
                        <button className="px-4 py-2 border rounded-md text-sm hover:bg-muted">
                          Connect Anthropic
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </RoleGuard>
  );
}
