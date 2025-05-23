import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Code, Plus, Trash2, RefreshCw, CheckCircle2, XCircle, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Webhook } from '@/types/integrations';

const WebhookManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [webhookForm, setWebhookForm] = useState<Partial<Webhook>>({
    name: '',
    url: '',
    description: '',
    events: ['comment.created'],
    headers: {},
    is_active: true,
  });

  // Mock webhooks data instead of querying the database directly
  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      // In a real app with Supabase properly set up, you would use:
      // const { data, error } = await supabase.from('webhooks').select('*').order('created_at', { ascending: false });
      
      // For now, return mock data
      return [
        {
          id: '1',
          name: 'New Comment Notifications',
          url: 'https://example.com/webhook',
          description: 'Notifies when new comments are added',
          events: ['comment.created', 'comment.updated'],
          headers: {},
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_triggered_at: new Date(Date.now() - 3600000).toISOString(),
          success_count: 42,
          failure_count: 2
        },
        {
          id: '2',
          name: 'Meeting Scheduler',
          url: 'https://myapp.com/api/calendar',
          description: 'Syncs meeting information with calendar',
          events: ['meeting.scheduled', 'meeting.updated', 'meeting.canceled'],
          headers: { 'X-API-Key': 'secret-key' },
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_triggered_at: new Date(Date.now() - 86400000).toISOString(),
          success_count: 18,
          failure_count: 0
        }
      ] as Webhook[];
    },
    enabled: !!user,
  });

  const createWebhookMutation = useMutation({
    mutationFn: async (webhook: Partial<Webhook>) => {
      // In a real app with Supabase properly set up, you would use:
      // const { data, error } = await supabase.from('webhooks').insert(webhook).select().single();
      
      // Mock response
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      return {
        ...webhook,
        id: Math.random().toString(36).substring(7),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_triggered_at: null,
        success_count: 0,
        failure_count: 0
      } as Webhook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setIsCreating(false);
      resetForm();
      toast({
        title: 'Webhook created',
        description: 'Your webhook has been created successfully.',
      });
    },
  });

  const updateWebhookMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Webhook> }) => {
      // In a real app with Supabase properly set up, you would use:
      // const { data, error } = await supabase.from('webhooks').update(updates).eq('id', id).select().single();
      
      // Mock response
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const webhook = webhooks.find(w => w.id === id);
      if (!webhook) {
        throw new Error('Webhook not found');
      }
      
      return {
        ...webhook,
        ...updates,
        updated_at: new Date().toISOString()
      } as Webhook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast({
        title: 'Webhook updated',
        description: 'Your webhook has been updated successfully.',
      });
    },
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: async (id: string) => {
      // In a real app with Supabase properly set up, you would use:
      // const { error } = await supabase.from('webhooks').delete().eq('id', id);
      
      // Mock response
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast({
        title: 'Webhook deleted',
        description: 'Your webhook has been deleted successfully.',
      });
    },
  });

  const testWebhookMutation = useMutation({
    mutationFn: async (id: string) => {
      // In a real implementation, this would call an edge function to test the webhook
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Test successful',
        description: 'The webhook test was successful.',
      });
    },
  });

  const resetForm = () => {
    setWebhookForm({
      name: '',
      url: '',
      description: '',
      events: ['comment.created'],
      headers: {},
      is_active: true,
    });
  };

  const handleCreateWebhook = () => {
    if (!webhookForm.name || !webhookForm.url) {
      toast({
        title: 'Validation error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    createWebhookMutation.mutate(webhookForm);
  };

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    updateWebhookMutation.mutate({
      id,
      updates: { is_active: !currentStatus },
    });
  };

  const availableEvents = [
    { id: 'comment.created', name: 'Comment Created' },
    { id: 'comment.updated', name: 'Comment Updated' },
    { id: 'comment.deleted', name: 'Comment Deleted' },
    { id: 'meeting.scheduled', name: 'Meeting Scheduled' },
    { id: 'meeting.updated', name: 'Meeting Updated' },
    { id: 'meeting.canceled', name: 'Meeting Canceled' },
    { id: 'company.created', name: 'Company Created' },
    { id: 'company.updated', name: 'Company Updated' },
    { id: 'update.submitted', name: 'Founder Update Submitted' },
  ];

  const getEventName = (eventId: string) => {
    const event = availableEvents.find((e) => e.id === eventId);
    return event ? event.name : eventId;
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please log in to manage webhooks.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Webhooks</h2>
          <p className="text-muted-foreground">
            Create webhooks to receive notifications about events in your account.
          </p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'Cancel' : <><Plus className="mr-2 h-4 w-4" /> New Webhook</>}
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create Webhook</CardTitle>
            <CardDescription>
              Create a new webhook to receive notifications about events in your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="My Webhook"
                value={webhookForm.name}
                onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                placeholder="https://example.com/webhook"
                value={webhookForm.url}
                onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this webhook is for"
                value={webhookForm.description}
                onChange={(e) => setWebhookForm({ ...webhookForm, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableEvents.map((event) => (
                  <div key={event.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`event-${event.id}`}
                      checked={webhookForm.events?.includes(event.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setWebhookForm({
                            ...webhookForm,
                            events: [...(webhookForm.events || []), event.id],
                          });
                        } else {
                          setWebhookForm({
                            ...webhookForm,
                            events: webhookForm.events?.filter((e) => e !== event.id),
                          });
                        }
                      }}
                      className="rounded border-gray-300 text-primary h-4 w-4"
                    />
                    <Label htmlFor={`event-${event.id}`} className="text-sm font-normal">
                      {event.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is-active"
                checked={webhookForm.is_active}
                onCheckedChange={(checked) => setWebhookForm({ ...webhookForm, is_active: checked })}
              />
              <Label htmlFor="is-active">Active</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleCreateWebhook} disabled={createWebhookMutation.isPending}>
              {createWebhookMutation.isPending ? 'Creating...' : 'Create Webhook'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : webhooks.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't created any webhooks yet.
            </p>
            {!isCreating && (
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create Webhook
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{webhook.name}</CardTitle>
                    {webhook.is_active ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-800">
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testWebhookMutation.mutate(webhook.id)}
                            disabled={testWebhookMutation.isPending}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Test webhook</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Switch
                            checked={webhook.is_active}
                            onCheckedChange={() => handleToggleActive(webhook.id, webhook.is_active)}
                          />
                        </TooltipTrigger>
                        <TooltipContent>Toggle active status</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete webhook</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this webhook? This action cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                            className="bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {webhook.description && (
                  <p className="text-sm text-muted-foreground mb-2">{webhook.description}</p>
                )}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-xs bg-gray-100 p-1 rounded">{webhook.url}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {webhook.events.map((eventId) => (
                      <Badge key={eventId} variant="secondary" className="text-xs">
                        {getEventName(eventId)}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span>{webhook.success_count || 0} successful</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-red-600" />
                      <span>{webhook.failure_count || 0} failed</span>
                    </div>
                    {webhook.last_triggered_at && (
                      <div className="flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        <span>Last triggered {new Date(webhook.last_triggered_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WebhookManager;
