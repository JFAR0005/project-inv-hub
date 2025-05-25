
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, FileText, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const NotesView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const { toast } = useToast();

  const { data: notes, isLoading, refetch } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Note[];
    }
  });

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the note",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('notes')
        .insert([{
          title: newNote.title,
          content: newNote.content,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Note created successfully",
      });
      
      setNewNote({ title: '', content: '' });
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
    }
  };

  const filteredNotes = notes?.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
        </div>
        <div className="text-center py-8">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">
            Create and manage your notes
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Create Note Modal */}
      {showCreateModal && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Note title..."
              value={newNote.title}
              onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              placeholder="Note content..."
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateNote}>Create Note</Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notes found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms.' : 'Create your first note to get started.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(note.updated_at).toLocaleDateString()}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {note.content || 'No content'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesView;
