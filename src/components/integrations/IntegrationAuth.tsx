
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Key, Lock, KeyRound, Link as LinkIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ApiCredential {
  id: string;
  name: string;
  type: 'api_key' | 'oauth2' | 'basic_auth' | 'jwt';
  config: Record<string, string>;
  service?: string;
  createdAt: Date;
}

interface IntegrationAuthProps {
  onAuthSuccess?: (credentialId: string) => void;
}

const IntegrationAuth: React.FC<IntegrationAuthProps> = ({ onAuthSuccess }) => {
  const { user } = useAuth();
  const [credentials, setCredentials] = useState<ApiCredential[]>([]);
  const [isAddingCredential, setIsAddingCredential] = useState(false);
  const [authType, setAuthType] = useState<'api_key' | 'oauth2' | 'basic_auth' | 'jwt'>('api_key');
  const [newCredential, setNewCredential] = useState({
    name: '',
    service: '',
    api_key: '',
    api_secret: '',
    username: '',
    password: '',
    token: '',
    client_id: '',
    client_secret: '',
    auth_url: '',
    token_url: '',
    refresh_token: '',
  });

  // Mock credentials for demo
  useEffect(() => {
    const mockCredentials: ApiCredential[] = [
      {
        id: "cred_1",
        name: "Google Calendar API",
        type: "oauth2",
        service: "google_calendar",
        config: {
          client_id: "****************************",
          client_secret: "****************************",
          refresh_token: "****************************",
        },
        createdAt: new Date(Date.now() - 86400000 * 10)
      },
      {
        id: "cred_2",
        name: "Slack Webhook",
        type: "api_key",
        service: "slack",
        config: {
          api_key: "****************************",
        },
        createdAt: new Date(Date.now() - 86400000 * 3)
      }
    ];

    setCredentials(mockCredentials);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCredential(prev => ({ ...prev, [name]: value }));
  };

  const handleAuthTypeChange = (type: 'api_key' | 'oauth2' | 'basic_auth' | 'jwt') => {
    setAuthType(type);
  };

  const validateNewCredential = () => {
    if (!newCredential.name) {
      toast("Missing credential name", {
        description: "Please provide a name for this credential",
      });
      return false;
    }

    switch (authType) {
      case 'api_key':
        if (!newCredential.api_key) {
          toast("Missing API key", {
            description: "Please provide an API key",
          });
          return false;
        }
        break;
      case 'basic_auth':
        if (!newCredential.username || !newCredential.password) {
          toast("Missing authentication details", {
            description: "Please provide both username and password",
          });
          return false;
        }
        break;
      case 'jwt':
        if (!newCredential.token) {
          toast("Missing JWT token", {
            description: "Please provide a valid JWT token",
          });
          return false;
        }
        break;
      case 'oauth2':
        if (!newCredential.client_id || !newCredential.client_secret) {
          toast("Missing OAuth credentials", {
            description: "Please provide client ID and client secret",
          });
          return false;
        }
        break;
    }

    return true;
  };

  const handleSaveCredential = () => {
    if (!validateNewCredential()) {
      return;
    }
    
    // Build credential config based on auth type
    const config: Record<string, string> = {};
    
    switch (authType) {
      case 'api_key':
        config.api_key = newCredential.api_key;
        if (newCredential.api_secret) {
          config.api_secret = newCredential.api_secret;
        }
        break;
      case 'basic_auth':
        config.username = newCredential.username;
        config.password = newCredential.password;
        break;
      case 'jwt':
        config.token = newCredential.token;
        break;
      case 'oauth2':
        config.client_id = newCredential.client_id;
        config.client_secret = newCredential.client_secret;
        if (newCredential.auth_url) config.auth_url = newCredential.auth_url;
        if (newCredential.token_url) config.token_url = newCredential.token_url;
        if (newCredential.refresh_token) config.refresh_token = newCredential.refresh_token;
        break;
    }

    // Create new credential (in a real app, this would be saved to the database)
    const newCred: ApiCredential = {
      id: `cred_${Date.now()}`,
      name: newCredential.name,
      type: authType,
      service: newCredential.service || undefined,
      config,
      createdAt: new Date(),
    };

    // Add to credentials list
    setCredentials([...credentials, newCred]);
    
    toast("Credential created", {
      description: `${newCredential.name} credential has been successfully saved`,
    });
    
    // Reset form
    setNewCredential({
      name: '',
      service: '',
      api_key: '',
      api_secret: '',
      username: '',
      password: '',
      token: '',
      client_id: '',
      client_secret: '',
      auth_url: '',
      token_url: '',
      refresh_token: '',
    });
    
    setIsAddingCredential(false);

    // Trigger success callback if provided
    if (onAuthSuccess) {
      onAuthSuccess(newCred.id);
    }
  };

  const handleDeleteCredential = (id: string) => {
    setCredentials(credentials.filter(cred => cred.id !== id));
    
    toast("Credential deleted", {
      description: "The credential has been removed",
    });
  };

  const handleTestCredential = (cred: ApiCredential) => {
    // In a real app, this would test the credential against the actual service API
    toast("Testing credential", {
      description: `Testing connection for ${cred.name}...`,
    });

    // Simulate test result
    setTimeout(() => {
      toast("Connection successful", {
        description: `${cred.name} authentication verified successfully`,
      });
    }, 1500);
  };

  const renderAuthForm = () => {
    switch (authType) {
      case 'api_key':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                name="api_key"
                value={newCredential.api_key}
                onChange={handleInputChange}
                type="password"
                placeholder="Enter API key"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="api_secret">API Secret (optional)</Label>
              <Input
                id="api_secret"
                name="api_secret"
                value={newCredential.api_secret}
                onChange={handleInputChange}
                type="password"
                placeholder="Enter API secret"
                className="mt-1"
              />
            </div>
          </div>
        );
      
      case 'basic_auth':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={newCredential.username}
                onChange={handleInputChange}
                placeholder="Enter username"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                value={newCredential.password}
                onChange={handleInputChange}
                type="password"
                placeholder="Enter password"
                className="mt-1"
              />
            </div>
          </div>
        );
      
      case 'jwt':
        return (
          <div>
            <Label htmlFor="token">JWT Token</Label>
            <Input
              id="token"
              name="token"
              value={newCredential.token}
              onChange={handleInputChange}
              type="password"
              placeholder="Enter JWT token"
              className="mt-1"
            />
          </div>
        );
      
      case 'oauth2':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="client_id">Client ID</Label>
              <Input
                id="client_id"
                name="client_id"
                value={newCredential.client_id}
                onChange={handleInputChange}
                placeholder="Enter client ID"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="client_secret">Client Secret</Label>
              <Input
                id="client_secret"
                name="client_secret"
                value={newCredential.client_secret}
                onChange={handleInputChange}
                type="password"
                placeholder="Enter client secret"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="auth_url">Authorization URL (optional)</Label>
              <Input
                id="auth_url"
                name="auth_url"
                value={newCredential.auth_url}
                onChange={handleInputChange}
                placeholder="https://example.com/oauth/authorize"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="token_url">Token URL (optional)</Label>
              <Input
                id="token_url"
                name="token_url"
                value={newCredential.token_url}
                onChange={handleInputChange}
                placeholder="https://example.com/oauth/token"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="refresh_token">Refresh Token (optional)</Label>
              <Input
                id="refresh_token"
                name="refresh_token"
                value={newCredential.refresh_token}
                onChange={handleInputChange}
                type="password"
                placeholder="Enter refresh token"
                className="mt-1"
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">API Credentials</h2>
        <Button 
          onClick={() => setIsAddingCredential(true)}
          disabled={isAddingCredential}
        >
          <KeyRound className="mr-2 h-4 w-4" />
          Add New Credential
        </Button>
      </div>

      {isAddingCredential && (
        <Card>
          <CardHeader>
            <CardTitle>Add API Credential</CardTitle>
            <CardDescription>Configure authentication for an external API</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Credential Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newCredential.name}
                    onChange={handleInputChange}
                    placeholder="E.g., Google Calendar API"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="service">Service (optional)</Label>
                  <Input
                    id="service"
                    name="service"
                    value={newCredential.service}
                    onChange={handleInputChange}
                    placeholder="E.g., google_calendar"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-type">Authentication Type</Label>
                <Select 
                  defaultValue="api_key" 
                  onValueChange={(value) => handleAuthTypeChange(value as any)}
                >
                  <SelectTrigger id="auth-type" className="w-full">
                    <SelectValue placeholder="Select authentication type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="api_key">API Key</SelectItem>
                    <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                    <SelectItem value="basic_auth">Basic Auth</SelectItem>
                    <SelectItem value="jwt">JWT Token</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {renderAuthForm()}

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingCredential(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveCredential}>
                  Save Credential
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {credentials.map((credential) => (
          <Card key={credential.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {credential.type === 'api_key' && <Key className="h-5 w-5" />}
                    {credential.type === 'oauth2' && <LinkIcon className="h-5 w-5" />}
                    {(credential.type === 'basic_auth' || credential.type === 'jwt') && <Lock className="h-5 w-5" />}
                  </div>
                  <div>
                    <CardTitle className="text-base">{credential.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {credential.service && `Service: ${credential.service}`}
                      {!credential.service && `Type: ${credential.type}`}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground mb-3">
                Created on {credential.createdAt.toLocaleDateString()}
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(credential.config).map((key) => (
                  <div
                    key={key}
                    className="bg-muted text-xs rounded px-2 py-1 flex items-center"
                  >
                    <span className="font-medium mr-1">{key}:</span>
                    <span>••••••••</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-4 pt-0 flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleTestCredential(credential)}
              >
                Test
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDeleteCredential(credential.id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default IntegrationAuth;
