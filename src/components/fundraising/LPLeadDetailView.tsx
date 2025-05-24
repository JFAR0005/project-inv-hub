
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';
import EditLPLeadModal from './EditLPLeadModal';
import LPDocuments from './LPDocuments';

interface LPLead {
  id: string;
  name: string;
  type: 'Individual' | 'Family Office' | 'Institutional';
  contact_name?: string;
  contact_email?: string;
  location?: string;
  referred_by?: string;
  status: 'Contacted' | 'Interested' | 'In DD' | 'Committed' | 'Declined';
  estimated_commitment?: number;
  confirmed_commitment?: number;
  notes?: string;
  next_followup_date?: string;
  created_at: string;
  updated_at: string;
  relationship_owner?: { name: string; email: string };
  documents?: any[];
}

interface LPLeadDetailViewProps {
  lpLead: LPLead;
  onRefetch: () => void;
}

const LPLeadDetailView: React.FC<LPLeadDetailViewProps> = ({ lpLead, onRefetch }) => {
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Committed': return 'bg-green-100 text-green-800';
      case 'Interested': return 'bg-blue-100 text-blue-800';
      case 'In DD': return 'bg-yellow-100 text-yellow-800';
      case 'Contacted': return 'bg-gray-100 text-gray-800';
      case 'Declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/fundraising')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Fundraising
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{lpLead.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getStatusColor(lpLead.status)}>
                {lpLead.status}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{lpLead.type}</span>
            </div>
          </div>
        </div>
        <Button onClick={() => setShowEditModal(true)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="commitment">Commitment</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contact Name</label>
                  <div>{lpLead.contact_name || 'Not provided'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contact Email</label>
                  <div>{lpLead.contact_email || 'Not provided'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <div>{lpLead.location || 'Not provided'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Referred By</label>
                  <div>{lpLead.referred_by || 'Not provided'}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relationship Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Relationship Owner</label>
                  <div>{lpLead.relationship_owner?.name || 'Unassigned'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <div>{new Date(lpLead.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <div>{new Date(lpLead.updated_at).toLocaleDateString()}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {lpLead.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{lpLead.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="commitment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estimated Commitment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {lpLead.estimated_commitment ? formatCurrency(lpLead.estimated_commitment) : 'Not specified'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Confirmed Commitment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {lpLead.confirmed_commitment ? formatCurrency(lpLead.confirmed_commitment) : 'Not confirmed'}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Follow-Up Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Next Follow-Up Date</label>
                  <div className="text-lg">
                    {lpLead.next_followup_date ? 
                      new Date(lpLead.next_followup_date).toLocaleDateString() : 
                      'No follow-up scheduled'
                    }
                  </div>
                </div>
                {lpLead.next_followup_date && (
                  <div className="mt-4">
                    <Button variant="outline">
                      Schedule New Follow-Up
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <LPDocuments lpLeadId={lpLead.id} documents={lpLead.documents || []} onRefetch={onRefetch} />
        </TabsContent>
      </Tabs>

      <EditLPLeadModal
        lpLead={lpLead}
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSuccess={() => {
          setShowEditModal(false);
          onRefetch();
        }}
      />
    </div>
  );
};

export default LPLeadDetailView;
