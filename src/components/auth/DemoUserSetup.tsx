
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const DemoUserSetup: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const createDemoUsers = async () => {
    setIsCreating(true);
    try {
      console.log('Creating demo users...');
      const { data, error } = await supabase.functions.invoke('create-demo-users');
      
      if (error) {
        console.error('Error creating demo users:', error);
        toast({
          title: "Error",
          description: `Failed to create demo users: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log('Demo users creation result:', data);
        const successCount = data?.results?.filter((r: any) => r.success)?.length || 0;
        const failureCount = data?.results?.filter((r: any) => !r.success)?.length || 0;
        
        if (successCount > 0) {
          toast({
            title: "Demo Users Ready!",
            description: `${successCount} demo accounts are ready. You can now log in with any of the credentials below using password "demo".`,
          });
        } else if (failureCount > 0) {
          toast({
            title: "Issues Creating Demo Users",
            description: `${failureCount} accounts had issues. Check console for details.`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error calling demo users function:', error);
      toast({
        title: "Error",
        description: "Failed to create demo users. Please check the console for details.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Demo Setup</CardTitle>
        <CardDescription className="text-center">
          Create or refresh demo users for testing authentication
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={createDemoUsers} 
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? 'Setting up Demo Users...' : 'Setup/Refresh Demo Users'}
        </Button>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          This will create or update test accounts for different user roles
        </p>
      </CardContent>
    </Card>
  );
};

export default DemoUserSetup;
