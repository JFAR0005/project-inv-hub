
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PortfolioOverview from '@/components/portfolio/PortfolioOverview';
import PortfolioList from '@/components/portfolio/PortfolioList';
import { BarChart3, Grid3X3, List, TrendingUp, Activity } from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { UserRole } from '@/context/AuthContext';

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <Layout>
        <div className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Portfolio Management</h1>
              <p className="text-muted-foreground mt-1">
                Monitor and manage your portfolio companies
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="health" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Health Dashboard
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <PortfolioOverview />
            </TabsContent>

            <TabsContent value="health" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Health Dashboard</CardTitle>
                  <CardDescription>
                    Monitor the health and performance of your portfolio companies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PortfolioList />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="list" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio List View</CardTitle>
                  <CardDescription>
                    Detailed table view of all portfolio companies with filtering and sorting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PortfolioList />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Analytics</CardTitle>
                  <CardDescription>
                    Coming soon - Advanced analytics and reporting for your portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Portfolio analytics dashboard will be available in the next update
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
