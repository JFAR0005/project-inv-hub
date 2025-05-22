
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Edit, ExternalLink, Save, Globe, Users, TrendingUp, Clock } from 'lucide-react';

type Company = Database['public']['Tables']['companies']['Row'];

const CompanyProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({});

  const canEdit = hasPermission('edit:all') || 
    (hasPermission('edit:own:company') && user?.companyId === id);

  useEffect(() => {
    const fetchCompany = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be a Supabase query
        if (!id) return;

        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setCompany(data);
          setFormData(data);
        } else {
          // Fallback to mock data for development
          // This would be removed in production
          const mockCompany = {
            id,
            name: 'TechStartup Inc',
            logo_url: '',
            website: 'https://techstartup.com',
            stage: 'Series A',
            location: 'San Francisco, CA',
            description: 'A cutting-edge tech company focused on AI solutions.',
            sector: 'SaaS',
            arr: 1500000,
            mrr: 125000,
            burn_rate: 80000,
            runway: 14,
            churn_rate: 2.5,
            headcount: 25,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setCompany(mockCompany as Company);
          setFormData(mockCompany);
        }
      } catch (error) {
        console.error('Error fetching company:', error);
        toast({
          title: "Error",
          description: "Failed to load company data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [id, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : parseFloat(value)
    }));
  };

  const handleSave = async () => {
    try {
      const updatedData = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      // In a real app, this would be a Supabase update
      const { error } = await supabase
        .from('companies')
        .update(updatedData)
        .eq('id', id);

      if (error) throw error;

      setCompany(updatedData as Company);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Company profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating company:', error);
      toast({
        title: "Error",
        description: "Failed to update company data",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-[200px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[150px]" />
          <Skeleton className="h-[150px]" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Company not found</h2>
        <p className="text-gray-600 mt-2">The company you're looking for doesn't exist or you don't have permission to view it.</p>
      </div>
    );
  }

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {company.logo_url ? (
              <AvatarImage src={company.logo_url} alt={company.name} />
            ) : (
              <AvatarFallback className="text-lg">
                {company.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <div className="flex items-center text-muted-foreground">
              {company.website && (
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <Globe className="h-4 w-4" />
                  <span>{company.website}</span>
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              )}
            </div>
          </div>
        </div>

        {canEdit && (
          <div>
            {isEditing ? (
              <Button onClick={handleSave} variant="default">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>Company details and information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Company Name</label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="website" className="text-sm font-medium">Website</label>
                      <Input 
                        id="website" 
                        name="website" 
                        value={formData.website || ''} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="location" className="text-sm font-medium">Location</label>
                      <Input 
                        id="location" 
                        name="location" 
                        value={formData.location || ''} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="stage" className="text-sm font-medium">Stage</label>
                      <Input 
                        id="stage" 
                        name="stage" 
                        value={formData.stage || ''} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="sector" className="text-sm font-medium">Sector</label>
                      <Input 
                        id="sector" 
                        name="sector" 
                        value={formData.sector || ''} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">Description</label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      value={formData.description || ''} 
                      onChange={handleInputChange} 
                      rows={4}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Stage</h3>
                      <p>{company.stage || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Sector</h3>
                      <p>{company.sector || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                      <p>{company.location || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Website</h3>
                      <p>
                        {company.website ? (
                          <a 
                            href={company.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {company.website}
                          </a>
                        ) : (
                          'Not specified'
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-line">
                      {company.description || 'No description provided.'}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
              <CardDescription>Financial and growth metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="arr" className="text-sm font-medium">ARR</label>
                    <Input 
                      id="arr" 
                      name="arr" 
                      type="number" 
                      value={formData.arr || ''} 
                      onChange={handleNumberChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="mrr" className="text-sm font-medium">MRR</label>
                    <Input 
                      id="mrr" 
                      name="mrr" 
                      type="number" 
                      value={formData.mrr || ''} 
                      onChange={handleNumberChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="burn_rate" className="text-sm font-medium">Burn Rate (monthly)</label>
                    <Input 
                      id="burn_rate" 
                      name="burn_rate" 
                      type="number" 
                      value={formData.burn_rate || ''} 
                      onChange={handleNumberChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="runway" className="text-sm font-medium">Runway (months)</label>
                    <Input 
                      id="runway" 
                      name="runway" 
                      type="number" 
                      value={formData.runway || ''} 
                      onChange={handleNumberChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="churn_rate" className="text-sm font-medium">Churn Rate (%)</label>
                    <Input 
                      id="churn_rate" 
                      name="churn_rate" 
                      type="number" 
                      step="0.1" 
                      value={formData.churn_rate || ''} 
                      onChange={handleNumberChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="headcount" className="text-sm font-medium">Headcount</label>
                    <Input 
                      id="headcount" 
                      name="headcount" 
                      type="number" 
                      value={formData.headcount || ''} 
                      onChange={handleNumberChange} 
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-muted/40">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          <h3 className="text-sm font-medium">ARR</h3>
                        </div>
                        <span className="text-xl font-bold">
                          {formatCurrency(company.arr)}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        MRR: {formatCurrency(company.mrr)}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/40">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-5 w-5 text-blue-500" />
                          <h3 className="text-sm font-medium">Runway</h3>
                        </div>
                        <span className="text-xl font-bold">
                          {company.runway !== undefined && company.runway !== null 
                            ? `${company.runway} months` 
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Burn: {formatCurrency(company.burn_rate)}/mo
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/40">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="h-5 w-5 text-purple-500" />
                          <h3 className="text-sm font-medium">Headcount</h3>
                        </div>
                        <span className="text-xl font-bold">
                          {company.headcount !== undefined && company.headcount !== null 
                            ? company.headcount 
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Churn: {company.churn_rate !== undefined && company.churn_rate !== null 
                          ? `${company.churn_rate}%` 
                          : 'N/A'}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Leadership and key personnel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Team information coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Timeline of company events, notes, and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Activity timeline coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyProfile;
