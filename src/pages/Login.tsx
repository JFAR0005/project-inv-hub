
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // If already authenticated, redirect to dashboard
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-blacknova p-4">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-white">Black Nova</h1>
        <p className="text-white/80 mt-2">Venture Capital Operating Platform</p>
      </div>
      
      <div className="w-full max-w-md space-y-4">
        <div className="bg-background rounded-lg shadow-xl p-8">
          <LoginForm />
        </div>
        
        {/* Demo Credentials Card */}
        <Card className="bg-background/90">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Demo Credentials</CardTitle>
            <CardDescription className="text-xs">
              Use these credentials to test different role perspectives
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="grid grid-cols-1 gap-2">
              <div className="p-2 bg-muted rounded">
                <div className="font-medium">Admin</div>
                <div className="text-muted-foreground">admin@blacknova.vc / demo</div>
              </div>
              <div className="p-2 bg-muted rounded">
                <div className="font-medium">Capital Team</div>
                <div className="text-muted-foreground">capital@blacknova.vc / demo</div>
              </div>
              <div className="p-2 bg-muted rounded">
                <div className="font-medium">Partner</div>
                <div className="text-muted-foreground">partner@blacknova.vc / demo</div>
              </div>
              <div className="p-2 bg-muted rounded">
                <div className="font-medium">Founder</div>
                <div className="text-muted-foreground">founder@blacknova.vc / demo</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
