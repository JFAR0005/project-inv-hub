
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AuthTest: React.FC = () => {
  const { user, isAuthenticated, logout, error } = useAuth();

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
          <CardDescription>Not authenticated</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please log in to test authentication.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Authentication Test</CardTitle>
        <CardDescription>User authenticated successfully</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Name:</strong> {user?.name || 'Not set'}</p>
          <p><strong>Role:</strong> <Badge variant="outline">{user?.role}</Badge></p>
          <p><strong>User ID:</strong> {user?.id}</p>
          <p><strong>Company ID:</strong> {user?.companyId || 'Not assigned'}</p>
        </div>
        
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        
        <Button onClick={logout} variant="outline" className="w-full">
          Logout
        </Button>
      </CardContent>
    </Card>
  );
};

export default AuthTest;
