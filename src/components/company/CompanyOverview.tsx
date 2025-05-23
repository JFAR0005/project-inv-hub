
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Globe, MapPin, Building, Tag } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Company = Database['public']['Tables']['companies']['Row'];

interface CompanyOverviewProps {
  company: Company;
  isEditing: boolean;
  formData: Partial<Company>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const CompanyOverview: React.FC<CompanyOverviewProps> = ({
  company,
  isEditing,
  formData,
  onInputChange
}) => {
  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Edit company details and information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Company Name</label>
            <Input 
              id="name" 
              name="name" 
              value={formData.name || ''} 
              onChange={onInputChange} 
              placeholder="Company name"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="website" className="text-sm font-medium">Website</label>
              <Input 
                id="website" 
                name="website" 
                value={formData.website || ''} 
                onChange={onInputChange} 
                placeholder="https://company.com"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">Location</label>
              <Input 
                id="location" 
                name="location" 
                value={formData.location || ''} 
                onChange={onInputChange} 
                placeholder="City, Country"
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
                onChange={onInputChange} 
                placeholder="e.g., Seed, Series A"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="sector" className="text-sm font-medium">Sector</label>
              <Input 
                id="sector" 
                name="sector" 
                value={formData.sector || ''} 
                onChange={onInputChange} 
                placeholder="e.g., SaaS, FinTech"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea 
              id="description" 
              name="description" 
              value={formData.description || ''} 
              onChange={onInputChange} 
              rows={4}
              placeholder="Company description..."
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Company Information
        </CardTitle>
        <CardDescription>Overview of company details and information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Stage & Sector</h3>
                <div className="flex gap-2 mt-1">
                  {company.stage && <Badge variant="secondary">{company.stage}</Badge>}
                  {company.sector && <Badge variant="outline">{company.sector}</Badge>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                <p className="text-sm">{company.location || 'Not specified'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Website</h3>
                {company.website ? (
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {company.website}
                  </a>
                ) : (
                  <p className="text-sm">Not specified</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {company.description || 'No description provided.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyOverview;
