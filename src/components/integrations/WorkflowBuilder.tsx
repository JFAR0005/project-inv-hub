
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { ArrowRight, Plus, Workflow, LayoutTemplate, Calendar, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NodeType {
  id: string;
  name: string;
  type: 'trigger' | 'action';
  service: string;
  icon?: React.ReactNode;
  description: string;
}

interface WorkflowNode {
  id: string;
  type: NodeType;
  config: Record<string, any>;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  active: boolean;
  nodes: WorkflowNode[];
  createdAt: Date;
}

const nodeTypes: NodeType[] = [
  { 
    id: 'calendar_event', 
    name: 'Calendar Event', 
    type: 'trigger', 
    service: 'google_calendar',
    icon: <Calendar className="h-4 w-4" />,
    description: 'Triggers when a new calendar event is created' 
  },
  { 
    id: 'meeting_scheduled', 
    name: 'Meeting Scheduled', 
    type: 'trigger', 
    service: 'internal',
    icon: <Calendar className="h-4 w-4" />,
    description: 'Triggers when a new meeting is scheduled' 
  },
  { 
    id: 'send_slack_message', 
    name: 'Send Slack Message', 
    type: 'action', 
    service: 'slack',
    description: 'Sends a message to a Slack channel' 
  },
  { 
    id: 'create_calendar_event', 
    name: 'Create Calendar Event', 
    type: 'action', 
    service: 'google_calendar',
    icon: <Calendar className="h-4 w-4" />,
    description: 'Creates a new event on Google Calendar' 
  },
  { 
    id: 'ai_summary', 
    name: 'Generate AI Summary', 
    type: 'action', 
    service: 'openai',
    icon: <Sparkles className="h-4 w-4" />,
    description: 'Generates a summary of meeting notes using AI' 
  }
];

const WorkflowBuilder: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      id: 'wf1',
      name: 'Meeting Notification Workflow',
      description: 'Send Slack notification when meetings are scheduled',
      active: true,
      nodes: [
        {
          id: 'node1',
          type: nodeTypes.find(n => n.id === 'meeting_scheduled')!,
          config: {}
        },
        {
          id: 'node2',
          type: nodeTypes.find(n => n.id === 'send_slack_message')!,
          config: {
            channel: 'meetings',
            message_template: 'New meeting scheduled: {{title}} at {{start_time}}'
          }
        }
      ],
      createdAt: new Date(Date.now() - 86400000 * 5)
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
  });
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [currentNodeType, setCurrentNodeType] = useState<string>('');
  const [nodeConfig, setNodeConfig] = useState<Record<string, string>>({});

  const handleCreateWorkflow = () => {
    if (!newWorkflow.name) {
      toast("Workflow name required", {
        description: "Please provide a name for your workflow",
      });
      return;
    }

    const workflow: Workflow = {
      id: `wf_${Date.now()}`,
      name: newWorkflow.name,
      description: newWorkflow.description,
      active: false,
      nodes: [],
      createdAt: new Date()
    };

    setWorkflows([...workflows, workflow]);
    setNewWorkflow({ name: '', description: '' });
    setIsCreating(false);
    setSelectedWorkflow(workflow);

    toast("Workflow created", {
      description: `${workflow.name} has been created successfully`,
    });
  };

  const handleToggleWorkflow = (id: string) => {
    setWorkflows(
      workflows.map(workflow => 
        workflow.id === id 
          ? { ...workflow, active: !workflow.active } 
          : workflow
      )
    );

    const workflow = workflows.find(w => w.id === id);
    if (workflow) {
      toast(workflow.active ? "Workflow deactivated" : "Workflow activated", {
        description: `${workflow.name} has been ${workflow.active ? 'deactivated' : 'activated'}`
      });
    }
  };

  const handleSelectWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
  };

  const handleAddNode = () => {
    if (!selectedWorkflow) return;

    const nodeType = nodeTypes.find(n => n.id === currentNodeType);
    if (!nodeType) {
      toast("Select node type", {
        description: "Please select a valid node type",
      });
      return;
    }

    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: nodeType,
      config: nodeConfig
    };

    const updatedWorkflow = {
      ...selectedWorkflow,
      nodes: [...selectedWorkflow.nodes, newNode]
    };

    setWorkflows(
      workflows.map(wf => 
        wf.id === selectedWorkflow.id ? updatedWorkflow : wf
      )
    );

    setSelectedWorkflow(updatedWorkflow);
    setCurrentNodeType('');
    setNodeConfig({});

    toast("Node added", {
      description: `${nodeType.name} has been added to the workflow`,
    });
  };

  const handleConfigChange = (key: string, value: string) => {
    setNodeConfig({
      ...nodeConfig,
      [key]: value
    });
  };

  const renderNodeConfig = () => {
    const nodeType = nodeTypes.find(n => n.id === currentNodeType);
    if (!nodeType) return null;

    switch (nodeType.id) {
      case 'send_slack_message':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="channel">Channel</Label>
              <Input
                id="channel"
                value={nodeConfig.channel || ''}
                onChange={(e) => handleConfigChange('channel', e.target.value)}
                placeholder="e.g., #general"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="message_template">Message Template</Label>
              <Textarea
                id="message_template"
                value={nodeConfig.message_template || ''}
                onChange={(e) => handleConfigChange('message_template', e.target.value)}
                placeholder="Use {{variables}} for dynamic content"
                className="mt-1"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available variables: {{title}}, {{start_time}}, {{end_time}}, {{location}}
              </p>
            </div>
          </div>
        );
      
      case 'create_calendar_event':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="calendar_id">Calendar ID</Label>
              <Input
                id="calendar_id"
                value={nodeConfig.calendar_id || ''}
                onChange={(e) => handleConfigChange('calendar_id', e.target.value)}
                placeholder="primary or calendar ID"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="title_template">Event Title Template</Label>
              <Input
                id="title_template"
                value={nodeConfig.title_template || ''}
                onChange={(e) => handleConfigChange('title_template', e.target.value)}
                placeholder="{{company}} Meeting"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description_template">Description Template</Label>
              <Textarea
                id="description_template"
                value={nodeConfig.description_template || ''}
                onChange={(e) => handleConfigChange('description_template', e.target.value)}
                placeholder="Meeting with {{participants}}"
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
        );

      case 'ai_summary':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="input_field">Input Field</Label>
              <Input
                id="input_field"
                value={nodeConfig.input_field || ''}
                onChange={(e) => handleConfigChange('input_field', e.target.value)}
                placeholder="e.g., meeting_notes"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="output_field">Output Field</Label>
              <Input
                id="output_field"
                value={nodeConfig.output_field || ''}
                onChange={(e) => handleConfigChange('output_field', e.target.value)}
                placeholder="e.g., meeting_summary"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="prompt">AI Prompt</Label>
              <Textarea
                id="prompt"
                value={nodeConfig.prompt || ''}
                onChange={(e) => handleConfigChange('prompt', e.target.value)}
                placeholder="Summarize the following meeting notes in 3 bullet points: {{input}}"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        );
      
      // For triggers, generally we just need to know when to run
      case 'meeting_scheduled':
      case 'calendar_event':
        return (
          <div className="p-4 bg-muted rounded-md">
            <p className="text-sm">
              This trigger doesn't require any additional configuration.
              It will run automatically when the event occurs.
            </p>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-muted rounded-md">
            <p className="text-sm">Select a node type to configure it.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Workflow Automation</h2>
        <Button 
          onClick={() => {
            setIsCreating(true);
            setSelectedWorkflow(null);
          }}
          disabled={isCreating}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Workflow</CardTitle>
            <CardDescription>Define a new automated workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input
                  id="workflow-name"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({...newWorkflow, name: e.target.value})}
                  placeholder="E.g., Meeting Notifications"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="workflow-description">Description (optional)</Label>
                <Textarea
                  id="workflow-description"
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow({...newWorkflow, description: e.target.value})}
                  placeholder="Describe what this workflow does"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreating(false);
                setNewWorkflow({ name: '', description: '' });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateWorkflow}>
              Create Workflow
            </Button>
          </CardFooter>
        </Card>
      )}

      {!isCreating && selectedWorkflow && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Workflows</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedWorkflow(null)}
                  >
                    Back
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                  <div className="p-4 space-y-2">
                    {workflows.map(workflow => (
                      <div 
                        key={workflow.id}
                        className={`p-2 border rounded-md cursor-pointer transition-colors ${
                          selectedWorkflow?.id === workflow.id ? 'bg-muted border-primary' : ''
                        }`}
                        onClick={() => handleSelectWorkflow(workflow)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{workflow.name}</h4>
                            <p className="text-xs text-muted-foreground">{workflow.nodes.length} nodes</p>
                          </div>
                          <Badge variant={workflow.active ? "default" : "outline"}>
                            {workflow.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{selectedWorkflow.name}</span>
                  <Button 
                    size="sm" 
                    variant={selectedWorkflow.active ? "default" : "outline"}
                    onClick={() => handleToggleWorkflow(selectedWorkflow.id)}
                  >
                    {selectedWorkflow.active ? "Deactivate" : "Activate"}
                  </Button>
                </CardTitle>
                <CardDescription>{selectedWorkflow.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {selectedWorkflow.nodes.length > 0 ? (
                    <div className="space-y-2">
                      {selectedWorkflow.nodes.map((node, index) => (
                        <div key={node.id} className="flex items-center">
                          <Card className="w-full p-3 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-lg ${
                                node.type.type === 'trigger' ? 'bg-primary/10' : 'bg-secondary/10'
                              }`}>
                                {node.type.icon || (
                                  node.type.type === 'trigger' ? 
                                    <LayoutTemplate className="h-4 w-4" /> : 
                                    <Workflow className="h-4 w-4" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{node.type.name}</p>
                                <p className="text-xs text-muted-foreground">{node.type.description}</p>
                              </div>
                            </div>
                            
                            <Badge variant="outline">
                              {node.type.service}
                            </Badge>
                          </Card>
                          
                          {index < selectedWorkflow.nodes.length - 1 && (
                            <div className="mx-auto my-1 p-2">
                              <ArrowRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 border border-dashed rounded-lg">
                      <p className="text-muted-foreground">
                        No nodes in this workflow yet. Add a trigger or action below.
                      </p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Add Node</h4>
                    <div className="space-y-4">
                      <Select
                        value={currentNodeType}
                        onValueChange={setCurrentNodeType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select node type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="" disabled>Select a node type</SelectItem>
                          {selectedWorkflow.nodes.length === 0 ? (
                            nodeTypes
                              .filter(node => node.type === 'trigger')
                              .map(node => (
                                <SelectItem key={node.id} value={node.id}>
                                  {node.name} ({node.service})
                                </SelectItem>
                              ))
                          ) : (
                            nodeTypes
                              .filter(node => node.type === 'action')
                              .map(node => (
                                <SelectItem key={node.id} value={node.id}>
                                  {node.name} ({node.service})
                                </SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>

                      {currentNodeType && (
                        <div className="border rounded-md p-4">
                          {renderNodeConfig()}
                        </div>
                      )}

                      {currentNodeType && (
                        <div className="flex justify-end">
                          <Button onClick={handleAddNode}>
                            Add to Workflow
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!isCreating && !selectedWorkflow && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflows.map(workflow => (
            <Card key={workflow.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleSelectWorkflow(workflow)}>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Workflow className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  </div>
                  <Badge variant={workflow.active ? "default" : "outline"}>
                    {workflow.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription className="mt-1">{workflow.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  <span className="font-medium">{workflow.nodes.length}</span> nodes configured
                </p>
                <p className="text-xs text-muted-foreground">
                  Created on {workflow.createdAt.toLocaleDateString()}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {workflow.nodes.slice(0, 3).map(node => (
                    <Badge key={node.id} variant="outline" className="text-xs">
                      {node.type.name}
                    </Badge>
                  ))}
                  {workflow.nodes.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{workflow.nodes.length - 3} more
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" onClick={(e) => {
                  e.stopPropagation();
                  handleToggleWorkflow(workflow.id);
                }}>
                  {workflow.active ? "Deactivate" : "Activate"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Integration Documentation</CardTitle>
          <CardDescription>
            How to integrate with external APIs and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm">
              Our integration system allows you to connect with various external services using different authentication methods:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">API Key Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  The simplest form of authentication. Requires an API key that is sent with each request.
                  Common for services like SendGrid, OpenAI, etc.
                </p>
              </div>
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">OAuth 2.0</h3>
                <p className="text-sm text-muted-foreground">
                  More secure authentication flow for services like Google, Microsoft, etc.
                  Requires client ID, client secret, and authorization flow.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-medium mb-2">Available Service Connectors:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm pl-4">
                <li>Google Calendar (OAuth 2.0)</li>
                <li>Slack (OAuth 2.0)</li>
                <li>Microsoft Teams (OAuth 2.0)</li>
                <li>Zapier Webhooks (API Key)</li>
                <li>OpenAI (API Key)</li>
                <li>Salesforce (OAuth 2.0)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowBuilder;
