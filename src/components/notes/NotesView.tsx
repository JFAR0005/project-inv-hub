
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, FileText, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Note {
  id: string;
  title: string;
  content: string;
  company_id?: string;
  visibility: 'private' | 'team' | 'shared';
  author_id: string;
  created_at: string;
  updated_at: string;
  companies?: { name: string };
  author_name?: string;
}

interface Company {
  id: string;
  name: string;
}

interface NotesViewProps {
  onCreateNote: () => void;
  onEditNote: (note: Note) => void;
}

const NotesView: React.FC<NotesViewProps> = ({ onCreateNote, onEditNote }) => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterVisibility, setFilterVisibility] = useState('');

  useEffect(() => {
    fetchNotes();
    fetchCompanies();
  }, [user]);

  const fetchNotes = async () => {
    if (!user) return;

    try {
      // First, fetch notes with company information
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select(`
          *,
          companies(name)
        `)
        .order('updated_at', { ascending: false });

      if (notesError) throw notesError;

      // Then, fetch user information separately
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name');

      if (usersError) throw usersError;

      // Create a map for quick user lookup
      const userMap = new Map();
      usersData?.forEach(u => userMap.set(u.id, u.name));

      // Combine the data
      const notesWithAuthors: Note[] = (notesData || []).map(note => ({
        ...note,
        author_name: userMap.get(note.author_id) || 'Unknown User',
        visibility: note.visibility as 'private' | 'team' | 'shared'
      }));

      setNotes(notesWithAuthors);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(notes.filter(note => note.id !== noteId));
      toast({
        title: "Note Deleted",
        description: "The note has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = !filterCompany || note.company_id === filterCompany;
    const matchesVisibility = !filterVisibility || note.visibility === filterVisibility;
    
    return matchesSearch && matchesCompany && matchesVisibility;
  });

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'private': return 'bg-red-100 text-red-800';
      case 'team': return 'bg-blue-100 text-blue-800';
      case 'shared': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canEditNote = (note: Note) => {
    return note.author_id === user?.id || hasPermission('edit:all');
  };

  const canDeleteNote = (note: Note) => {
    return note.author_id === user?.id || hasPermission('delete:all');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-muted-foreground">Manage and organize your notes</p>
        </div>
        {hasPermission('create:notes') && (
          <Button onClick={onCreateNote}>
            <Plus className="h-4 w-4 mr-2" />
            Create Note
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterCompany} onValueChange={setFilterCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterVisibility} onValueChange={setFilterVisibility}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All visibility levels</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="shared">Shared</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterCompany('');
                setFilterVisibility('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                <Badge className={`text-xs ${getVisibilityColor(note.visibility)}`}>
                  {note.visibility}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {note.companies?.name && (
                  <span className="text-primary font-medium">{note.companies.name}</span>
                )}
                {!note.companies?.name && <span>General note</span>}
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {note.content}
              </p>
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  <p>By {note.author_name}</p>
                  <p>{format(new Date(note.updated_at), 'MMM d, yyyy')}</p>
                </div>
                
                <div className="flex gap-1">
                  {canEditNote(note) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditNote(note)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  {canDeleteNote(note) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No notes found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filterCompany || filterVisibility 
              ? "No notes match your current filters."
              : "Get started by creating your first note."
            }
          </p>
          {hasPermission('create:notes') && !searchTerm && !filterCompany && !filterVisibility && (
            <Button onClick={onCreateNote}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Note
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotesView;
