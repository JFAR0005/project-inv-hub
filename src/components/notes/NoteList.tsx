
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Search } from 'lucide-react';
import NoteCard from './NoteCard';
import NoteDetail from './NoteDetail';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface Note {
  id: string;
  title: string;
  content: string;
  company_id: string | null;
  company_name?: string;
  author_id: string;
  author_name?: string;
  visibility: string;
  file_url?: string | null;
  created_at: string;
  updated_at?: string;
}

// Define the component's ref type
export interface NoteListRef {
  fetchNotes: () => Promise<void>;
}

const NoteList = forwardRef<NoteListRef, {}>((props, ref) => {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('');
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Expose the fetchNotes function via ref
  useImperativeHandle(ref, () => ({
    fetchNotes,
  }));

  // Determine what notes the current user can access
  const fetchNotes = async () => {
    setLoading(true);
    
    try {
      // First fetch users to get author names
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name');
      
      if (userError) throw userError;
      
      // User map for easier lookup
      const userMap = new Map();
      userData?.forEach(u => userMap.set(u.id, u.name));
      
      // Now fetch notes
      let query = supabase
        .from('notes')
        .select(`
          *,
          companies (id, name)
        `);
      
      // Apply role-based filtering
      if (user?.role === 'founder' && user?.companyId) {
        // Founders can only see notes for their company with visibility = 'founder'
        query = query
          .eq('company_id', user.companyId)
          .eq('visibility', 'founder');
      } else if (user?.role === 'partner') {
        // Partners can see notes with visibility = 'partner' or 'founder'
        query = query
          .in('visibility', ['partner', 'founder']);
      }
      // Admins can see all notes (no additional filter)
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to include company and author names
      const formattedNotes: Note[] = data.map(note => ({
        ...note,
        company_name: note.companies?.name || 'No company',
        // Use the userMap to get author name
        author_name: userMap.get(note.author_id) || 'Unknown user',
      }));
      
      setNotes(formattedNotes);
      setFilteredNotes(formattedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch companies for the filter dropdown
  const fetchCompanies = async () => {
    try {
      let query = supabase
        .from('companies')
        .select('id, name')
        .order('name');
        
      // If user is a founder, limit to their company
      if (user?.role === 'founder' && user?.companyId) {
        query = query.eq('id', user.companyId);
      }
        
      const { data, error } = await query;
        
      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  // Initial data loading
  useEffect(() => {
    if (user) {
      fetchNotes();
      fetchCompanies();
    }
  }, [user]);

  // Apply filters when filter values change
  useEffect(() => {
    if (notes.length === 0) return;
    
    let filtered = [...notes];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(term) || 
        note.content.toLowerCase().includes(term)
      );
    }
    
    // Apply visibility filter
    if (visibilityFilter) {
      filtered = filtered.filter(note => note.visibility === visibilityFilter);
    }
    
    // Apply company filter
    if (companyFilter) {
      filtered = filtered.filter(note => note.company_id === companyFilter);
    }
    
    setFilteredNotes(filtered);
  }, [notes, searchTerm, visibilityFilter, companyFilter]);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-auto">
          <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Visibility</SelectItem>
              <SelectItem value="admin">Admins Only</SelectItem>
              <SelectItem value="partner">Partners & Admins</SelectItem>
              <SelectItem value="founder">Everyone</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Companies</SelectItem>
              {companies.map(company => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-gray-100"></CardHeader>
              <CardContent className="h-32 bg-gray-50"></CardContent>
              <CardFooter className="h-10 bg-gray-100"></CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map(note => (
            <NoteCard 
              key={note.id} 
              note={note} 
              onClick={handleNoteClick}
            />
          ))}
        </div>
      ) : (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Pencil className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No notes found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchTerm || visibilityFilter || companyFilter
                ? "Try adjusting your filters"
                : "Create your first note to get started"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Note Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px] overflow-y-auto max-h-[90vh]">
          {selectedNote && (
            <NoteDetail note={selectedNote} onClose={handleCloseDetail} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
});

NoteList.displayName = 'NoteList';

export default NoteList;
