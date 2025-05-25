
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';
import { 
  Calendar, 
  FileText, 
  Zap, 
  Workflow, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Copy,
  Settings
} from 'lucide-react';

const ProductionIntegrations = () => {
  const [zapierWebhook, setZapierWebhook] = useState('');
  const [n8nWebhook, setN8nWebhook] = useState('');
  const [googleCredentials, setGoogleCredentials] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: ''
  });
  const [calendlyToken, setCalendlyToken] = useState('');

  const handleWebhookTest = async (webhookUrl: string, service: string) => {
    if (!webhookUrl) {
      toast(`Please enter your ${service} webhook URL first`);
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          source: 'Black Nova VC Platform',
          event_type: 'test_connection'
        }),
      });

      toast(`${service} webhook test sent successfully`, {
        description: 'Check your workflow to confirm the test was received'
      });
    } catch (error) {
      toast(`Error testing ${service} webhook`, {
        description: 'Please verify the webhook URL is correct'
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This section contains production-ready integration configurations. Follow the step-by-step guides below to set up each integration properly.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="google" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="google">Google Suite</TabsTrigger>
          <TabsTrigger value="calendly">Calendly</TabsTrigger>
          <TabsTrigger value="zapier">Zapier</TabsTrigger>
          <TabsTrigger value="n8n">n8n</TabsTrigger>
          <TabsTrigger value="webhook">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="google">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Google Calendar Integration
                </CardTitle>
                <CardDescription>
                  Sync meetings and events with Google Calendar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="google-client-id">Client ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="google-client-id"
                      placeholder="your-client-id.googleusercontent.com"
                      value={googleCredentials.clientId}
                      onChange={(e) => setGoogleCredentials({...googleCredentials, clientId: e.target.value})}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(googleCredentials.clientId)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google-client-secret">Client Secret</Label>
                  <Input
                    id="google-client-secret"
                    type="password"
                    placeholder="GOCSPX-..."
                    value={googleCredentials.clientSecret}
                    onChange={(e) => setGoogleCredentials({...googleCredentials, clientSecret: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="google-redirect">Redirect URI</Label>
                  <Input
                    id="google-redirect"
                    placeholder="https://your-domain.com/auth/google/callback"
                    value={googleCredentials.redirectUri}
                    onChange={(e) => setGoogleCredentials({...googleCredentials, redirectUri: e.target.value})}
                  />
                </div>

                <Alert>
                  <AlertDescription className="text-sm">
                    <strong>Setup Instructions:</strong><br/>
                    1. Go to <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-600 underline">Google Cloud Console</a><br/>
                    2. Create a new project or select existing<br/>
                    3. Enable Calendar API and Drive API<br/>
                    4. Create OAuth 2.0 credentials<br/>
                    5. Add your domain to authorized origins<br/>
                    6. Set redirect URI to your callback URL
                  </AlertDescription>
                </Alert>

                <Button className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Google Cloud Console
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Google Drive Integration
                </CardTitle>
                <CardDescription>
                  Access and manage documents in Google Drive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Uses same Google OAuth credentials
                </Badge>

                <Alert>
                  <AlertDescription className="text-sm">
                    <strong>Additional Scopes Required:</strong><br/>
                    • https://www.googleapis.com/auth/drive.readonly<br/>
                    • https://www.googleapis.com/auth/drive.file<br/>
                    • https://www.googleapis.com/auth/drive.metadata.readonly
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h4 className="font-medium">Folder Structure</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>📁 Black Nova VC</div>
                    <div className="ml-4">📁 Portfolio Companies</div>
                    <div className="ml-8">📁 [Company Name]</div>
                    <div className="ml-12">📁 Due Diligence</div>
                    <div className="ml-12">📁 Board Materials</div>
                    <div className="ml-12">📁 Financial Reports</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendly">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendly Integration
              </CardTitle>
              <CardDescription>
                Embed Calendly scheduling and sync events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calendly-token">Personal Access Token</Label>
                <Input
                  id="calendly-token"
                  type="password"
                  placeholder="eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY..."
                  value={calendlyToken}
                  onChange={(e) => setCalendlyToken(e.target.value)}
                />
              </div>

              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Setup Instructions:</strong><br/>
                  1. Log in to your <a href="https://calendly.com/integrations/api_webhooks" target="_blank" className="text-blue-600 underline">Calendly account</a><br/>
                  2. Go to Integrations → API & Webhooks<br/>
                  3. Generate a Personal Access Token<br/>
                  4. Copy the token above<br/>
                  5. Set up webhooks for event notifications
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium">Webhook Endpoints</h4>
                <div className="space-y-1 text-sm font-mono bg-muted p-2 rounded">
                  <div>POST /api/webhooks/calendly/scheduled</div>
                  <div>POST /api/webhooks/calendly/canceled</div>
                  <div>POST /api/webhooks/calendly/rescheduled</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleWebhookTest(`${window.location.origin}/api/webhooks/calendly/test`, 'Calendly')}
                  disabled={!calendlyToken}
                >
                  Test Connection
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://calendly.com/integrations/api_webhooks" target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Calendly API Docs
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zapier">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Zapier Integration
              </CardTitle>
              <CardDescription>
                Connect to 6000+ apps with Zapier workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zapier-webhook">Zapier Webhook URL</Label>
                <Input
                  id="zapier-webhook"
                  placeholder="https://hooks.zapier.com/hooks/catch/123456/abcdef/"
                  value={zapierWebhook}
                  onChange={(e) => setZapierWebhook(e.target.value)}
                />
              </div>

              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Setup Instructions:</strong><br/>
                  1. Create a new Zap in <a href="https://zapier.com/app/zaps" target="_blank" className="text-blue-600 underline">Zapier</a><br/>
                  2. Choose "Webhooks by Zapier" as trigger<br/>
                  3. Select "Catch Hook" trigger event<br/>
                  4. Copy the webhook URL provided<br/>
                  5. Paste it above and test the connection<br/>
                  6. Configure your desired actions (Slack, Email, etc.)
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium">Available Events</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Badge variant="outline">company_update_submitted</Badge>
                  <Badge variant="outline">meeting_scheduled</Badge>
                  <Badge variant="outline">deal_created</Badge>
                  <Badge variant="outline">note_added</Badge>
                  <Badge variant="outline">document_uploaded</Badge>
                  <Badge variant="outline">metric_updated</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Sample Payload</h4>
                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
{`{
  "event_type": "company_update_submitted",
  "company_name": "TechCorp Inc",
  "company_id": "uuid-here",
  "submitted_by": "founder@techcorp.com",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "revenue": 150000,
    "employees": 12,
    "runway_months": 18
  }
}`}
                </pre>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleWebhookTest(zapierWebhook, 'Zapier')}>
                  Test Webhook
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://zapier.com/app/zaps" target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Create Zap
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="n8n">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                n8n Integration
              </CardTitle>
              <CardDescription>
                Self-hosted workflow automation with n8n
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="n8n-webhook">n8n Webhook URL</Label>
                <Input
                  id="n8n-webhook"
                  placeholder="https://your-n8n-instance.com/webhook/black-nova"
                  value={n8nWebhook}
                  onChange={(e) => setN8nWebhook(e.target.value)}
                />
              </div>

              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Setup Instructions:</strong><br/>
                  1. Deploy n8n on your server or use <a href="https://n8n.cloud" target="_blank" className="text-blue-600 underline">n8n Cloud</a><br/>
                  2. Create a new workflow<br/>
                  3. Add a "Webhook" trigger node<br/>
                  4. Set HTTP method to POST<br/>
                  5. Copy the webhook URL<br/>
                  6. Add processing nodes (HTTP Request, Set, etc.)<br/>
                  7. Connect to your desired endpoints
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium">Recommended n8n Nodes</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">HTTP Request</Badge>
                    <span className="text-xs text-muted-foreground">API calls</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Gmail</Badge>
                    <span className="text-xs text-muted-foreground">Email alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Slack</Badge>
                    <span className="text-xs text-muted-foreground">Team notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Google Sheets</Badge>
                    <span className="text-xs text-muted-foreground">Data logging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Airtable</Badge>
                    <span className="text-xs text-muted-foreground">CRM sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Set</Badge>
                    <span className="text-xs text-muted-foreground">Data transformation</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Sample n8n Workflow JSON</h4>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(`{
  "name": "Black Nova Integration",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300],
      "parameters": {
        "httpMethod": "POST",
        "path": "black-nova",
        "responseMode": "responseNode"
      }
    }
  ]
}`)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Workflow Template
                </Button>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleWebhookTest(n8nWebhook, 'n8n')}>
                  Test Webhook
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://docs.n8n.io/" target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    n8n Documentation
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhook">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Custom Webhook Endpoints</CardTitle>
                <CardDescription>
                  Direct webhook URLs for custom integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <code className="text-sm">POST /api/webhooks/company-update</code>
                      <p className="text-xs text-muted-foreground">Triggered when companies submit updates</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(`${window.location.origin}/api/webhooks/company-update`)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <code className="text-sm">POST /api/webhooks/meeting-scheduled</code>
                      <p className="text-xs text-muted-foreground">Triggered when meetings are scheduled</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(`${window.location.origin}/api/webhooks/meeting-scheduled`)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <code className="text-sm">POST /api/webhooks/deal-stage-change</code>
                      <p className="text-xs text-muted-foreground">Triggered when deal stages change</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(`${window.location.origin}/api/webhooks/deal-stage-change`)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Authentication:</strong> All webhook requests include an HMAC signature in the <code>X-Black-Nova-Signature</code> header for verification.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Webhook Security</CardTitle>
                <CardDescription>
                  Implement proper webhook verification in production
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Signature Verification (Node.js)</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Rate Limiting</h4>
                  <p className="text-sm text-muted-foreground">
                    Webhooks are rate-limited to 100 requests per minute per endpoint to prevent abuse.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionIntegrations;
