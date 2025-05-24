import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface EditLPLeadData {
  name: string;
  type: 'Individual' | 'Family Office' | 'Institutional';
  contact_name?: string;
  contact_email?: string;
  location?: string;
  referred_by?: string;
  relationship_owner?: string;
  status: 'Contacted' | 'Interested' | 'In DD' | 'Committed' | 'Declined';
  estimated_commitment?: number;
  confirmed_commitment?: number;
  notes?: string;
  next_followup_date?: string;
}

interface EditLPLeadModalProps {
  lpLead: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EditLPLeadModal: React.FC<EditLPLeadModalProps> = ({
  lpLead,
  open,
  onOpenChange,
  onSuccess
}) => {
  const { toast } = useToast();
  const { register, handleSubmit, reset, setValue, watch } = useForm<EditLPLeadData>();

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

  useEffect(() => {
    if (lpLead && open) {
      reset({
        name: lpLead.name,
        type: lpLead.type,
        contact_name: lpLead.contact_name || '',
        contact_email: lpLead.contact_email || '',
        location: lpLead.location || '',
        referred_by: lpLead.referred_by || '',
        relationship_owner: lpLead.relationship_owner?.id || '',
        status: lpLead.status,
        estimated_commitment: lpLead.estimated_commitment || undefined,
        confirmed_commitment: lpLead.confirmed_commitment || undefined,
        notes: lpLead.notes || '',
        next_followup_date: lpLead.next_followup_date || ''
      });
    }
  }, [lpLead, open, reset]);

  const updateLPLead = useMutation({
    mutationFn: async (data: EditLPLeadData) => {
      const { error } = await supabase
        .from('lp_leads')
        .update({
          ...data,
          estimated_commitment: data.estimated_commitment ? Number(data.estimated_commitment) : null,
          confirmed_commitment: data.confirmed_commitment ? Number(data.confirmed_commitment) : null,
          next_followup_date: data.next_followup_date || null
        })
        .eq('id', lpLead.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "LP lead updated successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update LP lead",
        variant: "destructive",
      });
      console.error('Error updating LP lead:', error);
    }
  });

  const onSubmit = (data: EditLPLeadData) => {
    updateLPLead.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit LP Lead</DialogTitle>
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
              <Select onValueChange={(value) => setValue('type', value as any)} defaultValue={lpLead?.type}>
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
              <Label htmlFor="estimated_commitment">Estimated Commitment ($)</Label>
              <Input
                id="estimated_commitment"
                type="number"
                {...register('estimated_commitment')}
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmed_commitment">Confirmed Commitment ($)</Label>
              <Input
                id="confirmed_commitment"
                type="number"
                {...register('confirmed_commitment')}
                placeholder="0"
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
              disabled={updateLPLead.isPending}
            >
              {updateLPLead.isPending ? 'Updating...' : 'Update LP Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditLPLeadModal;
