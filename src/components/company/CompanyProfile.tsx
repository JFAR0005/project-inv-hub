
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import CompanyProfileHeader from './CompanyProfileHeader';
import CompanyProfileTabs from './CompanyProfileTabs';
import CompanyProfileSkeleton from './CompanyProfileSkeleton';
import CompanyNotFound from './CompanyNotFound';

type Company = Database['public']['Tables']['companies']['Row'];

const CompanyProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { canViewCompany, canEditCompany } = useRolePermissions();
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
    return <CompanyProfileSkeleton />;
  }

  if (!canView || !company) {
    return <CompanyNotFound />;
  }

  return (
    <div className="space-y-6">
      <CompanyProfileHeader
        company={company}
        canEdit={canEdit}
        isEditing={isEditing}
        isSaving={isSaving}
        onEdit={() => setIsEditing(true)}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <CompanyProfileTabs company={company} companyId={id!} />
    </div>
  );
};

export default CompanyProfile;
