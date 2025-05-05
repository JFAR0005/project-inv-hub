
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/auth/LoginForm';

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
      
      <div className="w-full max-w-md bg-background rounded-lg shadow-xl p-8">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
