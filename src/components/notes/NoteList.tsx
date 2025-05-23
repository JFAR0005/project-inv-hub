
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Plus, FileText } from 'lucide-react';
import NoteCard, { Note } from './NoteCard';
import NoteForm from './NoteForm';
import NoteFilters, { FilterOptions } from './NoteFilters';
import { format, sub } from 'date-fns';

const NoteList = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    visibility: 'all',
    companyId: '',
    dateRange: 'all',
  });
  
  // Function to fetch notes from the database
  const fetchNotes = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Start building the query
      let query = supabase
        .from('notes')
        .select(`
          id,
          title,
          content,
          visibility,
          created_at,
          updated_at,
          company_id,
          companies(name),
          users!notes_author_id_fkey(id, name)
        `);
      
      // Apply role-based filtering
      if (user.role === 'founder') {
        // Founders can only see notes marked as 'founder' AND linked to their company
        query = query
          .eq('visibility', 'founder')
          .eq('company_id', user.companyId);
      } else if (user.role === 'partner') {
        // Partners can see notes marked as 'partner' or 'founder'
        query = query.in('visibility', ['partner', 'founder']);
      }
      // Admins can see all notes (no additional filter)
      
      // Apply search filter if provided
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }
      
      // Apply visibility filter if not 'all'
      if (filters.visibility !== 'all') {
        query = query.eq('visibility', filters.visibility);
      }
      
      // Apply company filter if provided
      if (filters.companyId) {
        query = query.eq('company_id', filters.companyId);
      }
      
      // Apply date range filter
      if (filters.dateRange !== 'all') {
        let dateFrom;
        const now = new Date();
        
        switch (filters.dateRange) {
          case 'today':
            dateFrom = format(now, 'yyyy-MM-dd');
            break;
          case 'week':
            dateFrom = format(sub(now, { weeks: 1 }), 'yyyy-MM-dd');
            break;
          case 'month':
            dateFrom = format(sub(now, { months: 1 }), 'yyyy-MM-dd');
            break;
          case 'quarter':
            dateFrom = format(sub(now, { months: 3 }), 'yyyy-MM-dd');
            break;
          default:
            dateFrom = null;
        }
        
        if (dateFrom) {
          query = query.gte('created_at', dateFrom);
        }
      }
      
      // Execute the query
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Format the data to match our Note interface
        const formattedNotes: Note[] = data.map(note => {
          // Since users and companies are returned as arrays, handle accordingly
          const userData = Array.isArray(note.users) ? note.users[0] : note.users;
          const companyData = Array.isArray(note.companies) ? note.companies[0] : note.companies;
          
          return {
            id: note.id,
            title: note.title,
            content: note.content,
            author: {
              id: userData?.id || '',
              name: userData?.name || '',
            },
            companyId: note.company_id,
            companyName: companyData?.name || '',
            visibility: note.visibility as "internal" | "partner" | "founder",
            createdAt: new Date(note.created_at),
            tags: [], // We'll need to add tags from a separate query or join
            attachments: [], // Same for attachments
          };
        });
        
        setNotes(formattedNotes);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast("Error loading notes", {
        description: "Could not load your notes. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch notes when component mounts or filters change
  useEffect(() => {
    fetchNotes();
  }, [user, filters]);
  
  const handleCreateNote = () => {
    setEditingNote(null);
    setIsFormOpen(true);
  };
  
  const handleEditNote = (id: string) => {
    const noteToEdit = notes.find(note => note.id === id);
    if (noteToEdit) {
      setEditingNote(noteToEdit);
      setIsFormOpen(true);
    }
  };
  
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingNote(null);
    fetchNotes();
  };
  
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };
  
  // If user is not authenticated, show login prompt
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
        <div className="mb-2 p-4 bg-background rounded-full border">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">Authentication Required</h3>
        <p className="text-muted-foreground text-center mb-4">
          You need to be logged in to view and manage notes.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Notes</h2>
        <Button onClick={handleCreateNote}>
          <Plus className="h-4 w-4 mr-2" />
          Create Note
        </Button>
      </div>
      
      <NoteFilters onFilterChange={handleFilterChange} />
      
      <Tabs defaultValue="all" className="w-full">
        <TabsContent value="all" className="mt-0">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notes.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <NoteCard 
                  key={note.id} 
                  note={note}
                  onEdit={
                    user.role === 'admin' || (user.role === 'partner' && note.author.id === user.id)
                      ? handleEditNote
                      : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
              <div className="mb-2 p-4 bg-background rounded-full border">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No notes found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {filters.search || filters.visibility !== 'all' || filters.companyId || filters.dateRange !== 'all'
                  ? "No notes match your filter criteria. Try adjusting your filters."
                  : "You don't have any notes yet. Create your first note to get started."}
              </p>
              {!(filters.search || filters.visibility !== 'all' || filters.companyId || filters.dateRange !== 'all') && (
                <Button variant="outline" onClick={handleCreateNote}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Note
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="my">
          {/* Content for My Notes tab - filter by current user */}
        </TabsContent>
        
        <TabsContent value="recent">
          {/* Content for Recent tab - filter by date */}
        </TabsContent>
        
        <TabsContent value="important">
          {/* Content for Important tab - filter by tag or importance */}
        </TabsContent>
      </Tabs>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingNote ? 'Edit Note' : 'Create Note'}</DialogTitle>
          </DialogHeader>
          <NoteForm 
            onSuccess={handleFormSuccess}
            initialData={editingNote ? {
              id: editingNote.id,
              title: editingNote.title,
              content: editingNote.content,
              visibility: editingNote.visibility,
              companyId: editingNote.companyId,
              tags: editingNote.tags.join(', '),
            } : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NoteList;
