
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ApiDocumentation: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Documentation</CardTitle>
        <CardDescription>
          Learn how to use our APIs to extend the platform's functionality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">
            The Black Nova platform offers REST APIs that allow you to programmatically:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 pl-4">
            <li>Fetch portfolio company data</li>
            <li>Create and manage calendar events</li>
            <li>Send notifications to users</li>
            <li>Generate reports and analytics</li>
          </ul>
          <div className="mt-4">
            <Button variant="outline">View API Documentation</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiDocumentation;
