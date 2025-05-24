
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Dashboard from '@/components/dashboard/Dashboard';
import AuthTest from '@/components/auth/AuthTest';

const Index = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-blacknova p-4">
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Black Nova</h1>
            <p className="text-white/80">Venture Capital Operating Platform</p>
          </div>
          <AuthTest />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name || user?.email}</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your portfolio today.
          </p>
        </div>
        <AuthTest />
      </div>
      <Dashboard />
    </div>
  );
};

export default Index;
