
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Tag, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Note {
  id: string;
  title: string;
  content: string;
  company_id?: string;
  visibility: 'private' | 'team' | 'public';
  author_id: string;
  created_at: string;
  updated_at?: string;
  companies?: {
    name: string;
  };
}

interface NoteCardProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Get badge color for visibility
  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'private': return 'bg-gray-100 text-gray-800';
      case 'team': return 'bg-blue-100 text-blue-800';
      case 'public': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', note.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Note deleted successfully.",
      });

      onDelete();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="leading-tight line-clamp-2">{note.title}</CardTitle>
          <Badge className={getVisibilityColor(note.visibility)}>
            {note.visibility.charAt(0).toUpperCase() + note.visibility.slice(1)}
          </Badge>
        </div>
        {note.companies?.name && (
          <div className="text-sm text-muted-foreground">
            Company: {note.companies.name}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <div className="text-sm line-clamp-4 text-muted-foreground">
          {note.content}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-2 border-t">
        <div className="text-xs text-muted-foreground">
          {format(new Date(note.created_at), 'MMM d, yyyy')}
        </div>
        <div className="flex gap-2">
          {user?.id === note.author_id && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default NoteCard;
