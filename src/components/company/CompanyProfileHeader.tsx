
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, Globe, ExternalLink } from 'lucide-react';
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
  const getStageColor = (stage: string | null) => {
    switch (stage?.toLowerCase()) {
      case 'seed': return 'bg-green-100 text-green-800';
      case 'series a': return 'bg-blue-100 text-blue-800';
      case 'series b': return 'bg-purple-100 text-purple-800';
      case 'series c': return 'bg-orange-100 text-orange-800';
      case 'growth': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex justify-between items-start mb-8">
      <div className="flex items-center gap-6">
        <Avatar className="h-20 w-20">
          {company.logo_url ? (
            <AvatarImage src={company.logo_url} alt={company.name} />
          ) : (
            <AvatarFallback className="text-xl bg-primary/10 text-primary">
              {company.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">{company.name}</h1>
          
          <div className="flex items-center gap-4 text-muted-foreground">
            {company.sector && (
              <span className="text-lg">{company.sector}</span>
            )}
            {company.location && (
              <>
                <span>•</span>
                <span className="text-lg">{company.location}</span>
              </>
            )}
            {company.stage && (
              <>
                <span>•</span>
                <Badge className={getStageColor(company.stage)}>
                  {company.stage}
                </Badge>
              </>
            )}
          </div>
          
          {company.website && (
            <a 
              href={company.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span>{new URL(company.website).hostname}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {canEdit && (
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button 
                onClick={onCancel} 
                variant="outline"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                onClick={onSave} 
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={onEdit} variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyProfileHeader;
