import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { supabase } from '@/lib/supabase';
import { Database } from '@/integrations/supabase/types';
import RoleGuard from '@/components/layout/RoleGuard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Edit, Save, ExternalLink, Globe, FileText, Users, Activity, BarChart3 } from 'lucide-react';
import CompanyOverview from './CompanyOverview';
import CompanyMetrics from './CompanyMetrics';
import CompanyDocuments from './CompanyDocuments';

type Company = Database['public']['Tables']['companies']['Row'];

const CompanyProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user, hasPermission } = useAuth();
  const { canViewCompany, canEditCompany } = useRoleAccess();
  const { toast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({});
  const [isSaving, setIsSaving] = useState(false);

  const canView = id ? canViewCompany(id) : false;
  const canEdit = id ? canEditCompany(id) : false;

  useEffect(() => {
    const fetchCompany = async () => {
      setIsLoading(true);
      try {
        if (!id) return;

        // Check access before fetching
        if (!canView) {
          setCompany(null);
          return;
        }

        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setCompany(null);
          } else {
            throw error;
          }
        } else {
          setCompany(data);
          setFormData(data);
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
  }, [id, toast, canView]);

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
    if (!id) return;
    
    setIsSaving(true);
    try {
      const updatedData = {
        ...formData,
        updated_at: new Date().toISOString()
      };

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
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(company || {});
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!canView || !company) {
    return (
      <RoleGuard resourceOwnerId={id}>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800">Company not found</h2>
          <p className="text-gray-600 mt-2">The company you're looking for doesn't exist or you don't have permission to view it.</p>
        </div>
      </RoleGuard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {company.logo_url ? (
              <AvatarImage src={company.logo_url} alt={company.name} />
            ) : (
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {company.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <div className="flex items-center text-muted-foreground mt-1">
              {company.website && (
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">{new URL(company.website).hostname}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleCancel} 
                  variant="outline"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <CompanyOverview
            company={company}
            isEditing={isEditing}
            formData={formData}
            onInputChange={handleInputChange}
          />
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Key Metrics</h2>
              <p className="text-muted-foreground">Financial and operational performance indicators</p>
            </div>
            <CompanyMetrics
              company={company}
              isEditing={isEditing}
              formData={formData}
              onNumberChange={handleNumberChange}
            />
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Documents</h2>
              <p className="text-muted-foreground">Files and resources related to {company?.name}</p>
            </div>
            <CompanyDocuments
              company={company}
              isEditing={isEditing}
            />
          </div>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Team Management</h3>
            <p>Team member management will be available soon</p>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Activity Timeline</h3>
            <p>Company activity and updates timeline will be available soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyProfile;
