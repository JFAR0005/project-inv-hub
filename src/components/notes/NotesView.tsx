
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import NoteList, { NoteListRef } from './NoteList';
import NoteForm from './NoteForm';
import NotesErrorBoundary from './NotesErrorBoundary';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface Note {
  id: string;
  title: string;
  content: string;
  company_id?: string;
  visibility: 'private' | 'team' | 'public';
  author_id: string;
  created_at: string;
  updated_at: string;
}

const NotesView: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const noteListRef = useRef<NoteListRef>(null);

  const handleCreateNote = () => {
    setSelectedNote(null);
    setIsFormOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedNote(null);
    // Refresh the notes list
    if (noteListRef.current) {
      noteListRef.current.fetchNotes();
    }
  };

  const handleRetry = () => {
    if (noteListRef.current) {
      noteListRef.current.fetchNotes();
    }
  };

  return (
    <NotesErrorBoundary onRetry={handleRetry} onCreateNote={handleCreateNote}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
            <p className="text-muted-foreground">
              Create and manage your notes
            </p>
          </div>
          <Button onClick={handleCreateNote}>
            <Plus className="w-4 h-4 mr-2" />
            Create Note
          </Button>
        </div>

        <NoteList ref={noteListRef} />

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[700px] overflow-y-auto max-h-[90vh]">
            <NoteForm 
              note={selectedNote}
              onClose={handleCloseForm}
              onSave={handleCloseForm}
              onCancel={handleCloseForm}
            />
          </DialogContent>
        </Dialog>
      </div>
    </NotesErrorBoundary>
  );
};

export default NotesView;
