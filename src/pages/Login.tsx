
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, isAuthenticated, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Clear errors when component mounts or when user starts typing
  useEffect(() => {
    clearError();
    setError(null);
  }, [clearError]);

  useEffect(() => {
    if (email || password) {
      setError(null);
      clearError();
    }
  }, [email, password, clearError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation will happen automatically due to useEffect above
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to sign in. Please check your credentials.';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link.';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a moment and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'partner' | 'founder') => {
    const demoCredentials = {
      admin: { email: 'admin@blacknova.vc', password: 'demo123' },
      partner: { email: 'partner@blacknova.vc', password: 'demo123' },
      founder: { email: 'founder@blacknova.vc', password: 'demo123' }
    };

    const credentials = demoCredentials[role];
    setEmail(credentials.email);
    setPassword(credentials.password);
    
    setError(null);
    setIsLoading(true);

    try {
      await login(credentials.email, credentials.password);
    } catch (error: any) {
      console.error('Demo login error:', error);
      setError('Demo login failed. Please try manual login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Black Nova
          </CardTitle>
          <CardDescription className="text-center">
            Venture Capital Operating Platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {(error || authError) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error || authError}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or try demo accounts
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              onClick={() => handleDemoLogin('admin')}
              disabled={isLoading}
              className="w-full"
            >
              Demo Admin
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDemoLogin('partner')}
              disabled={isLoading}
              className="w-full"
            >
              Demo Partner
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDemoLogin('founder')}
              disabled={isLoading}
              className="w-full"
            >
              Demo Founder
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Demo credentials: Use any demo button above</p>
            <p className="mt-1">Or email: admin@blacknova.vc / Password: demo123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
