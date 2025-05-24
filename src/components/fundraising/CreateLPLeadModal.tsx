
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface CreateLPLeadData {
  name: string;
  type: 'Individual' | 'Family Office' | 'Institutional';
  contact_name?: string;
  contact_email?: string;
  location?: string;
  referred_by?: string;
  relationship_owner?: string;
  status: 'Contacted' | 'Interested' | 'In DD' | 'Committed' | 'Declined';
  estimated_commitment?: number;
  notes?: string;
  next_followup_date?: string;
}

interface CreateLPLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateLPLeadModal: React.FC<CreateLPLeadModalProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue, watch } = useForm<CreateLPLeadData>({
    defaultValues: {
      status: 'Contacted',
      relationship_owner: user?.id
    }
  });

  const { data: users } = useQuery({
    queryKey: ['users-for-ownership'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .in('role', ['admin', 'capital_team'])
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  const createLPLead = useMutation({
    mutationFn: async (data: CreateLPLeadData) => {
      const { error } = await supabase
        .from('lp_leads')
        .insert([{
          ...data,
          estimated_commitment: data.estimated_commitment ? Number(data.estimated_commitment) : null,
          next_followup_date: data.next_followup_date || null
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "LP lead created successfully",
      });
      reset();
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create LP lead",
        variant: "destructive",
      });
      console.error('Error creating LP lead:', error);
    }
  });

  const onSubmit = (data: CreateLPLeadData) => {
    createLPLead.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New LP Lead</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">LP Name *</Label>
              <Input
                id="name"
                {...register('name', { required: true })}
                placeholder="Enter LP name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select onValueChange={(value) => setValue('type', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Family Office">Family Office</SelectItem>
                  <SelectItem value="Institutional">Institutional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_name">Contact Name</Label>
              <Input
                id="contact_name"
                {...register('contact_name')}
                placeholder="Primary contact"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                {...register('contact_email')}
                placeholder="contact@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="City, Country"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="referred_by">Referred By</Label>
              <Input
                id="referred_by"
                {...register('referred_by')}
                placeholder="Who referred this LP"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => setValue('status', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Contacted">Contacted</SelectItem>
                  <SelectItem value="Interested">Interested</SelectItem>
                  <SelectItem value="In DD">In DD</SelectItem>
                  <SelectItem value="Committed">Committed</SelectItem>
                  <SelectItem value="Declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="relationship_owner">Relationship Owner</Label>
              <Select 
                defaultValue={user?.id}
                onValueChange={(value) => setValue('relationship_owner', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_commitment">Estimated Commitment ($)</Label>
              <Input
                id="estimated_commitment"
                type="number"
                {...register('estimated_commitment')}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="next_followup_date">Next Follow-Up Date</Label>
              <Input
                id="next_followup_date"
                type="date"
                {...register('next_followup_date')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional notes about this LP"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createLPLead.isPending}
            >
              {createLPLead.isPending ? 'Creating...' : 'Create LP Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLPLeadModal;
