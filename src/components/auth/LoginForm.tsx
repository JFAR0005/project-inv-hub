
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const { toast } = useToast();

  const getErrorMessage = (error: any): string => {
    const errorMessage = error?.message || '';
    
    // Handle specific Supabase auth errors
    if (errorMessage.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    
    if (errorMessage.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    
    if (errorMessage.includes('Too many requests')) {
      return 'Too many login attempts. Please wait a few minutes before trying again.';
    }
    
    if (errorMessage.includes('User not found')) {
      return 'No account found with this email address. Please check your email or sign up.';
    }
    
    if (errorMessage.includes('Password')) {
      return 'Incorrect password. Please try again.';
    }
    
    if (errorMessage.includes('Network')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    if (errorMessage.includes('Auth session missing')) {
      return 'Authentication session expired. Please try logging in again.';
    }
    
    // Generic fallback with demo info
    return 'Login failed. For demo, use any of the sample accounts below with password "demo123".';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password.');
      setIsSubmitting(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Attempting login for:', email);
      await login(email, password);
      
      toast({
        title: "Login Successful",
        description: "Welcome back to Black Nova!",
      });
      
      // Navigation will be handled by auth state change and page reload
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'partner' | 'founder' | 'capital') => {
    const demoCredentials = {
      admin: { email: 'admin@blacknova.vc', password: 'demo123' },
      partner: { email: 'partner@blacknova.vc', password: 'demo123' },
      founder: { email: 'founder@blacknova.vc', password: 'demo123' },
      capital: { email: 'capital@blacknova.vc', password: 'demo123' }
    };

    const credentials = demoCredentials[role];
    setEmail(credentials.email);
    setPassword(credentials.password);
    
    setError(null);
    setIsSubmitting(true);

    try {
      await login(credentials.email, credentials.password);
      toast({
        title: "Demo Login Successful",
        description: `Logged in as ${role}`,
      });
    } catch (error: any) {
      console.error('Demo login error:', error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-muted-foreground mt-2">Sign in to access your Black Nova dashboard</p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            required
            disabled={isSubmitting}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
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

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={() => handleDemoLogin('admin')}
          disabled={isSubmitting}
          size="sm"
        >
          Demo Admin
        </Button>
        <Button
          variant="outline"
          onClick={() => handleDemoLogin('capital')}
          disabled={isSubmitting}
          size="sm"
        >
          Demo Capital
        </Button>
        <Button
          variant="outline"
          onClick={() => handleDemoLogin('partner')}
          disabled={isSubmitting}
          size="sm"
        >
          Demo Partner
        </Button>
        <Button
          variant="outline"
          onClick={() => handleDemoLogin('founder')}
          disabled={isSubmitting}
          size="sm"
        >
          Demo Founder
        </Button>
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>Demo credentials: password "demo123" for all accounts</p>
        <p className="mt-1">Or manually enter: admin@blacknova.vc / demo123</p>
      </div>
    </div>
  );
};

export default LoginForm;
