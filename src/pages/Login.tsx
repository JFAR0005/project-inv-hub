
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import DemoUserSetup from '@/components/auth/DemoUserSetup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to home
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('User is authenticated, redirecting to home');
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading while auth state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-blacknova">
        <LoadingSpinner size="lg" className="text-white" />
      </div>
    );
  }

  // If user is authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-blacknova">
        <LoadingSpinner size="lg" className="text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-blacknova p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white">Black Nova</h1>
          <p className="text-white/80 mt-2">Venture Capital Operating Platform</p>
        </div>
        
        <div className="bg-background rounded-lg shadow-xl p-8">
          <LoginForm />
        </div>
        
        {/* Demo Setup Card */}
        <DemoUserSetup />
        
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
