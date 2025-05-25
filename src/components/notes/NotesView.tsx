
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, BookOpen, FileText, Users, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NoteCard from './NoteCard';
import NoteForm from './NoteForm';

interface Note {
  id: string;
  title: string;
  content: string;
  visibility: 'private' | 'team' | 'public';
  company_id?: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  companies?: {
    name: string;
  };
}

const NotesView: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch notes
  const { data: notes = [], isLoading, refetch } = useQuery({
    queryKey: ['notes', user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select(`
            *,
            companies:company_id(name)
          `)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error fetching notes:', error);
          throw error;
        }
        
        return data as Note[];
      } catch (error) {
        console.error('Notes query failed:', error);
        return [];
      }
    },
    enabled: !!user
  });

  // Fetch companies for note creation
  const { data: companies = [] } = useQuery({
    queryKey: ['companies-for-notes'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('id, name')
          .order('name');

        if (error) {
          console.error('Error fetching companies:', error);
          return [];
        }
        
        return data;
      } catch (error) {
        console.error('Companies query failed:', error);
        return [];
      }
    }
  });

  // Filter notes based on search and filters
  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchTerm || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVisibility = visibilityFilter === 'all' || note.visibility === visibilityFilter;
    const matchesCompany = companyFilter === 'all' || note.company_id === companyFilter;
    
    let matchesTab = true;
    if (activeTab === 'my') {
      matchesTab = note.author_id === user?.id;
    } else if (activeTab === 'company') {
      matchesTab = !!note.company_id;
    } else if (activeTab === 'team') {
      matchesTab = note.visibility === 'team' || note.visibility === 'public';
    }
    
    return matchesSearch && matchesVisibility && matchesCompany && matchesTab;
  });

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowNoteForm(true);
  };

  const handleCloseForm = () => {
    setShowNoteForm(false);
    setEditingNote(null);
    refetch();
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return <FileText className="h-4 w-4" />;
      case 'team':
        return <Users className="h-4 w-4" />;
      case 'public':
        return <Building2 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return 'bg-gray-100 text-gray-800';
      case 'team':
        return 'bg-blue-100 text-blue-800';
      case 'public':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (showNoteForm) {
    return (
      <NoteForm 
        note={editingNote} 
        companies={companies}
        onClose={handleCloseForm}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">
            Manage your notes and insights about portfolio companies
          </p>
        </div>
        <Button onClick={() => setShowNoteForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Note
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Visibility</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="public">Public</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Notes</TabsTrigger>
          <TabsTrigger value="my">My Notes</TabsTrigger>
          <TabsTrigger value="company">Company Notes</TabsTrigger>
          <TabsTrigger value="team">Team Notes</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No notes found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || visibilityFilter !== 'all' || companyFilter !== 'all'
                    ? "Try adjusting your search or filter criteria"
                    : "Start by creating your first note"}
                </p>
                <Button onClick={() => setShowNoteForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Note
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={() => handleEditNote(note)}
                  onDelete={() => refetch()}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotesView;
