
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
      const { data, error } = await supabase.functions.invoke('create-demo-users');
      
      if (error) {
        console.error('Error creating demo users:', error);
        toast({
          title: "Error",
          description: "Failed to create demo users. Please try again.",
          variant: "destructive",
        });
      } else {
        console.log('Demo users creation result:', data);
        toast({
          title: "Success",
          description: "Demo users created successfully! You can now log in with the provided credentials.",
        });
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
          Create demo users for testing authentication
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={createDemoUsers} 
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? 'Creating Demo Users...' : 'Create Demo Users'}
        </Button>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          This will create test accounts for different user roles
        </p>
      </CardContent>
    </Card>
  );
};

export default DemoUserSetup;
