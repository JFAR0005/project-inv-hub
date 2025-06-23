
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Company = Database['public']['Tables']['companies']['Row'];

interface CompanyProfileHeaderProps {
  company: Company;
  canEdit: boolean;
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const CompanyProfileHeader: React.FC<CompanyProfileHeaderProps> = ({
  company,
  canEdit,
  isEditing,
  isSaving,
  onEdit,
  onSave,
  onCancel
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{company.name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {company.stage && <Badge variant="outline">{company.stage}</Badge>}
              {company.sector && <Badge variant="secondary">{company.sector}</Badge>}
            </div>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button 
                    onClick={onSave} 
                    disabled={isSaving}
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={onCancel}
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={onEdit} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Location</h4>
            <p>{company.location || 'Not specified'}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Website</h4>
            <p>{company.website || 'Not specified'}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">ARR</h4>
            <p>{company.arr ? `$${company.arr.toLocaleString()}` : 'Not specified'}</p>
          </div>
        </div>
        {company.description && (
          <div className="mt-4">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
            <p>{company.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyProfileHeader;
